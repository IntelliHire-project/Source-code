import React, { useState } from 'react';
import {
  Users,
  Briefcase,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Activity,
  CheckCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import AdminSidebar from '../../../components/common/AdminSidebar';
import TopBar from '../../../components/TopBar/TopBar';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-theme admin-dashboard">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeItem="Dashboard"
      />
      
      <div className="admin-dashboard__main">
        <TopBar
          user={{ name: 'Admin User', role: 'System Controller' }}
          notificationsCount={5}
          searchPlaceholder="Search across system..."
          onHamburgerClick={() => setSidebarOpen(true)}
        />

        <div className="admin-dashboard-content">
          {/* Welcome Banner */}
          <div className="dashboard-welcome-banner">
            <div>
              <h1 className="dashboard-title">Welcome back, Admin 👋</h1>
              <p className="dashboard-subtitle">Here is what's happening on IntelliHire today.</p>
            </div>
            <div className="dashboard-system-status">
              <span className="status-dot healthy"></span>
              System is healthy
            </div>
          </div>

          {/* KPI Widgets */}
          <div className="dashboard-kpi-grid">
            <div className="kpi-card">
              <div className="kpi-icon-box users">
                <Users size={20} />
              </div>
              <div className="kpi-info">
                <span className="kpi-label">Total Active Users</span>
                <span className="kpi-value">12,845</span>
                <span className="kpi-trend positive"><TrendingUp size={14} /> +12% this month</span>
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon-box briefcase">
                <Briefcase size={20} />
              </div>
              <div className="kpi-info">
                <span className="kpi-label">Active Vacancies</span>
                <span className="kpi-value">3,492</span>
                <span className="kpi-trend positive"><TrendingUp size={14} /> +5% this month</span>
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon-box revenue">
                <DollarSign size={20} />
              </div>
              <div className="kpi-info">
                <span className="kpi-label">Platform Revenue</span>
                <span className="kpi-value">$142,390</span>
                <span className="kpi-trend positive"><TrendingUp size={14} /> +18% this month</span>
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon-box alerts">
                <AlertTriangle size={20} />
              </div>
              <div className="kpi-info">
                <span className="kpi-label">Pending Reviews</span>
                <span className="kpi-value">48</span>
                <span className="kpi-trend negative">Requires attention</span>
              </div>
            </div>
          </div>

          <div className="dashboard-bottom-grid">
            {/* Chart Area (Mocked with CSS/SVG) */}
            <div className="dashboard-chart-card">
              <div className="card-header">
                <h3>Platform Activity Overview</h3>
                <select className="chart-filter">
                  <option>Last 30 Days</option>
                  <option>Last 7 Days</option>
                  <option>This Year</option>
                </select>
              </div>
              <div className="chart-placeholder">
                <svg viewBox="0 0 800 200" className="mock-chart">
                  <path d="M0,150 C100,150 150,50 250,80 C350,110 400,20 500,60 C600,100 650,40 800,20" fill="none" stroke="#F0B90B" strokeWidth="4" />
                  <path d="M0,200 L0,150 C100,150 150,50 250,80 C350,110 400,20 500,60 C600,100 650,40 800,20 L800,200 Z" fill="url(#chartGradient)" />
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(240,185,11,0.2)" />
                      <stop offset="100%" stopColor="rgba(240,185,11,0)" />
                    </linearGradient>
                  </defs>
                  {/* Grid lines */}
                  <line x1="0" y1="50" x2="800" y2="50" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                  <line x1="0" y1="100" x2="800" y2="100" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                  <line x1="0" y1="150" x2="800" y2="150" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                </svg>
                <div className="chart-labels-x">
                  <span>Week 1</span>
                  <span>Week 2</span>
                  <span>Week 3</span>
                  <span>Week 4</span>
                </div>
              </div>
            </div>

            <div className="dashboard-side-column">
              {/* Recent Activity */}
              <div className="dashboard-activity-card">
                <div className="card-header">
                  <h3>Recent Activity</h3>
                  <button className="view-all-btn">View All</button>
                </div>
                <div className="activity-list">
                  <div className="activity-item">
                    <div className="activity-icon-wrapper success">
                      <CheckCircle size={14} />
                    </div>
                    <div className="activity-details">
                      <span className="activity-title">New Company Verified</span>
                      <span className="activity-time">2 mins ago • TechFlow Systems</span>
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-icon-wrapper warning">
                      <DollarSign size={14} />
                    </div>
                    <div className="activity-details">
                      <span className="activity-title">Large Payment Processed</span>
                      <span className="activity-time">1 hour ago • $13,695.00</span>
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-icon-wrapper danger">
                      <AlertTriangle size={14} />
                    </div>
                    <div className="activity-details">
                      <span className="activity-title">Failed AML Check</span>
                      <span className="activity-time">3 hours ago • TRX-8742-LQ</span>
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-icon-wrapper info">
                      <Activity size={14} />
                    </div>
                    <div className="activity-details">
                      <span className="activity-title">System Backup Completed</span>
                      <span className="activity-time">5 hours ago • Automated</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="dashboard-quick-actions">
                <div className="card-header">
                  <h3>Pending Actions</h3>
                </div>
                <div className="action-button-list">
                  <button className="quick-action-btn">
                    <div className="action-left">
                      <Clock size={16} className="text-yellow" />
                      <span>Review 12 Pending Companies</span>
                    </div>
                    <ArrowRight size={16} className="arrow-icon" />
                  </button>
                  <button className="quick-action-btn">
                    <div className="action-left">
                      <AlertTriangle size={16} className="text-red" />
                      <span>Resolve 3 Content Reports</span>
                    </div>
                    <ArrowRight size={16} className="arrow-icon" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
