import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Briefcase,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Flag,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  AlertTriangle,
  Building,
  MapPin,
  DollarSign,
  Clock,
  Calendar,
  User,
  BarChart2,
  Download,
  RefreshCw,
} from 'lucide-react';
import AdminSidebar from '../../../components/common/AdminSidebar';
import TopBar from '../../../components/TopBar/TopBar';
import AdminToast from '../../../components/common/AdminToast';
import { getJobListings, saveJobListings, appendAuditLog } from '../../../services/adminStorage';
import './JobModeration.css';

// ── Initial Mock Job Listings ─────────────────────────────────────────
const INITIAL_JOBS = [
  {
    id: 'JOB-1001',
    title: 'Senior Frontend Engineer',
    company: 'TechFlow Systems',
    companyLogo: 'https://api.dicebear.com/7.x/initials/svg?seed=TF',
    location: 'San Francisco, CA',
    type: 'Full-time',
    category: 'Engineering',
    salary: '$130,000 – $160,000',
    postedDate: '2024-05-20',
    status: 'pending',
    applicants: 42,
    description: 'We are looking for a Senior Frontend Engineer to join our product team. You will be responsible for building and maintaining our customer-facing web applications using React, TypeScript, and modern tooling.',
    recruiter: 'Priya Sharma',
    recruiterEmail: 'p.sharma@techflow.io',
    flagReason: null,
  },
  {
    id: 'JOB-1002',
    title: 'ML Operations Specialist',
    company: 'DataPulse AI',
    companyLogo: 'https://api.dicebear.com/7.x/initials/svg?seed=DP',
    location: 'Remote',
    type: 'Contract',
    category: 'Data Science',
    salary: '$90 – $120 / hr',
    postedDate: '2024-05-21',
    status: 'active',
    applicants: 18,
    description: 'DataPulse AI seeks a MLOps engineer to build, deploy, and monitor machine learning pipelines at scale. Experience with Kubernetes, Airflow, and major cloud providers required.',
    recruiter: 'James Chen',
    recruiterEmail: 'j.chen@datapulse.ai',
    flagReason: null,
  },
  {
    id: 'JOB-1003',
    title: 'Creative Director',
    company: 'Nexus Creative',
    companyLogo: 'https://api.dicebear.com/7.x/initials/svg?seed=NC',
    location: 'New York, NY',
    type: 'Full-time',
    category: 'Design',
    salary: '$110,000 – $140,000',
    postedDate: '2024-05-19',
    status: 'flagged',
    applicants: 7,
    description: 'Lead our creative vision and brand identity. The role involves unclear compensation terms and requires unpaid trial period which may violate platform guidelines.',
    recruiter: 'Sophia Lee',
    recruiterEmail: 's.lee@nexuscreative.co',
    flagReason: 'Unpaid trial period clause violates platform policy §4.2',
  },
  {
    id: 'JOB-1004',
    title: 'Sustainability Consultant',
    company: 'Green Horizon Ltd',
    companyLogo: 'https://api.dicebear.com/7.x/initials/svg?seed=GH',
    location: 'London, UK',
    type: 'Part-time',
    category: 'Consulting',
    salary: '£45,000 – £55,000',
    postedDate: '2024-05-18',
    status: 'rejected',
    applicants: 0,
    description: 'This listing was rejected due to missing required company registration information and unverified contact details.',
    recruiter: 'Oliver Watts',
    recruiterEmail: 'o.watts@greenhorizon.uk',
    flagReason: 'Missing company registration number. Contact details unverified.',
  },
  {
    id: 'JOB-1005',
    title: 'Product Manager — FinTech',
    company: 'Stellar Fintech',
    companyLogo: 'https://api.dicebear.com/7.x/initials/svg?seed=SF',
    location: 'Singapore',
    type: 'Full-time',
    category: 'Product',
    salary: 'SGD 120,000 – 150,000',
    postedDate: '2024-05-22',
    status: 'pending',
    applicants: 31,
    description: 'Stellar Fintech is looking for a strategic product manager to own the roadmap for our retail investment platform. You will work with engineering, design and regulatory teams.',
    recruiter: 'Mei Lin',
    recruiterEmail: 'm.lin@stellarfintech.sg',
    flagReason: null,
  },
  {
    id: 'JOB-1006',
    title: 'DevOps Engineer (AWS)',
    company: 'CloudScale Inc.',
    companyLogo: 'https://api.dicebear.com/7.x/initials/svg?seed=CS',
    location: 'Austin, TX',
    type: 'Full-time',
    category: 'Engineering',
    salary: '$115,000 – $145,000',
    postedDate: '2024-05-17',
    status: 'active',
    applicants: 55,
    description: 'CloudScale is hiring a seasoned DevOps engineer to manage our AWS infrastructure, CI/CD pipelines, and help drive our SOC 2 compliance initiative.',
    recruiter: 'Ryan Park',
    recruiterEmail: 'r.park@cloudscale.io',
    flagReason: null,
  },
  {
    id: 'JOB-1007',
    title: 'Compliance Analyst',
    company: 'Aureum Capital',
    companyLogo: 'https://api.dicebear.com/7.x/initials/svg?seed=AC',
    location: 'Dubai, UAE',
    type: 'Full-time',
    category: 'Finance',
    salary: 'AED 180,000 – 220,000',
    postedDate: '2024-05-23',
    status: 'pending',
    applicants: 12,
    description: 'Join our compliance team in Dubai. Monitor regulatory requirements across GCC markets, prepare reports for regulators, and partner with legal and risk teams.',
    recruiter: 'Yasmin Al-Rashid',
    recruiterEmail: 'y.alrashid@aureum.com',
    flagReason: null,
  },
  {
    id: 'JOB-1008',
    title: 'UX Research Lead',
    company: 'Aura Design Studio',
    companyLogo: 'https://api.dicebear.com/7.x/initials/svg?seed=AD',
    location: 'Toronto, Canada',
    type: 'Full-time',
    category: 'Design',
    salary: 'CAD 95,000 – 120,000',
    postedDate: '2024-05-16',
    status: 'flagged',
    applicants: 9,
    description: 'Lead qualitative and quantitative research for our product portfolio. This listing was auto-flagged for potential keyword stuffing in the requirements section.',
    recruiter: 'Lena Braun',
    recruiterEmail: 'l.braun@auradesign.ca',
    flagReason: 'Auto-flagged: Possible keyword stuffing detected in requirements field',
  },
];

const STATUS_TABS = ['All', 'pending', 'active', 'flagged', 'rejected'];
const JOB_TYPES   = ['All Types', 'Full-time', 'Part-time', 'Contract', 'Remote'];
const CATEGORIES  = ['All Categories', 'Engineering', 'Design', 'Data Science', 'Product', 'Finance', 'Consulting'];
const ITEMS_PER_PAGE = 5;

const STATUS_META = {
  pending:  { label: 'Pending Review', cls: 'jm-badge--pending' },
  active:   { label: 'Active',         cls: 'jm-badge--active' },
  flagged:  { label: 'Flagged',        cls: 'jm-badge--flagged' },
  rejected: { label: 'Rejected',       cls: 'jm-badge--rejected' },
};

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || { label: status, cls: '' };
  return <span className={`jm-status-badge ${meta.cls}`}>{meta.label}</span>;
}

// ── Job Detail Modal ──────────────────────────────────────────────────
function JobDetailModal({ job, onClose, onApprove, onReject, onFlag }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!job) return null;

  return (
    <div
      className="jm-modal-overlay"
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={`Job details: ${job.title}`}
    >
      <div className="jm-modal">
        {/* Header */}
        <div className="jm-modal__header">
          <div className="jm-modal__header-left">
            <img src={job.companyLogo} alt="" className="jm-modal__company-logo" />
            <div>
              <h2 className="jm-modal__title">{job.title}</h2>
              <p className="jm-modal__subtitle">{job.company} · {job.location}</p>
            </div>
          </div>
          <div className="jm-modal__header-right">
            <StatusBadge status={job.status} />
            <button className="jm-modal__close" onClick={onClose} aria-label="Close modal" type="button">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="jm-modal__body">
          {/* Flag warning if flagged */}
          {job.flagReason && (
            <div className="jm-modal__flag-alert">
              <AlertTriangle size={16} />
              <span>{job.flagReason}</span>
            </div>
          )}

          {/* Meta grid */}
          <div className="jm-modal__meta-grid">
            <div className="jm-modal__meta-item">
              <Building size={14} className="jm-modal__meta-icon" />
              <div>
                <span className="jm-modal__meta-label">Company</span>
                <span className="jm-modal__meta-value">{job.company}</span>
              </div>
            </div>
            <div className="jm-modal__meta-item">
              <MapPin size={14} className="jm-modal__meta-icon" />
              <div>
                <span className="jm-modal__meta-label">Location</span>
                <span className="jm-modal__meta-value">{job.location}</span>
              </div>
            </div>
            <div className="jm-modal__meta-item">
              <Clock size={14} className="jm-modal__meta-icon" />
              <div>
                <span className="jm-modal__meta-label">Employment Type</span>
                <span className="jm-modal__meta-value">{job.type}</span>
              </div>
            </div>
            <div className="jm-modal__meta-item">
              <DollarSign size={14} className="jm-modal__meta-icon" />
              <div>
                <span className="jm-modal__meta-label">Salary Range</span>
                <span className="jm-modal__meta-value">{job.salary}</span>
              </div>
            </div>
            <div className="jm-modal__meta-item">
              <Briefcase size={14} className="jm-modal__meta-icon" />
              <div>
                <span className="jm-modal__meta-label">Category</span>
                <span className="jm-modal__meta-value">{job.category}</span>
              </div>
            </div>
            <div className="jm-modal__meta-item">
              <Calendar size={14} className="jm-modal__meta-icon" />
              <div>
                <span className="jm-modal__meta-label">Posted</span>
                <span className="jm-modal__meta-value">{job.postedDate}</span>
              </div>
            </div>
            <div className="jm-modal__meta-item">
              <User size={14} className="jm-modal__meta-icon" />
              <div>
                <span className="jm-modal__meta-label">Recruiter</span>
                <span className="jm-modal__meta-value">{job.recruiter}</span>
              </div>
            </div>
            <div className="jm-modal__meta-item">
              <BarChart2 size={14} className="jm-modal__meta-icon" />
              <div>
                <span className="jm-modal__meta-label">Applicants</span>
                <span className="jm-modal__meta-value">{job.applicants}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="jm-modal__desc-section">
            <h3 className="jm-modal__section-title">Job Description</h3>
            <p className="jm-modal__desc-text">{job.description}</p>
          </div>

          {/* Recruiter contact */}
          <div className="jm-modal__recruiter-card">
            <span className="jm-modal__recruiter-name">{job.recruiter}</span>
            <span className="jm-modal__recruiter-email">{job.recruiterEmail}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="jm-modal__footer">
          <button className="jm-modal__btn jm-modal__btn--secondary" onClick={onClose} type="button">
            Close
          </button>
          {job.status !== 'rejected' && (
            <button
              className="jm-modal__btn jm-modal__btn--danger"
              onClick={() => { onReject(job); onClose(); }}
              type="button"
            >
              <XCircle size={15} /> Reject Listing
            </button>
          )}
          {job.status !== 'flagged' && (
            <button
              className="jm-modal__btn jm-modal__btn--warning"
              onClick={() => { onFlag(job); onClose(); }}
              type="button"
            >
              <Flag size={15} /> Flag for Review
            </button>
          )}
          {job.status !== 'active' && (
            <button
              className="jm-modal__btn jm-modal__btn--success"
              onClick={() => { onApprove(job); onClose(); }}
              type="button"
            >
              <CheckCircle size={15} /> Approve Listing
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Reject / Flag Reason Modal ────────────────────────────────────────
function ReasonModal({ title, placeholder, onConfirm, onCancel, confirmLabel, confirmClass }) {
  const [reason, setReason] = useState('');

  return (
    <div className="jm-modal-overlay" onClick={onCancel} role="dialog" aria-modal="true">
      <div className="jm-reason-modal" onClick={(e) => e.stopPropagation()}>
        <div className="jm-reason-modal__header">
          <h3>{title}</h3>
          <button className="jm-modal__close" onClick={onCancel} type="button"><X size={16} /></button>
        </div>
        <div className="jm-reason-modal__body">
          <label className="jm-reason-modal__label">Reason (optional)</label>
          <textarea
            className="jm-reason-modal__textarea"
            placeholder={placeholder}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            autoFocus
          />
        </div>
        <div className="jm-reason-modal__footer">
          <button className="jm-modal__btn jm-modal__btn--secondary" onClick={onCancel} type="button">Cancel</button>
          <button
            className={`jm-modal__btn ${confirmClass}`}
            onClick={() => onConfirm(reason.trim())}
            type="button"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────
export default function JobModeration() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [jobs, setJobs] = useState(() => getJobListings(INITIAL_JOBS));
  const [toast, setToast] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery]     = useState('');
  const [activeTab, setActiveTab]         = useState('All');
  const [typeFilter, setTypeFilter]       = useState('All Types');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const filterRef = useRef(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [selectedJob, setSelectedJob]   = useState(null);  // detail modal
  const [rejectTarget, setRejectTarget] = useState(null);  // reject reason modal
  const [flagTarget, setFlagTarget]     = useState(null);  // flag reason modal

  const location = useLocation();

  // Read search intent from routing state (e.g. from Payments Transaction Modal)
  useEffect(() => {
    if (location.state?.searchJobTitle) {
      setSearchQuery(location.state.searchJobTitle);
      
      // Attempt to auto-select the job if it matches exactly
      const matchedJob = jobs.find(j => j.title === location.state.searchJobTitle);
      if (matchedJob) {
        setSelectedJob(matchedJob);
      }
    }
  }, [location.state, jobs]);

  // Close filter menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilterMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab, typeFilter, categoryFilter]);

  // ── KPI Stats ──────────────────────────────────────────────────────
  const kpi = useMemo(() => ({
    total:    jobs.length,
    pending:  jobs.filter(j => j.status === 'pending').length,
    active:   jobs.filter(j => j.status === 'active').length,
    flagged:  jobs.filter(j => j.status === 'flagged').length,
    rejected: jobs.filter(j => j.status === 'rejected').length,
  }), [jobs]);

  // ── Filtered List ──────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return jobs.filter((j) => {
      const matchesTab  = activeTab === 'All' || j.status === activeTab;
      const matchesType = typeFilter === 'All Types' || j.type === typeFilter;
      const matchesCat  = categoryFilter === 'All Categories' || j.category === categoryFilter;
      const matchesQ    = !q ||
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.id.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q);
      return matchesTab && matchesType && matchesCat && matchesQ;
    });
  }, [jobs, searchQuery, activeTab, typeFilter, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const pageJobs   = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // ── Mutation helpers ───────────────────────────────────────────────
  const updateJobStatus = useCallback((id, status, flagReason = null) => {
    const updated = jobs.map(j =>
      j.id === id ? { ...j, status, flagReason: flagReason !== null ? flagReason : j.flagReason } : j
    );
    setJobs(updated);
    saveJobListings(updated);
    return updated.find(j => j.id === id);
  }, [jobs]);

  const handleApprove = useCallback((job) => {
    updateJobStatus(job.id, 'active', null);
    appendAuditLog({ actionType: 'Job Listing Approved', module: 'JOB_MODERATION', status: 'success' });
    setToast({ type: 'success', message: `"${job.title}" at ${job.company} has been approved and is now live.` });
  }, [updateJobStatus]);

  const handleRejectConfirm = useCallback((reason) => {
    if (!rejectTarget) return;
    updateJobStatus(rejectTarget.id, 'rejected', reason || 'Rejected by admin.');
    appendAuditLog({ actionType: 'Job Listing Rejected', module: 'JOB_MODERATION', status: 'failure' });
    setToast({ type: 'error', message: `"${rejectTarget.title}" has been rejected and removed from listings.` });
    setRejectTarget(null);
  }, [rejectTarget, updateJobStatus]);

  const handleFlagConfirm = useCallback((reason) => {
    if (!flagTarget) return;
    updateJobStatus(flagTarget.id, 'flagged', reason || 'Flagged for policy review.');
    appendAuditLog({ actionType: 'Job Listing Flagged', module: 'JOB_MODERATION' });
    setToast({ type: 'warning', message: `"${flagTarget.title}" has been flagged for review.` });
    setFlagTarget(null);
  }, [flagTarget, updateJobStatus]);

  // ── Export CSV ─────────────────────────────────────────────────────
  const handleExport = () => {
    const csv = 'ID,Title,Company,Location,Type,Category,Status,Posted,Applicants\n' +
      filtered.map(j =>
        `${j.id},"${j.title}","${j.company}","${j.location}",${j.type},${j.category},${j.status},${j.postedDate},${j.applicants}`
      ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `job_listings_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setToast({ type: 'info', message: `Exported ${filtered.length} listings to CSV.` });
  };

  return (
    <div className="admin-theme admin-dashboard">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activeItem="Job moderation" />
      <AdminToast toast={toast} onDismiss={() => setToast(null)} />

      <div className="admin-dashboard__main jm-page">
        <TopBar
          user={{ name: 'Admin User', role: 'Administrator' }}
          notificationsCount={kpi.flagged + kpi.pending}
          searchPlaceholder="Search job listings..."
          onSearch={(q) => { setSearchQuery(q); }}
          onHamburgerClick={() => setSidebarOpen(true)}
        />

        <div className="jm-content">
          {/* ── Page Header ── */}
          <div className="jm-header">
            <div className="jm-header__left">
              <h1 className="jm-header__title">Job Moderation</h1>
              <p className="jm-header__subtitle">
                Review, approve, flag and reject job listings posted by verified recruiters.
              </p>
            </div>
            <div className="jm-header__actions">
              <button className="jm-btn jm-btn--outline" onClick={handleExport} type="button">
                <Download size={15} /> Export CSV
              </button>
            </div>
          </div>

          {/* ── KPI Cards ── */}
          <div className="jm-kpi-grid">
            <div className="jm-kpi-card" onClick={() => setActiveTab('All')}>
              <div className="jm-kpi-card__icon jm-kpi-card__icon--blue">
                <Briefcase size={18} />
              </div>
              <div className="jm-kpi-card__info">
                <span className="jm-kpi-card__label">Total Listings</span>
                <span className="jm-kpi-card__value">{kpi.total}</span>
              </div>
            </div>
            <div className="jm-kpi-card" onClick={() => setActiveTab('pending')}>
              <div className="jm-kpi-card__icon jm-kpi-card__icon--yellow">
                <Clock size={18} />
              </div>
              <div className="jm-kpi-card__info">
                <span className="jm-kpi-card__label">Pending Review</span>
                <span className="jm-kpi-card__value">{kpi.pending}</span>
              </div>
            </div>
            <div className="jm-kpi-card" onClick={() => setActiveTab('active')}>
              <div className="jm-kpi-card__icon jm-kpi-card__icon--green">
                <CheckCircle size={18} />
              </div>
              <div className="jm-kpi-card__info">
                <span className="jm-kpi-card__label">Active Listings</span>
                <span className="jm-kpi-card__value">{kpi.active}</span>
              </div>
            </div>
            <div className="jm-kpi-card" onClick={() => setActiveTab('flagged')}>
              <div className="jm-kpi-card__icon jm-kpi-card__icon--orange">
                <Flag size={18} />
              </div>
              <div className="jm-kpi-card__info">
                <span className="jm-kpi-card__label">Flagged</span>
                <span className="jm-kpi-card__value">{kpi.flagged}</span>
              </div>
            </div>
            <div className="jm-kpi-card" onClick={() => setActiveTab('rejected')}>
              <div className="jm-kpi-card__icon jm-kpi-card__icon--red">
                <XCircle size={18} />
              </div>
              <div className="jm-kpi-card__info">
                <span className="jm-kpi-card__label">Rejected</span>
                <span className="jm-kpi-card__value">{kpi.rejected}</span>
              </div>
            </div>
          </div>

          {/* ── Table Panel ── */}
          <div className="jm-table-panel">
            {/* Toolbar */}
            <div className="jm-toolbar">
              <div className="jm-toolbar__left">
                {/* Status tabs */}
                <div className="jm-tabs">
                  {STATUS_TABS.map(tab => (
                    <button
                      key={tab}
                      className={`jm-tab ${activeTab === tab ? 'jm-tab--active' : ''}`}
                      onClick={() => setActiveTab(tab)}
                      type="button"
                    >
                      {tab === 'All' ? 'All' : STATUS_META[tab].label}
                      <span className="jm-tab__count">
                        {tab === 'All' ? jobs.length : jobs.filter(j => j.status === tab).length}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="jm-toolbar__right">
                {/* Search */}
                <div className="jm-search">
                  <Search size={15} className="jm-search__icon" />
                  <input
                    className="jm-search__input"
                    type="text"
                    placeholder="Search by title, company, ID…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Filter dropdown */}
                <div className="jm-filter-wrap" ref={filterRef}>
                  <button
                    className="jm-btn jm-btn--outline"
                    type="button"
                    onClick={() => setShowFilterMenu(p => !p)}
                    aria-expanded={showFilterMenu}
                  >
                    <Filter size={14} /> Filters
                    {(typeFilter !== 'All Types' || categoryFilter !== 'All Categories') && (
                      <span className="jm-filter-dot" />
                    )}
                  </button>

                  {showFilterMenu && (
                    <div className="jm-filter-menu">
                      <div className="jm-filter-menu__group">
                        <label className="jm-filter-menu__label">Job Type</label>
                        {JOB_TYPES.map(t => (
                          <button
                            key={t}
                            type="button"
                            className={`jm-filter-menu__option ${typeFilter === t ? 'active' : ''}`}
                            onClick={() => { setTypeFilter(t); setShowFilterMenu(false); }}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                      <div className="jm-filter-menu__divider" />
                      <div className="jm-filter-menu__group">
                        <label className="jm-filter-menu__label">Category</label>
                        {CATEGORIES.map(c => (
                          <button
                            key={c}
                            type="button"
                            className={`jm-filter-menu__option ${categoryFilter === c ? 'active' : ''}`}
                            onClick={() => { setCategoryFilter(c); setShowFilterMenu(false); }}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                      <div className="jm-filter-menu__divider" />
                      <button
                        type="button"
                        className="jm-filter-menu__reset"
                        onClick={() => { setTypeFilter('All Types'); setCategoryFilter('All Categories'); setShowFilterMenu(false); }}
                      >
                        <RefreshCw size={13} /> Reset Filters
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="jm-table-wrapper">
              <table className="jm-table">
                <thead>
                  <tr>
                    <th>JOB LISTING</th>
                    <th>COMPANY</th>
                    <th>TYPE / CATEGORY</th>
                    <th>POSTED</th>
                    <th>APPLICANTS</th>
                    <th>STATUS</th>
                    <th className="text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {pageJobs.length > 0 ? pageJobs.map(job => (
                    <tr
                      key={job.id}
                      className={job.status === 'flagged' ? 'jm-row--flagged' : ''}
                      onClick={() => setSelectedJob(job)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <div className="jm-cell-title">
                          <span className="jm-cell-title__text">{job.title}</span>
                          <span className="jm-cell-title__id">{job.id}</span>
                        </div>
                      </td>
                      <td>
                        <div className="jm-cell-company">
                          <img src={job.companyLogo} alt="" className="jm-cell-company__logo" />
                          <div>
                            <span className="jm-cell-company__name">{job.company}</span>
                            <span className="jm-cell-company__loc">
                              <MapPin size={10} /> {job.location}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="jm-cell-type">
                          <span className="jm-type-badge">{job.type}</span>
                          <span className="jm-cell-type__cat">{job.category}</span>
                        </div>
                      </td>
                      <td className="jm-cell-muted">{job.postedDate}</td>
                      <td>
                        <div className="jm-cell-applicants">
                          <BarChart2 size={13} />
                          {job.applicants}
                        </div>
                      </td>
                      <td><StatusBadge status={job.status} /></td>
                      <td>
                        <div className="jm-cell-actions" onClick={(e) => e.stopPropagation()}>
                          <button
                            className="jm-icon-btn jm-icon-btn--view"
                            title="View details"
                            onClick={() => setSelectedJob(job)}
                            type="button"
                          >
                            <Eye size={15} />
                          </button>
                          {job.status !== 'active' && (
                            <button
                              className="jm-icon-btn jm-icon-btn--approve"
                              title="Approve listing"
                              onClick={() => handleApprove(job)}
                              type="button"
                            >
                              <CheckCircle size={15} />
                            </button>
                          )}
                          {job.status !== 'flagged' && (
                            <button
                              className="jm-icon-btn jm-icon-btn--flag"
                              title="Flag for review"
                              onClick={() => setFlagTarget(job)}
                              type="button"
                            >
                              <Flag size={15} />
                            </button>
                          )}
                          {job.status !== 'rejected' && (
                            <button
                              className="jm-icon-btn jm-icon-btn--reject"
                              title="Reject listing"
                              onClick={() => setRejectTarget(job)}
                              type="button"
                            >
                              <XCircle size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={7} className="jm-empty-state">
                        <Briefcase size={32} className="jm-empty-state__icon" />
                        <p>No job listings match the current filters.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="jm-table-footer">
              <span className="jm-table-footer__info">
                Showing {Math.min(filtered.length, (currentPage - 1) * ITEMS_PER_PAGE + 1)}–{Math.min(filtered.length, currentPage * ITEMS_PER_PAGE)} of <strong>{filtered.length}</strong> listings
              </span>
              <div className="jm-pagination">
                <button
                  className="jm-page-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  aria-label="Previous page"
                  type="button"
                >
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && arr[idx - 1] !== p - 1) acc.push('…');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, idx) =>
                    p === '…' ? (
                      <span key={`ellipsis-${idx}`} className="jm-page-ellipsis">…</span>
                    ) : (
                      <button
                        key={p}
                        className={`jm-page-btn jm-page-btn--num ${currentPage === p ? 'active' : ''}`}
                        onClick={() => setCurrentPage(p)}
                        type="button"
                      >
                        {p}
                      </button>
                    )
                  )
                }
                <button
                  className="jm-page-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                  aria-label="Next page"
                  type="button"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Detail Modal ── */}
      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onApprove={(job) => { handleApprove(job); setSelectedJob(null); }}
          onReject={(job) => { setRejectTarget(job); setSelectedJob(null); }}
          onFlag={(job) => { setFlagTarget(job); setSelectedJob(null); }}
        />
      )}

      {/* ── Reject Reason Modal ── */}
      {rejectTarget && (
        <ReasonModal
          title={`Reject "${rejectTarget.title}"`}
          placeholder="Describe why this listing is being rejected (visible to the recruiter)..."
          confirmLabel="Reject Listing"
          confirmClass="jm-modal__btn--danger"
          onConfirm={handleRejectConfirm}
          onCancel={() => setRejectTarget(null)}
        />
      )}

      {/* ── Flag Reason Modal ── */}
      {flagTarget && (
        <ReasonModal
          title={`Flag "${flagTarget.title}" for Review`}
          placeholder="Describe the policy concern or reason for flagging..."
          confirmLabel="Flag Listing"
          confirmClass="jm-modal__btn--warning"
          onConfirm={handleFlagConfirm}
          onCancel={() => setFlagTarget(null)}
        />
      )}
    </div>
  );
}
