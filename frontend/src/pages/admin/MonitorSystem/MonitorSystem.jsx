import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Cpu,
  MemoryStick,
  HardDrive,
  RefreshCw,
  Clock,
  ArrowDown,
  Zap,
  Server,
  Database,
  Bell,
  Activity,
} from 'lucide-react';
import TopBar from '../../../components/TopBar/TopBar';
import AdminSidebar from '../../../components/common/AdminSidebar';
import './MonitorSystem.css';
import '../../../styles/admin.css';
import logo from '../../../logo.png';

// ── Static configuration ──────────────────────────────────────────────
const TABS = ['Overview', 'Nodes', 'Services', 'Logs'];

const INITIAL_METRICS = {
  cpu:     { value: 64.8, unit: '%',     bar: 64.8, delta: '+4.2% from last hour',  dir: 'up'   },
  memory:  { value: 12.4, unit: ' GB',   bar: 62,   delta: '-1.1% from last hour',  dir: 'down' },
  storage: { value: 284,  unit: ' MB/s', bar: 71,   delta: '+12% from last hour',   dir: 'up'   },
};

const SERVICES = [
  {
    id: 'api-gw',
    name: 'API Gateway',
    icon: Zap,
    uptime: '14d 6h',
    latency: '42ms',
  },
  {
    id: 'edge',
    name: 'Global Edge Server',
    icon: Server,
    uptime: '82d 12h',
    latency: '18ms',
  },
  {
    id: 'postgres',
    name: 'Primary PostgreSQL',
    icon: Database,
    uptime: '2d 3h',
    latency: '156ms',
  },
];

// 24-hour system load data points (value 0-100)
const LOAD_DATA = [
  { t: '00:00', v: 38 },
  { t: '02:00', v: 35 },
  { t: '04:00', v: 34 },
  { t: '06:00', v: 40 },
  { t: '08:00', v: 58 },
  { t: '10:00', v: 78 },
  { t: '12:00', v: 90 },
  { t: '14:00', v: 82 },
  { t: '16:00', v: 68 },
  { t: '18:00', v: 60 },
  { t: '20:00', v: 54 },
  { t: '22:00', v: 50 },
  { t: '23:59', v: 49 },
];

const INCIDENTS = [
  { id: 1, severity: 'critical', text: 'Database connection pool saturated (98%)',    time: '2 MINS AGO'   },
  { id: 2, severity: 'warning',  text: 'High latency detected in US-East-1 region',  time: '14 MINS AGO'  },
  { id: 3, severity: 'success',  text: 'Automated backup completed successfully',     time: '1 HOUR AGO'   },
  { id: 4, severity: 'info',     text: 'New node deployed: WORKER-082',              time: '3 HOURS AGO'  },
  { id: 5, severity: 'warning',  text: 'SSL certificate expiring in 14 days',        time: '5 HOURS AGO'  },
];

// ── Utility: build SVG path from data points ───────────────────────────
function buildAreaPath(data, W, H, padT, padB, padL, padR) {
  const usableW = W - padL - padR;
  const usableH = H - padT - padB;
  const maxV = 100;
  const minV = 0;

  const pts = data.map((d, i) => ({
    x: padL + (i / (data.length - 1)) * usableW,
    y: padT + (1 - (d.v - minV) / (maxV - minV)) * usableH,
  }));

  // Smooth curve using cardinal spline-like approach
  let linePath = `M ${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    linePath += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }

  const lastX = pts[pts.length - 1].x;
  const lastY = pts[pts.length - 1].y;
  const bottomY = padT + usableH;

  const areaPath =
    linePath +
    ` L ${lastX},${bottomY}` +
    ` L ${pts[0].x},${bottomY}` +
    ` Z`;

  return { linePath, areaPath, pts };
}

// ── KPI Card ──────────────────────────────────────────────────────────
function KpiCard({ label, value, unit, barPct, delta, dir, icon: Icon }) {
  return (
    <div className="ms-kpi-card">
      <div className="ms-kpi-card__top">
        <span className="ms-kpi-card__label">{label}</span>
        <div className="ms-kpi-card__icon">
          <Icon size={16} />
        </div>
      </div>
      <div className="ms-kpi-card__value">
        {value}
        <span style={{ fontSize: '1.2rem', fontWeight: 400, color: '#9CA0A8' }}>{unit}</span>
      </div>
      <div className="ms-kpi-bar-track">
        <div className="ms-kpi-bar-fill" style={{ width: `${barPct}%` }} />
      </div>
      <div className={`ms-kpi-card__delta ${dir}`}>
        {dir === 'up' ? '↗' : '↘'} {delta}
      </div>
    </div>
  );
}

// ── Service Status Card ───────────────────────────────────────────────
function ServiceCard({ name, icon: Icon, uptime, latency }) {
  return (
    <div className="ms-service-card">
      <div className="ms-service-card__icon-wrap">
        <Icon size={20} />
      </div>
      <div className="ms-service-card__info">
        <span className="ms-service-card__name">{name}</span>
        <div className="ms-service-card__meta">
          <span className="ms-service-meta-item">
            <Clock size={12} />
            {uptime}
          </span>
          <span className="ms-service-meta-item">
            <ArrowDown size={12} />
            {latency}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── System Load Chart ─────────────────────────────────────────────────
function SystemLoadChart({ data }) {
  const svgRef = useRef(null);
  const [dims, setDims] = useState({ W: 600, H: 240 });

  useEffect(() => {
    if (!svgRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect;
      setDims({ W: rect.width || 600, H: Math.max(rect.height, 200) });
    });
    ro.observe(svgRef.current);
    return () => ro.disconnect();
  }, []);

  const PAD = { top: 16, bottom: 28, left: 36, right: 16 };
  const { W, H } = dims;
  const { linePath, areaPath, pts } = buildAreaPath(
    data, W, H, PAD.top, PAD.bottom, PAD.left, PAD.right
  );

  const yLabels = [0, 25, 50, 75, 100];
  const usableH = H - PAD.top - PAD.bottom;
  const usableW = W - PAD.left - PAD.right;

  return (
    <div ref={svgRef} className="ms-chart-svg-wrapper">
      <svg
        className="ms-chart-svg"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        aria-label="System load trend chart"
      >
        <defs>
          <linearGradient id="ms-area-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#F0B90B" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#F0B90B" stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {/* Grid lines and Y-axis labels */}
        {yLabels.map((val) => {
          const cy = PAD.top + (1 - val / 100) * usableH;
          return (
            <g key={val}>
              <line
                className="ms-chart-grid-line"
                x1={PAD.left} y1={cy}
                x2={W - PAD.right} y2={cy}
              />
              <text
                className="ms-chart-axis-label"
                x={PAD.left - 6}
                y={cy + 4}
                textAnchor="end"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* X-axis time labels */}
        {data.map((d, i) => {
          const cx = PAD.left + (i / (data.length - 1)) * usableW;
          return (
            <text
              key={d.t}
              className="ms-chart-axis-label"
              x={cx}
              y={H - 4}
              textAnchor="middle"
            >
              {d.t}
            </text>
          );
        })}

        {/* Area fill */}
        <path className="ms-chart-area-fill" d={areaPath} />

        {/* Line stroke */}
        <path className="ms-chart-area-line" d={linePath} />

        {/* Data point dots */}
        {pts.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={3.5}
            fill="#F0B90B"
            stroke="#0D0E13"
            strokeWidth={2}
            opacity={0.85}
          />
        ))}
      </svg>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────
function MonitorSystem() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Overview');
  const [refreshing, setRefreshing] = useState(false);
  const [metrics, setMetrics] = useState(INITIAL_METRICS);
  const [loadData, setLoadData] = useState(LOAD_DATA);

  const handleRefresh = useCallback(() => {
    if (refreshing) return;
    setRefreshing(true);

    setTimeout(() => {
      // Simulate updated metric values
      setMetrics({
        cpu: {
          value: (Math.random() * 30 + 45).toFixed(1),
          unit: '%',
          bar: Math.random() * 30 + 45,
          delta: `+${(Math.random() * 5).toFixed(1)}% from last hour`,
          dir: 'up',
        },
        memory: {
          value: (Math.random() * 4 + 10).toFixed(1),
          unit: ' GB',
          bar: Math.random() * 20 + 50,
          delta: `-${(Math.random() * 2).toFixed(1)}% from last hour`,
          dir: 'down',
        },
        storage: {
          value: Math.round(Math.random() * 100 + 230),
          unit: ' MB/s',
          bar: Math.random() * 20 + 60,
          delta: `+${Math.round(Math.random() * 15)}% from last hour`,
          dir: 'up',
        },
      });

      // Slightly shift load data
      setLoadData((prev) =>
        prev.map((d) => ({
          ...d,
          v: Math.min(100, Math.max(20, d.v + (Math.random() * 10 - 5))),
        }))
      );

      setRefreshing(false);
    }, 1200);
  }, [refreshing]);

  return (
    <div className="admin-theme admin-dashboard">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeItem="System health"
      />
      <div className="admin-dashboard__main ms-shell">
        {/* ── Standard TopBar ── */}
        <TopBar
          user={{ name: 'Admin User', role: 'System Controller' }}
          notificationsCount={5}
          searchPlaceholder="Search system..."
          onSearch={(q) => console.log('System search:', q)}
          onHamburgerClick={() => setSidebarOpen(true)}
        />

        {/* ── Secondary nav: tabs + cluster badge + refresh ── */}
        <nav className="ms-topnav" role="navigation" aria-label="System monitor navigation">
        <div className="ms-topnav__tabs">
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`ms-tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
              type="button"
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="ms-topnav__right">
          <div className="ms-cluster-badge">
            <span className="ms-cluster-badge__label">Master Cluster</span>
            <span className="ms-cluster-badge__status">STABLE</span>
          </div>
          <button
            id="refresh-system-btn"
            className={`ms-btn-refresh ${refreshing ? 'refreshing' : ''}`}
            onClick={handleRefresh}
            type="button"
            disabled={refreshing}
          >
            <RefreshCw size={15} />
            {refreshing ? 'Refreshing…' : 'Refresh System'}
          </button>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <main className="ms-content">
        {/* KPI Metrics Cards */}
        <section className="ms-kpi-row" aria-label="System metrics">
          <KpiCard
            label="CPU Utilization"
            value={metrics.cpu.value}
            unit={metrics.cpu.unit}
            barPct={metrics.cpu.bar}
            delta={metrics.cpu.delta}
            dir={metrics.cpu.dir}
            icon={Cpu}
          />
          <KpiCard
            label="Memory Usage"
            value={metrics.memory.value}
            unit={metrics.memory.unit}
            barPct={metrics.memory.bar}
            delta={metrics.memory.delta}
            dir={metrics.memory.dir}
            icon={MemoryStick}
          />
          <KpiCard
            label="Storage I/O"
            value={metrics.storage.value}
            unit={metrics.storage.unit}
            barPct={metrics.storage.bar}
            delta={metrics.storage.delta}
            dir={metrics.storage.dir}
            icon={HardDrive}
          />
        </section>

        {/* Service Status Cards */}
        <section className="ms-services-row" aria-label="Service status">
          {SERVICES.map((svc) => (
            <ServiceCard key={svc.id} {...svc} />
          ))}
        </section>

        {/* Bottom row: chart + feed */}
        <div className="ms-bottom-row">
          {/* System Load Trends */}
          <div className="ms-chart-card">
            <div className="ms-chart-card__header">
              <div className="ms-chart-card__title-group">
                <h2 className="ms-chart-card__title">
                  <Activity size={16} className="ms-chart-title-icon" />
                  System Load Trends
                </h2>
                <p className="ms-chart-card__subtitle">
                  Real-time performance distribution across 24h
                </p>
              </div>
              <div className="ms-chart-card__badges">
                <span className="ms-badge ms-badge--realtime">Real-Time</span>
                <span className="ms-badge ms-badge--nodes">Nodes: 04</span>
              </div>
            </div>
            <SystemLoadChart data={loadData} />
          </div>

          {/* Live Incident Feed */}
          <div className="ms-feed-card">
            <div className="ms-feed-card__header">
              <h2 className="ms-feed-card__title">
                <Bell size={16} className="ms-feed-bell-icon" />
                Live Incident Feed
              </h2>
              <span className="ms-feed-card__subtitle">Last 5 prioritized events</span>
            </div>

            <ul className="ms-incident-list">
              {INCIDENTS.map((inc) => (
                <li key={inc.id} className="ms-incident-item">
                  <span className={`ms-incident-dot ${inc.severity}`} aria-hidden="true" />
                  <div className="ms-incident-body">
                    <span className="ms-incident-text">{inc.text}</span>
                    <span className="ms-incident-time">{inc.time}</span>
                  </div>
                </li>
              ))}
            </ul>

            <button
              id="view-all-logs-btn"
              className="ms-btn-view-logs"
              type="button"
              onClick={() => alert('Navigating to system logs...')}
            >
              View All Logs
            </button>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="ms-footer">
        <span className="ms-footer__left">Global Status: Operational</span>
        <div className="ms-footer__right">
          <span>Version: 4.8.2-GOLD</span>
          <span>© 2024 IntelliHire Systems Inc.</span>
        </div>
      </footer>
      </div>
    </div>
  );
}

export default MonitorSystem;
