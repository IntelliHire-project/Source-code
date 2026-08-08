import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Target,
  Clock,
  Play,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ExternalLink,
  X,
  Filter,
  Calendar,
  FileText,
  Sparkles,
  Search,
} from 'lucide-react';
import {
  MOCK_CANDIDATES,
  enrichCandidateDetails,
  CandidateDetailView,
} from '../RankedApplicants/RankedApplicants';
import '../RankedApplicants/RankedApplicants.css';

export default function ApplicantsSectionContent({ vacancy, candidates, setCandidates, isShortlistMode }) {
  const navigate = useNavigate();
  const numericVacancyId = parseInt(vacancy.id.replace(/\D/g, ''), 10) || 1;

  const [searchQuery, setSearchQuery] = useState('');
  const [isMatching, setIsMatching] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedCandidateNames, setSelectedCandidateNames] = useState([]);

  // Modal States for Interview Scheduling
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);

  // Tab State: 'All Applicants', 'Ranked Candidates', 'Shortlisted'
  const [activeTab, setActiveTab] = useState(isShortlistMode ? 'Shortlisted' : 'Ranked Candidates');

  // Filtering & Sorting State
  const [sortBy, setSortBy] = useState('Highest Match');
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    setSelectedCandidateNames([]);
  }, [numericVacancyId, activeTab, currentPage, activeFilter, searchQuery]);

  const handleRunMatching = () => {
    setIsMatching(true);
    setTimeout(() => {
      setIsMatching(false);
      setToastMessage(`AI matching engine completed successfully! ${candidates.length} applicants processed for ${vacancy.title}.`);
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 4000);
    }, 2500);
  };

  const filteredCandidates = candidates.filter((c) => {
    if (c.vacancyId !== numericVacancyId) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesName = c.name.toLowerCase().includes(q);
      const matchesSkill = c.skills.some((s) => s.toLowerCase().includes(q));
      if (!matchesName && !matchesSkill) return false;
    }
    if (activeTab === 'Shortlisted' && !c.shortlisted) return false;
    if (activeFilter === 'All') return true;
    return c.expMatch === activeFilter;
  });

  const sortedCandidates = [...filteredCandidates].sort((a, b) => {
    if (sortBy === 'Highest Match') return b.score - a.score;
    if (sortBy === 'Lowest Match') return a.score - b.score;
    if (sortBy === 'Alphabetical') return a.name.localeCompare(b.name);
    return 0;
  });

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
    <div className="ranked-page" style={{ height: 'auto', background: 'transparent' }}>
      <main className="ranked-content" style={{ padding: 0 }}>
        {selectedCandidate ? (
          <CandidateDetailView
            candidate={enrichCandidateDetails(selectedCandidate)}
            onBack={() => setSelectedCandidate(null)}
            onShortlist={(cand) => {
              const isCurrentlyShortlisted = !!cand.shortlisted;
              setCandidates((prev) =>
                prev.map((c) => (c.name === cand.name ? { ...c, shortlisted: !isCurrentlyShortlisted } : c))
              );
              setSelectedCandidate((prev) => (prev ? { ...prev, shortlisted: !isCurrentlyShortlisted } : null));
              setToastMessage(
                isCurrentlyShortlisted
                  ? `${cand.name} has been removed from the shortlisted board.`
                  : `${cand.name} has been added to the shortlisted board.`
              );
              setShowToast(true);
              setTimeout(() => setShowToast(false), 4000);
            }}
            onReject={(cand) => {
              setCandidates((prev) =>
                prev.map((c) => (c.name === cand.name ? { ...c, shortlisted: false, rejected: true } : c))
              );
              setSelectedCandidate((prev) => (prev ? { ...prev, shortlisted: false, rejected: true } : null));
              setToastMessage(`${cand.name} has been marked as rejected.`);
              setShowToast(true);
              setTimeout(() => setShowToast(false), 4000);
            }}
            onApprove={() => {
              setToastMessage(`${selectedCandidate.name} has been approved for interview!`);
              setShowToast(true);
              setTimeout(() => setShowToast(false), 4000);
            }}
          />
        ) : (
          <>
            <div className="ranked-header" style={{ marginTop: 0, justifyContent: 'flex-end' }}>
              <div className="ranked-header__actions">
                <button
                  className="btn btn-primary"
                  onClick={handleRunMatching}
                  disabled={isMatching}
                  style={{ opacity: isMatching ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Play size={16} fill="currentColor" /> {isMatching ? 'Matching...' : 'Run Matching'}
                </button>
              </div>
            </div>

            <div className="candidates-card">
              {isMatching && (
                <div className="matching-overlay">
                  <div className="scanning-bar" />
                  <div className="scanner-text">AI engine parsing CV profiles and calculating match scores...</div>
                </div>
              )}

              <div className="candidates-header">
                <div className="candidates-header__left-group">
                  {!isShortlistMode && (
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
                    </div>
                  )}
                  <p className="candidates-header__subtitle">
                    {activeTab === 'All Applicants' && 'Showing all applied candidate profiles for this vacancy.'}
                    {activeTab === 'Ranked Candidates' && 'Automated matching results based on CV parsing and job requirements.'}
                    {activeTab === 'Shortlisted' && 'Selected candidates marked for shortlisting board.'}
                  </p>
                </div>

                <div className="filter-actions" style={{ display: 'flex', alignItems: 'center' }}>
                  <div className="search-input-container" style={{ position: 'relative', display: 'flex', alignItems: 'center', marginRight: '10px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '10px', color: 'var(--text-on-dark-muted)' }} />
                    <input
                      type="text"
                      placeholder="Search applicants..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      style={{
                        padding: '8px 12px 8px 32px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-dark)',
                        background: 'transparent',
                        color: 'var(--text-on-dark)',
                        fontSize: '0.9rem',
                        outline: 'none',
                        width: '220px'
                      }}
                    />
                  </div>
                  {activeTab === 'Shortlisted' && (
                    <>
                      <button
                        className="btn-schedule-interviews"
                        onClick={() => {
                          setSelectedMethod(null);
                          setShowScheduleModal(true);
                        }}
                      >
                        <Calendar size={16} /> Schedule Interviews
                      </button>
                      <button
                        className="btn-schedule-interviews"
                        style={{ marginLeft: '10px' }}
                        onClick={() => navigate('/recruiter/assessments')}
                      >
                        <FileText size={16} /> Schedule Assessment
                      </button>
                    </>
                  )}
                  <div style={{ position: 'relative' }}>
                    <button
                      className={`filter-icon-btn ${activeFilter !== 'All' ? 'active' : ''}`}
                      onClick={() => setFilterOpen(!filterOpen)}
                      title="Filter by status"
                    >
                      <Filter size={18} />
                    </button>
                    {filterOpen && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '46px',
                          right: '0',
                          backgroundColor: 'var(--primary-light)',
                          border: '1px solid var(--border-dark)',
                          borderRadius: '8px',
                          padding: '8px 0',
                          width: '160px',
                          boxShadow: 'var(--shadow-md)',
                          zIndex: 30,
                        }}
                      >
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
                              fontWeight: activeFilter === f ? '600' : 'normal',
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

              <div className={`candidates-table ${activeTab !== 'Shortlisted' ? 'has-checkbox' : 'is-shortlisted'}`}>
                <div className="table-header">
                  {activeTab !== 'Shortlisted' && (
                    <div className="cell-checkbox">
                      <input
                        type="checkbox"
                        className="candidate-checkbox"
                        checked={
                          paginatedCandidates.length > 0 &&
                          paginatedCandidates.every((c) => selectedCandidateNames.includes(c.name))
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            const newSelections = [
                              ...selectedCandidateNames,
                              ...paginatedCandidates
                                .map((c) => c.name)
                                .filter((name) => !selectedCandidateNames.includes(name)),
                            ];
                            setSelectedCandidateNames(newSelections);
                          } else {
                            const pageNames = paginatedCandidates.map((c) => c.name);
                            setSelectedCandidateNames(
                              selectedCandidateNames.filter((name) => !pageNames.includes(name))
                            );
                          }
                        }}
                      />
                    </div>
                  )}
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
                        {activeTab !== 'Shortlisted' && (
                          <div className="cell-checkbox">
                            <input
                              type="checkbox"
                              className="candidate-checkbox"
                              checked={selectedCandidateNames.includes(candidate.name)}
                              onChange={() => {
                                if (selectedCandidateNames.includes(candidate.name)) {
                                  setSelectedCandidateNames(
                                    selectedCandidateNames.filter((name) => name !== candidate.name)
                                  );
                                } else {
                                  setSelectedCandidateNames([...selectedCandidateNames, candidate.name]);
                                }
                              }}
                            />
                          </div>
                        )}
                        <div className="cell-rank">{candidate.rank}</div>
                        <div className="cell-candidate">
                          <img src={candidate.avatar} alt={candidate.name} className="candidate-avatar" />
                          <div className="candidate-meta">
                            <span className="candidate-name">{candidate.name}</span>
                            <span className="candidate-active-time">{candidate.activeTime}</span>
                          </div>
                        </div>

                        <div className="cell-score">
                          <span className="score-number">{candidate.score}%</span>
                          <div className="score-bar-track">
                            <div className="score-bar-fill" style={{ width: `${candidate.score}%` }} />
                          </div>
                        </div>

                        <div className="cell-skills">
                          {candidate.skills.map((skill) => (
                            <span key={skill} className="skill-badge">
                              {skill}
                            </span>
                          ))}
                        </div>

                        <div className="cell-exp">
                          <span className="status-indicator">
                            {getStatusIcon(candidate.expMatch)}
                            <span
                              style={{
                                color:
                                  candidate.expMatch === 'Matched'
                                    ? 'var(--success)'
                                    : candidate.expMatch === 'Partial Match'
                                    ? 'var(--accent)'
                                    : candidate.expMatch === 'Underqualified'
                                    ? '#ff6b6b'
                                    : '#ff4a4a',
                              }}
                            >
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
                          {activeTab === 'Shortlisted' && (
                            <button
                              className="btn-remove-shortlist"
                              onClick={() => {
                                setCandidates((prev) =>
                                  prev.map((c) =>
                                    c.name === candidate.name ? { ...c, shortlisted: false } : c
                                  )
                                );
                                setToastMessage(`${candidate.name} has been removed from the shortlisted board.`);
                                setShowToast(true);
                                setSelectedCandidateNames((prev) =>
                                  prev.filter((name) => name !== candidate.name)
                                );
                                setTimeout(() => setShowToast(false), 4000);
                              }}
                            >
                              Remove
                            </button>
                          )}
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

              <div className="table-footer">
                <div>
                  Showing {paginatedCandidates.length} of {filteredCandidates.length} potential matches.
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

            <div className="bottom-grid">
              {!isShortlistMode && (
                <div className="insight-card">
                  <span className="insight-card__title">
                    <Target size={16} /> Requirement Insight
                  </span>
                  <p className="insight-card__text">
                    AI analysis suggests this vacancy requires strong modern framework skills and scalable architecture experience.
                  </p>
                  <a href="#review-parsing" className="insight-card__link" onClick={(e) => e.preventDefault()}>
                    Review Job Parsing Data <ExternalLink size={14} />
                  </a>
                </div>
              )}

              <div className="progress-card" style={{ gridColumn: isShortlistMode ? '1 / -1' : 'auto' }}>
                <span className="progress-card__title">
                  <Users size={16} /> Shortlist Progress
                </span>
                <div className="progress-card__content">
                  <div className="avatar-group">
                    {candidates
                      .filter((c) => c.vacancyId === numericVacancyId && c.shortlisted)
                      .slice(0, 4)
                      .map((c, i) => (
                        <img key={i} src={c.avatar} alt={c.name} className="avatar-stacked" />
                      ))}
                  </div>
                  <p className="progress-card__text">
                    <strong>
                      {candidates.filter((c) => c.vacancyId === numericVacancyId && c.shortlisted).length} candidates
                    </strong>{' '}
                    already shortlisted for interview stage.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {showToast && (
        <div className="matching-toast">
          <CheckCircle2 size={20} style={{ color: 'var(--success)' }} />
          <span className="matching-toast__text">{toastMessage}</span>
          <button
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-on-dark-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
            onClick={() => setShowToast(false)}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {selectedCandidateNames.length > 0 && (
        <div className="batch-actions-bar">
          <span className="batch-selected-count">
            {selectedCandidateNames.length} candidate{selectedCandidateNames.length > 1 ? 's' : ''} selected
          </span>
          <div className="batch-buttons">
            <button
              className="btn-batch btn-batch-shortlist"
              onClick={() => {
                setCandidates((prev) =>
                  prev.map((c) =>
                    selectedCandidateNames.includes(c.name) ? { ...c, shortlisted: true } : c
                  )
                );
                setToastMessage(`Shortlisted ${selectedCandidateNames.length} candidate(s).`);
                setShowToast(true);
                setSelectedCandidateNames([]);
                setTimeout(() => setShowToast(false), 4000);
              }}
            >
              Shortlist Selected
            </button>
            <button
              className="btn-batch btn-batch-reject"
              onClick={() => {
                setCandidates((prev) =>
                  prev.map((c) =>
                    selectedCandidateNames.includes(c.name) ? { ...c, shortlisted: false, rejected: true } : c
                  )
                );
                setToastMessage(`Rejected ${selectedCandidateNames.length} candidate(s).`);
                setShowToast(true);
                setSelectedCandidateNames([]);
                setTimeout(() => setShowToast(false), 4000);
              }}
            >
              Reject Selected
            </button>
            <button className="btn-batch-clear" onClick={() => setSelectedCandidateNames([])}>
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {showScheduleModal && (
        <div className="schedule-modal-overlay">
          <div className="schedule-modal">
            <button
              className="schedule-modal__close-btn"
              onClick={() => {
                setShowScheduleModal(false);
                setSelectedMethod(null);
              }}
            >
              <X size={20} />
            </button>

            <h2 className="schedule-modal__title">Choose Scheduling Method</h2>
            <p className="schedule-modal__desc">
              Select how you would like to schedule interviews for shortlisted candidates.
            </p>

            <div className="schedule-options-grid">
              <div
                className={`schedule-option-card recommended ${selectedMethod === 'auto' ? 'selected' : ''}`}
                onClick={() => setSelectedMethod('auto')}
              >
                <div className="schedule-option-card__badge">Recommended</div>
                <div className="schedule-option-card__icon-wrap auto-icon">
                  <Sparkles size={22} />
                </div>
                <div className="schedule-option-card__content">
                  <h3 className="schedule-option-card__title">🤖 Auto Schedule & Notify</h3>
                  <p className="schedule-option-card__desc">
                    Automatically match shortlisted candidates with available interview time slots based on existing interview panels and send interview invitation emails.
                  </p>
                </div>
              </div>

              <div
                className={`schedule-option-card ${selectedMethod === 'manual' ? 'selected' : ''}`}
                onClick={() => setSelectedMethod('manual')}
              >
                <div className="schedule-option-card__icon-wrap manual-icon">
                  <Users size={22} />
                </div>
                <div className="schedule-option-card__content">
                  <h3 className="schedule-option-card__title">👤 Manual Scheduling</h3>
                  <p className="schedule-option-card__desc">
                    Manually assign interview panels, candidates, interview dates, and time slots before sending interview invitations.
                  </p>
                </div>
              </div>
            </div>

            <div className="schedule-modal__actions">
              <button
                className="btn-modal-cancel"
                onClick={() => {
                  setShowScheduleModal(false);
                  setSelectedMethod(null);
                }}
              >
                Cancel
              </button>
              <button
                className="btn-modal-continue"
                disabled={!selectedMethod}
                onClick={() => {
                  setShowScheduleModal(false);
                  if (selectedMethod === 'auto') {
                    const panelsExist = localStorage.getItem('interview_panel_created') === 'true';
                    if (panelsExist) {
                      const shortlistedCount = candidates.filter(
                        (c) => c.vacancyId === numericVacancyId && c.shortlisted
                      ).length;

                      setToastMessage(
                        `Auto-scheduled interviews and sent invitations to ${shortlistedCount} candidate(s) successfully!`
                      );
                      setShowToast(true);
                      setTimeout(() => setShowToast(false), 5000);
                    } else {
                      localStorage.setItem('scheduling_pending', 'true');
                      navigate('/recruiter/interviews/evaluation');
                    }
                  } else {
                    navigate('/recruiter/interviews/allocation');
                  }
                  setSelectedMethod(null);
                }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
