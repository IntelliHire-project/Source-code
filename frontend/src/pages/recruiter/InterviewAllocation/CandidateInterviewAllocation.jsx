import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Calendar,
  CalendarDays,
  CalendarPlus,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  RotateCcw,
  Save,
  Search,
  Sparkles,
  Star,
  Users,
  X,
} from 'lucide-react';
import RecruiterSidebar from '../../../components/common/RecruiterSidebar';
import TopBar from '../../../components/TopBar/TopBar';
import '../../../style.css';
import './CandidateInterviewAllocation.css';

// Initial Mock Candidates Data
const INITIAL_CANDIDATES = [
  { id: 'APP-001', name: 'Alice Fernando', score: 88, status: 'SHORTLISTED', jobPosition: 'Senior Software Engineer', round: 'Technical Interview', selected: false },
  { id: 'APP-002', name: 'Kamal Perera', score: 82, status: 'SHORTLISTED', jobPosition: 'Senior Software Engineer', round: 'Technical Interview', selected: false },
  { id: 'APP-003', name: 'Nimal Silva', score: 79, status: 'SHORTLISTED', jobPosition: 'Senior Software Engineer', round: 'Technical Interview', selected: false },
  { id: 'APP-004', name: 'Sara Jayawardena', score: 75, status: 'SHORTLISTED', jobPosition: 'Senior Software Engineer', round: 'Technical Interview', selected: false },
  { id: 'APP-005', name: 'Ruwan Bandara', score: 71, status: 'SHORTLISTED', jobPosition: 'Senior Software Engineer', round: 'Technical Interview', selected: false },
  { id: 'APP-006', name: 'Dilhani Wickramasinghe', score: 68, status: 'SHORTLISTED', jobPosition: 'Senior Software Engineer', round: 'Technical Interview', selected: false },
  { id: 'APP-007', name: 'Ishara Gunasekara', score: 84, status: 'SHORTLISTED', jobPosition: 'UI/UX Designer', round: 'HR Portfolio Review', selected: false },
  { id: 'APP-008', name: 'Malith Senanayake', score: 77, status: 'SHORTLISTED', jobPosition: 'QA Automation Engineer', round: 'Technical Interview', selected: false },
];

// Initial Mock Time Slots Data
const INITIAL_SLOTS = [
  { id: 'SLOT-101', dateKey: '2026-08-03', date: '03 Aug 2026', dateShort: '03 Aug', time: '09:00 AM', end: '10:00 AM', type: 'Online', cap: 5, jobPosition: 'Senior Software Engineer', round: 'Technical Interview' },
  { id: 'SLOT-102', dateKey: '2026-08-03', date: '03 Aug 2026', dateShort: '03 Aug', time: '11:00 AM', end: '12:00 PM', type: 'Physical', cap: 3, jobPosition: 'Senior Software Engineer', round: 'Technical Interview' },
  { id: 'SLOT-103', dateKey: '2026-08-04', date: '04 Aug 2026', dateShort: '04 Aug', time: '02:00 PM', end: '03:00 PM', type: 'Online', cap: 4, jobPosition: 'Senior Software Engineer', round: 'Technical Interview' },
  { id: 'SLOT-104', dateKey: '2026-08-05', date: '05 Aug 2026', dateShort: '05 Aug', time: '10:00 AM', end: '11:00 AM', type: 'Physical', cap: 1, jobPosition: 'Senior Software Engineer', round: 'Technical Interview' },
  { id: 'SLOT-105', dateKey: '2026-08-06', date: '06 Aug 2026', dateShort: '06 Aug', time: '09:00 AM', end: '10:00 AM', type: 'Online', cap: 6, jobPosition: 'Senior Software Engineer', round: 'Technical Interview' },
  { id: 'SLOT-106', dateKey: '2026-08-03', date: '03 Aug 2026', dateShort: '03 Aug', time: '01:00 PM', end: '02:00 PM', type: 'Physical', cap: 3, jobPosition: 'UI/UX Designer', round: 'HR Portfolio Review' },
  { id: 'SLOT-107', dateKey: '2026-08-03', date: '03 Aug 2026', dateShort: '03 Aug', time: '03:00 PM', end: '04:00 PM', type: 'Online', cap: 3, jobPosition: 'QA Automation Engineer', round: 'Technical Interview' },
];

// Initial Allocation Results Data (Pre-populated to match wireframe)
const INITIAL_ALLOCATIONS = [
  { candidateId: 'APP-001', candidateName: 'Alice Fernando', slotId: 'SLOT-101', assignedTime: '09:00 AM', interviewDate: '03 Aug 2026', interviewType: 'Online', status: 'ALLOCATED' },
  { candidateId: 'APP-002', candidateName: 'Kamal Perera', slotId: 'SLOT-103', assignedTime: '02:00 PM', interviewDate: '04 Aug 2026', interviewType: 'Online', status: 'ALLOCATED' },
  { candidateId: 'APP-003', candidateName: 'Nimal Silva', slotId: 'SLOT-104', assignedTime: '10:00 AM', interviewDate: '05 Aug 2026', interviewType: 'Physical', status: 'ALLOCATED' },
  { candidateId: 'APP-004', candidateName: 'Sara Jayawardena', slotId: null, assignedTime: '—', interviewDate: '—', interviewType: '—', status: 'PENDING' },
];

export default function CandidateInterviewAllocationPage({ embeddedVacancy = null }) {
  const navigate = useNavigate();

  // State Management
  const [jobPosition, setJobPosition] = useState(embeddedVacancy ? embeddedVacancy.title : 'Senior Software Engineer');
  const [interviewRound, setInterviewRound] = useState('Technical Interview');
  const [interviewDate, setInterviewDate] = useState('2026-08-03');

  const [candidates, setCandidates] = useState(() =>
    embeddedVacancy
      ? INITIAL_CANDIDATES.map((c) => ({ ...c, jobPosition: embeddedVacancy.title }))
      : INITIAL_CANDIDATES
  );
  const [allocations, setAllocations] = useState(INITIAL_ALLOCATIONS);
  const [selectedSlotId, setSelectedSlotId] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingReallocation, setPendingReallocation] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [reschedulingAllocation, setReschedulingAllocation] = useState(null);
  const [rescheduleSlotId, setRescheduleSlotId] = useState('');
  const itemsPerPage = 4;

  // Header Navigation Active Tab State
  const activeSubTab = 'allocation'; // 'management' or 'allocation'

  // Show Toast Utility
  const showToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
  };

  useEffect(() => {
    if (!toastMessage) return undefined;
    const timeoutId = window.setTimeout(() => setToastMessage(''), 4000);
    return () => window.clearTimeout(timeoutId);
  }, [toastMessage]);

  const allocationByCandidate = useMemo(
    () => new Map(allocations.map((allocation) => [allocation.candidateId, allocation])),
    [allocations]
  );

  const slotsWithRemaining = useMemo(
    () => INITIAL_SLOTS.map((rawSlot) => {
      const slot = embeddedVacancy ? { ...rawSlot, jobPosition: embeddedVacancy.title } : rawSlot;
      const allocatedCount = allocations.filter(
        (allocation) => allocation.status === 'ALLOCATED' && allocation.slotId === slot.id
      ).length;
      return { ...slot, rem: Math.max(0, slot.cap - allocatedCount) };
    }),
    [allocations, embeddedVacancy]
  );

  const filteredCandidates = useMemo(
    () => candidates.filter(
      (candidate) =>
        candidate.status === 'SHORTLISTED' &&
        candidate.jobPosition === jobPosition &&
        candidate.round === interviewRound
    ),
    [candidates, interviewRound, jobPosition]
  );

  const filteredSlots = useMemo(
    () => slotsWithRemaining.filter(
      (slot) =>
        slot.jobPosition === jobPosition &&
        slot.round === interviewRound &&
        slot.dateKey === interviewDate
    ),
    [interviewDate, interviewRound, jobPosition, slotsWithRemaining]
  );

  useEffect(() => {
    if (!filteredSlots.some((slot) => slot.id === selectedSlotId && slot.rem > 0)) {
      setSelectedSlotId('');
    }
  }, [filteredSlots, selectedSlotId]);

  // Toggle selection for Candidate checkbox
  const handleToggleCandidateSelect = (id) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, selected: !c.selected } : c))
    );
  };

  // Select/Deselect All Candidates
  const handleSelectAllCandidates = (e) => {
    const isChecked = e.target.checked;
    const visibleIds = new Set(filteredCandidates.map((candidate) => candidate.id));
    setCandidates((prev) =>
      prev.map((candidate) =>
        visibleIds.has(candidate.id) ? { ...candidate, selected: isChecked } : candidate
      )
    );
  };

  const buildAllocationRecord = (candidate, slot) => ({
    candidateId: candidate.id,
    candidateName: candidate.name,
    slotId: slot.id,
    assignedTime: slot.time,
    interviewDate: slot.date,
    interviewType: slot.type,
    status: 'ALLOCATED',
  });

  const performManualAllocation = (selectedCands, slotToAssign) => {
    const candidatesToMove = selectedCands.filter(
      (candidate) => allocationByCandidate.get(candidate.id)?.slotId !== slotToAssign.id
    );
    if (candidatesToMove.length === 0) {
      showToast('The selected candidate(s) are already allocated to this slot.', 'error');
      return;
    }
    if (candidatesToMove.length > slotToAssign.rem) {
      showToast(
        `Only ${slotToAssign.rem} seat(s) remain in this slot. Reduce the candidate selection.`,
        'error'
      );
      return;
    }

    setAllocations((current) => {
      const next = [...current];
      candidatesToMove.forEach((candidate) => {
        const record = buildAllocationRecord(candidate, slotToAssign);
        const existingIndex = next.findIndex((item) => item.candidateId === candidate.id);
        if (existingIndex >= 0) next[existingIndex] = record;
        else next.push(record);
      });
      return next;
    });
    setCandidates((current) =>
      current.map((candidate) => candidate.selected ? { ...candidate, selected: false } : candidate)
    );
    setSelectedSlotId('');
    setPendingReallocation(null);
    showToast(
      `Allocated ${candidatesToMove.length} candidate(s) to ${slotToAssign.time} on ${slotToAssign.dateShort}. Google Calendar invite sent!`
    );
  };

  // Manual Allocate Button Action
  const handleManualAllocate = () => {
    const visibleIds = new Set(filteredCandidates.map((candidate) => candidate.id));
    const selectedCands = candidates.filter(
      (candidate) => candidate.selected && visibleIds.has(candidate.id)
    );
    const slotToAssign = filteredSlots.find((slot) => slot.id === selectedSlotId);
    if (selectedCands.length === 0) {
      showToast('Please select at least one candidate to allocate.', 'error');
      return;
    }
    if (!slotToAssign) {
      showToast('Please select an available time slot.', 'error');
      return;
    }
    if (slotToAssign.rem <= 0) {
      showToast(`Slot ${slotToAssign.time} (${slotToAssign.dateShort}) is fully booked!`, 'error');
      return;
    }
    const reallocations = selectedCands.filter((candidate) => {
      const existing = allocationByCandidate.get(candidate.id);
      return existing?.status === 'ALLOCATED' && existing.slotId !== slotToAssign.id;
    });
    if (reallocations.length > 0) {
      setPendingReallocation({ candidates: selectedCands, slot: slotToAssign });
      return;
    }
    performManualAllocation(selectedCands, slotToAssign);
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
    const eligibleCandidates = [...filteredCandidates].sort((a, b) => b.score - a.score);
    const availableSlots = filteredSlots.map((slot) => ({ ...slot, rem: slot.cap }));
    if (eligibleCandidates.length === 0 || availableSlots.length === 0) {
      showToast('No eligible candidates or matching time slots are available.', 'error');
      return;
    }
    const visibleIds = new Set(eligibleCandidates.map((candidate) => candidate.id));
    const newAllocations = allocations.filter((allocation) => !visibleIds.has(allocation.candidateId));

    eligibleCandidates.forEach((cand) => {
      const availableSlot = availableSlots.find((slot) => slot.rem > 0);

      if (availableSlot) {
        availableSlot.rem -= 1;
        newAllocations.push(buildAllocationRecord(cand, availableSlot));
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

    setAllocations(newAllocations);
    setCandidates((current) => current.map((candidate) => ({ ...candidate, selected: false })));
    setSelectedSlotId('');
    showToast('Auto-allocation completed! Google Calendar invites sent to allocated candidates.');
  };

  // Reset Allocations
  const handleResetAllocations = () => {
    setCandidates(INITIAL_CANDIDATES);
    setAllocations(INITIAL_ALLOCATIONS);
    setSelectedSlotId('');
    setShowResetConfirm(false);
    showToast('Allocations reset to initial state.', 'info');
  };

  const handleConfirmReschedule = () => {
    const candidate = candidates.find(
      (item) => item.id === reschedulingAllocation?.candidateId
    );
    const targetSlot = slotsWithRemaining.find((slot) => slot.id === rescheduleSlotId);
    if (!candidate || !targetSlot) {
      showToast('Select an available slot to reschedule this candidate.', 'error');
      return;
    }
    const isCurrentSlot = reschedulingAllocation.slotId === targetSlot.id;
    if (!isCurrentSlot && targetSlot.rem <= 0) {
      showToast('The selected slot is fully booked.', 'error');
      return;
    }
    setAllocations((current) =>
      current.map((allocation) =>
        allocation.candidateId === candidate.id
          ? buildAllocationRecord(candidate, targetSlot)
          : allocation
      )
    );
    setReschedulingAllocation(null);
    setRescheduleSlotId('');
    showToast(`${candidate.name}'s interview was rescheduled successfully.`);
  };

  // Save Allocations
  const handleSaveAllocations = () => {
    showToast('Interview allocations saved successfully!');
  };

  // Filtered Allocations for display
  const filteredAllocations = useMemo(() => {
    const visibleCandidateIds = new Set(
      candidates
        .filter((candidate) => candidate.jobPosition === jobPosition)
        .map((candidate) => candidate.id)
    );
    const contextualAllocations = allocations.filter((allocation) =>
      visibleCandidateIds.has(allocation.candidateId)
    );
    if (!searchQuery) return contextualAllocations;
    return contextualAllocations.filter((a) =>
      a.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.interviewType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.status.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allocations, candidates, jobPosition, searchQuery]);

  // Pagination calculations
  const totalResults = filteredAllocations.length;
  const totalPages = Math.ceil(totalResults / itemsPerPage) || 1;
  const paginatedAllocations = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredAllocations.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredAllocations, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [jobPosition, searchQuery]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const selectedVisibleCandidates = filteredCandidates.filter((candidate) => candidate.selected);
  const selectedSlot = filteredSlots.find((slot) => slot.id === selectedSlotId);
  const rescheduleCandidate = candidates.find(
    (candidate) => candidate.id === reschedulingAllocation?.candidateId
  );
  const rescheduleOptions = rescheduleCandidate
    ? slotsWithRemaining.filter(
        (slot) =>
          slot.jobPosition === rescheduleCandidate.jobPosition &&
          slot.round === rescheduleCandidate.round &&
          (slot.rem > 0 || slot.id === reschedulingAllocation?.slotId)
      )
    : [];
  const allCandidatesSelected =
    filteredCandidates.length > 0 && filteredCandidates.every((candidate) => candidate.selected);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const mainContent = (
    <>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {!embeddedVacancy && (
            <div className="filter-item">
              <label className="filter-item-label">
                <BriefcaseBusiness size={14} />
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
          )}

          <div className="filter-item">
            <label className="filter-item-label">
              <Star size={14} />
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
              <CalendarDays size={14} />
              <span>INTERVIEW DATE</span>
            </label>
            <input
              type="date"
              value={interviewDate}
              onChange={(e) => setInterviewDate(e.target.value)}
              className="form-control date-picker-input"
            />
          </div>
        </div>

        {/* Schedule New Interview Button (Inline, compact) */}
        <button
          type="button"
          className="btn-primary-accent btn-schedule-inline"
          onClick={() =>
            navigate('/recruiter/interviews', {
              state: { selectedVacancy: embeddedVacancy ? embeddedVacancy.title : jobPosition, openForm: true },
            })
          }
        >
          <CalendarPlus size={16} />
          <span>Schedule New Interview</span>
        </button>
      </div>

          {/* ── Dual Workspace Grid: Shortlisted Candidates | Action Buttons | Available Time Slots ── */}
          <div className="allocation-workspace-grid">

            {/* Left Card: Shortlisted Candidates */}
            <div className="card-surface candidate-list-card">
              <div className="card-header-bar flex-between">
                <div className="card-title-group">
                  <Users size={16} />
                  <h3 className="card-title">Shortlisted Candidates</h3>
                </div>
                <span className="count-badge">{filteredCandidates.length} TOTAL</span>
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
                    {filteredCandidates.map((cand) => (
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
              <div className="allocation-mobile-list">
                {filteredCandidates.map((candidate) => (
                  <button
                    type="button"
                    key={`mobile-${candidate.id}`}
                    className={`allocation-mobile-card candidate-mobile-card ${candidate.selected ? 'is-selected' : ''}`}
                    onClick={() => handleToggleCandidateSelect(candidate.id)}
                  >
                    <span className="mobile-selection-indicator">
                      {candidate.selected && <Check size={13} />}
                    </span>
                    <span>
                      <strong>{candidate.name}</strong>
                      <small>{candidate.id}</small>
                    </span>
                    <span className="score-badge">{candidate.score}%</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Middle Action Controls */}
            <div className="middle-action-column">
              <div className="allocation-selection-summary">
                <strong>{selectedVisibleCandidates.length}</strong>
                <span>candidate{selectedVisibleCandidates.length === 1 ? '' : 's'}</span>
                <small>{selectedSlot ? `${selectedSlot.dateShort}, ${selectedSlot.time}` : 'No slot selected'}</small>
              </div>
              <button
                type="button"
                className="btn-primary-accent btn-allocate"
                onClick={handleManualAllocate}
              >
                <span>Allocate</span>
                <ArrowRight size={14} />
              </button>
              <button
                type="button"
                className="btn-ghost-dark btn-remove-alloc"
                onClick={() => {
                  const selected = selectedVisibleCandidates;
                  if (selected.length === 0) {
                    showToast('Select a candidate to remove allocation.', 'error');
                  } else {
                    const selectedIds = new Set(selected.map((candidate) => candidate.id));
                    setAllocations((current) =>
                      current.map((allocation) =>
                        selectedIds.has(allocation.candidateId)
                          ? { ...allocation, slotId: null, assignedTime: '—', interviewDate: '—', interviewType: '—', status: 'PENDING' }
                          : allocation
                      )
                    );
                    setCandidates((current) =>
                      current.map((candidate) =>
                        selectedIds.has(candidate.id) ? { ...candidate, selected: false } : candidate
                      )
                    );
                    showToast(`Removed allocations for ${selected.length} candidate(s).`);
                  }
                }}
              >
                <ArrowLeft size={14} />
                <span>Remove</span>
              </button>
            </div>

            {/* Right Card: Available Time Slots */}
            <div className="card-surface slots-list-card">
              <div className="card-header-bar flex-between">
                <div className="card-title-group">
                  <CalendarDays size={16} />
                  <h3 className="card-title">Available Time Slots</h3>
                </div>
                <span className="count-badge">{filteredSlots.length} SLOTS</span>
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
                    {filteredSlots.length === 0 && (
                      <tr>
                        <td colSpan="6" className="allocation-empty-cell">No slots match the selected filters.</td>
                      </tr>
                    )}
                    {filteredSlots.map((slot) => (
                      <tr
                        key={slot.id}
                        className={`${selectedSlotId === slot.id ? 'row-selected' : ''} ${slot.rem === 0 ? 'row-disabled' : ''}`}
                        onClick={() => slot.rem > 0 && setSelectedSlotId(slot.id)}
                      >
                        <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                          <input
                            type="radio"
                            name="allocation-slot"
                            checked={selectedSlotId === slot.id}
                            disabled={slot.rem === 0}
                            onChange={() => setSelectedSlotId(slot.id)}
                            className="styled-checkbox"
                          />
                        </td>
                        <td className="slot-date-cell">{slot.dateShort}</td>
                        <td className="slot-time-cell">
                          <Clock3 size={12} />
                          <span>{slot.time}</span>
                        </td>
                        <td>
                          <span className={`type-tag ${slot.type === 'Online' ? 'type-online' : 'type-physical'}`}>
                            {slot.type}
                          </span>
                        </td>
                        <td className="font-bold">{slot.cap}</td>
                        <td>
                          {slot.rem === 0 ? (
                            <span className="slot-full-badge">FULL</span>
                          ) : (
                            <span className="rem-count">{slot.rem}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="allocation-mobile-list">
                {filteredSlots.length === 0 && (
                  <div className="allocation-mobile-empty">No slots match the selected filters.</div>
                )}
                {filteredSlots.map((slot) => (
                  <button
                    type="button"
                    key={`mobile-${slot.id}`}
                    disabled={slot.rem === 0}
                    className={`allocation-mobile-card slot-mobile-card ${selectedSlotId === slot.id ? 'is-selected' : ''}`}
                    onClick={() => setSelectedSlotId(slot.id)}
                  >
                    <span>
                      <strong>{slot.dateShort}</strong>
                      <small>{slot.time} – {slot.end}</small>
                    </span>
                    <span className={`type-tag ${slot.type === 'Online' ? 'type-online' : 'type-physical'}`}>
                      {slot.type}
                    </span>
                    {slot.rem === 0 ? <span className="slot-full-badge">FULL</span> : <span>{slot.rem} left</span>}
                  </button>
                ))}
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
                <div className="allocation-results-search">
                  <Search size={15} />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search results..."
                    aria-label="Search allocation results"
                  />
                </div>
                <button type="button" className="btn-ghost-dark" onClick={() => setShowResetConfirm(true)}>
                  <RotateCcw size={14} />
                  <span>Reset</span>
                </button>
                <button type="button" className="btn-primary-accent" onClick={handleSaveAllocations}>
                  <Save size={14} />
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
                          <Clock3 size={14} />
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
                              <CheckCircle2 size={12} />
                              <span>ALLOCATED</span>
                            </>
                          ) : (
                            <>
                              <Clock3 size={12} />
                              <span>PENDING</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {item.status === 'ALLOCATED' && (
                          <div className="result-row-actions">
                            <button
                              type="button"
                              className="btn-reschedule-row"
                              onClick={() => {
                                setReschedulingAllocation(item);
                                setRescheduleSlotId(item.slotId);
                              }}
                            >
                              Reschedule
                            </button>
                            <button
                              type="button"
                              className="btn-unassign-row"
                              onClick={() => handleRemoveAllocation(item.candidateId)}
                              title="Unassign this candidate"
                            >
                              Unassign
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="allocation-mobile-list results-mobile-list">
              {paginatedAllocations.map((item) => (
                <article className="allocation-result-mobile-card" key={`mobile-${item.candidateId}`}>
                  <div>
                    <strong>{item.candidateName}</strong>
                    <span className={`status-result-badge ${item.status === 'ALLOCATED' ? 'badge-allocated' : 'badge-pending'}`}>
                      {item.status}
                    </span>
                  </div>
                  <dl>
                    <div><dt>Date</dt><dd>{item.interviewDate}</dd></div>
                    <div><dt>Time</dt><dd>{item.assignedTime}</dd></div>
                    <div><dt>Type</dt><dd>{item.interviewType}</dd></div>
                  </dl>
                  {item.status === 'ALLOCATED' && (
                    <div className="result-row-actions">
                      <button type="button" className="btn-reschedule-row" onClick={() => {
                        setReschedulingAllocation(item);
                        setRescheduleSlotId(item.slotId);
                      }}>Reschedule</button>
                      <button type="button" className="btn-unassign-row" onClick={() => handleRemoveAllocation(item.candidateId)}>
                        Unassign
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>

            {/* Pagination Footer */}
            {filteredAllocations.length > itemsPerPage && (
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
          )}
        </div>

      {pendingReallocation && (
        <div className="allocation-modal-backdrop" onClick={() => setPendingReallocation(null)}>
          <div className="allocation-modal" onClick={(event) => event.stopPropagation()}>
            <div className="allocation-modal__header">
              <h3>Confirm Reallocation</h3>
              <button type="button" onClick={() => setPendingReallocation(null)} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <div className="allocation-modal__body">
              <p>
                {pendingReallocation.candidates.filter((candidate) =>
                  allocationByCandidate.get(candidate.id)?.status === 'ALLOCATED'
                ).length} selected candidate(s) already have an interview slot.
              </p>
              <p>Their previous capacity will be restored when they are moved.</p>
            </div>
            <div className="allocation-modal__actions">
              <button type="button" className="allocation-modal-cancel" onClick={() => setPendingReallocation(null)}>Cancel</button>
              <button
                type="button"
                className="allocation-modal-confirm"
                onClick={() => performManualAllocation(pendingReallocation.candidates, pendingReallocation.slot)}
              >
                Confirm Reallocation
              </button>
            </div>
          </div>
        </div>
      )}

      {showResetConfirm && (
        <div className="allocation-modal-backdrop" onClick={() => setShowResetConfirm(false)}>
          <div className="allocation-modal" onClick={(event) => event.stopPropagation()}>
            <div className="allocation-modal__header">
              <h3>Reset Allocations?</h3>
              <button type="button" onClick={() => setShowResetConfirm(false)} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <div className="allocation-modal__body">
              <p>This will discard the current allocation changes and restore the initial demo records.</p>
            </div>
            <div className="allocation-modal__actions">
              <button type="button" className="allocation-modal-cancel" onClick={() => setShowResetConfirm(false)}>Cancel</button>
              <button type="button" className="allocation-modal-confirm allocation-modal-danger" onClick={handleResetAllocations}>
                Reset Allocations
              </button>
            </div>
          </div>
        </div>
      )}

      {reschedulingAllocation && (
        <div className="allocation-modal-backdrop" onClick={() => setReschedulingAllocation(null)}>
          <div className="allocation-modal" onClick={(event) => event.stopPropagation()}>
            <div className="allocation-modal__header">
              <h3>Reschedule Interview</h3>
              <button type="button" onClick={() => setReschedulingAllocation(null)} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <div className="allocation-modal__body">
              <p>Select a new slot for <strong>{reschedulingAllocation.candidateName}</strong>.</p>
              <label className="reschedule-slot-label" htmlFor="reschedule-slot">Available time slot</label>
              <select
                id="reschedule-slot"
                className="form-control"
                value={rescheduleSlotId}
                onChange={(event) => setRescheduleSlotId(event.target.value)}
              >
                <option value="">Select a slot</option>
                {rescheduleOptions.map((slot) => (
                  <option key={slot.id} value={slot.id}>
                    {slot.date} · {slot.time}–{slot.end} · {slot.type} · {slot.rem} available
                  </option>
                ))}
              </select>
            </div>
            <div className="allocation-modal__actions">
              <button type="button" className="allocation-modal-cancel" onClick={() => setReschedulingAllocation(null)}>Cancel</button>
              <button type="button" className="allocation-modal-confirm" onClick={handleConfirmReschedule}>
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  if (embeddedVacancy) {
    return <div className="embedded-allocation-tab">{mainContent}</div>;
  }

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
          onHamburgerClick={() => setSidebarOpen(true)}
        />

        {/* Content Container */}
        <div className="recruiter-content">
          {/* ── Sub-navigation Tabs ── */}
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
          </div>

          {/* ── Page Heading Block + Auto Allocate Button ── */}
          <div className="page-heading-block heading-with-action">
            <div>
              <h1 className="interview-page-title">Candidate Interview Allocation</h1>
              <p className="page-subtitle">
                Assign shortlisted candidates to available interview slots by priority.
              </p>
            </div>
            <button type="button" className="btn-auto-allocate" onClick={handleAutoAllocate}>
              <Sparkles size={16} />
              <span>Auto Allocate</span>
            </button>
          </div>

          {mainContent}
        </div>
      </div>
    </div>
  );
}
