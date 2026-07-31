import React, { Fragment, useState, useEffect, useCallback } from 'react';
import {
  X,
  Building2,
  MapPin,
  Clock,
  CalendarDays,
  FileText,
  Check,
  ChevronDown,
  ExternalLink,
  User,
  Mail,
  Phone,
  Briefcase,
  Tag,
  Hash,
  DollarSign,
  StickyNote,
  MessageSquare,
  XCircle,
} from 'lucide-react';

/* ── Mock Data ── */

export const MOCK_APPLICATION = {
  id: 'APP-99281-X',
  title: 'Senior Frontend Engineer',
  company: 'TechFlow Systems',
  location: 'Remote (NYC Based)',
  workType: 'Full-Time',
  status: 'Interview Scheduled',
  appliedDate: 'Oct 28, 2024',
  lastUpdated: 'Nov 2, 2024',
  salaryRange: '$140k - $180k',
  submittedCv: {
    filename: 'SENIOR_PRODUCT_DES',
    uploadDate: 'Jan 12, 2024',
  },
  timeline: [
    { label: 'Applied', date: 'Oct 28' },
    { label: 'Under Review', date: 'Oct 30' },
    { label: 'Interview', date: 'Nov 15' },
    { label: 'Decision', date: null },
  ],
  personalInfo: {
    fullName: 'Michael Chen',
    email: 'michael.chen@example.com',
    phone: '+1 (555) 014-2288',
    location: 'New York, NY',
  },
  professionalSummary: {
    currentRole: 'Senior Frontend Engineer at TechFlow',
    totalExperience: '7 Years',
    keySkills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'System Architecture'],
  },
  note: 'Interview scheduled for Nov 15, 2024 at 2:00 PM with the engineering team.',
  jobPosting: {
    title: 'Senior Frontend Engineer',
    company: 'TechFlow Systems',
    responsibilities: [
      'Build and maintain scalable, accessible React applications that power our core product.',
      'Collaborate with product, design, and backend engineers to ship high-quality features.',
      'Mentor mid-level engineers and champion code quality, testing, and performance.',
    ],
    requirements: [
      '5+ years of frontend engineering experience with React and TypeScript.',
      'Expert-level proficiency in modern CSS and component-driven design systems.',
      'Experience with testing, performance profiling, and accessible web standards.',
    ],
  },
};

/* ── Status Helpers ── */

const STATUS_STEP_INDEX = {
  'Under Review': 1,
  'Interview Scheduled': 2,
  Rejected: 1,
  Withdrawn: 0,
  'Offer Received': 3,
};

const STATUS_BADGE = {
  'Under Review': 'border-[rgba(240,185,11,0.35)] bg-[rgba(240,185,11,0.12)] text-accent',
  'Interview Scheduled': 'border-[rgba(107,140,255,0.35)] bg-[rgba(107,140,255,0.12)] text-accent-info',
  Rejected: 'border-[rgba(230,57,70,0.35)] bg-[rgba(230,57,70,0.12)] text-crisis',
  Withdrawn: 'border-border-dark bg-primary-light text-text-muted',
  'Offer Received': 'border-[rgba(34,197,94,0.35)] bg-[rgba(34,197,94,0.12)] text-accent-success',
};

const NON_WITHDRAWABLE = new Set(['Rejected', 'Withdrawn', 'Offer Received']);

function getStatusBadge(status) {
  return STATUS_BADGE[status] || '';
}

function getCurrentStep(status) {
  return STATUS_STEP_INDEX[status] ?? 0;
}

function getCompanyInitial(company) {
  return company ? company.charAt(0).toUpperCase() : '?';
}

const TIMELINE_KEY_MAP = {
  submitted: 'Applied',
  reviewed: 'Under Review',
  interview: 'Interview',
  decision: 'Decision',
};

const DEFAULT_TIMELINE = [
  { label: 'Applied', date: null },
  { label: 'Under Review', date: null },
  { label: 'Interview', date: null },
  { label: 'Decision', date: null },
];

function buildTimeline(application) {
  const raw = application?.timeline;

  if (Array.isArray(raw)) {
    return raw.map((step) => ({ label: step.label, date: step.date ?? null }));
  }

  if (raw && typeof raw === 'object') {
    return DEFAULT_TIMELINE.map((step) => {
      const key = Object.keys(TIMELINE_KEY_MAP).find((k) => TIMELINE_KEY_MAP[k] === step.label);
      return { ...step, date: key ? raw[key] ?? null : null };
    });
  }

  return DEFAULT_TIMELINE.map((step) =>
    step.label === 'Applied' ? { ...step, date: application?.appliedDate || null } : { ...step }
  );
}

/* ── Sub-components ── */

function SectionHeading({ icon, children }) {
  return (
    <h3 className="flex items-center gap-2 text-[0.68rem] font-extrabold uppercase tracking-[0.1em] text-text-muted">
      <span className="text-accent">{icon}</span>
      {children}
    </h3>
  );
}

function MetaItem({ icon, label, value }) {
  return (
    <div className="min-w-0">
      <span className="flex items-center gap-1.5 text-[0.62rem] font-bold uppercase tracking-[0.08em] text-text-muted">
        <span className="text-accent">{icon}</span>
        {label}
      </span>
      <span className="mt-1.5 block truncate text-sm font-semibold text-text-on-dark">
        {value || '—'}
      </span>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 shrink-0 text-accent">{icon}</span>
      <div className="min-w-0">
        <span className="block text-[0.62rem] font-semibold uppercase tracking-wide text-text-muted">
          {label}
        </span>
        <span className="mt-0.5 block break-words text-sm font-semibold text-text-on-dark">
          {value || '—'}
        </span>
      </div>
    </div>
  );
}

function SummaryCard({ icon, title, children }) {
  return (
    <div className="rounded-lg border border-border-dark bg-primary-light p-4">
      <p className="flex items-center gap-1.5 text-[0.62rem] font-extrabold uppercase tracking-[0.08em] text-text-muted">
        <span className="text-accent">{icon}</span>
        {title}
      </p>
      <div className="mt-3.5 space-y-3">{children}</div>
    </div>
  );
}

/* ── Main Component ── */

function ApplicationDetailCard({
  application = MOCK_APPLICATION,
  onClose = () => {},
  onWithdraw,
  onMessageRecruiter,
}) {
  const [jobOpen, setJobOpen] = useState(false);

  useEffect(() => {
    setJobOpen(false);
  }, [application?.id]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  const status = application.status || 'Under Review';
  const currentStep = getCurrentStep(status);
  const canWithdraw = !NON_WITHDRAWABLE.has(status);
  const canMessage = status === 'Interview Scheduled';
  const showNotes = status === 'Interview Scheduled' || status === 'Rejected';

  const { submittedCv = {}, personalInfo = {}, professionalSummary = {}, jobPosting = {} } = application;
  const timeline = buildTimeline(application);

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm sm:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="adc-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border-dark bg-primary font-sans text-text-on-dark shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <header className="flex items-start justify-between gap-4 border-b border-border-dark p-6 pb-5">
          <div className="flex items-start gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-[rgba(240,185,11,0.12)] text-lg font-extrabold text-accent">
              {getCompanyInitial(application.company)}
            </div>
            <div className="min-w-0">
              <h2 id="adc-title" className="text-xl font-bold leading-snug">
                {application.title}
              </h2>
              <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.82rem] text-text-on-dark-muted">
                <span className="inline-flex items-center gap-1.5">
                  <Building2 size={13} />
                  {application.company}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={13} />
                  {application.location}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock size={13} />
                  {application.workType || '—'}
                </span>
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-3">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close application details"
              className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-primary-light hover:text-text-on-dark"
            >
              <X size={20} />
            </button>
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-[0.7rem] font-bold whitespace-nowrap ${getStatusBadge(status)}`}
            >
              {status}
            </span>
          </div>
        </header>

        {/* ── Application Meta Row ── */}
        <div className="px-6 pt-5">
          <div className="grid grid-cols-2 gap-4 rounded-lg border border-border-dark bg-primary-light p-4 sm:grid-cols-4">
            <MetaItem icon={<Hash size={12} />} label="Application ID" value={application.id} />
            <MetaItem icon={<CalendarDays size={12} />} label="Applied Date" value={application.appliedDate} />
            <MetaItem icon={<CalendarDays size={12} />} label="Last Updated" value={application.lastUpdated} />
            <MetaItem icon={<DollarSign size={12} />} label="Salary Range" value={application.salaryRange || 'Not specified'} />
          </div>
        </div>

        {/* ── Status Timeline ── */}
        <section className="border-b border-border-dark px-6 py-5">
          <SectionHeading icon={<CalendarDays size={14} />}>Application Timeline</SectionHeading>
          <div className="mt-5 flex items-start">
            {timeline.map((step, i) => (
              <Fragment key={step.label}>
                {i > 0 && (
                  <div
                    className={`mx-2 mt-[11px] h-0.5 min-w-[8px] flex-1 ${
                      i <= currentStep ? 'bg-accent' : 'bg-border-dark'
                    }`}
                  />
                )}
                <div className="flex w-[84px] shrink-0 flex-col items-center">
                  <div
                    className={`grid h-6 w-6 place-items-center rounded-full border-2 ${
                      i < currentStep
                        ? 'border-accent bg-[rgba(240,185,11,0.15)] text-accent'
                        : i === currentStep
                        ? 'border-accent bg-accent text-primary'
                        : 'border-border-dark text-text-muted'
                    }`}
                  >
                    {i < currentStep ? (
                      <Check size={13} />
                    ) : i === currentStep ? (
                      <span className="h-2 w-2 rounded-full bg-primary" />
                    ) : null}
                  </div>
                  <span
                    className={`mt-2 text-center text-[0.68rem] font-bold leading-tight ${
                      i === currentStep ? 'text-accent' : 'text-text-on-dark'
                    }`}
                  >
                    {step.label}
                  </span>
                  <span className="mt-0.5 text-center text-[0.6rem] text-text-muted">
                    {step.date ? `— ${step.date}` : 'Pending'}
                  </span>
                </div>
              </Fragment>
            ))}
          </div>
        </section>

        {/* ── Submitted CV ── */}
        <section className="border-b border-border-dark px-6 py-5">
          <SectionHeading icon={<FileText size={14} />}>Submitted CV</SectionHeading>
          <div className="mt-4 flex items-center justify-between gap-4 rounded-lg border border-border-dark bg-primary-light p-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[rgba(230,57,70,0.12)] text-crisis">
                <FileText size={18} />
              </div>
              <div className="min-w-0">
                <p className="flex items-center gap-2 truncate text-sm font-semibold text-text-on-dark">
                  {submittedCv.filename || 'No CV submitted'}
                  <span className="text-[0.55rem] font-extrabold tracking-wide text-crisis">PDF</span>
                </p>
                <p className="mt-0.5 text-xs text-text-muted">
                  Uploaded {submittedCv.uploadDate || '—'}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="inline-flex shrink-0 items-center gap-1.5 text-xs font-bold text-accent transition-colors hover:text-accent-dark"
            >
              <ExternalLink size={13} />
              View CV
            </button>
          </div>
        </section>

        {/* ── Application Summary ── */}
        <section className="border-b border-border-dark px-6 py-5">
          <SectionHeading icon={<FileText size={14} />}>Application Summary</SectionHeading>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <SummaryCard icon={<User size={12} />} title="Personal Information">
              <InfoRow icon={<User size={13} />} label="Full Name" value={personalInfo.fullName} />
              <InfoRow icon={<Mail size={13} />} label="Email" value={personalInfo.email} />
              <InfoRow icon={<Phone size={13} />} label="Phone" value={personalInfo.phone} />
              <InfoRow icon={<MapPin size={13} />} label="Location" value={personalInfo.location} />
            </SummaryCard>

            <SummaryCard icon={<Briefcase size={12} />} title="Professional Summary">
              <InfoRow
                icon={<Briefcase size={13} />}
                label="Current Role"
                value={professionalSummary.currentRole}
              />
              <InfoRow
                icon={<Clock size={13} />}
                label="Total Experience"
                value={professionalSummary.totalExperience}
              />
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 shrink-0 text-accent">
                  <Tag size={13} />
                </span>
                <div className="min-w-0">
                  <span className="block text-[0.62rem] font-semibold uppercase tracking-wide text-text-muted">
                    Key Skills
                  </span>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {(professionalSummary.keySkills || []).map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-border-dark bg-primary px-2.5 py-1 text-[0.68rem] font-semibold text-text-on-dark-muted"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </SummaryCard>
          </div>
        </section>

        {/* ── Recruiter / Company Notes ── */}
        {showNotes && application.note && (
          <section className="border-b border-border-dark px-6 py-5">
            <SectionHeading icon={<StickyNote size={14} />}>Recruiter Note</SectionHeading>
            <div
              className={`mt-4 flex gap-3 rounded-lg border p-4 ${
                status === 'Rejected'
                  ? 'border-[rgba(230,57,70,0.35)] bg-[rgba(230,57,70,0.08)]'
                  : 'border-[rgba(240,185,11,0.35)] bg-[rgba(240,185,11,0.08)]'
              }`}
            >
              <StickyNote size={16} className="mt-0.5 shrink-0 text-accent" />
              <p className="text-[0.84rem] leading-relaxed text-text-on-dark-muted">
                {application.note}
              </p>
            </div>
          </section>
        )}

        {/* ── Job Details Recap (collapsible) ── */}
        <section className="border-b border-border-dark px-6 py-5">
          <button
            type="button"
            onClick={() => setJobOpen((prev) => !prev)}
            className="flex w-full items-center justify-between gap-4 text-left"
            aria-expanded={jobOpen}
          >
            <SectionHeading icon={<Building2 size={14} />}>View Original Job Posting</SectionHeading>
            <ChevronDown
              size={16}
              className={`shrink-0 text-accent transition-transform duration-200 ${
                jobOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {jobOpen && (
            <div className="mt-4 rounded-lg border border-border-dark bg-primary-light p-4">
              <h4 className="text-sm font-bold text-text-on-dark">{jobPosting.title || application.title}</h4>
              <p className="mt-0.5 text-xs text-text-muted">{jobPosting.company || application.company}</p>

              <div className="mt-4">
                <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.08em] text-text-muted">
                  Key Responsibilities
                </p>
                <ul className="mt-2 space-y-2">
                  {(jobPosting.responsibilities || []).map((item, i) => (
                    <li
                      key={i}
                      className="flex gap-2 text-[0.82rem] leading-relaxed text-text-on-dark-muted"
                    >
                      <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4">
                <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.08em] text-text-muted">
                  Requirements &amp; Qualifications
                </p>
                <ul className="mt-2 space-y-2">
                  {(jobPosting.requirements || []).map((item, i) => (
                    <li
                      key={i}
                      className="flex gap-2 text-[0.82rem] leading-relaxed text-text-on-dark-muted"
                    >
                      <Check size={14} className="mt-0.5 shrink-0 text-accent" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </section>

        {/* ── Footer Actions ── */}
        <footer className="flex flex-wrap items-center justify-end gap-3 p-6">
          {canWithdraw && (
            <button
              type="button"
              onClick={() => onWithdraw?.(application)}
              className="inline-flex items-center gap-2 rounded-lg border border-[rgba(230,57,70,0.35)] px-4 py-2.5 text-sm font-bold text-crisis opacity-80 transition-all hover:border-crisis hover:bg-[rgba(230,57,70,0.1)] hover:opacity-100"
            >
              <XCircle size={15} />
              Withdraw Application
            </button>
          )}
          {canMessage && (
            <button
              type="button"
              onClick={() => onMessageRecruiter?.(application)}
              className="inline-flex items-center gap-2 rounded-lg border border-border-dark px-4 py-2.5 text-sm font-bold text-text-on-dark transition-colors hover:border-accent hover:text-accent"
            >
              <MessageSquare size={15} />
              Message Recruiter
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-primary transition-colors hover:bg-accent-dark"
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}

export default ApplicationDetailCard;
