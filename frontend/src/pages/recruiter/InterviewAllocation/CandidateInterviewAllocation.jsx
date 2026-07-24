import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import RecruiterSidebar from '../../../components/common/RecruiterSidebar';
import TopBar from '../../../components/TopBar/TopBar';
import '../../../style.css';
import './CandidateInterviewAllocation.css';

// Initial Mock Candidates Data
const INITIAL_CANDIDATES = [
  { id: 'APP-001', name: 'Alice Fernando', score: 88, status: 'SHORTLISTED', selected: false },
  { id: 'APP-002', name: 'Kamal Perera', score: 82, status: 'SHORTLISTED', selected: false },
  { id: 'APP-003', name: 'Nimal Silva', score: 79, status: 'SHORTLISTED', selected: false },
  { id: 'APP-004', name: 'Sara Jayawardena', score: 75, status: 'PENDING', selected: false },
  { id: 'APP-005', name: 'Ruwan Bandara', score: 71, status: 'SHORTLISTED', selected: false },
  { id: 'APP-006', name: 'Dilhani Wickramasinghe', score: 68, status: 'SHORTLISTED', selected: false },
];

// Initial Mock Time Slots Data
const INITIAL_SLOTS = [
  { id: 'SLOT-101', date: '25 Jul 2026', dateShort: '25 Jul', time: '09:00 AM', end: '10:00 AM', type: 'Online', cap: 5, rem: 3, selected: false },
  { id: 'SLOT-102', date: '25 Jul 2026', dateShort: '25 Jul', time: '11:00 AM', end: '12:00 PM', type: 'Physical', cap: 3, rem: 0, selected: false },
  { id: 'SLOT-103', date: '26 Jul 2026', dateShort: '26 Jul', time: '02:00 PM', end: '03:00 PM', type: 'Online', cap: 4, rem: 2, selected: false },
  { id: 'SLOT-104', date: '27 Jul 2026', dateShort: '27 Jul', time: '10:00 AM', end: '11:00 AM', type: 'Physical', cap: 2, rem: 2, selected: false },
  { id: 'SLOT-105', date: '28 Jul 2026', dateShort: '28 Jul', time: '09:00 AM', end: '10:00 AM', type: 'Online', cap: 6, rem: 4, selected: false },
];

// Initial Allocation Results Data (Pre-populated to match wireframe)
const INITIAL_ALLOCATIONS = [
  { candidateId: 'APP-001', candidateName: 'Alice Fernando', slotId: 'SLOT-101', assignedTime: '09:00 AM', interviewDate: '25 Jul 2026', interviewType: 'Online', status: 'ALLOCATED' },
  { candidateId: 'APP-002', candidateName: 'Kamal Perera', slotId: 'SLOT-103', assignedTime: '02:00 PM', interviewDate: '26 Jul 2026', interviewType: 'Online', status: 'ALLOCATED' },
  { candidateId: 'APP-003', candidateName: 'Nimal Silva', slotId: 'SLOT-104', assignedTime: '10:00 AM', interviewDate: '27 Jul 2026', interviewType: 'Physical', status: 'ALLOCATED' },
  { candidateId: 'APP-004', candidateName: 'Sara Jayawardena', slotId: null, assignedTime: '—', interviewDate: '—', interviewType: '—', status: 'PENDING' },
];

export default function CandidateInterviewAllocationPage() {
  const navigate = useNavigate();

  // State Management
  const [jobPosition, setJobPosition] = useState('Senior Software Engineer');
  const [interviewRound, setInterviewRound] = useState('Technical Interview');
  const [interviewDate, setInterviewDate] = useState('2026-07-25');
  const [allocationMethod, setAllocationMethod] = useState('Automatic (Optimized)');

  const [candidates, setCandidates] = useState(INITIAL_CANDIDATES);
  const [slots, setSlots] = useState(INITIAL_SLOTS);
  const [allocations, setAllocations] = useState(INITIAL_ALLOCATIONS);

  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // Header Navigation Active Tab State
  const activeSubTab = 'allocation'; // 'management' or 'allocation'

  // Show Toast Utility
  const showToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage('');
    }, 4000);
  };

  // Toggle selection for Candidate checkbox
  const handleToggleCandidateSelect = (id) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, selected: !c.selected } : c))
    );
  };

  // Select/Deselect All Candidates
  const handleSelectAllCandidates = (e) => {
    const isChecked = e.target.checked;
    setCandidates((prev) => prev.map((c) => ({ ...c, selected: isChecked })));
  };

  // Toggle selection for Slot checkbox
  const handleToggleSlotSelect = (id) => {
    setSlots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, selected: !s.selected } : s))
    );
  };

  // Manual Allocate Button Action
  const handleManualAllocate = () => {
    const selectedCands = candidates.filter((c) => c.selected);
    const selectedSlotList = slots.filter((s) => s.selected);

    if (selectedCands.length === 0) {
      showToast('Please select at least one candidate to allocate.', 'error');
      return;
    }
    if (selectedSlotList.length === 0) {
      showToast('Please select an available time slot.', 'error');
      return;
    }

    const slotToAssign = selectedSlotList[0];
    if (slotToAssign.rem <= 0) {
      showToast(`Slot ${slotToAssign.time} (${slotToAssign.dateShort}) is fully booked!`, 'error');
      return;
    }

    let updatedAllocations = [...allocations];
    let allocatedCount = 0;

    selectedCands.forEach((cand) => {
      // Check if candidate already has an allocation
      const existingIdx = updatedAllocations.findIndex((a) => a.candidateId === cand.id);
      const newRecord = {
        candidateId: cand.id,
        candidateName: cand.name,
        slotId: slotToAssign.id,
        assignedTime: slotToAssign.time,
        interviewDate: slotToAssign.date,
        interviewType: slotToAssign.type,
        status: 'ALLOCATED',
      };

      if (existingIdx >= 0) {
        updatedAllocations[existingIdx] = newRecord;
      } else {
        updatedAllocations.push(newRecord);
      }
      allocatedCount++;
    });

    // Update slot remaining capacity
    setSlots((prev) =>
      prev.map((s) =>
        s.id === slotToAssign.id
          ? { ...s, rem: Math.max(0, s.rem - allocatedCount), selected: false }
          : s
      )
    );

    // Unselect allocated candidates
    setCandidates((prev) =>
      prev.map((c) => (c.selected ? { ...c, selected: false } : c))
    );

    setAllocations(updatedAllocations);
    showToast(`Allocated ${allocatedCount} candidate(s) to slot ${slotToAssign.time} (${slotToAssign.dateShort}).`);
  };

  // Remove Allocation Action
  const handleRemoveAllocation = (candidateId) => {
    setAllocations((prev) =>
      prev.map((a) =>
        a.candidateId === candidateId
          ? { ...a, slotId: null, assignedTime: '—', interviewDate: '—', interviewType: '—', status: 'PENDING' }
          : a
      )
    );
    showToast('Allocation removed for selected candidate.');
  };

  // Auto Allocate Algorithm
  const handleAutoAllocate = () => {
    // Sort candidates by score descending
    const eligibleCandidates = [...candidates].sort((a, b) => b.score - a.score);
    let tempSlots = slots.map((s) => ({ ...s }));
    let newAllocations = [];

    eligibleCandidates.forEach((cand) => {
      // Find first available slot with remaining capacity > 0
      const availableSlot = tempSlots.find((s) => s.rem > 0);

      if (availableSlot) {
        availableSlot.rem -= 1;
        newAllocations.push({
          candidateId: cand.id,
          candidateName: cand.name,
          slotId: availableSlot.id,
          assignedTime: availableSlot.time,
          interviewDate: availableSlot.date,
          interviewType: availableSlot.type,
          status: 'ALLOCATED',
        });
      } else {
        newAllocations.push({
          candidateId: cand.id,
          candidateName: cand.name,
          slotId: null,
          assignedTime: '—',
          interviewDate: '—',
          interviewType: '—',
          status: 'PENDING',
        });
      }
    });

    setSlots(tempSlots);
    setAllocations(newAllocations);
    showToast('Auto-allocation completed based on candidate score priority & slot availability!⚡');
  };

  // Reset Allocations
  const handleResetAllocations = () => {
    setCandidates(INITIAL_CANDIDATES);
    setSlots(INITIAL_SLOTS);
    setAllocations(INITIAL_ALLOCATIONS);
    showToast('Allocations reset to initial state.', 'info');
  };

  // Save Allocations
  const handleSaveAllocations = () => {
    showToast('Interview allocations saved successfully!');
  };

  // Filtered Allocations for display
  const filteredAllocations = useMemo(() => {
    if (!searchQuery) return allocations;
    return allocations.filter((a) =>
      a.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.interviewType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.status.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allocations, searchQuery]);

  // Pagination calculations
  const totalResults = filteredAllocations.length;
  const totalPages = Math.ceil(totalResults / itemsPerPage) || 1;
  const paginatedAllocations = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredAllocations.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredAllocations, currentPage, itemsPerPage]);

  const allCandidatesSelected = candidates.length > 0 && candidates.every((c) => c.selected);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="create-vacancy">
      <RecruiterSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeItem="Candidate Allocation"
      />

      <div className="create-vacancy__main">
        <TopBar
          user={{ name: 'Recruiter', role: 'Recruiter Account' }}
          notificationsCount={3}
          searchPlaceholder="Search vacancies, candidates, or interviews..."
          onSearch={(q) => setSearchQuery(q)}
          onHamburgerClick={() => setSidebarOpen(true)}
        />

        {/* Content Container */}
        <div className="recruiter-content">

          {/* ── Sub-navigation Tabs (Time Slot Management vs Candidate Allocation vs Invitations) ── */}
          <div className="interview-subnav-tabs">
            <button
              className={`subnav-tab-btn ${activeSubTab === 'management' ? 'is-active' : ''}`}
              onClick={() => navigate('/recruiter/interviews')}
              type="button"
            >
              Time Slot Management
            </button>
            <button
              className={`subnav-tab-btn ${activeSubTab === 'allocation' ? 'is-active' : ''}`}
              onClick={() => navigate('/recruiter/interviews/allocation')}
              type="button"
            >
              Candidate Allocation
            </button>
            <button
              className={`subnav-tab-btn ${activeSubTab === 'invitations' ? 'is-active' : ''}`}
              onClick={() => navigate('/recruiter/interviews/invitations')}
              type="button"
            >
              Invitations & Communication
            </button>
          </div>

          {/* ── Page Heading Block + Auto Allocate Button ── */}
          <div className="page-heading-block heading-with-action">
            <div>
              <h1 className="page-title">Candidate Interview Allocation</h1>
              <p className="page-subtitle">
                Automatically assign shortlisted candidates to available interview slots based on priority and availability.
              </p>
            </div>
            <button type="button" className="btn-auto-allocate" onClick={handleAutoAllocate}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
              <span>Auto Allocate</span>
            </button>
          </div>

          {/* Toast Notification */}
          {toastMessage && (
            <div className={`alert-toast alert-${toastType === 'error' ? 'danger' : 'success'}`}>
              <span>{toastMessage}</span>
              <button type="button" className="toast-close" onClick={() => setToastMessage('')}>
                ×
              </button>
            </div>
          )}

          {/* ── Filter Controls Card ── */}
          <div className="card-surface filter-card-row">
            <div className="filter-item">
              <label className="filter-item-label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
                <span>JOB POSITION</span>
              </label>
              <div className="select-input-wrap">
                <select
                  value={jobPosition}
                  onChange={(e) => setJobPosition(e.target.value)}
                  className="form-control"
                >
                  <option value="Senior Software Engineer">Senior Software Engineer</option>
                  <option value="UI/UX Designer">UI/UX Designer</option>
                  <option value="QA Automation Engineer">QA Automation Engineer</option>
                  <option value="Business Analyst">Business Analyst</option>
                  <option value="Product Manager">Product Manager</option>
                  <option value="DevOps Lead">DevOps Lead</option>
                </select>
                <span className="select-arrow">▼</span>
              </div>
            </div>

            <div className="filter-item">
              <label className="filter-item-label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                <span>INTERVIEW ROUND</span>
              </label>
              <div className="select-input-wrap">
                <select
                  value={interviewRound}
                  onChange={(e) => setInterviewRound(e.target.value)}
                  className="form-control"
                >
                  <option value="Technical Interview">Technical Interview</option>
                  <option value="HR Screening">HR Screening</option>
                  <option value="HR Portfolio Review">HR Portfolio Review</option>
                  <option value="Technical Case Study">Technical Case Study</option>
                  <option value="Final Cultural Fit">Final Cultural Fit</option>
                </select>
                <span className="select-arrow">▼</span>
              </div>
            </div>

            <div className="filter-item">
              <label className="filter-item-label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span>INTERVIEW DATE</span>
              </label>
              <input
                type="date"
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
                className="form-control date-picker-input"
              />
            </div>

            <div className="filter-item">
              <label className="filter-item-label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                </svg>
                <span>ALLOCATION METHOD</span>
              </label>
              <div className="select-input-wrap">
                <select
                  value={allocationMethod}
                  onChange={(e) => setAllocationMethod(e.target.value)}
                  className="form-control"
                >
                  <option value="Automatic (Optimized)">Automatic (Optimized)</option>
                  <option value="Score-Based First">Score-Based First</option>
                  <option value="Manual Priority">Manual Priority</option>
                </select>
                <span className="select-arrow">▼</span>
              </div>
            </div>
          </div>

          {/* ── Dual Workspace Grid: Shortlisted Candidates | Action Buttons | Available Time Slots ── */}
          <div className="allocation-workspace-grid">

            {/* Left Card: Shortlisted Candidates */}
            <div className="card-surface candidate-list-card">
              <div className="card-header-bar flex-between">
                <div className="card-title-group">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                  </svg>
                  <h3 className="card-title">Shortlisted Candidates</h3>
                </div>
                <span className="count-badge">{candidates.length} TOTAL</span>
              </div>

              <div className="table-responsive">
                <table className="alloc-table">
                  <thead>
                    <tr>
                      <th style={{ width: '36px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={allCandidatesSelected}
                          onChange={handleSelectAllCandidates}
                          className="styled-checkbox"
                        />
                      </th>
                      <th>CANDIDATE NAME</th>
                      <th>APP. ID</th>
                      <th>SCORE</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidates.map((cand) => (
                      <tr
                        key={cand.id}
                        className={cand.selected ? 'row-selected' : ''}
                        onClick={() => handleToggleCandidateSelect(cand.id)}
                      >
                        <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={cand.selected}
                            onChange={() => handleToggleCandidateSelect(cand.id)}
                            className="styled-checkbox"
                          />
                        </td>
                        <td className="cand-name-cell">
                          <span className="cand-name">{cand.name}</span>
                        </td>
                        <td className="app-id-cell">{cand.id}</td>
                        <td>
                          <span className="score-badge">{cand.score}%</span>
                        </td>
                        <td>
                          <span className={`status-pill ${cand.status === 'SHORTLISTED' ? 'pill-gold' : 'pill-grey'}`}>
                            {cand.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Middle Action Controls */}
            <div className="middle-action-column">
              <button
                type="button"
                className="btn-primary-accent btn-allocate"
                onClick={handleManualAllocate}
              >
                <span>Allocate</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
              <button
                type="button"
                className="btn-ghost-dark btn-remove-alloc"
                onClick={() => {
                  const selected = candidates.filter((c) => c.selected);
                  if (selected.length === 0) {
                    showToast('Select a candidate to remove allocation.', 'error');
                  } else {
                    selected.forEach((c) => handleRemoveAllocation(c.id));
                  }
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
                <span>Remove</span>
              </button>
            </div>

            {/* Right Card: Available Time Slots */}
            <div className="card-surface slots-list-card">
              <div className="card-header-bar flex-between">
                <div className="card-title-group">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                  </svg>
                  <h3 className="card-title">Available Time Slots</h3>
                </div>
                <span className="count-badge">{slots.length} SLOTS</span>
              </div>

              <div className="table-responsive">
                <table className="alloc-table">
                  <thead>
                    <tr>
                      <th style={{ width: '36px', textAlign: 'center' }}></th>
                      <th>DATE</th>
                      <th>TIME</th>
                      <th>TYPE</th>
                      <th>CAP.</th>
                      <th>REM.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {slots.map((slot) => (
                      <tr
                        key={slot.id}
                        className={slot.selected ? 'row-selected' : ''}
                        onClick={() => handleToggleSlotSelect(slot.id)}
                      >
                        <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={slot.selected}
                            onChange={() => handleToggleSlotSelect(slot.id)}
                            className="styled-checkbox"
                          />
                        </td>
                        <td className="slot-date-cell">{slot.dateShort}</td>
                        <td className="slot-time-cell">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                          </svg>
                          <span>{slot.time}</span>
                        </td>
                        <td>
                          <span className={`type-tag ${slot.type === 'Online' ? 'type-online' : 'type-physical'}`}>
                            {slot.type}
                          </span>
                        </td>
                        <td className="font-bold">{slot.cap}</td>
                        <td>
                          <span className={`rem-count ${slot.rem === 0 ? 'rem-zero' : ''}`}>
                            {slot.rem}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* ── Bottom Card: Allocation Results ── */}
          <div className="card-surface results-card-section">
            <div className="card-header-bar flex-between border-bottom-header">
              <div className="card-title-group">
                <span className="gold-indicator"></span>
                <h2 className="card-title">Allocation Results</h2>
              </div>

              <div className="action-buttons-group">
                <button type="button" className="btn-ghost-dark" onClick={handleResetAllocations}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="1 4 1 10 7 10"></polyline>
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                  </svg>
                  <span>Reset</span>
                </button>
                <button type="button" className="btn-primary-accent" onClick={handleSaveAllocations}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                    <polyline points="7 3 7 8 15 8"></polyline>
                  </svg>
                  <span>Save Allocation</span>
                </button>
              </div>
            </div>

            {/* Results Table */}
            <div className="table-responsive">
              <table className="results-table">
                <thead>
                  <tr>
                    <th>CANDIDATE NAME</th>
                    <th>ASSIGNED TIME SLOT</th>
                    <th>INTERVIEW DATE</th>
                    <th>INTERVIEW TYPE</th>
                    <th>ALLOCATION STATUS</th>
                    <th style={{ textAlign: 'right' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedAllocations.map((item) => (
                    <tr key={item.candidateId}>
                      <td className="font-bold cand-name-cell">{item.candidateName}</td>
                      <td className="time-slot-cell">
                        {item.assignedTime !== '—' && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                          </svg>
                        )}
                        <span>{item.assignedTime}</span>
                      </td>
                      <td>{item.interviewDate}</td>
                      <td>{item.interviewType}</td>
                      <td>
                        <span
                          className={`status-result-badge ${
                            item.status === 'ALLOCATED' ? 'badge-allocated' : 'badge-pending'
                          }`}
                        >
                          {item.status === 'ALLOCATED' ? (
                            <>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                              <span>ALLOCATED</span>
                            </>
                          ) : (
                            <>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                              </svg>
                              <span>PENDING</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {item.status === 'ALLOCATED' && (
                          <button
                            type="button"
                            className="btn-unassign-row"
                            onClick={() => handleRemoveAllocation(item.candidateId)}
                            title="Unassign this candidate"
                          >
                            Unassign
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="table-pagination-footer">
              <span className="pagination-info">
                Showing <strong>{paginatedAllocations.length}</strong> of <strong>{filteredAllocations.length}</strong> allocation results
              </span>

              <div className="pagination-controls">
                <button
                  type="button"
                  className="page-nav-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  aria-label="Previous Page"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    className={`page-num-btn ${pageNum === currentPage ? 'active' : ''}`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                ))}
                <button
                  type="button"
                  className="page-nav-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  aria-label="Next Page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
