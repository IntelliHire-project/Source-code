import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Briefcase,
  Users,
  FileText,
  Clock,
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Activity,
  Eye,
  MoreVertical,
  MapPin,
  BarChart3,
} from 'lucide-react';
import RecruiterSidebar from '../../../components/common/RecruiterSidebar';
import TopBar from '../../../components/TopBar/TopBar';
import InsightPanel from '../../../components/common/InsightPanel';
import '../../../style.css';
import './VacancyManagementPage.css';

const VACANCIES = [
  {
    id: 'VAC-001',
    title: 'Senior Frontend Engineer',
    department: 'Engineering',
    status: 'published',
    applicants: 87,
    dateCreated: '12 Jul 2026',
    location: 'London, UK',
  },
  {
    id: 'VAC-002',
    title: 'Product Designer',
    department: 'Design',
    status: 'published',
    applicants: 64,
    dateCreated: '08 Jul 2026',
    location: 'Remote',
  },
  {
    id: 'VAC-003',
    title: 'Backend Engineer',
    department: 'Engineering',
    status: 'published',
    applicants: 52,
    dateCreated: '01 Jul 2026',
    location: 'London, UK',
  },
  {
    id: 'VAC-004',
    title: 'Data Analyst',
    department: 'Analytics',
    status: 'draft',
    applicants: 23,
    dateCreated: '20 Jun 2026',
    location: 'Remote',
  },
  {
    id: 'VAC-005',
    title: 'DevOps Engineer',
    department: 'Engineering',
    status: 'closed',
    applicants: 10,
    dateCreated: '05 Jun 2026',
    location: 'Manchester, UK',
  },
];

const STAT_CARDS = [
  { icon: Briefcase, label: 'TOTAL VACANCIES', value: '5', variant: 'gold' },
  { icon: BarChart3, label: 'ACTIVE LISTINGS', value: '3', variant: 'info' },
  { icon: Users, label: 'TOTAL APPLICANTS', value: '236', variant: 'success' },
  { icon: FileText, label: 'PENDING DRAFTS', value: '1', variant: 'muted' },
];

const PAGE_SIZE = 5;

function StatusBadge({ status }) {
  const map = {
    published: { className: 'vm-badge vm-badge--published', label: 'Published' },
    draft: { className: 'vm-badge vm-badge--draft', label: 'Draft' },
    closed: { className: 'vm-badge vm-badge--closed', label: 'Closed' },
  };
  const { className, label } = map[status] || map.draft;
  return <span className={className}>{label}</span>;
}

function StatCard({ icon: Icon, label, value, variant }) {
  return (
    <div className="vm-stat-card">
      <div className={`vm-stat-card__icon vm-stat-card__icon--${variant}`}>
        <Icon size={18} />
      </div>
      <span className="vm-stat-card__label">{label}</span>
      <span className="vm-stat-card__value">{value}</span>
    </div>
  );
}

function VacancyManagementPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    if (!search.trim()) return VACANCIES;
    const q = search.toLowerCase();
    return VACANCIES.filter(
      (v) =>
        v.title.toLowerCase().includes(q) ||
        v.department.toLowerCase().includes(q) ||
        v.id.toLowerCase().includes(q),
    );
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="create-vacancy vm-shell">
      <RecruiterSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="create-vacancy__main">
        <TopBar
          user={{ name: 'Recruiter', role: 'Recruiter Account' }}
          notificationsCount={3}
          breadcrumbItems={[
            { label: 'Recruitment', path: '/recruiter/dashboard' },
            { label: 'Vacancy Management' },
          ]}
          searchPlaceholder="Search vacancies…"
          onSearch={(q) => console.log('Search:', q)}
          onNotificationClick={() => console.log('Notifications clicked')}
          onLogout={() => console.log('Logout')}
          onHamburgerClick={() => setSidebarOpen(true)}
        />

        <main className="vm-content">
          {/* ── Header ── */}
          <div className="vm-header">
            <div className="vm-header__text">
              <h1 className="vm-title">Vacancy Management</h1>
              <p className="vm-subtitle">
                Monitor and manage your active job listings across multiple departments.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate('/recruiter/create-vacancy')}
            >
              <Plus size={16} />
              Create New Vacancy
            </button>
          </div>

          {/* ── Stat Cards ── */}
          <div className="vm-stats-row">
            {STAT_CARDS.map((card) => (
              <StatCard key={card.label} {...card} />
            ))}
          </div>

          {/* ── Vacancy Table Card ── */}
          <div className="vm-table-card">
            {/* Toolbar */}
            <div className="vm-toolbar">
              <div className="vm-toolbar__search">
                <Search size={16} className="vm-toolbar__search-icon" />
                <input
                  className="vm-toolbar__search-input"
                  type="text"
                  placeholder="Search job titles..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <div className="vm-toolbar__right">
                <span className="vm-toolbar__count">{filtered.length} results found</span>
                <button type="button" className="vm-toolbar__icon-btn" aria-label="Filter">
                  <Filter size={16} />
                </button>
                <button type="button" className="vm-toolbar__icon-btn" aria-label="Sort">
                  <ArrowUpDown size={16} />
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="vm-table-wrap">
              <table className="vm-table">
                <thead>
                  <tr>
                    <th>JOB TITLE &amp; ID</th>
                    <th>DEPARTMENT</th>
                    <th>STATUS</th>
                    <th>APPLICANTS</th>
                    <th>DATE CREATED</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((v) => (
                    <tr
                      key={v.id}
                      className="vm-table__row"
                      onClick={() => navigate('/recruiter/vacancy-preview')}
                    >
                      <td>
                        <div className="vm-table__title-cell">
                          <span className="vm-table__job-title">{v.title}</span>
                          <span className="vm-table__job-meta">
                            {v.id} · {v.location}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="vm-table__dept">{v.department}</span>
                      </td>
                      <td>
                        <StatusBadge status={v.status} />
                      </td>
                      <td>
                        <div className="vm-table__applicants">
                          <Users size={14} />
                          <span>{v.applicants}</span>
                        </div>
                      </td>
                      <td>
                        <span className="vm-table__date">{v.dateCreated}</span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="vm-table__action-btn"
                          aria-label={`Actions for ${v.title}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {paginated.length === 0 && (
                    <tr>
                      <td colSpan={6} className="vm-table__empty">
                        No vacancies match your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="vm-pagination">
              <span className="vm-pagination__info">
                Showing {(safePage - 1) * PAGE_SIZE + 1}–
                {Math.min(safePage * PAGE_SIZE, filtered.length)} of{' '}
                {filtered.length} listings
              </span>
              <div className="vm-pagination__controls">
                <button
                  type="button"
                  className="vm-pagination__btn"
                  disabled={safePage <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>
                <button
                  type="button"
                  className="vm-pagination__btn"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* ── Bottom Row ── */}
          <div className="vm-bottom-row">
            <InsightPanel eyebrow="RECRUITER TIP" className="vm-tip-panel">
              <p className="vm-tip-text">
                Listings with detailed descriptions and 5+ required skills receive{' '}
                <strong>40% more qualified applicants</strong> on average.
                Consider reviewing your draft postings before publishing.
              </p>
            </InsightPanel>

            <div className="vm-activity-panel">
              <div className="vm-activity-header">
                <div className="vm-activity-icon">
                  <Clock size={16} />
                </div>
                <span className="vm-activity-heading">Recent Activity</span>
              </div>
              <div className="vm-activity-body">
                <div className="vm-activity-item">
                  <div className="vm-activity-dot" />
                  <div className="vm-activity-content">
                    <p className="vm-activity-text">
                      <strong>3 new applicants</strong> applied to Senior Frontend Engineer
                    </p>
                    <span className="vm-activity-time">2 hours ago</span>
                  </div>
                </div>
                <div className="vm-activity-item">
                  <div className="vm-activity-dot vm-activity-dot--accent" />
                  <div className="vm-activity-content">
                    <p className="vm-activity-text">
                      Product Designer listing <strong>reached 50 applicants</strong>
                    </p>
                    <span className="vm-activity-time">Yesterday</span>
                  </div>
                </div>
                <div className="vm-activity-item">
                  <div className="vm-activity-dot vm-activity-dot--muted" />
                  <div className="vm-activity-content">
                    <p className="vm-activity-text">
                      DevOps Engineer listing was <strong>closed</strong>
                    </p>
                    <span className="vm-activity-time">3 days ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default VacancyManagementPage;
