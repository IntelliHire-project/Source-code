import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Users,
  Calendar,
  CheckCircle,
  AlertCircle,
  XCircle,
  Search,
  Filter,
  Star,
  ChevronDown,
  X,
  FileText,
  Sliders,
  ChevronRight,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import RecruiterSidebar from '../../../components/common/RecruiterSidebar';
import TopBar from '../../../components/TopBar/TopBar';
import '../../../style.css';
import './InterviewedApplicants.css';

// Mock Vacancies
const VACANCIES = [
  { id: 'all', title: 'All Opportunities' },
  { id: 1, title: 'Software Engineer' },
  { id: 2, title: 'Product Manager' },
  { id: 3, title: 'UX Designer' }
];

// Mock Interview Rounds
const ROUNDS = [
  'All Rounds',
  'Technical',
  'HR Portfolio Review',
  'Final Cultural Fit',
  'Technical Case Study',
  'HR Screening',
  'Architecture Final'
];

// Mock Panel Members
const PANEL_MEMBERS = [
  'All Interviewers',
  'J. Silva (Tech Lead)',
  'K. Perera (Senior Dev)',
  'M. Dias (HR Manager)',
  'R. Fernando (Engineering VP)',
  'T. Kumara (Senior QA)',
  'S. Ali (Product Director)',
  'N. Gupta (HR Lead)'
];

// Rich Mock Data for Interviewed Candidates
const MOCK_INTERVIEWED = [
  {
    id: 'INT-001',
    name: 'Alice Fernando',
    role: 'Senior Fullstack Engineer',
    vacancyId: 1,
    vacancyTitle: 'Software Engineer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    email: 'alice.fernando@example.com',
    interviewRound: 'Technical',
    interviewDate: '25 Jul 2026',
    panel: ['J. Silva (Tech Lead)', 'K. Perera (Senior Dev)', 'N. Gupta (HR Lead)'],
    scores: {
      commSkills: 4,
      techSkills: 5,
      problemSolving: 4,
      teamwork: 4,
      overallRating: 4.5
    },
    remarks: 'Excellent knowledge of React, Node.js microservices, and system design. Communicates clearly under pressure and explains complex technical architectures step-by-step.',
    recommendation: 'Hire',
    status: 'Completed'
  },
  {
    id: 'INT-002',
    name: 'Kamal Perera',
    role: 'UI/UX Designer',
    vacancyId: 3,
    vacancyTitle: 'UX Designer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    email: 'kamal.perera@example.com',
    interviewRound: 'HR Portfolio Review',
    interviewDate: '25 Jul 2026',
    panel: ['M. Dias (HR Manager)', 'R. Fernando (Engineering VP)', 'S. Ali (Product Director)'],
    scores: {
      commSkills: 4,
      techSkills: 3,
      problemSolving: 4,
      teamwork: 5,
      overallRating: 4.0
    },
    remarks: 'Strong portfolio with excellent user-centered design thinking. Proactively identified usability issues in similar product lines. Minor gaps in design system engineering.',
    recommendation: 'Hold',
    status: 'In Review'
  },
  {
    id: 'INT-003',
    name: 'Nimal Silva',
    role: 'QA Automation Engineer',
    vacancyId: 1,
    vacancyTitle: 'Software Engineer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    email: 'nimal.silva@example.com',
    interviewRound: 'Final Cultural Fit',
    interviewDate: '26 Jul 2026',
    panel: ['J. Silva (Tech Lead)', 'K. Perera (Senior Dev)', 'N. Gupta (HR Lead)'],
    scores: {
      commSkills: 3,
      techSkills: 4,
      problemSolving: 3,
      teamwork: 4,
      overallRating: 3.2
    },
    remarks: 'Good automation skills, particularly with Selenium/Cypress. However, showed some difficulty when handling cross-functional collaboration conflicts during design discussions.',
    recommendation: 'Reject',
    status: 'Completed'
  },
  {
    id: 'INT-004',
    name: 'Sara Jayawardena',
    role: 'Business Analyst',
    vacancyId: 2,
    vacancyTitle: 'Product Manager',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    email: 'sara.jayawardena@example.com',
    interviewRound: 'Technical Case Study',
    interviewDate: '27 Jul 2026',
    panel: ['M. Dias (HR Manager)', 'T. Kumara (Senior QA)', 'S. Ali (Product Director)'],
    scores: {
      commSkills: 5,
      techSkills: 4,
      problemSolving: 5,
      teamwork: 5,
      overallRating: 4.8
    },
    remarks: 'Outstanding case study presentation. Identified client pain points with remarkable analytical precision. Proposed actionable solutions that align with business KPIs.',
    recommendation: 'Hire',
    status: 'Completed'
  },
  {
    id: 'INT-005',
    name: 'Ruwan Bandara',
    role: 'Product Manager',
    vacancyId: 2,
    vacancyTitle: 'Product Manager',
    avatar: null,
    email: 'ruwan.bandara@example.com',
    interviewRound: 'HR Screening',
    interviewDate: '28 Jul 2026',
    panel: ['J. Silva (Tech Lead)', 'K. Perera (Senior Dev)', 'N. Gupta (HR Lead)'],
    scores: {
      commSkills: 4,
      techSkills: 3,
      problemSolving: 4,
      teamwork: 4,
      overallRating: 3.8
    },
    remarks: 'Great product vision and stakeholder management experience. Background aligns well with team culture, though technical details on software development cycles were high-level.',
    recommendation: 'Hold',
    status: 'In Review'
  },
  {
    id: 'INT-006',
    name: 'Dilhani Wickramasinghe',
    role: 'DevOps Lead',
    vacancyId: 1,
    vacancyTitle: 'Software Engineer',
    avatar: null,
    email: 'dilhani.w@example.com',
    interviewRound: 'Architecture Final',
    interviewDate: '29 Jul 2026',
    panel: ['J. Silva (Tech Lead)', 'K. Perera (Senior Dev)', 'N. Gupta (HR Lead)'],
    scores: {
      commSkills: 4,
      techSkills: 5,
      problemSolving: 5,
      teamwork: 3,
      overallRating: 4.6
    },
    remarks: 'Exceptional architecture knowledge and CI/CD pipeline design. Has experience leading cloud-native transitions on AWS. Excellent candidate for DevOps/Infrastructure roles.',
    recommendation: 'Hire',
    status: 'Completed'
  },
  {
    id: 'INT-007',
    name: 'Alex Sterling',
    role: 'Senior Frontend Architect',
    vacancyId: 1,
    vacancyTitle: 'Software Engineer',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80',
    email: 'alex.sterling@example.com',
    interviewRound: 'Technical',
    interviewDate: '28 Jul 2026',
    panel: ['J. Silva (Tech Lead)', 'K. Perera (Senior Dev)'],
    scores: {
      commSkills: 5,
      techSkills: 4.8,
      problemSolving: 4.5,
      teamwork: 4,
      overallRating: 4.6
    },
    remarks: 'Strong frontend architect with great communication skills and AWS knowledge. Solid engineering principles. Answers questions deeply with technical examples.',
    recommendation: 'Hire',
    status: 'Completed'
  },
  {
    id: 'INT-008',
    name: 'Diana Prince',
    role: 'Senior Product Manager',
    vacancyId: 2,
    vacancyTitle: 'Product Manager',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&h=100&q=80',
    email: 'diana.prince@example.com',
    interviewRound: 'Final Cultural Fit',
    interviewDate: '29 Jul 2026',
    panel: ['R. Fernando (Engineering VP)', 'S. Ali (Product Director)'],
    scores: {
      commSkills: 5,
      techSkills: 4.5,
      problemSolving: 5,
      teamwork: 5,
      overallRating: 4.9
    },
    remarks: 'Extremely strong candidate with proven leadership and business acumen. Fits right into the leadership mindset required for our product scale and speed.',
    recommendation: 'Hire',
    status: 'Completed'
  }
];

function InterviewedApplicants() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVacancy, setSelectedVacancy] = useState('all');
  const [selectedRound, setSelectedRound] = useState('All Rounds');
  const [selectedPanel, setSelectedPanel] = useState('All Interviewers');
  const [selectedRecFilter, setSelectedRecFilter] = useState('All'); // 'All', 'Hire', 'Hold', 'Reject'
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Derive stats
  const stats = useMemo(() => {
    const total = MOCK_INTERVIEWED.length;
    const hires = MOCK_INTERVIEWED.filter(c => c.recommendation === 'Hire').length;
    const holds = MOCK_INTERVIEWED.filter(c => c.recommendation === 'Hold').length;
    const reviews = MOCK_INTERVIEWED.filter(c => c.status === 'In Review').length;
    return { total, hires, holds, reviews };
  }, []);

  // Filter logic
  const filteredCandidates = useMemo(() => {
    return MOCK_INTERVIEWED.filter(candidate => {
      // Search text
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = candidate.name.toLowerCase().includes(q);
        const matchesRole = candidate.role.toLowerCase().includes(q);
        const matchesEmail = candidate.email.toLowerCase().includes(q);
        if (!matchesName && !matchesRole && !matchesEmail) return false;
      }

      // Vacancy filter
      if (selectedVacancy !== 'all' && candidate.vacancyId !== Number(selectedVacancy)) {
        return false;
      }

      // Interview round filter
      if (selectedRound !== 'All Rounds' && candidate.interviewRound !== selectedRound) {
        return false;
      }

      // Panel member filter
      if (selectedPanel !== 'All Interviewers') {
        const hasPanelist = candidate.panel.some(p => p === selectedPanel);
        if (!hasPanelist) return false;
      }

      // Recommendation filter
      if (selectedRecFilter !== 'All' && candidate.recommendation !== selectedRecFilter) {
        return false;
      }

      return true;
    });
  }, [searchQuery, selectedVacancy, selectedRound, selectedPanel, selectedRecFilter]);

  // Paginated candidates
  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage) || 1;
  const paginatedCandidates = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCandidates.slice(start, start + itemsPerPage);
  }, [filteredCandidates, currentPage]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedVacancy('all');
    setSelectedRound('All Rounds');
    setSelectedPanel('All Interviewers');
    setSelectedRecFilter('All');
    setCurrentPage(1);
  };

  const getRecommendationClass = (rec) => {
    switch (rec) {
      case 'Hire': return 'badge-rec-hire';
      case 'Hold': return 'badge-rec-hold';
      case 'Reject': return 'badge-rec-reject';
      default: return 'badge-rec-neutral';
    }
  };

  const renderStars = (rating) => {
    const rounded = Math.round(rating);
    return (
      <div className="stars-row">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            size={14}
            fill={star <= rounded ? 'var(--accent)' : 'none'}
            stroke={star <= rounded ? 'var(--accent)' : '#4E505F'}
          />
        ))}
        <span className="rating-num">({rating})</span>
      </div>
    );
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarBg = (name) => {
    const colors = ['#F0B90B', '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899', '#F97316'];
    return colors[name.charCodeAt(0) % colors.length];
  };

  return (
    <div className="create-vacancy interviewed-page">
      <RecruiterSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeItem="Interviewed"
      />

      <div className="create-vacancy__main">
        <TopBar
          user={{ name: 'Sarah Parker', role: 'Talent Acquisition Partner' }}
          notificationsCount={3}
          searchPlaceholder="Search interviewed candidates..."
          onSearch={(q) => {
            setSearchQuery(q);
            setCurrentPage(1);
          }}
          onHamburgerClick={() => setSidebarOpen(true)}
        />

        <main className="interviewed-content">
          {/* Breadcrumbs */}
          <div className="interviewed-breadcrumbs">
            <span>Applicants</span>
            <ChevronRight size={14} />
            <span className="interviewed-breadcrumbs__active">Interviewed Board</span>
          </div>

          {/* Navigation Tabs */}
          <div className="applicants-tabs-nav">
            <button className="tab-nav-btn" onClick={() => navigate('/recruiter/applicants/all')}>
              All Applicants
            </button>
            <button className="tab-nav-btn" onClick={() => navigate('/recruiter/applicants/ranked')}>
              Ranked Candidates
            </button>
            <button className="tab-nav-btn" onClick={() => navigate('/recruiter/applicants/shortlisted')}>
              Shortlisted
            </button>
            <button className="tab-nav-btn active">
              Interviewed
            </button>
          </div>

          {/* Stats Row */}
          <section className="interviewed-stats-grid">
            <div className="interviewed-stat-card">
              <div className="stat-card-info">
                <span className="stat-label">Total Interviewed</span>
                <span className="stat-value">{stats.total}</span>
                <span className="stat-subtext">Completed or in review</span>
              </div>
              <div className="stat-icon-wrap">
                <Users size={20} />
              </div>
            </div>

            <div className="interviewed-stat-card">
              <div className="stat-card-info">
                <span className="stat-label">Offers Recommended</span>
                <span className="stat-value text-green">{stats.hires}</span>
                <span className="stat-subtext positive"><TrendingUp size={12} /> {Math.round((stats.hires/stats.total)*100)}% Conversion Rate</span>
              </div>
              <div className="stat-icon-wrap icon-green">
                <UserCheck size={20} />
              </div>
            </div>

            <div className="interviewed-stat-card">
              <div className="stat-card-info">
                <span className="stat-label">Pending In-Review</span>
                <span className="stat-value text-yellow">{stats.reviews}</span>
                <span className="stat-subtext">Awaiting panel consensus</span>
              </div>
              <div className="stat-icon-wrap icon-yellow">
                <AlertCircle size={20} />
              </div>
            </div>
          </section>

          {/* Filter Dashboard Card */}
          <section className="filters-dashboard-card">
            <div className="filters-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Filter size={18} className="text-yellow" />
                <h3 className="filters-title">Filter & Refine Candidates</h3>
              </div>
              {(selectedVacancy !== 'all' || selectedRound !== 'All Rounds' || selectedPanel !== 'All Interviewers' || selectedRecFilter !== 'All' || searchQuery !== '') && (
                <button className="btn-reset-filters" onClick={handleResetFilters}>
                  Clear All Filters
                </button>
              )}
            </div>

            <div className="filters-grid">
              {/* Search Box */}
              <div className="filter-item">
                <label className="filter-label">Search Candidate</label>
                <div className="filter-input-wrap">
                  <Search size={14} className="filter-search-icon" />
                  <input
                    type="text"
                    className="filter-input-field"
                    placeholder="Name, role, or email..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>

              {/* Vacancy Selector */}
              <div className="filter-item">
                <label className="filter-label">Vacancy / Job Title</label>
                <div className="filter-select-wrap">
                  <select
                    className="filter-select-field"
                    value={selectedVacancy}
                    onChange={(e) => {
                      setSelectedVacancy(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    {VACANCIES.map((v) => (
                      <option key={v.id} value={v.id}>{v.title}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="select-arrow" />
                </div>
              </div>

              {/* Interview Round Filter */}
              <div className="filter-item">
                <label className="filter-label">Interview Round</label>
                <div className="filter-select-wrap">
                  <select
                    className="filter-select-field"
                    value={selectedRound}
                    onChange={(e) => {
                      setSelectedRound(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    {ROUNDS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="select-arrow" />
                </div>
              </div>

              {/* Panel Interviewer Filter */}
              <div className="filter-item">
                <label className="filter-label">Panel Interviewer</label>
                <div className="filter-select-wrap">
                  <select
                    className="filter-select-field"
                    value={selectedPanel}
                    onChange={(e) => {
                      setSelectedPanel(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    {PANEL_MEMBERS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="select-arrow" />
                </div>
              </div>

              {/* Recommendation Filter */}
              <div className="filter-item">
                <label className="filter-label">Recommendation</label>
                <div className="filter-select-wrap">
                  <select
                    className="filter-select-field"
                    value={selectedRecFilter}
                    onChange={(e) => {
                      setSelectedRecFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="All">All Recommendations</option>
                    <option value="Hire">Hire</option>
                    <option value="Hold">Hold</option>
                    <option value="Reject">Reject</option>
                  </select>
                  <ChevronDown size={14} className="select-arrow" />
                </div>
              </div>
            </div>
          </section>

          {/* Candidates List Container */}
          <section className="candidates-list-card">
            <div className="list-card-header">
              <div>
                <h3 className="list-title">Interviewed Candidate Logs</h3>
                <p className="list-subtitle">Showing {filteredCandidates.length} applicants</p>
              </div>
            </div>

            <div className="table-responsive">
              <table className="interviewed-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Vacancy</th>
                    <th>Interview Round</th>
                    <th>Interviewer Panel</th>
                    <th>Overall Score</th>
                    <th>Recommendation</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCandidates.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="empty-table-cell">
                        <AlertCircle size={24} style={{ marginBottom: '8px', color: 'var(--text-on-dark-muted)' }} />
                        <p>No interviewed candidates match the selected filters.</p>
                        <button className="btn-reset-filters" style={{ marginTop: '8px' }} onClick={handleResetFilters}>
                          Reset Filters
                        </button>
                      </td>
                    </tr>
                  ) : (
                    paginatedCandidates.map((candidate) => (
                      <tr key={candidate.id} className="candidate-row">
                        <td>
                          <div className="candidate-cell-info">
                            {candidate.avatar ? (
                              <img src={candidate.avatar} alt={candidate.name} className="cand-avatar" />
                            ) : (
                              <div className="cand-avatar-fallback" style={{ backgroundColor: getAvatarBg(candidate.name) }}>
                                {getInitials(candidate.name)}
                              </div>
                            )}
                            <div>
                              <div className="cand-name">{candidate.name}</div>
                              <div className="cand-role">{candidate.role}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="vacancy-badge">
                            <Briefcase size={12} style={{ marginRight: '6px' }} />
                            {candidate.vacancyTitle}
                          </div>
                        </td>
                        <td>
                          <div className="round-cell-info">
                            <span className="round-text">{candidate.interviewRound}</span>
                            <span className="round-date">
                              <Calendar size={10} style={{ marginRight: '4px' }} />
                              {candidate.interviewDate}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="panel-list-wrap">
                            <div className="panel-avatars">
                              {candidate.panel.slice(0, 3).map((panelist, index) => {
                                const initials = panelist.split(' ').map(x => x[0]).join('');
                                return (
                                  <div
                                    key={index}
                                    className="panel-avatar-chip"
                                    title={panelist}
                                    style={{
                                      backgroundColor: getAvatarBg(panelist),
                                      zIndex: 3 - index
                                    }}
                                  >
                                    {initials.slice(0, 2)}
                                  </div>
                                );
                              })}
                              {candidate.panel.length > 3 && (
                                <div className="panel-avatar-chip more-chip" title={`${candidate.panel.length - 3} more`}>
                                  +{candidate.panel.length - 3}
                                </div>
                              )}
                            </div>
                            <span className="panel-text-summary" title={candidate.panel.join(', ')}>
                              {candidate.panel.length} Interviewers
                            </span>
                          </div>
                        </td>
                        <td>
                          {renderStars(candidate.scores.overallRating)}
                        </td>
                        <td>
                          <span className={`badge-rec ${getRecommendationClass(candidate.recommendation)}`}>
                            {candidate.recommendation === 'Hire' && <CheckCircle size={10} style={{ marginRight: '4px' }} />}
                            {candidate.recommendation === 'Hold' && <AlertCircle size={10} style={{ marginRight: '4px' }} />}
                            {candidate.recommendation === 'Reject' && <XCircle size={10} style={{ marginRight: '4px' }} />}
                            {candidate.recommendation}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="btn-view-evaluation"
                            onClick={() => setSelectedCandidate(candidate)}
                          >
                            View Evaluation
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {filteredCandidates.length > itemsPerPage && (
              <div className="table-footer-pagination">
                <span className="pagination-summary">
                  Showing <strong>{(currentPage - 1) * itemsPerPage + 1}</strong> to{' '}
                  <strong>{Math.min(currentPage * itemsPerPage, filteredCandidates.length)}</strong> of{' '}
                  <strong>{filteredCandidates.length}</strong> candidates
                </span>

                <div className="pagination-buttons">
                  <button
                    className="pagination-arrow-btn"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      className={`pagination-num-btn ${currentPage === i + 1 ? 'active' : ''}`}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    className="pagination-arrow-btn"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </section>
        </main>
      </div>

      {/* Candidate Scorecard Modal/Drawer */}
      {selectedCandidate && (
        <div className="evaluation-modal-overlay" onClick={() => setSelectedCandidate(null)}>
          <div className="evaluation-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="evaluation-modal-header">
              <div className="modal-header-title-block">
                <span className="gold-accent-line" />
                <h3 className="modal-title-text">Candidate Interview Evaluation Scorecard</h3>
              </div>
              <button className="btn-close-modal" onClick={() => setSelectedCandidate(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="evaluation-modal-body">
              {/* Profile Card Summary */}
              <div className="modal-profile-summary">
                {selectedCandidate.avatar ? (
                  <img src={selectedCandidate.avatar} alt={selectedCandidate.name} className="modal-profile-avatar" />
                ) : (
                  <div className="modal-profile-avatar-fallback" style={{ backgroundColor: getAvatarBg(selectedCandidate.name) }}>
                    {getInitials(selectedCandidate.name)}
                  </div>
                )}
                <div className="modal-profile-info">
                  <h4 className="modal-candidate-name">{selectedCandidate.name}</h4>
                  <p className="modal-candidate-role">{selectedCandidate.role}</p>
                  <p className="modal-candidate-email">{selectedCandidate.email}</p>
                </div>
                <div className="modal-rating-badge">
                  <span className="rating-score">{selectedCandidate.scores.overallRating}</span>
                  <span className="rating-label">Overall Rating</span>
                </div>
              </div>

              {/* Grid: Round Details & Panel Members */}
              <div className="modal-details-grid">
                <div className="detail-box">
                  <span className="detail-box-label">Interview Round</span>
                  <span className="detail-box-value highlight">{selectedCandidate.interviewRound}</span>
                  <span className="detail-box-sub">{selectedCandidate.interviewDate}</span>
                </div>

                <div className="detail-box">
                  <span className="detail-box-label">Interviewer Panel</span>
                  <div className="detail-panel-list">
                    {selectedCandidate.panel.map((panelist, index) => (
                      <span key={index} className="detail-panelist-tag">
                        {panelist}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ratings breakdown */}
              <div className="modal-ratings-breakdown">
                <h4 className="section-subtitle-text">
                  <Sliders size={14} className="text-yellow" style={{ marginRight: '6px' }} />
                  Evaluation Metric Scores
                </h4>

                <div className="metrics-bars-list">
                  <div className="metric-bar-item">
                    <div className="metric-label-row">
                      <span>Communication Skills</span>
                      <strong>{selectedCandidate.scores.commSkills} / 5</strong>
                    </div>
                    <div className="metric-progress-track">
                      <div
                        className="metric-progress-fill"
                        style={{ width: `${(selectedCandidate.scores.commSkills / 5) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="metric-bar-item">
                    <div className="metric-label-row">
                      <span>Technical Skills</span>
                      <strong>{selectedCandidate.scores.techSkills} / 5</strong>
                    </div>
                    <div className="metric-progress-track">
                      <div
                        className="metric-progress-fill"
                        style={{ width: `${(selectedCandidate.scores.techSkills / 5) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="metric-bar-item">
                    <div className="metric-label-row">
                      <span>Problem Solving</span>
                      <strong>{selectedCandidate.scores.problemSolving} / 5</strong>
                    </div>
                    <div className="metric-progress-track">
                      <div
                        className="metric-progress-fill"
                        style={{ width: `${(selectedCandidate.scores.problemSolving / 5) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="metric-bar-item">
                    <div className="metric-label-row">
                      <span>Teamwork & Collaboration</span>
                      <strong>{selectedCandidate.scores.teamwork} / 5</strong>
                    </div>
                    <div className="metric-progress-track">
                      <div
                        className="metric-progress-fill"
                        style={{ width: `${(selectedCandidate.scores.teamwork / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Remarks/Remarks block */}
              <div className="modal-remarks-block">
                <h4 className="section-subtitle-text">
                  <FileText size={14} className="text-yellow" style={{ marginRight: '6px' }} />
                  Interviewer Panel Feedback Comments
                </h4>
                <p className="remarks-text-content">
                  "{selectedCandidate.remarks}"
                </p>
              </div>

              {/* Recommendation summary badge */}
              <div className="modal-recommendation-footer">
                <span className="rec-footer-label">Final Consensus Recommendation:</span>
                <span className={`badge-rec large ${getRecommendationClass(selectedCandidate.recommendation)}`}>
                  {selectedCandidate.recommendation === 'Hire' && <CheckCircle size={14} style={{ marginRight: '6px' }} />}
                  {selectedCandidate.recommendation === 'Hold' && <AlertCircle size={14} style={{ marginRight: '6px' }} />}
                  {selectedCandidate.recommendation === 'Reject' && <XCircle size={14} style={{ marginRight: '6px' }} />}
                  {selectedCandidate.recommendation}
                </span>
              </div>
            </div>

            <div className="evaluation-modal-footer">
              <button className="btn-modal-close-action" onClick={() => setSelectedCandidate(null)}>
                Close Scorecard
              </button>
              <button
                className="btn-modal-eval-details"
                onClick={() => {
                  setSelectedCandidate(null);
                  navigate('/recruiter/interviews/evaluation');
                }}
              >
                Go to Panel & Evaluation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InterviewedApplicants;
