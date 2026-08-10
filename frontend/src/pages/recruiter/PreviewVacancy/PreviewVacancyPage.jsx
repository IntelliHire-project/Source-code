import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Edit3,
  Send,
  Briefcase,
  MapPin,
  Clock,
  Building2,
  FileText,
  ListChecks,
  CheckCircle2,
  ShieldCheck,
  Share2,
  ClipboardCheck,
  ChevronRight,
  Globe,
  DollarSign,
  CalendarDays,
  Layers,
  Sparkles,
} from 'lucide-react';
import RecruiterSidebar from '../../../components/common/RecruiterSidebar';
import TopBar from '../../../components/TopBar/TopBar';
import InsightPanel from '../../../components/common/InsightPanel';
import ProgressBar from '../../../components/common/ProgressBar';
import PaymentRequiredModal from '../../../components/PaymentRequiredModal';
import '../../../style.css';
import './PreviewVacancyPage.css';

const SAMPLE_VACANCY = {
  jobTitle: 'Senior Frontend Engineer',
  salaryRange: '£85,000 – £110,000',
  department: 'Engineering',
  location: 'London, UK',
  workMode: 'Remote Friendly',
  employmentType: 'Full-Time',
  description:
    "We're looking for a Senior Frontend Engineer to join our growing product team. You'll lead the design and implementation of complex UI features, mentor junior developers, and collaborate closely with product and design to deliver world-class experiences.\n\nYou'll work across our React-based design system, contribute to architectural decisions, and help shape the technical direction of the frontend platform. This is a high-impact role with visibility across the entire organisation.",
  responsibilities: [
    'Architect and implement complex, accessible UI components using React and TypeScript',
    'Lead code reviews and mentor junior and mid-level engineers',
    'Collaborate with product managers and designers to translate requirements into technical solutions',
    'Drive frontend performance optimisation and Core Web Vitals improvements',
    'Contribute to and maintain the shared design system and component library',
  ],
  qualifications: [
    "Bachelor's degree in Computer Science or equivalent practical experience",
    '5+ years of professional frontend development experience',
    'Deep expertise in React, TypeScript, and modern CSS architectures',
    'Proven track record of leading technical projects from inception to delivery',
    'Strong understanding of web accessibility standards (WCAG 2.1 AA)',
    'Experience with CI/CD pipelines, testing frameworks, and code quality tooling',
  ],
  perks: [
    'Competitive base salary plus equity',
    '25 days holiday + bank holidays',
    'Flexible remote-first culture',
    'Annual learning & development budget',
    'Private health & dental insurance',
    'Quarterly team offsites',
  ],
  skills: ['React', 'TypeScript', 'REST APIs', 'CSS Architecture', 'GraphQL', 'Testing'],
  experienceLevel: 'Senior',
  openings: '3',
  deadline: '2026-08-30',
};

const CATEGORY_LABELS = {
  engineering: 'Engineering',
  design: 'Design',
  marketing: 'Marketing',
  sales: 'Sales',
  hr: 'HR',
};

const WORK_MODE_LABELS = {
  remote: 'Remote',
  hybrid: 'Hybrid',
  onsite: 'Onsite',
};

const JOB_TYPE_LABELS = {
  'full-time': 'Full-Time',
  'part-time': 'Part-Time',
  'contract': 'Contract',
  'internship': 'Internship',
};

const EXPERIENCE_LABELS = {
  junior: 'Junior',
  'mid-level': 'Mid-Level',
  senior: 'Senior',
  lead: 'Lead',
};

function StatusBadge({ label }) {
  return (
    <span className="pv-status-badge">
      <span className="pv-status-badge__dot" />
      {label}
    </span>
  );
}

function SummaryStatRow({ icon: Icon, label, value }) {
  return (
    <div className="pv-stat-row">
      <div className="pv-stat-row__icon">
        <Icon size={16} />
      </div>
      <div className="pv-stat-row__content">
        <span className="pv-stat-row__label">{label}</span>
        <span className="pv-stat-row__value">{value}</span>
      </div>
    </div>
  );
}

function QuickActionRow({ icon: Icon, label, onClick }) {
  return (
    <button type="button" className="pv-quick-action" onClick={onClick}>
      <span className="pv-quick-action__left">
        <Icon size={18} />
        <span>{label}</span>
      </span>
      <ChevronRight size={16} className="pv-quick-action__chevron" />
    </button>
  );
}

function SectionHeader({ icon: Icon, label }) {
  return (
    <div className="pv-section-header">
      <div className="pv-section-header__icon">
        <Icon size={16} />
      </div>
      <span className="pv-section-header__label">{label}</span>
      <div className="pv-section-header__rule" />
    </div>
  );
}

function PreviewVacancyPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const formState = location.state;

  const v = formState
    ? {
        jobTitle: formState.jobTitle || SAMPLE_VACANCY.jobTitle,
        salaryRange:
          formState.salaryMin && formState.salaryMax
            ? `$${Number(formState.salaryMin).toLocaleString()} – $${Number(formState.salaryMax).toLocaleString()}`
            : SAMPLE_VACANCY.salaryRange,
        department: CATEGORY_LABELS[formState.category] || formState.category || SAMPLE_VACANCY.department,
        location: formState.selectedLocation || SAMPLE_VACANCY.location,
        workMode: WORK_MODE_LABELS[formState.workMode] || formState.workMode || SAMPLE_VACANCY.workMode,
        employmentType: JOB_TYPE_LABELS[formState.jobType] || formState.jobType || SAMPLE_VACANCY.employmentType,
        description: formState.jobDescription || SAMPLE_VACANCY.description,
        responsibilities: formState.responsibilities || SAMPLE_VACANCY.responsibilities,
        qualifications: formState.qualifications
          ? formState.qualifications.split('\n').filter(Boolean)
          : SAMPLE_VACANCY.qualifications,
        perks: SAMPLE_VACANCY.perks,
        skills: formState.skills || SAMPLE_VACANCY.skills,
        experienceLevel: EXPERIENCE_LABELS[formState.experienceLevel] || formState.experienceLevel || SAMPLE_VACANCY.experienceLevel,
        openings: formState.openings || SAMPLE_VACANCY.openings,
        deadline: formState.deadline || SAMPLE_VACANCY.deadline,
        shortlistCount: formState.shortlistCount || '',
        milestones: formState.milestones || [],
      }
    : SAMPLE_VACANCY;

  const META_ITEMS = [
    { icon: Building2, label: v.department },
    { icon: MapPin, label: v.location },
    { icon: Globe, label: v.workMode },
    { icon: Clock, label: v.employmentType },
  ];

  const SUMMARY_STATS = [
    { icon: Layers, label: 'EXPERIENCE LEVEL', value: v.experienceLevel },
    { icon: Briefcase, label: 'OPENINGS', value: `${v.openings} position${v.openings !== '1' ? 's' : ''}` },
    {
      icon: CalendarDays,
      label: 'APPLICATION DEADLINE',
      value: v.deadline
        ? new Date(v.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
        : 'Not set',
    },
    {
      icon: ClipboardCheck,
      label: 'SHORTLIST TARGET',
      value: v.shortlistCount ? `${v.shortlistCount} candidate${v.shortlistCount !== '1' ? 's' : ''}` : 'Not set',
    },
    { icon: Globe, label: 'WORK MODE', value: v.workMode },
  ];

  const MILESTONES = v.milestones.map((m) => ({
    date: m.date
      ? new Date(m.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      : 'Not set',
    shortlistCount: m.shortlistCount || '—',
  }));

  return (
    <div className="create-vacancy pv-shell">
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
            { label: 'Create Vacancy', path: '/recruiter/create-vacancy' },
            { label: 'Preview Vacancy' },
          ]}
          searchPlaceholder="Search vacancies…"
          onSearch={(q) => console.log('Search:', q)}
          onNotificationClick={() => console.log('Notifications clicked')}
          onLogout={() => console.log('Logout')}
          onHamburgerClick={() => setSidebarOpen(true)}
        />

        <main className="pv-content">
          {/* ── Back link ── */}
          <button
            type="button"
            className="pv-back-link"
            onClick={() => navigate('/recruiter/create-vacancy')}
          >
            <ArrowLeft size={16} />
            Back to Editor
          </button>

          {/* ── Header ── */}
          <div className="pv-header">
            <div className="pv-header__text">
              <div className="pv-header__title-row">
                <h1 className="pv-title">Preview Vacancy</h1>
                <StatusBadge label="Draft" />
              </div>
              <p className="pv-subtitle">
                Review the job details below before publishing to the public job board.
              </p>
            </div>
            <div className="pv-header__actions">
              <button
                type="button"
                className="comm-btn comm-btn--ghost"
                onClick={() => navigate('/recruiter/create-vacancy')}
              >
                <Edit3 size={16} />
                Edit Details
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setShowPaymentModal(true)}
              >
                <Send size={16} />
                Go to Payment
              </button>
            </div>
          </div>

          <div className="pv-accent-bar" />

          {/* ── Two-column layout ── */}
          <div className="pv-layout">
            {/* ── Main Column ── */}
            <div className="pv-main-col">
              {/* Job Listing Card */}
              <div className="pv-listing-card">
                {/* Card header */}
                <div className="pv-listing-header">
                  <div className="pv-listing-header__left">
                    <h2 className="pv-listing-title">{v.jobTitle}</h2>
                  </div>
                  <div className="pv-listing-header__right">
                    <span className="pv-salary-eyebrow">SALARY RANGE</span>
                    <span className="pv-salary-value">{v.salaryRange}</span>
                  </div>
                </div>

                {/* Meta row */}
                <div className="pv-meta-row">
                  {META_ITEMS.map((item, i) => (
                    <React.Fragment key={item.label}>
                      <span className="pv-meta-item">
                        <item.icon size={14} />
                        {item.label}
                      </span>
                      {i < META_ITEMS.length - 1 && (
                        <span className="pv-meta-sep" aria-hidden="true" />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Job Description */}
                <section className="pv-section">
                  <SectionHeader icon={FileText} label="Job Description" />
                  {v.description.split('\n').map((para, i) => (
                    <p key={i} className="pv-body-text">
                      {para}
                    </p>
                  ))}
                </section>

                {/* Key Responsibilities */}
                <section className="pv-section">
                  <SectionHeader icon={ListChecks} label="Key Responsibilities" />
                  <ul className="pv-bullet-list">
                    {v.responsibilities.map((item, i) => (
                      <li key={i} className="pv-bullet-item">
                        <span className="pv-bullet-dot" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* Qualifications */}
                <section className="pv-section">
                  <SectionHeader icon={CheckCircle2} label="Qualifications" />
                  <ul className="pv-check-list">
                    {v.qualifications.map((item, i) => (
                      <li key={i} className="pv-check-item">
                        <CheckCircle2 size={16} className="pv-check-icon" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* Perks & Benefits */}
                <section className="pv-section">
                  <SectionHeader icon={Sparkles} label="Perks &amp; Benefits" />
                  <div className="pv-perks-grid">
                    {v.perks.map((perk, i) => (
                      <div key={i} className="pv-perk-item">
                        <CheckCircle2 size={16} className="pv-perk-icon" />
                        <span>{perk}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* ── Bottom CTA Banner ── */}
              <InsightPanel eyebrow="NEXT STEPS" className="pv-cta-banner">
                <div className="pv-cta-content">
                  <div className="pv-cta-icon">
                    <ShieldCheck size={22} />
                  </div>
                  <div className="pv-cta-text">
                    <h3 className="pv-cta-heading">Ready to take the next step?</h3>
                    <p className="pv-cta-desc">
                      Publishing sends you to secure payment to finalise the listing fee.
                      Your vacancy will go live once payment is confirmed.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-primary pv-cta-btn"
                  onClick={() => setShowPaymentModal(true)}
                >
                  <Send size={16} />
                  Go to Payment
                </button>
              </InsightPanel>
            </div>

            {/* ── Right Rail ── */}
            <aside className="cv-rail">
              {/* Posting Summary */}
              <section className="cv-card cv-rail-card">
                <h3 className="cv-rail-heading">Posting Summary</h3>
                <span className="pv-rail-sublabel">INTERNAL REFERENCE</span>

                <div className="pv-stats-list">
                  {SUMMARY_STATS.map((stat) => (
                    <SummaryStatRow key={stat.label} {...stat} />
                  ))}
                </div>

                {/* Milestones */}
                {MILESTONES.length > 0 && (
                  <div className="pv-rail-section pv-milestones">
                    <span className="pv-rail-label">IN-BETWEEN SHORTLISTING MILESTONES</span>
                    {MILESTONES.map((m, i) => (
                      <div key={i} className="pv-milestone">
                        <span className="pv-milestone__index">{i + 1}</span>
                        <span className="pv-milestone__date">{m.date}</span>
                        <span className="pv-milestone__count">{m.shortlistCount}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Required Skills */}
                <div className="pv-rail-skills">
                  <span className="pv-rail-label">REQUIRED SKILLS</span>
                  <div className="pv-rail-chips">
                    {v.skills.map((skill) => (
                      <span key={skill} className="tag-input__chip">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pv-rail-divider" />

                {/* Auto-Matching */}
                <div className="pv-rail-section">
                  <span className="pv-rail-label">AUTO-MATCHING ACTIVE</span>
                  <ProgressBar label="AI Match Confidence" value={80} />
                  <p className="pv-rail-note">
                    AI will prioritise candidates matching 80%+ of listed skills.
                  </p>
                </div>
              </section>

              {/* Quick Actions */}
              <section className="cv-card cv-rail-card">
                <h3 className="cv-rail-heading">Quick Actions</h3>
                <div className="pv-quick-actions">
                  <QuickActionRow
                    icon={Share2}
                    label="Share as Public Link"
                    onClick={() => console.log('Share as Public Link')}
                  />
                  <QuickActionRow
                    icon={ClipboardCheck}
                    label="Send to Approval"
                    onClick={() => console.log('Send to Approval')}
                  />
                </div>
              </section>
            </aside>
          </div>
        </main>
      </div>

      {/* ── Payment Required Modal ── */}
      <PaymentRequiredModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onProceed={() => {
          setShowPaymentModal(false);
          navigate('/recruiter/select-payment');
        }}
        onSaveDraft={() => {
          setShowPaymentModal(false);
        }}
        jobTitle={v.jobTitle}
      />
    </div>
  );
}

export default PreviewVacancyPage;
