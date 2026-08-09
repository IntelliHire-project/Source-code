import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  Calendar,
  MoreVertical,
  MapPin,
  Building2,
  FileText,
  Clock,
  ExternalLink,
  ArrowLeft,
  Plus,
  AlertCircle,
  Star,
  Check,
  CalendarPlus,
  ListChecks,
  ClipboardList,
  TrendingUp,
  Circle,
  Pencil,
  Copy,
  X,
  User,
  Mail,
  Phone,
  Download,
  Building,
  CheckCircle,
  ChevronDown,
  Search,
  Filter,
  ChevronRight,
} from 'lucide-react';
import RecruiterSidebar from '../../../components/common/RecruiterSidebar';
import TopBar from '../../../components/TopBar/TopBar';
import StatusBadge from '../../../components/common/StatusBadge';
import DropdownMenu from '../../../components/common/DropdownMenu';
import CandidateInterviewAllocationPage from '../InterviewAllocation/CandidateInterviewAllocation';
import { VACANCIES } from '../../../data/vacancies';
import {
  getApplicants,
  getStageCounts,
  getFunnel,
  getShortlisted,
  getAvgMatchScore,
  deriveNextStep,
  getTrackerStates,
  getOutcome,
} from '../../../data/applicants';
import { getInterviews } from '../../../data/interviews';
import { STATUS_COLORS, STATUS_TONES } from '../../../utils/statusColors';
import '../../../style.css';
import './VacancyDetailPage.css';
import ApplicantsSectionContent from './ApplicantsSectionContent';
import { MOCK_CANDIDATES } from '../RankedApplicants/RankedApplicants';

const STAGE_LABELS = {
  applied: 'Applied',
  shortlisted: 'Shortlisted',
  interviewed: 'Interviewed',
  offer: 'Offer',
  hired: 'Hired',
  rejected: 'Rejected',
  dropped: 'Dropped',
};

const INTERVIEW_STATUS_LABELS = {
  scheduled: 'Scheduled',
  completed: 'Completed',
  rescheduled: 'Rescheduled',
  cancelled: 'Cancelled',
};

function initials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

function toneForState(state) {
  if (state === 'done') return STATUS_TONES.success;
  if (state === 'current') return STATUS_TONES.warning;
  return STATUS_TONES.neutral;
}

function EmptyState({ icon: Icon, title, hint }) {
  return (
    <div className="vd-empty">
      <div className="vd-empty__icon">
        <Icon size={20} />
      </div>
      <p className="vd-empty__title">{title}</p>
      <p className="vd-empty__hint">{hint}</p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Recruitment Progress Tracker + Next-step callout
   ───────────────────────────────────────────────────────────── */
function ProgressTracker({ vacancy }) {
  const states = getTrackerStates(vacancy);

  return (
    <section className="vd-progress" aria-label="Recruitment progress">
      <div className="vd-progress__stepper" role="list">
        {states.map((node, index) => (
          <div
            key={node.id}
            className={`vd-progress__node vd-progress__node--${node.state}`}
            role="listitem"
            style={{ ['--status-color']: `var(${toneForState(node.state)})` }}
          >
            <div className="vd-progress__track">
              {index < states.length - 1 && <div className="vd-progress__connector" />}
              <div className="vd-progress__dot" aria-hidden="true">
                {node.state === 'done' && <Check size={12} />}
                {node.state === 'current' && <Circle size={10} />}
              </div>
            </div>
            <span className="vd-progress__label">{node.label}</span>
          </div>
        ))}
      </div>

      <div className="vd-next-step">
        <span className="vd-next-step__eyebrow">Next step</span>
        <p className="vd-next-step__text">{deriveNextStep(vacancy)}</p>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   Tab: Vacancy Details
   ───────────────────────────────────────────────────────────── */
function VacancyDetailsTab({ vacancy }) {
  return (
    <>
      <div style={{ marginBottom: '24px' }}>
        <ProgressTracker vacancy={vacancy} />
      </div>
      <div className="vd-details-grid">
        <div className="vd-details-main">
        <section className="vd-card">
          <div className="vd-card__header">
            <span className="vd-card__eyebrow">Job Description</span>
            <h3 className="vd-card__title">About the role</h3>
          </div>
          <p className="vd-body-text">{vacancy.description}</p>
        </section>

        <section className="vd-card">
          <div className="vd-card__header">
            <span className="vd-card__eyebrow">Requirements</span>
            <h3 className="vd-card__title">What we are looking for</h3>
          </div>
          <ul className="vd-requirements">
            {vacancy.requirements.map((requirement) => (
              <li key={requirement}>
                <span className="vd-requirements__check">
                  <Check size={12} />
                </span>
                {requirement}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <aside className="vd-details-meta">
        <section className="vd-card vd-meta-card">
          <div className="vd-card__header">
            <span className="vd-card__eyebrow">Position Details</span>
            <h3 className="vd-card__title">Role information</h3>
          </div>
          <dl className="vd-meta-list">
            <div className="vd-meta-item">
              <dt>
                <FileText size={14} />
                Salary range
              </dt>
              <dd>{vacancy.salaryRange}</dd>
            </div>
            <div className="vd-meta-item">
              <dt>
                <Users size={14} />
                Hiring manager
              </dt>
              <dd>{vacancy.hiringManager}</dd>
            </div>
            <div className="vd-meta-item">
              <dt>
                <Building2 size={14} />
                Department
              </dt>
              <dd>{vacancy.department}</dd>
            </div>
            <div className="vd-meta-item">
              <dt>
                <MapPin size={14} />
                Location
              </dt>
              <dd>{vacancy.location}</dd>
            </div>
            <div className="vd-meta-item">
              <dt>
                <Clock size={14} />
                Date created
              </dt>
              <dd>{vacancy.dateCreated}</dd>
            </div>
          </dl>
        </section>
      </aside>
    </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   Tab: Applicants
   ───────────────────────────────────────────────────────────── */
function ApplicantsTab({ vacancy }) {
  const navigate = useNavigate();
  const candidates = getApplicants(vacancy.id);
  if (candidates.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No applicants yet"
        hint="Share this vacancy to start sourcing — new applications will appear here."
      />
    );
  }

  function openProfile(candidate) {
    navigate('/candidate/profile');
  }

  return (
    <div className="vd-card">
      <div className="vd-table-wrap">
        <table className="vd-table">
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Match Score</th>
              <th>Current Stage</th>
              <th>Applied Date</th>
              <th>Resume</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {candidates.map((candidate) => (
              <tr
                key={candidate.id}
                className="vd-table__row vd-table__row--clickable"
                tabIndex={0}
                role="link"
                aria-label={`Open profile for ${candidate.name}`}
                onClick={() => openProfile(candidate)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openProfile(candidate);
                  }
                }}
              >
                <td>
                  <div className="vd-person">
                    <span className="vd-avatar" aria-hidden="true">
                      {initials(candidate.name)}
                    </span>
                    <div className="vd-person__text">
                      <span className="vd-person__name">{candidate.name}</span>
                      <span className="vd-person__email">{candidate.email}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="vd-score">
                    <Star size={12} />
                    {candidate.score}%
                  </span>
                </td>
                <td>
                  <StatusBadge
                    status={candidate.stage}
                    label={STAGE_LABELS[candidate.stage] || candidate.stage}
                  />
                </td>
                <td>
                  <span className="vd-date">{candidate.appliedDate}</span>
                </td>
                <td>
                  <a
                    className="vd-link"
                    href={candidate.resumeLink}
                    onClick={(event) => event.stopPropagation()}
                  >
                    Resume <ExternalLink size={12} />
                  </a>
                </td>
                <td>
                  <button
                    type="button"
                    className="vd-link-btn"
                    aria-label={`Open profile for ${candidate.name}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      openProfile(candidate);
                    }}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Tab: Shortlist
   ───────────────────────────────────────────────────────────── */
function ShortlistTab({ vacancy, scheduledIds, onSchedule }) {
  const shortlisted = getShortlisted(vacancy);
  if (shortlisted.length === 0) {
    return (
      <EmptyState
        icon={UserCheck}
        title="No candidates shortlisted yet"
        hint="Review applicants and shortlist the strongest matches to build your pipeline."
      />
    );
  }

  return (
    <div className="vd-shortlist">
      {shortlisted.map((candidate, index) => {
        const isScheduled = scheduledIds.has(candidate.id);
        const isPastShortlist =
          candidate.stage === 'interviewed' ||
          candidate.stage === 'offer' ||
          candidate.stage === 'hired';
        return (
          <div className="vd-shortlist-card" key={candidate.id}>
            <div className="vd-shortlist-card__rank" aria-hidden="true">
              {index + 1}
            </div>
            <span className="vd-avatar" aria-hidden="true">
              {initials(candidate.name)}
            </span>
            <div className="vd-shortlist-card__main">
              <span className="vd-person__name">{candidate.name}</span>
              <span className="vd-person__email">{candidate.email}</span>
              <div className="vd-shortlist-card__meta">
                <span className="vd-score">
                  <Star size={12} />
                  {candidate.score}% match
                </span>
                <StatusBadge
                  status={candidate.stage}
                  label={STAGE_LABELS[candidate.stage] || candidate.stage}
                />
              </div>
            </div>
            <button
              type="button"
              className="vd-action-btn"
              disabled={isScheduled || isPastShortlist}
              onClick={() => onSchedule(candidate)}
            >
              {isScheduled ? (
                <>
                  <Check size={14} /> Added to schedule
                </>
              ) : isPastShortlist ? (
                'In interviews'
              ) : (
                <>
                  <CalendarPlus size={14} /> Move to Interview Schedule
                </>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Tab: Interview Schedule
   ───────────────────────────────────────────────────────────── */
function InterviewScheduleTab({ vacancy, extraInterviews, onAddInterview }) {
  const navigate = useNavigate();
  const interviews = [...extraInterviews, ...getInterviews(vacancy.id)];
  const [showForm, setShowForm] = useState(false);
  const [candidate, setCandidate] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const shortlisted = getShortlisted(vacancy);

  if (interviews.length === 0 && !showForm) {
    return (
      <div className="vd-empty-wrap">
        <EmptyState
          icon={Calendar}
          title="No interviews scheduled yet"
          hint="Shortlist candidates first, then schedule interviews here."
        />
        <button
          type="button"
          className="vd-primary-btn"
          onClick={() => navigate('/recruiter/interviews', { state: { selectedVacancy: vacancy.title, openForm: true } })}
        >
          <CalendarPlus size={15} /> Schedule New Interview
        </button>
      </div>
    );
  }

  return (
    <div className="vd-interviews">
      <div className="vd-section-actions">
        <button
          type="button"
          className="vd-primary-btn"
          onClick={() => navigate('/recruiter/interviews', { state: { selectedVacancy: vacancy.title, openForm: true } })}
        >
          <CalendarPlus size={15} /> Schedule New Interview
        </button>
      </div>

      {showForm && (
        <div className="vd-card vd-form-card">
          <h3 className="vd-card__title">Schedule an interview</h3>
          <form
            className="vd-form"
            onSubmit={(event) => {
              event.preventDefault();
              if (!candidate || !date || !time) return;
              onAddInterview({ candidateName: candidate, date, time });
              setCandidate('');
              setDate('');
              setTime('');
              setShowForm(false);
            }}
          >
            <label className="vd-form__field">
              <span>Candidate</span>
              <select value={candidate} onChange={(e) => setCandidate(e.target.value)} required>
                <option value="">Select candidate…</option>
                {shortlisted.map((person) => (
                  <option key={person.id} value={person.name}>
                    {person.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="vd-form__field">
              <span>Date</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </label>
            <label className="vd-form__field">
              <span>Time</span>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
            </label>
            <div className="vd-form__actions">
              <button type="submit" className="vd-primary-btn">
                <Plus size={14} /> Add interview
              </button>
              <button
                type="button"
                className="vd-ghost-btn"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {interviews.length > 0 && (
        <div className="vd-card">
          <div className="vd-table-wrap">
            <table className="vd-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Round</th>
                  <th>Interviewer</th>
                  <th>Location</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {interviews.map((interview) => (
                  <tr key={interview.id}>
                    <td>
                      <span className="vd-person__name">{interview.candidateName}</span>
                    </td>
                    <td>
                      <span className="vd-date">{interview.date}</span>
                    </td>
                    <td>
                      <span className="vd-date">{interview.time}</span>
                    </td>
                    <td>
                      <span className="vd-pill">{interview.round}</span>
                    </td>
                    <td>
                      <span className="vd-muted">{interview.interviewer}</span>
                    </td>
                    <td>
                      <span className="vd-muted">{interview.location}</span>
                    </td>
                    <td>
                      <StatusBadge
                        status={interview.status}
                        label={INTERVIEW_STATUS_LABELS[interview.status] || interview.status}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Tab: Attendees
   ───────────────────────────────────────────────────────────── */
function AttendeesTab({ vacancy }) {
  const attendees = vacancy.attendees || [];
  if (attendees.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No interview panel assigned yet"
        hint="Schedule interviews first — the panel for this vacancy will be listed here."
      />
    );
  }

  return (
    <div className="vd-attendees">
      {attendees.map((attendee) => (
        <div className="vd-card vd-attendee" key={attendee.id}>
          <div className="vd-attendee__head">
            <span className="vd-avatar vd-avatar--lg" aria-hidden="true">
              {initials(attendee.name)}
            </span>
            <div className="vd-person__text">
              <span className="vd-person__name">{attendee.name}</span>
              <span className="vd-person__email">{attendee.role}</span>
            </div>
            {attendee.confirmed ? (
              <StatusBadge status="approved" label="Confirmed" />
            ) : (
              <StatusBadge status="pending" label="Awaiting confirmation" />
            )}
          </div>
          <div className="vd-attendee__body">
            <div className="vd-attendee__group">
              <span className="vd-attendee__label">Assigned interviews</span>
              <div className="vd-attendee__chips">
                {attendee.interviews.map((item) => (
                  <span className="vd-pill" key={item}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="vd-attendee__group">
              <span className="vd-attendee__label">Availability</span>
              <span className="vd-muted">{attendee.availability}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Tab: Admin Review
   ───────────────────────────────────────────────────────────── */
function AdminReviewTab({ vacancy }) {
  const reviews = vacancy.adminReviews || [];
  const approval = vacancy.approvalHistory || [];

  return (
    <div className="vd-admin">
      <section className="vd-card">
        <div className="vd-card__header">
          <span className="vd-card__eyebrow">Approval Timeline</span>
          <h3 className="vd-card__title">Vacancy approval history</h3>
        </div>
        <div className="vd-approval" role="list">
          {approval.map((item, index) => (
            <div
              key={item.step}
              className={`vd-approval__node vd-approval__node--${item.state}`}
              role="listitem"
              style={{ ['--status-color']: `var(${toneForState(item.state)})` }}
            >
              <div className="vd-approval__track">
                {index < approval.length - 1 && <div className="vd-approval__connector" />}
                <div className="vd-approval__dot" aria-hidden="true">
                  {item.state === 'done' && <Check size={12} />}
                  {item.state === 'current' && <Circle size={10} />}
                </div>
              </div>
              <span className="vd-approval__label">{item.step}</span>
              <span className="vd-approval__time">{item.timestamp}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="vd-card">
        <div className="vd-card__header">
          <span className="vd-card__eyebrow">Admin Decisions</span>
          <h3 className="vd-card__title">Reviewer decisions</h3>
        </div>
        {reviews.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No reviews yet"
            hint="Decisions will appear here once reviewers respond to this vacancy."
          />
        ) : (
          <div className="vd-reviews">
            {reviews.map((review) => (
              <div className="vd-review" key={review.id}>
                <div className="vd-review__head">
                  <span className="vd-avatar" aria-hidden="true">
                    {initials(review.reviewerName)}
                  </span>
                  <div className="vd-person__text">
                    <span className="vd-person__name">{review.reviewerName}</span>
                    <span className="vd-person__email">{review.role}</span>
                  </div>
                  <StatusBadge status={review.decision} label={review.decision} />
                </div>
                {review.comment && <p className="vd-review__comment">“{review.comment}”</p>}
                <span className="vd-review__time">{review.timestamp}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Tab: Summary
   ───────────────────────────────────────────────────────────── */
function SummaryTab({ vacancy }) {
  const funnel = getFunnel(vacancy);
  const avgScore = getAvgMatchScore(vacancy);
  const outcome = getOutcome(vacancy);
  const activity = vacancy.activityLog || [];
  const counts = getStageCounts(vacancy);

  const steps = [
    { key: 'applied', label: 'Applied', value: funnel.applied },
    { key: 'shortlisted', label: 'Shortlisted', value: funnel.shortlisted },
    { key: 'interviewed', label: 'Interviewed', value: funnel.interviewed },
    { key: 'hired', label: 'Hired', value: funnel.hired },
  ];

  return (
    <div className="vd-summary">
      <section className="vd-card">
        <div className="vd-card__header">
          <span className="vd-card__eyebrow">Applicant Funnel</span>
          <h3 className="vd-card__title">Where candidates stand</h3>
        </div>
        {funnel.total === 0 ? (
          <EmptyState
            icon={TrendingUp}
            title="No pipeline activity yet"
            hint="Share the vacancy to start sourcing — the funnel will populate as applicants apply."
          />
        ) : (
          <div className="vd-funnel">
            {steps.map((step, index) => {
              const width = funnel.total ? Math.round((step.value / funnel.total) * 100) : 0;
              const conversion =
                index > 0 && steps[index - 1].value
                  ? Math.round((step.value / steps[index - 1].value) * 100)
                  : null;
              return (
                <div className="vd-funnel__step" key={step.key}>
                  <div className="vd-funnel__row">
                    <span className="vd-funnel__label">{step.label}</span>
                    <span className="vd-funnel__count">{step.value}</span>
                  </div>
                  <div
                    className="vd-funnel__track"
                    style={{ ['--status-color']: `var(${STATUS_COLORS[step.key]})` }}
                  >
                    <div className="vd-funnel__fill" style={{ width: `${width}%` }} />
                  </div>
                  {conversion !== null && (
                    <span className="vd-funnel__conversion">{conversion}% from previous stage</span>
                  )}
                </div>
              );
            })}
            <div className="vd-funnel__legend">
              <span className="vd-funnel__legend-item">
                <i style={{ ['--status-color']: `var(${STATUS_COLORS.hired})` }} />
                Hired {funnel.hired}
              </span>
              <span className="vd-funnel__legend-item">
                <i style={{ ['--status-color']: `var(${STATUS_COLORS.rejected})` }} />
                Rejected {funnel.rejected}
              </span>
              <span className="vd-funnel__legend-item">
                <i style={{ ['--status-color']: `var(${STATUS_COLORS.applied})` }} />
                Still open {funnel.total - funnel.hired - funnel.rejected}
              </span>
            </div>
          </div>
        )}
      </section>

      <section className="vd-card">
        <div className="vd-card__header">
          <span className="vd-card__eyebrow">Snapshot</span>
          <h3 className="vd-card__title">Recruitment summary</h3>
        </div>
        <dl className="vd-snapshot">
          <div className="vd-snapshot__item">
            <dt>Outcome</dt>
            <dd>
              <StatusBadge status={outcome.key} label={outcome.label} />
            </dd>
          </div>
          <div className="vd-snapshot__item">
            <dt>Time to fill</dt>
            <dd>{vacancy.timeToFill ? `${vacancy.timeToFill} days` : 'Still in progress'}</dd>
          </div>
          <div className="vd-snapshot__item">
            <dt>Avg. match score</dt>
            <dd>{avgScore ? `${avgScore}%` : '—'}</dd>
          </div>
          <div className="vd-snapshot__item">
            <dt>Total applicants</dt>
            <dd>{funnel.total}</dd>
          </div>
          <div className="vd-snapshot__item">
            <dt>Offers in progress</dt>
            <dd>{counts.offer}</dd>
          </div>
        </dl>
      </section>

      <section className="vd-card">
        <div className="vd-card__header">
          <span className="vd-card__eyebrow">Activity Log</span>
          <h3 className="vd-card__title">Recent activity</h3>
        </div>
        {activity.length === 0 ? (
          <EmptyState
            icon={ListChecks}
            title="No activity recorded yet"
            hint="Created, edited and status changes will be logged here."
          />
        ) : (
          <ul className="vd-activity">
            {activity.map((entry) => (
              <li className="vd-activity__item" key={entry.id}>
                <span className="vd-activity__dot" aria-hidden="true" />
                <span className="vd-activity__text">{entry.text}</span>
                <span className="vd-activity__time">{entry.timestamp}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Page
   ───────────────────────────────────────────────────────────── */
export default function VacancyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [scheduledIds, setScheduledIds] = useState(() => new Set());
  const [extraInterviews, setExtraInterviews] = useState([]);
  const [candidates, setCandidates] = useState(MOCK_CANDIDATES);
  const tabRefs = useRef([]);

  const vacancy = VACANCIES.find((item) => item.id === id);

  useEffect(() => {
    setActiveTab('details');
    setScheduledIds(new Set());
    setExtraInterviews([]);
  }, [id]);

  const funnel = vacancy ? getFunnel(vacancy) : null;
  const outcome = vacancy ? getOutcome(vacancy) : null;

  const TABS = vacancy
    ? [
        { id: 'details', label: 'Vacancy Details' },

        { id: 'applicants', label: 'Applicants', count: funnel.total },
        { id: 'shortlist', label: 'Shortlist', count: getShortlisted(vacancy).length },
        {
          id: 'interviews',
          label: 'Interview Schedule',
          count: getInterviews(vacancy.id).length,
        },
        { id: 'attendees', label: 'Attendees', count: (vacancy.attendees || []).length },
        { id: 'admin', label: 'Admin Review', count: (vacancy.adminReviews || []).length },

        // { id: 'applicants', label: 'Applicants', count: 8 },
        // { id: 'shortlist', label: 'Shortlist', count: 5 },
        // { id: 'interviews', label: 'Interview Schedule', count: 5 },
        // { id: 'attendees', label: 'Attendees', count: 3 },
        // { id: 'admin', label: 'Admin Review', count: 2 },

        { id: 'summary', label: 'Summary' },
      ]
    : [];

  function handleTabKeyDown(event, index) {
    let next = null;
    if (event.key === 'ArrowRight') next = (index + 1) % TABS.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + TABS.length) % TABS.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = TABS.length - 1;
    if (next !== null) {
      event.preventDefault();
      setActiveTab(TABS[next].id);
      tabRefs.current[next]?.focus();
    }
  }

  function handleAddInterview({ candidateName, date, time }) {
    setExtraInterviews((prev) => [
      {
        id: `local-${Date.now()}`,
        candidateName,
        date,
        time,
        round: 'Round 1',
        status: 'scheduled',
        interviewer: '—',
        location: 'TBC',
      },
      ...prev,
    ]);
  }

  const backLink = (
    <button
      type="button"
      className="vd-back-btn"
      onClick={() => navigate('/recruiter/vacancies')}
    >
      <ArrowLeft size={15} /> Back to Vacancies
    </button>
  );

  return (
    <div className="create-vacancy vd-shell">
      <RecruiterSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeItem="Active Vacancies"
      />

      <div className="create-vacancy__main">
        <TopBar
          user={{ name: 'Recruiter', role: 'Recruiter Account' }}
          notificationsCount={3}
          breadcrumbItems={[
            { label: 'Recruitment', path: '/recruiter/dashboard' },
            { label: 'Vacancy Management', path: '/recruiter/vacancies' },
            { label: vacancy ? vacancy.title : 'Not Found' },
          ]}
          searchPlaceholder="Search vacancies…"
          onHamburgerClick={() => setSidebarOpen(true)}
        />

        <main className="vd-content">
          {!vacancy || !funnel || !outcome ? (
            <div className="vd-card vd-not-found">
              <div className="vd-empty">
                <div className="vd-empty__icon">
                  <AlertCircle size={20} />
                </div>
                <p className="vd-empty__title">Vacancy not found</p>
                <p className="vd-empty__hint">
                  We could not find a vacancy with id “{id}”. It may have been removed.
                </p>
              </div>
              <button
                type="button"
                className="vd-primary-btn"
                onClick={() => navigate('/recruiter/vacancies')}
              >
                <ArrowLeft size={15} /> Back to Vacancy Management
              </button>
            </div>
          ) : (
            <>
              {backLink}

              {/* ── Header ── */}
              <div className="vd-header">
                <div className="vd-header__text">
                  <h1 className="vd-title">{vacancy.title}</h1>
                  <div className="vd-header__meta">
                    <StatusBadge status={vacancy.status} label={vacancy.status} />
                    <span>
                      <Building2 size={13} /> {vacancy.department}
                    </span>
                    <span>
                      <MapPin size={13} /> {vacancy.location}
                    </span>
                    <span>
                      <Clock size={13} /> Created {vacancy.dateCreated}
                    </span>
                  </div>
                </div>
                <div className="vd-header__actions">
                  <button
                    type="button"
                    className="vd-primary-btn"
                    onClick={() => navigate('/recruiter/create-vacancy')}
                  >
                    Edit Vacancy
                  </button>
                  <DropdownMenu
                    trigger={<MoreVertical size={16} />}
                    ariaLabel={`Actions for ${vacancy.title}`}
                    items={[
                      {
                        label: 'View Details',
                        icon: FileText,
                        onClick: () => navigate(`/vacancies/${vacancy.id}`),
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
                </div>
              </div>

              {/* ── Process navigation (tablist) ── */}
              <div
                className="vd-nav"
                role="tablist"
                aria-label="Vacancy sections"
              >
                {TABS.map((tab, index) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    id={`vd-tab-${tab.id}`}
                    aria-selected={activeTab === tab.id}
                    aria-controls={`vd-panel-${tab.id}`}
                    tabIndex={activeTab === tab.id ? 0 : -1}
                    ref={(el) => {
                      tabRefs.current[index] = el;
                    }}
                    className={`vd-nav__item ${activeTab === tab.id ? 'is-active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                    onKeyDown={(event) => handleTabKeyDown(event, index)}
                  >
                    {tab.label}
                    {typeof tab.count === 'number' && (
                      <span className="vd-nav__count">{tab.count}</span>
                    )}
                  </button>
                ))}
              </div>

              {/* ── Active panel ── */}
              <div
                role="tabpanel"
                id={`vd-panel-${activeTab}`}
                aria-labelledby={`vd-tab-${activeTab}`}
                tabIndex={0}
                className="vd-panel"
              >
                {activeTab === 'details' && <VacancyDetailsTab vacancy={vacancy} />}
                {activeTab === 'applicants' && (
                  <ApplicantsSectionContent 
                    vacancy={vacancy} 
                    candidates={candidates} 
                    setCandidates={setCandidates} 
                  />
                )}
                {activeTab === 'shortlist' && (
                  <ApplicantsSectionContent 
                    vacancy={vacancy} 
                    candidates={candidates} 
                    setCandidates={setCandidates} 
                    isShortlistMode={true}
                  />
                )}
                {activeTab === 'interviews' && (
                  <CandidateInterviewAllocationPage embeddedVacancy={vacancy} />
                )}
                {activeTab === 'attendees' && <AttendeesTab vacancy={vacancy} />}
                {activeTab === 'admin' && <AdminReviewTab vacancy={vacancy} />}
                {activeTab === 'summary' && <SummaryTab vacancy={vacancy} />}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
