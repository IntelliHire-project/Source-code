import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Users,
  Target,
  Clock,
  ChevronDown,
  ChevronRight,
  Play,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ExternalLink,
  X,
  Sliders,
  Filter,
} from 'lucide-react';
import RecruiterSidebar from '../../../components/common/RecruiterSidebar';
import TopBar from '../../../components/TopBar/TopBar';
import './RankedApplicants.css';
import '../../../style.css';

// Rich Mock Candidates Data
const MOCK_CANDIDATES = [
  {
    rank: '#1',
    name: 'Alex Sterling',
    activeTime: 'ACTIVE 2H AGO',
    score: 94,
    skills: ['React', 'TypeScript', 'Node.js', 'AWS'],
    expMatch: 'Matched',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80',
    email: 'alex.sterling@example.com',
    phone: '+1 (555) 124-5678',
    experience: '6 Years',
    bio: 'Senior Frontend Engineer with deep expertise in building cloud-native React architectures. Passionate about performance tuning and UI design systems.',
    education: 'B.S. in Computer Science - Stanford University',
    matchReason: 'Exceptional match. Over 5 years of industry React experience, verified AWS certification, and strong full-stack skills matching job description.',
    shortlisted: true,
  },
  {
    rank: '#2',
    name: 'Sarah Jenkins',
    activeTime: 'ACTIVE 5H AGO',
    score: 88,
    skills: ['Python', 'React', 'PostgreSQL', 'Docker'],
    expMatch: 'Partial Match',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80',
    email: 'sarah.jenkins@example.com',
    phone: '+1 (555) 987-6543',
    experience: '4 Years',
    bio: 'Software Engineer skilled in backend API development using Python/Django and modern React frontends. Loves microservices architectures.',
    education: 'M.S. in Software Engineering - MIT',
    matchReason: 'Strong match. Has React and databases, but lacks professional AWS deployment experience. Recommended for a quick technical interview.',
  },
  {
    rank: '#3',
    name: 'Michael Chen',
    activeTime: 'ACTIVE 1D AGO',
    score: 72,
    skills: ['Java', 'Spring Boot', 'MySQL'],
    expMatch: 'Underqualified',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=100&h=100&q=80',
    email: 'michael.chen@example.com',
    phone: '+1 (555) 246-8101',
    experience: '2 Years',
    bio: 'Junior Backend Developer specializing in Java microservices. Fast learner with strong computer science fundamentals and algorithmic skills.',
    education: 'B.S. in Computer Engineering - UC Berkeley',
    matchReason: 'Underqualified. Candidate has solid backend foundation but lacks modern JavaScript framework experience (React) and cloud skills (AWS).',
  },
  {
    rank: '#4',
    name: 'Elena Rodriguez',
    activeTime: 'ACTIVE 3H AGO',
    score: 65,
    skills: ['Vue.js', 'JavaScript', 'Firebase'],
    expMatch: 'Matched',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=100&h=100&q=80',
    email: 'elena.rodriguez@example.com',
    phone: '+1 (555) 369-1215',
    experience: '5 Years',
    bio: 'Frontend Specialist focused on responsive web design and real-time databases. Deeply experienced in JavaScript frameworks and CSS modules.',
    education: 'B.A. in Web Design & Dev - UT Austin',
    matchReason: 'Partial core skills. Exceptional JavaScript and frontend developer, but core skills are Vue-heavy instead of React. Quick transferability expected.',
    shortlisted: true,
  },
  {
    rank: '#5',
    name: 'Jordan Smith',
    activeTime: 'ACTIVE 1W AGO',
    score: 42,
    skills: ['PHP', 'Laravel', 'jQuery'],
    expMatch: 'Mismatch',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80',
    email: 'jordan.smith@example.com',
    phone: '+1 (555) 456-7890',
    experience: '3 Years',
    bio: 'Full Stack PHP developer with experience building content management solutions and enterprise websites. Well-versed in traditional server-side rendering.',
    education: 'Self-Taught & Certified Web Developer',
    matchReason: 'Mismatch. Experience is centered around server-side PHP/Laravel and legacy jQuery. Missing modern React, TypeScript, and AWS cloud competencies.',
  },
  {
    rank: '#6',
    name: 'Priya Patel',
    activeTime: 'ACTIVE 4D AGO',
    score: 38,
    skills: ['Java', 'React Native'],
    expMatch: 'Mismatch',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80',
    email: 'priya.patel@example.com',
    phone: '+1 (555) 789-0123',
    experience: '3 Years',
    bio: 'Mobile App Developer focused on cross-platform frameworks. Experienced in React Native and Java/Android apps.',
    education: 'B.S. in Computer Science - Georgia Tech',
    matchReason: 'Mismatch. Specialized in mobile applications; lacks web application architecture, system design, and AWS environment expertise.',
  },
  {
    rank: '#7',
    name: 'Lucas Dubois',
    activeTime: 'ACTIVE 6D AGO',
    score: 35,
    skills: ['Ruby', 'Rails', 'PostgreSQL'],
    expMatch: 'Mismatch',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100&q=80',
    email: 'lucas.dubois@example.com',
    phone: '+1 (555) 890-1234',
    experience: '4 Years',
    bio: 'Backend specialist with Rails focus. Enjoys database optimization, SQL debugging, and setting up automated CI/CD pipelines.',
    education: 'B.S. in Software Engineering - Sorbonne University',
    matchReason: 'Mismatch. High proficiency in backend Ruby on Rails, but missing required React and AWS cloud experience.',
  },
  {
    rank: '#8',
    name: 'Emily Wong',
    activeTime: 'ACTIVE 2W AGO',
    score: 28,
    skills: ['HTML', 'CSS', 'jQuery'],
    expMatch: 'Mismatch',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&h=100&q=80',
    email: 'emily.wong@example.com',
    phone: '+1 (555) 901-2345',
    experience: '1 Year',
    bio: 'Entry-level UI Web Developer with a strong eye for graphics design and responsive layouts. Experienced with legacy sites.',
    education: 'Web Design Bootcamp Graduate',
    matchReason: 'Mismatch. Lacks required professional programming depth, framework knowledge, and cloud computing infrastructure experience.',
  },
];

function RankedApplicants() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [candidates, setCandidates] = useState(MOCK_CANDIDATES);
  const [isMatching, setIsMatching] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  
  // Tab State: 'All Applicants', 'Ranked Candidates', 'Shortlisted'
  const [activeTab, setActiveTab] = useState('Ranked Candidates');
  
  // Filtering & Sorting State
  const [sortBy, setSortBy] = useState('Highest Match');
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All'); // 'All', 'Matched', 'Partial Match', 'Underqualified', 'Mismatch'
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Handle run matching simulation
  const handleRunMatching = () => {
    setIsMatching(true);
    // Simulate AI scanning and ranking pipeline
    setTimeout(() => {
      setIsMatching(false);
      setToastMessage('AI matching engine completed successfully! 48 applicants processed.');
      setShowToast(true);
      
      // Auto dismiss toast after 4s
      setTimeout(() => {
        setShowToast(false);
      }, 4000);
    }, 2500);
  };

  // Perform Sorting and Filtering
  const filteredCandidates = candidates.filter((c) => {
    // Tab filtering
    if (activeTab === 'Shortlisted' && !c.shortlisted) return false;
    
    // Experience matching filtering
    if (activeFilter === 'All') return true;
    return c.expMatch === activeFilter;
  });

  const sortedCandidates = [...filteredCandidates].sort((a, b) => {
    if (sortBy === 'Highest Match') {
      return b.score - a.score;
    } else if (sortBy === 'Lowest Match') {
      return a.score - b.score;
    } else if (sortBy === 'Alphabetical') {
      return a.name.localeCompare(b.name);
    }
    return 0;
  });

  // Paginated List
  const totalPages = Math.ceil(sortedCandidates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCandidates = sortedCandidates.slice(startIndex, startIndex + itemsPerPage);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Matched':
        return <CheckCircle2 size={16} className="status-indicator--matched" />;
      case 'Partial Match':
        return <CheckCircle2 size={16} className="status-indicator--partial" />;
      case 'Underqualified':
        return <AlertCircle size={16} className="status-indicator--underqualified" />;
      case 'Mismatch':
      default:
        return <XCircle size={16} className="status-indicator--mismatch" />;
    }
  };

  return (
    <div className="create-vacancy ranked-page">
      <RecruiterSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeItem="Ranked Applicants"
      />

      <div className="create-vacancy__main">
        <TopBar
          user={{ name: 'Recruiter', role: 'Recruiter Account' }}
          notificationsCount={3}
          searchPlaceholder="Search applicants..."
          onSearch={(q) => {
            const query = q.toLowerCase();
            const filtered = MOCK_CANDIDATES.filter((c) =>
              c.name.toLowerCase().includes(query) ||
              c.skills.some((s) => s.toLowerCase().includes(query))
            );
            setCandidates(filtered);
            setCurrentPage(1);
          }}
          onHamburgerClick={() => setSidebarOpen(true)}
        />

        <main className="ranked-content">
          {/* Breadcrumbs */}
          <nav className="ranked-breadcrumbs">
            Vacancies / <span className="ranked-breadcrumbs__active">Software Engineer</span>
          </nav>

          {/* Header Section */}
          <div className="ranked-header">
            <div>
              <h1 className="ranked-header__title">
                Software Engineer <span className="ranked-header__number">#1023</span>
              </h1>
              <div className="ranked-header__meta">
                <span className="status-badge-active">Status: Active</span>
                <span className="posted-time">
                  <Clock size={15} /> Posted 12 days ago
                </span>
              </div>
            </div>
            <div className="ranked-header__actions">
              <button className="btn btn-outline">Edit Job</button>
              <button 
                className="btn btn-primary" 
                onClick={handleRunMatching}
                disabled={isMatching}
                style={{ opacity: isMatching ? 0.7 : 1 }}
              >
                <Play size={16} fill="currentColor" /> {isMatching ? 'Matching...' : 'Run Matching'}
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="ranked-stats-grid">
            <div className="stat-card">
              <div className="stat-card__info">
                <span className="stat-card__label">Total Applicants</span>
                <span className="stat-card__value">48</span>
                <span className="stat-card__subtext positive">+12 since last run</span>
              </div>
              <div className="stat-card__icon-wrap">
                <Users size={20} />
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card__info">
                <span className="stat-card__label">Avg. Match Score</span>
                <span className="stat-card__value">72%</span>
                <span className="stat-card__subtext">Engine Confidence: High</span>
              </div>
              <div className="stat-card__icon-wrap">
                <Target size={20} />
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card__info">
                <span className="stat-card__label">Last Matched</span>
                <span className="stat-card__value">2 mins ago</span>
                <span className="stat-card__subtext">By Admin Recruiter</span>
              </div>
              <div className="stat-card__icon-wrap">
                <Clock size={20} />
              </div>
            </div>
          </div>

          {/* Candidates Main Table Section */}
          <div className="candidates-card">
            {/* Run Matching Loading Scanner Overlay */}
            {isMatching && (
              <div className="matching-overlay">
                <div className="scanning-bar" />
                <div className="scanner-text">AI engine parsing CV profiles and calculating match scores...</div>
              </div>
            )}

            <div className="candidates-header">
              <div className="candidates-header__left-group">
                <div className="candidates-tabs">
                  <button 
                    className={`tab-btn ${activeTab === 'All Applicants' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('All Applicants'); setCurrentPage(1); }}
                  >
                    All Applicants
                  </button>
                  <button 
                    className={`tab-btn ${activeTab === 'Ranked Candidates' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('Ranked Candidates'); setCurrentPage(1); }}
                  >
                    Ranked Candidates
                  </button>
                  <button 
                    className={`tab-btn ${activeTab === 'Shortlisted' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('Shortlisted'); setCurrentPage(1); }}
                  >
                    Shortlisted
                  </button>
                </div>
                <p className="candidates-header__subtitle">
                  {activeTab === 'All Applicants' && 'Showing all applied candidate profiles for this vacancy.'}
                  {activeTab === 'Ranked Candidates' && 'Automated matching results based on CV parsing and job requirements.'}
                  {activeTab === 'Shortlisted' && 'Selected candidates marked for shortlisting board.'}
                </p>
              </div>
              
              <div className="filter-actions">
                <div className="sort-container">
                  <span>Sort:</span>
                  <select 
                    className="sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="Highest Match">Highest Match</option>
                    <option value="Lowest Match">Lowest Match</option>
                    <option value="Alphabetical">Alphabetical</option>
                  </select>
                </div>
                
                <div style={{ position: 'relative' }}>
                  <button 
                    className={`filter-icon-btn ${activeFilter !== 'All' ? 'active' : ''}`}
                    onClick={() => setFilterOpen(!filterOpen)}
                    title="Filter by status"
                  >
                    <Filter size={18} />
                  </button>
                  {filterOpen && (
                    <div style={{
                      position: 'absolute',
                      top: '46px',
                      right: '0',
                      backgroundColor: 'var(--primary-light)',
                      border: '1px solid var(--border-dark)',
                      borderRadius: '8px',
                      padding: '8px 0',
                      width: '160px',
                      boxShadow: 'var(--shadow-md)',
                      zIndex: 30
                    }}>
                      {['All', 'Matched', 'Partial Match', 'Underqualified', 'Mismatch'].map((f) => (
                        <div
                          key={f}
                          onClick={() => {
                            setActiveFilter(f);
                            setFilterOpen(false);
                            setCurrentPage(1);
                          }}
                          style={{
                            padding: '8px 16px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            color: activeFilter === f ? 'var(--accent)' : 'var(--text-on-dark)',
                            backgroundColor: activeFilter === f ? 'rgba(255,255,255,0.05)' : 'transparent',
                            fontWeight: activeFilter === f ? '600' : 'normal'
                          }}
                        >
                          {f}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Candidates Grid Table */}
            <div className="candidates-table">
              <div className="table-header">
                <div>Rank</div>
                <div>Candidate Name</div>
                <div>Match Score</div>
                <div>Key Matched Skills</div>
                <div>Exp. Match</div>
                <div style={{ textAlign: 'right', paddingRight: '20px' }}>Actions</div>
              </div>

              {paginatedCandidates.length > 0 ? (
                paginatedCandidates.map((candidate) => (
                  <div key={candidate.name} className="table-row-container">
                    <div className="table-row">
                      <div className="cell-rank">{candidate.rank}</div>
                      <div className="cell-candidate">
                        <img 
                          src={candidate.avatar} 
                          alt={candidate.name} 
                          className="candidate-avatar"
                        />
                        <div className="candidate-meta">
                          <span className="candidate-name">{candidate.name}</span>
                          <span className="candidate-active-time">{candidate.activeTime}</span>
                        </div>
                      </div>
                      
                      <div className="cell-score">
                        <span className="score-number">{candidate.score}%</span>
                        <div className="score-bar-track">
                          <div 
                            className="score-bar-fill"
                            style={{ width: `${candidate.score}%` }}
                          />
                        </div>
                      </div>

                      <div className="cell-skills">
                        {candidate.skills.map((skill) => (
                          <span key={skill} className="skill-badge">{skill}</span>
                        ))}
                      </div>

                      <div className="cell-exp">
                        <span className="status-indicator">
                          {getStatusIcon(candidate.expMatch)}
                          <span style={{
                            color: candidate.expMatch === 'Matched' ? 'var(--success)' :
                                   candidate.expMatch === 'Partial Match' ? 'var(--accent)' :
                                   candidate.expMatch === 'Underqualified' ? '#ff6b6b' : '#ff4a4a'
                          }}>
                            {candidate.expMatch}
                          </span>
                        </span>
                      </div>

                      <div className="cell-actions">
                        <button 
                          className="btn-view-details"
                          onClick={() => setSelectedCandidate(candidate)}
                        >
                          View Details
                        </button>
                        <button className="btn-more-options">
                          <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>⋮</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state-container">
                  <Users size={32} className="empty-state-icon" />
                  <h4 className="empty-state-title">No candidates found</h4>
                  <p className="empty-state-text">
                    {activeTab === 'Shortlisted' 
                      ? 'No candidates have been shortlisted yet. Open candidate details to shortlist them.' 
                      : 'No candidates match the selected filters.'}
                  </p>
                </div>
              )}
            </div>

            {/* Table Pagination Footer */}
            <div className="table-footer">
              <div>
                Showing {paginatedCandidates.length} of {filteredCandidates.length} potential matches for this vacancy.
              </div>
              {totalPages > 1 && (
                <div className="pagination-controls">
                  <button 
                    className="pagination-btn"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    style={{ opacity: currentPage === 1 ? 0.4 : 1 }}
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                  <button 
                    className="pagination-btn next-active"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    style={{ opacity: currentPage === totalPages ? 0.4 : 1 }}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Grid Section */}
          <div className="bottom-grid">
            {/* Requirement Insight */}
            <div className="insight-card">
              <span className="insight-card__title">
                <Target size={16} /> Requirement Insight
              </span>
              <p className="insight-card__text">
                The matching engine has prioritised <strong>React</strong> and <strong>AWS</strong> for this role. Check the Job Parsing preview to adjust weighted skill importance.
              </p>
              <a href="#review-parsing" className="insight-card__link" onClick={(e) => e.preventDefault()}>
                Review Job Parsing Data <ExternalLink size={14} />
              </a>
            </div>

            {/* Shortlist Progress */}
            <div className="progress-card">
              <span className="progress-card__title">
                <Users size={16} /> Shortlist Progress
              </span>
              <div className="progress-card__content">
                <div className="avatar-group">
                  <img 
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80" 
                    alt="Shortlist 1" 
                    className="avatar-stacked"
                  />
                  <img 
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80&q=80" 
                    alt="Shortlist 2" 
                    className="avatar-stacked"
                  />
                  <img 
                    src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=80&h=80&q=80" 
                    alt="Shortlist 3" 
                    className="avatar-stacked"
                  />
                  <img 
                    src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=80&h=80&q=80" 
                    alt="Shortlist 4" 
                    className="avatar-stacked"
                  />
                </div>
                <p className="progress-card__text">
                  <strong>4 candidates</strong> already shortlisted for interview stage.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Matching Success Toast Notification */}
      {showToast && (
        <div className="matching-toast">
          <CheckCircle2 size={20} style={{ color: 'var(--success)' }} />
          <span className="matching-toast__text">{toastMessage}</span>
          <button 
            style={{ background: 'none', border: 'none', color: 'var(--text-on-dark-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            onClick={() => setShowToast(false)}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Candidate Profile Details Modal */}
      {selectedCandidate && (
        <div className="modal-overlay" onClick={() => setSelectedCandidate(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-header__title">Candidate Profile Analysis</h3>
              <button className="btn-close-modal" onClick={() => setSelectedCandidate(null)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="profile-card">
                <img 
                  src={selectedCandidate.avatar} 
                  alt={selectedCandidate.name} 
                  className="profile-avatar"
                />
                <div className="profile-details">
                  <span className="profile-name">{selectedCandidate.name}</span>
                  <span className="profile-subtitle">Match Rating: {selectedCandidate.score}%</span>
                  <span className="profile-active">{selectedCandidate.activeTime}</span>
                </div>
              </div>

              <div className="modal-divider" />

              <div className="info-grid">
                <div>
                  <h4 className="info-section__title">Contact Information</h4>
                  <p className="info-text">
                    <strong>Email:</strong> {selectedCandidate.email}<br />
                    <strong>Phone:</strong> {selectedCandidate.phone}
                  </p>
                </div>
                <div>
                  <h4 className="info-section__title">Professional Profile</h4>
                  <p className="info-text">
                    <strong>Total Experience:</strong> {selectedCandidate.experience}<br />
                    <strong>Education:</strong> {selectedCandidate.education}
                  </p>
                </div>
              </div>

              <div className="modal-divider" />

              <div>
                <h4 className="info-section__title">Professional Summary</h4>
                <p className="info-text" style={{ fontStyle: 'italic', color: 'var(--text-on-dark-muted)' }}>
                  "{selectedCandidate.bio}"
                </p>
              </div>

              <div className="modal-divider" />

              <div>
                <h4 className="info-section__title">Matched Skill Stack</h4>
                <div className="modal-skills-list">
                  {selectedCandidate.skills.map((skill) => (
                    <span key={skill} className="modal-skill-badge">{skill}</span>
                  ))}
                </div>
              </div>

              <div className="modal-divider" />

              <div>
                <h4 className="info-section__title">AI Recommendation Notes</h4>
                <p className="info-text" style={{ color: 'var(--accent)' }}>
                  {selectedCandidate.matchReason}
                </p>
              </div>
            </div>

            <div className="modal-footer-actions">
              <button className="btn btn-secondary" onClick={() => setSelectedCandidate(null)}>
                Close
              </button>
              <button 
                className="btn btn-shortlist" 
                style={{
                  backgroundColor: selectedCandidate.shortlisted ? 'var(--crisis)' : 'var(--success)'
                }}
                onClick={() => {
                  const isCurrentlyShortlisted = !!selectedCandidate.shortlisted;
                  setCandidates(prev => 
                    prev.map(c => c.name === selectedCandidate.name ? { ...c, shortlisted: !isCurrentlyShortlisted } : c)
                  );
                  setSelectedCandidate(null);
                  setToastMessage(
                    isCurrentlyShortlisted 
                      ? `${selectedCandidate.name} has been removed from the shortlisted board.`
                      : `${selectedCandidate.name} has been added to the shortlisted board.`
                  );
                  setShowToast(true);
                  setTimeout(() => setShowToast(false), 4000);
                }}
              >
                {selectedCandidate.shortlisted ? 'Remove from Shortlist' : 'Shortlist Candidate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RankedApplicants;
