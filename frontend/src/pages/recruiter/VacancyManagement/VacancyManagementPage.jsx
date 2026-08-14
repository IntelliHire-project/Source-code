import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Eye,
  MoreVertical,
  BarChart3,
  Pencil,
  Copy,
  X,
  Check,
} from 'lucide-react';
import RecruiterSidebar from '../../../components/common/RecruiterSidebar';
import TopBar from '../../../components/TopBar/TopBar';
import InsightPanel from '../../../components/common/InsightPanel';
import StatusBadge from '../../../components/common/StatusBadge';
import DropdownMenu from '../../../components/common/DropdownMenu';
import { VACANCIES } from '../../../data/vacancies';
import { getApplicants } from '../../../data/applicants';
import '../../../style.css';
import './VacancyManagementPage.css';

const PAGE_SIZE = 5;

const STATUS_LABELS = {
  published: 'Published',
  draft: 'Draft',
  closed: 'Closed',
};

const MONTHS = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
};

function parseDate(dateStr = '') {
  const [day, month, year] = dateStr.split(' ');
  const monthIndex = MONTHS[month];
  if (!day || monthIndex === undefined || !year) return 0;
  return new Date(Number(year), monthIndex, Number(day)).getTime();
}

const STATUS_OPTIONS = [
  { id: 'all', label: 'All statuses' },
  { id: 'published', label: 'Published' },
  { id: 'draft', label: 'Draft' },
  { id: 'closed', label: 'Closed' },
];

const SORT_OPTIONS = [
  { id: 'dateDesc', label: 'Newest first' },
  { id: 'dateAsc', label: 'Oldest first' },
  { id: 'titleAsc', label: 'Title A–Z' },
  { id: 'titleDesc', label: 'Title Z–A' },
  { id: 'applicantsDesc', label: 'Most applicants' },
  { id: 'applicantsAsc', label: 'Fewest applicants' },
];

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
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dateDesc');
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const toolbarRef = useRef(null);
  const navigate = useNavigate();

  const statCards = useMemo(() => {
    const totalApplicants = VACANCIES.reduce(
      (sum, vacancy) => sum + getApplicants(vacancy.id).length,
      0,
    );
    return [
      { icon: Briefcase, label: 'TOTAL VACANCIES', value: VACANCIES.length, variant: 'gold' },
      {
        icon: BarChart3,
        label: 'ACTIVE LISTINGS',
        value: VACANCIES.filter((v) => v.status === 'published').length,
        variant: 'info',
      },
      { icon: Users, label: 'TOTAL APPLICANTS', value: totalApplicants, variant: 'success' },
      {
        icon: FileText,
        label: 'PENDING DRAFTS',
        value: VACANCIES.filter((v) => v.status === 'draft').length,
        variant: 'muted',
      },
    ];
  }, []);

  const departments = useMemo(
    () => [...new Set(VACANCIES.map((v) => v.department))].sort(),
    [],
  );

  const hasActiveFilters = statusFilter !== 'all' || departmentFilter !== 'all';

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, departmentFilter, sortBy]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target)) {
        setFilterOpen(false);
        setSortOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = useMemo(() => {
    const list = VACANCIES.filter(
      (v) =>
        (statusFilter === 'all' || v.status === statusFilter) &&
        (departmentFilter === 'all' || v.department === departmentFilter),
    ).filter((v) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        v.title.toLowerCase().includes(q) ||
        v.department.toLowerCase().includes(q) ||
        v.id.toLowerCase().includes(q)
      );
    });

    switch (sortBy) {
      case 'titleAsc':
        list.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'titleDesc':
        list.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'applicantsDesc':
        list.sort((a, b) => getApplicants(b.id).length - getApplicants(a.id).length);
        break;
      case 'applicantsAsc':
        list.sort((a, b) => getApplicants(a.id).length - getApplicants(b.id).length);
        break;
      case 'dateAsc':
        list.sort((a, b) => parseDate(a.dateCreated) - parseDate(b.dateCreated));
        break;
      default:
        list.sort((a, b) => parseDate(b.dateCreated) - parseDate(a.dateCreated));
        break;
    }
    return list;
  }, [search, statusFilter, departmentFilter, sortBy]);

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
            {statCards.map((card) => (
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
              <div className="vm-toolbar__right" ref={toolbarRef}>
                <span className="vm-toolbar__count">{filtered.length} results found</span>

                <div className="vm-toolbar__popover-wrap">
                  <button
                    type="button"
                    className={`vm-toolbar__icon-btn ${hasActiveFilters ? 'is-active' : ''}`}
                    aria-label="Filter"
                    aria-expanded={filterOpen}
                    onClick={() => {
                      setFilterOpen((open) => !open);
                      setSortOpen(false);
                    }}
                  >
                    <Filter size={16} />
                  </button>

                  {filterOpen && (
                    <div className="vm-toolbar__popover">
                      <div className="vm-toolbar__popover-head">
                        <span className="vm-toolbar__popover-title">Filter</span>
                        {hasActiveFilters && (
                          <button
                            type="button"
                            className="vm-toolbar__popover-clear"
                            onClick={() => {
                              setStatusFilter('all');
                              setDepartmentFilter('all');
                            }}
                          >
                            Clear
                          </button>
                        )}
                      </div>

                      <div className="vm-toolbar__popover-columns">
                        <div className="vm-toolbar__popover-group">
                          <span className="vm-toolbar__popover-label">Status</span>
                          {STATUS_OPTIONS.map((option) => (
                            <button
                              type="button"
                              key={option.id}
                              className={`vm-toolbar__popover-option ${
                                statusFilter === option.id ? 'is-selected' : ''
                              }`}
                              onClick={() => setStatusFilter(option.id)}
                            >
                              <span>{option.label}</span>
                              {statusFilter === option.id && <Check size={14} />}
                            </button>
                          ))}
                        </div>

                        <div className="vm-toolbar__popover-group">
                          <span className="vm-toolbar__popover-label">Department</span>
                          <button
                            type="button"
                            className={`vm-toolbar__popover-option ${
                              departmentFilter === 'all' ? 'is-selected' : ''
                            }`}
                            onClick={() => setDepartmentFilter('all')}
                          >
                            <span>All departments</span>
                            {departmentFilter === 'all' && <Check size={14} />}
                          </button>
                          {departments.map((dept) => (
                            <button
                              type="button"
                              key={dept}
                              className={`vm-toolbar__popover-option ${
                                departmentFilter === dept ? 'is-selected' : ''
                              }`}
                              onClick={() => setDepartmentFilter(dept)}
                            >
                              <span>{dept}</span>
                              {departmentFilter === dept && <Check size={14} />}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="vm-toolbar__popover-wrap">
                  <button
                    type="button"
                    className={`vm-toolbar__icon-btn ${sortBy !== 'dateDesc' ? 'is-active' : ''}`}
                    aria-label="Sort"
                    aria-expanded={sortOpen}
                    onClick={() => {
                      setSortOpen((open) => !open);
                      setFilterOpen(false);
                    }}
                  >
                    <ArrowUpDown size={16} />
                  </button>

                  {sortOpen && (
                    <div className="vm-toolbar__popover">
                      <div className="vm-toolbar__popover-head">
                        <span className="vm-toolbar__popover-title">Sort by</span>
                      </div>
                      {SORT_OPTIONS.map((option) => (
                        <button
                          type="button"
                          key={option.id}
                          className={`vm-toolbar__popover-option ${
                            sortBy === option.id ? 'is-selected' : ''
                          }`}
                          onClick={() => setSortBy(option.id)}
                        >
                          <span>{option.label}</span>
                          {sortBy === option.id && <Check size={14} />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
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
                    <tr key={v.id} className="vm-table__row">
                      <td>
                        <Link
                          to={`/vacancies/${v.id}`}
                          className="vm-table__link"
                          aria-label={`Open ${v.title}`}
                        >
                          <div className="vm-table__title-cell">
                            <span className="vm-table__job-title">{v.title}</span>
                            <span className="vm-table__job-meta">
                              {v.id} · {v.location}
                            </span>
                          </div>
                        </Link>
                      </td>
                      <td>
                        <Link to={`/vacancies/${v.id}`} className="vm-table__link">
                          <span className="vm-table__dept">{v.department}</span>
                        </Link>
                      </td>
                      <td>
                        <Link to={`/vacancies/${v.id}`} className="vm-table__link">
                          <StatusBadge
                            status={v.status}
                            label={STATUS_LABELS[v.status] || v.status}
                          />
                        </Link>
                      </td>
                      <td>
                        <Link to={`/vacancies/${v.id}`} className="vm-table__link">
                          <div className="vm-table__applicants">
                            <Users size={14} />
                            <span>{getApplicants(v.id).length}</span>
                          </div>
                        </Link>
                      </td>
                      <td>
                        <Link to={`/vacancies/${v.id}`} className="vm-table__link">
                          <span className="vm-table__date">{v.dateCreated}</span>
                        </Link>
                      </td>
                      <td>
                        <DropdownMenu
                          trigger={<MoreVertical size={16} />}
                          ariaLabel={`Actions for ${v.title}`}
                          items={[
                            {
                              label: 'View Details',
                              icon: Eye,
                              onClick: () => navigate(`/vacancies/${v.id}`),
                            },
                            {
                              label: 'Edit Vacancy',
                              icon: Pencil,
                              onClick: () => navigate('/recruiter/create-vacancy'),
                            },
                            { label: 'Duplicate', icon: Copy },
                            { label: 'Close Vacancy', icon: X, danger: true },
                          ]}
                        />
                      </td>
                    </tr>
                  ))}
                  {paginated.length === 0 && (
                    <tr>
                      <td colSpan={6} className="vm-table__empty">
                        No vacancies match your search or filters.
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
