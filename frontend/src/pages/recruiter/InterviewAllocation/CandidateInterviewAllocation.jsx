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
  ExternalLink,
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
import { INTERVIEWS } from '../../../data/interviews';
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

  const [roundsCount, setRoundsCount] = useState(3);
  const [roundTitles, setRoundTitles] = useState(['HR Screening', 'Technical / Live Coding', 'System Design Architecture']);

  const handleRoundsCountChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (val >= 1 && val <= 10) {
      setRoundsCount(val);
      setRoundTitles(prev => {
        const newTitles = [...prev];
        while (newTitles.length < val) newTitles.push('');
        return newTitles;
      });
    } else if (e.target.value === '') {
      setRoundsCount('');
    }
  };

  const handleRoundTitleChange = (index, val) => {
    setRoundTitles(prev => {
      const newTitles = [...prev];
      newTitles[index] = val;
      return newTitles;
    });
  };

  const [candidates, setCandidates] = useState(() => {
    if (embeddedVacancy) {
      if (embeddedVacancy.title === 'Product Designer') return [];
      return INITIAL_CANDIDATES.map((c) => ({ ...c, jobPosition: embeddedVacancy.title }));
    }
    return INITIAL_CANDIDATES;
  });
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
  const [viewingSlotModal, setViewingSlotModal] = useState(null);
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
    const vId = embeddedVacancy?.id || 'VAC-001';
    allocations.forEach((alloc) => {
      if (alloc.status === 'ALLOCATED') {
        const existingIdx = INTERVIEWS.findIndex(
          (item) => item.vacancyId === vId && item.candidateName === alloc.candidateName
        );
        const record = {
          id: `${vId}-${alloc.candidateId}`,
          vacancyId: vId,
          candidateName: alloc.candidateName,
          date: alloc.interviewDate,
          time: alloc.assignedTime,
          round: interviewRound || 'Round 1',
          status: 'scheduled',
          interviewer: 'Interview Panel',
          location: alloc.interviewType === 'Physical' ? 'Office — Room 1A' : 'Google Meet',
        };
        if (existingIdx >= 0) {
          INTERVIEWS[existingIdx] = record;
        } else {
          INTERVIEWS.push(record);
        }
      }
    });
    showToast('Interview allocations saved and synced to schedule!');
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
      <div className="card-surface filter-card-row" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap', flex: 1, minWidth: '60%' }}>
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

          <div className="dynamic-rounds-pipeline" style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, minWidth: '350px' }}>
            <div style={{ paddingRight: '140px' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-on-dark, #fff)', margin: '0 0 4px 0' }}>
                Set Up Interview Rounds for This Vacancy
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#9599A6', margin: 0 }}>
                Choose the number of interview rounds and select the type for each round.
              </p>
            </div>
            <div style={{ 
              position: 'absolute', 
              top: 0, 
              right: 0, 
              display: 'flex', 
              alignItems: 'center', 
              background: 'rgba(240, 185, 11, 0.15)', 
              border: '1px solid #F0B90B', 
              borderRadius: '6px', 
              padding: '0 10px', 
              height: '32px' 
            }}>
              <label style={{ fontSize: '0.7rem', color: '#F0B90B', fontWeight: 700, margin: 0, whiteSpace: 'nowrap', cursor: 'pointer' }}>
                ROUNDS COUNT:
              </label>
              <input 
                type="number" 
                min="1" 
                max="10" 
                value={roundsCount} 
                onChange={handleRoundsCountChange}
                style={{ 
                  width: '28px', 
                  background: 'transparent',
                  border: 'none',
                  color: '#F0B90B', 
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  outline: 'none',
                  textAlign: 'center',
                  marginLeft: '4px',
                  padding: 0
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {Array.from({ length: roundsCount || 0 }).map((_, idx) => (
                <div key={idx} style={{ flex: '1 1 150px' }}>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: '#9599A6', marginBottom: '6px', fontWeight: 600 }}>
                    ROUND {idx + 1} TITLE
                  </label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Add Round Name"
                    value={roundTitles[idx] || ''} 
                    onChange={(e) => handleRoundTitleChange(idx, e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-dark, #2A2C38)', background: 'rgba(255, 255, 255, 0.03)', color: 'var(--text-on-dark, #fff)', fontSize: '0.85rem', outline: 'none' }} 
                  />
                </div>
              ))}
            </div>

            {/* Next Step Section */}
            <div style={{ 
              marginTop: '24px', 
              border: '1px solid var(--border-dark, #2A2C38)',
              borderLeft: '4px solid #F0B90B',
              backgroundColor: 'rgba(240, 185, 11, 0.04)',
              borderRadius: '8px',
              padding: '16px 20px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              flexWrap: 'wrap', 
              gap: '16px' 
            }}>
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-on-dark, #fff)', margin: '0 0 4px 0' }}>
                  Next Step: Schedule Interviews 
                </h4>
                <p style={{ fontSize: '0.75rem', color: '#9599A6', margin: 0 }}>
                  Once rounds are configured, start scheduling interviews as per selected rounds.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <a
                  href="https://calendar.google.com/calendar/r"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-schedule-inline"
                  title="Open Google Calendar in a new tab"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0 16px',
                    height: '42px',
                    borderRadius: '8px',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    backgroundColor: '#1E222D',
                    border: '1px solid #2A2C38',
                    color: '#4285F4',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                    boxShadow: 'none',
                  }}
                >
                  <Calendar size={15} style={{ color: '#4285F4' }} />
                  <span>Google Calendar Sync</span>
                  <ExternalLink size={13} style={{ color: '#9599A6' }} />
                </a>

                <button
                  type="button"
                  className="btn-primary-accent btn-schedule-inline"
                  onClick={() =>
                    navigate('/recruiter/interviews', {
                      state: { selectedVacancy: embeddedVacancy ? embeddedVacancy.title : jobPosition, openForm: true },
                    })
                  }
                  style={{ height: '42px' }}
                >
                  <CalendarPlus size={16} />
                  <span>Schedule Interviews</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

          {/* ── Panel Details Section ── */}
          <div className="card-surface" style={{ marginBottom: '24px' }}>
            <div className="card-header-bar border-bottom-header">
              <div className="card-title-group">
                <span className="gold-indicator"></span>
                <h2 className="card-title">Assigned Panel Details</h2>
              </div>
            </div>
            <div style={{ padding: '24px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              {/* Panel Info Card */}
              <div style={{ flex: '1 1 calc(50% - 10px)', backgroundColor: '#13141C', padding: '20px', borderRadius: '12px', border: '1px solid #2A2C38' }}>
                <h3 style={{ fontSize: '0.75rem', color: '#9599A6', textTransform: 'uppercase', marginBottom: '16px', fontWeight: 700, letterSpacing: '0.05em' }}>Panel Information</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px dashed #2A2C38' }}>
                    <span style={{ color: '#9599A6', fontSize: '0.82rem', fontWeight: 500 }}>Panel Name</span>
                    <span style={{ color: '#FFFFFF', fontSize: '0.85rem', fontWeight: 600 }}>Panel A (Technical Leads)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px dashed #2A2C38' }}>
                    <span style={{ color: '#9599A6', fontSize: '0.82rem', fontWeight: 500 }}>Meeting Type</span>
                    <span className="type-tag" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60A5FA', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '4px 10px', fontSize: '0.7rem' }}>Google Meet</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#9599A6', fontSize: '0.82rem', fontWeight: 500 }}>Location / Link</span>
                    <a href="#" style={{ color: '#F0B90B', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 600 }}>meet.google.com/xyz-123</a>
                  </div>
                </div>
              </div>

              {/* Panel Members Card */}
              <div style={{ flex: '1 1 calc(50% - 10px)', backgroundColor: '#13141C', padding: '20px', borderRadius: '12px', border: '1px solid #2A2C38' }}>
                <h3 style={{ fontSize: '0.75rem', color: '#9599A6', textTransform: 'uppercase', marginBottom: '16px', fontWeight: 700, letterSpacing: '0.05em' }}>Panel Members</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#16171F', padding: '12px', borderRadius: '8px', border: '1px solid #2A2C38' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(240, 185, 11, 0.15)', color: '#F0B90B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>ST</div>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ color: '#FFFFFF', fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>Saman Tech</div>
                      <div style={{ color: '#9599A6', fontSize: '0.72rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>saman.tech@company.com</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#16171F', padding: '12px', borderRadius: '8px', border: '1px solid #2A2C38' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60A5FA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>NH</div>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ color: '#FFFFFF', fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>Nirosha HR</div>
                      <div style={{ color: '#9599A6', fontSize: '0.72rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>nirosha.hr@company.com</div>
                    </div>
                  </div>
                </div>
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
                    <th style={{ width: '18%' }}>CANDIDATE NAME</th>
                    <th style={{ width: '15%' }}>INTERVIEW ROUND</th>
                    <th style={{ width: '12%' }}>PANEL NAME</th>
                    <th style={{ width: '13%' }}>ASSIGNED TIME SLOT</th>
                    <th style={{ width: '12%' }}>INTERVIEW DATE</th>
                    <th style={{ width: '10%' }}>INTERVIEW TYPE</th>
                    <th style={{ width: '12%' }}>ALLOCATION STATUS</th>
                    <th style={{ width: '8%', textAlign: 'right' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedAllocations.map((item) => (
                    <tr key={item.candidateId}>
                      <td className="font-bold cand-name-cell">{item.candidateName}</td>
                      <td>
                        <span className="type-tag" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60A5FA', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                          {item.interviewRound || interviewRound}
                        </span>
                      </td>
                      <td style={{ color: '#E0E1E6', fontSize: '0.85rem' }}>
                        {item.panelName || 'Panel A'}
                      </td>
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
                    <div><dt>Round</dt><dd>{item.interviewRound || interviewRound}</dd></div>
                    <div><dt>Panel</dt><dd>{item.panelName || 'Panel A'}</dd></div>
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

              {filteredCandidates.length === 0 ? (
                <div style={{ padding: '60px 20px', textAlign: 'center', color: '#9599A6', borderTop: '1px solid #2A2C38' }}>
                  <Users size={32} style={{ marginBottom: '16px', opacity: 0.3, display: 'inline-block' }} />
                  <h4 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '8px', fontWeight: 600 }}>No candidates found</h4>
                  <p style={{ fontSize: '0.8rem', lineHeight: '1.5', maxWidth: '250px', margin: '0 auto' }}>
                    No candidates have been shortlisted yet. Open candidate details to shortlist them.
                  </p>
                </div>
              ) : (
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
              )}
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


        {/* ── Scheduled & Logged Time Slots Table Card (Exact Replica of Image 2) ── */}
        <div className="an-table-section" style={{ marginTop: '28px', backgroundColor: '#16171F', border: '1px solid #2A2C38', borderRadius: '14px', overflow: 'hidden' }}>
          <div className="an-section-header" style={{ padding: '18px 24px', borderBottom: '1px solid #2A2C38', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#16171F' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="an-chart-gold-bar" style={{ width: '3.5px', height: '16px', backgroundColor: '#F0B90B', borderRadius: '2px', display: 'inline-block' }} />
              <span className="an-section-title" style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#FFFFFF' }}>
                INTERVIEW STAGE &amp; ALLOCATION TRACKING
              </span>
            </div>

            <div className="an-local-search" style={{ width: '220px', height: '36px', padding: '0 12px', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#13141C', border: '1px solid #2A2C38', borderRadius: '8px', color: '#9599A6' }}>
              <Search size={14} />
              <input
                type="search"
                placeholder="Search slots..."
                aria-label="Search scheduled and logged slots"
                style={{ width: '100%', border: 0, outline: 0, background: 'transparent', color: '#FFFFFF', fontSize: '0.82rem' }}
              />
            </div>
          </div>

          <div className="an-table-wrap" style={{ overflowX: 'auto', width: '100%' }}>
            <table className="an-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#13141C', borderBottom: '1px solid #2A2C38' }}>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9599A6' }}>CANDIDATE NAME / ROLE</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9599A6' }}>INTERVIEW ROUND</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9599A6' }}>SLOT ID</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9599A6' }}>DATE &amp; TIME</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9599A6' }}>TYPE</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9599A6' }}>STATUS</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9599A6' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {INITIAL_SLOTS.slice(0, 5).map((slot, index) => {
                  const isCompleted = index % 2 === 0;
                  const candidate = INITIAL_CANDIDATES[index] || { name: 'Alice Fernando', jobPosition: 'Senior Software Engineer' };
                  const slotIdFormatted = `#SLOT-10${index + 1}`;

                  return (
                    <tr key={slot.id || index} style={{ borderBottom: '1px solid #2A2C38', transition: 'background-color 0.15s ease' }}>
                      <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.9rem' }}>{candidate.name}</span>
                          <span style={{ color: '#9599A6', fontSize: '0.78rem', fontWeight: 400 }}>{candidate.jobPosition}</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                        <span style={{ display: 'inline-block', backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60A5FA', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '4px 14px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>
                          {slot.round || 'Technical Interview'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', verticalAlign: 'middle', color: '#FFFFFF', fontWeight: 700, fontSize: '0.85rem', fontFamily: 'monospace' }}>
                        {slotIdFormatted}
                      </td>
                      <td style={{ padding: '16px 20px', verticalAlign: 'middle', color: '#FFFFFF', fontSize: '0.85rem', fontWeight: 500 }}>
                        {slot.date} ({slot.time})
                      </td>
                      <td style={{ padding: '16px 20px', verticalAlign: 'middle', color: '#FFFFFF', fontSize: '0.85rem' }}>
                        {slot.type}
                      </td>
                      <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '4px 12px',
                            borderRadius: '9999px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            letterSpacing: '0.03em',
                            backgroundColor: isCompleted ? 'rgba(34, 197, 94, 0.12)' : 'rgba(240, 185, 11, 0.12)',
                            color: isCompleted ? '#22C55E' : '#F0B90B',
                            border: isCompleted ? '1px solid rgba(34, 197, 94, 0.25)' : '1px solid rgba(240, 185, 11, 0.25)',
                          }}
                        >
                          {isCompleted && <CheckCircle2 size={12} />}
                          <span>{isCompleted ? 'COMPLETED' : 'INTERVIEW SCHEDULED'}</span>
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'right', verticalAlign: 'middle' }}>
                        <button
                          type="button"
                          onClick={() => setViewingSlotModal(slot)}
                          style={{
                            backgroundColor: '#F0B90B',
                            color: '#0D0E12',
                            border: 'none',
                            borderRadius: '9999px',
                            padding: '6px 22px',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(240, 185, 11, 0.2)',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8C31D')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#F0B90B')}
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls (Exact Match to Image 2) */}
          <div className="an-pagination" style={{ padding: '16px 24px', borderTop: '1px solid #2A2C38', backgroundColor: '#16171F', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="an-pagination-info" style={{ fontSize: '0.82rem', color: '#9599A6' }}>
              Showing <strong style={{ color: '#FFFFFF' }}>1–5</strong> of <strong style={{ color: '#FFFFFF' }}>6</strong> records
            </span>

            <div className="an-pagination-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                className="an-page-btn"
                disabled
                style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #2A2C38', backgroundColor: '#16171F', color: '#6E7079', display: 'grid', placeItems: 'center', cursor: 'not-allowed' }}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                className="an-page-btn an-page-num is-active"
                style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', backgroundColor: '#F0B90B', color: '#0D0E12', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
              >
                1
              </button>
              <button
                type="button"
                className="an-page-btn an-page-num"
                style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #2A2C38', backgroundColor: '#16171F', color: '#FFFFFF', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
              >
                2
              </button>
              <button
                type="button"
                className="an-page-btn"
                style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #2A2C38', backgroundColor: '#16171F', color: '#FFFFFF', display: 'grid', placeItems: 'center', cursor: 'pointer' }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

      {/* ── Modal: Manage / View Slot Details ── */}
      {viewingSlotModal && (
        <div className="allocation-modal-backdrop" onClick={() => setViewingSlotModal(null)}>
          <div
            className="allocation-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '580px', width: '92%', borderRadius: '16px', backgroundColor: '#16171F', border: '1px solid rgba(240, 185, 11, 0.3)', padding: '24px' }}
          >
            <div className="flex-between" style={{ paddingBottom: '16px', borderBottom: '1px solid #2A2C38', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '8px', height: '22px', backgroundColor: '#F0B90B', borderRadius: '4px' }} />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF' }}>
                  Interview Slot &amp; Evaluation Details
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingSlotModal(null)}
                style={{ background: 'none', border: 'none', color: '#9599A6', fontSize: '1.4rem', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1E222D', paddingBottom: '8px' }}>
                <span style={{ color: '#9599A6' }}>Interview Round:</span>
                <span style={{ color: '#FFFFFF', fontWeight: 700 }}>{viewingSlotModal.round || 'Technical Interview'} ({viewingSlotModal.type})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1E222D', paddingBottom: '8px' }}>
                <span style={{ color: '#9599A6' }}>Date &amp; Time:</span>
                <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{viewingSlotModal.date} ({viewingSlotModal.time} - {viewingSlotModal.end || '10:00 AM'})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1E222D', paddingBottom: '8px' }}>
                <span style={{ color: '#9599A6' }}>Assigned Panel:</span>
                <span style={{ color: '#F0B90B', fontWeight: 600 }}>Panel A (Technical Leads)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1E222D', paddingBottom: '8px' }}>
                <span style={{ color: '#9599A6' }}>Evaluator Emails:</span>
                <span style={{ color: '#9599A6', fontFamily: 'monospace', fontSize: '0.8rem' }}>saman.tech@company.com, nirosha.hr@company.com</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1E222D', paddingBottom: '8px' }}>
                <span style={{ color: '#9599A6' }}>Evaluation Rating:</span>
                <span style={{ color: '#F0B90B', fontWeight: 700 }}>⭐⭐⭐⭐⭐ (5 Stars - Exceptional)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1E222D', paddingBottom: '8px' }}>
                <span style={{ color: '#9599A6' }}>Hiring Recommendation:</span>
                <span style={{ color: '#22C55E', fontWeight: 700 }}>✅ Recommended for Next Round</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ color: '#9599A6', fontWeight: 600 }}>Panel Feedback Notes &amp; Remarks:</span>
                <div style={{ backgroundColor: '#1E222D', padding: '12px', borderRadius: '8px', color: '#D1D5DB', fontSize: '0.84rem', fontStyle: 'italic', border: '1px solid #2A2C38' }}>
                  "Candidate demonstrated exceptional problem solving abilities, clean code architecture knowledge, and strong technical communication during the live session."
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #2A2C38' }}>
              <button
                type="button"
                className="btn-primary-accent"
                style={{ flex: 1, padding: '11px 16px', fontWeight: 700, borderRadius: '8px', border: 'none', backgroundColor: '#F0B90B', color: '#0D0E12', cursor: 'pointer' }}
                onClick={() => {
                  const slotToEdit = viewingSlotModal;
                  setViewingSlotModal(null);
                  navigate('/recruiter/interviews', {
                    state: {
                      editSlot: slotToEdit,
                      activeZohoType: 'Log'
                    }
                  });
                }}
              >
                Edit Slot Settings
              </button>
              <button
                type="button"
                className="btn-ghost-dark"
                style={{ padding: '11px 20px', borderRadius: '8px', border: '1px solid #2A2C38', backgroundColor: 'transparent', color: '#FFFFFF', cursor: 'pointer' }}
                onClick={() => setViewingSlotModal(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
