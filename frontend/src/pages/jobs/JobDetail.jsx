import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Bookmark,
  Share2,
  Star,
  Check,
  DollarSign,
  Clock,
  Briefcase,
  CalendarDays,
  MapPin,
  ShieldCheck,
  Upload,
  FileText,
  ChevronRight,
} from 'lucide-react';
import './JobDetail.css';
import ApplicationReviewModal from '../../components/ApplicationReviewModal';

/* ── Mock Data ── */

const MOCK_JOB = {
  id: 1,
  logo: 'https://images.unsplash.com/photo-1563986768609-322da13575f2?auto=format&fit=crop&w=80&h=80&q=80',
  title: 'Senior AI Product Designer',
  company: 'IntelliHire Global',
  location: 'London, UK (Remote-friendly)',
  postedTime: '2 days ago',
  badge: 'NEW OPENING',
  salary: '$140,000',
  experience: '5+ Years',
  deadline: 'Nov 30, 2024',
  workType: 'Full-Time',
  about: [
    "We're looking for a Senior AI Product Designer to join our growing design team and shape the future of how recruiters interact with AI-powered hiring tools. You'll work at the intersection of human-centred design and machine learning, crafting intuitive interfaces that make complex AI workflows feel effortless.",
    "This role is ideal for someone who thrives in cross-functional environments and is passionate about building products that blend data intelligence with elegant user experience. You'll collaborate closely with our AI engineering, product, and recruiting teams to design workflows that empower recruiters to make smarter, faster hiring decisions.",
  ],
  responsibilities: [
    'Lead the end-to-end design process for AI-driven product features, from discovery and ideation through to high-fidelity prototypes and developer handoff.',
    'Design intuitive data visualisation dashboards that surface AI insights — match scores, candidate rankings, pipeline analytics — in clear, actionable formats.',
    'Partner with AI/ML engineers to translate complex model outputs into user-friendly interfaces, ensuring transparency and trust in automated recommendations.',
    'Mentor junior designers, champion design system consistency, and contribute to a culture of continuous improvement across the product team.',
  ],
  requirements: [
    '5+ years of product design experience in B2B SaaS or data-rich environments, with a strong portfolio demonstrating system-level thinking and end-to-end ownership.',
    'Demonstrated ability to design complex, multi-layered interfaces — ideally in hiring tech, HR platforms, or enterprise analytics tools.',
    'Hands-on experience designing AI or ML-powered features, including dashboards, recommendation UIs, or predictive data visualisations.',
    'Expert-level proficiency in Figma, prototyping tools, and design systems — you can move fluidly from wireframe to polished spec.',
  ],
  perks: [
    { label: 'Competitive Equity Package' },
    { label: 'Annual Learning Budget ($3k)' },
    { label: 'Premium Health Coverage' },
    { label: 'Flexible Remote Policy' },
    { label: 'M3 MacBook Pro Setup' },
  ],
  skills: ['Product Design', 'AI/UX', 'Data Visualization', 'Figma', 'SaaS Strategy', 'User Research', 'Prototyping'],
  matchScore: 88,
};

const MOCK_CVS = [
  { id: 1, filename: 'SENIOR_PRODUCT_DES', uploadDate: 'Uploaded Jan 12, 2024', isActive: true },
  { id: 2, filename: 'DEVOPS_FOCUSED_RESUME.PDF', uploadDate: 'Uploaded Nov 02, 2023', isActive: false },
  { id: 3, filename: 'GENERAL_SOFTWARE_ENG.PDF', uploadDate: 'Uploaded Aug 15, 2023', isActive: false },
];

/* ── CVSelectorCard ── */

function CVSelectorCard({ filename, uploadDate, isActive, onSelect }) {
  return (
    <div
      className={`cv-selector-card ${isActive ? 'cv-selector-card--active' : ''}`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
    >
      <div className="cv-selector-card__radio">
        <div className={`cv-selector-card__radio-dot ${isActive ? 'cv-selector-card__radio-dot--on' : ''}`} />
      </div>
      <div className="cv-selector-card__icon">
        <FileText size={18} />
      </div>
      <div className="cv-selector-card__info">
        <span className="cv-selector-card__filename">{filename}</span>
        <span className="cv-selector-card__date">{uploadDate}</span>
      </div>
      {isActive && <span className="cv-selector-card__active-badge">ACTIVE</span>}
    </div>
  );
}

/* ── Main Page ── */

function JobDetail() {
  const navigate = useNavigate();
  const [selectedCvId, setSelectedCvId] = useState(1);
  const [showReview, setShowReview] = useState(false);
  const job = MOCK_JOB;

  return (
    <div className="job-detail">
      {/* Breadcrumb */}
      <button className="job-detail__back" onClick={() => navigate('/candidate/jobs')}>
        <ArrowLeft size={16} />
        BACK TO JOB SEARCH
      </button>

      <div className="job-detail__body">
        {/* ── Center Column ── */}
        <main className="job-detail__main">
          {/* Header */}
          <header className="job-detail__header">
            <div className="job-detail__header-top">
              <div className="job-detail__logo-wrap">
                <img src={job.logo} alt={job.company} className="job-detail__logo" />
              </div>
              <span className="job-detail__badge">{job.badge}</span>
            </div>
            <h1 className="job-detail__title">{job.title}</h1>
            <div className="job-detail__meta">
              <span>{job.company}</span>
              <span className="job-detail__meta-sep" />
              <span><MapPin size={14} />{job.location}</span>
              <span className="job-detail__meta-sep" />
              <span><Clock size={14} />{job.postedTime}</span>
            </div>
            <div className="job-detail__header-actions">
              <button className="job-detail__icon-btn" aria-label="Save job"><Bookmark size={18} /></button>
              <button className="job-detail__icon-btn" aria-label="Share job"><Share2 size={18} /></button>
              <button className="job-detail__apply-btn" onClick={() => setShowReview(true)}>Apply Now<ChevronRight size={15} /></button>
            </div>
          </header>

          {/* About the Role */}
          <section className="job-detail__section">
            <h2 className="job-detail__section-title">ABOUT THE ROLE</h2>
            {job.about.map((p, i) => <p key={i} className="job-detail__text">{p}</p>)}
          </section>

          {/* Key Responsibilities */}
          <section className="job-detail__section">
            <h2 className="job-detail__section-title"><Star size={18} />KEY RESPONSIBILITIES</h2>
            <ul className="job-detail__bullet-list">
              {job.responsibilities.map((item, i) => (
                <li key={i} className="job-detail__bullet-item">
                  <span className="job-detail__bullet-dot" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Requirements */}
          <section className="job-detail__section">
            <h2 className="job-detail__section-title">REQUIREMENTS & QUALIFICATIONS</h2>
            <div className="job-detail__req-list">
              {job.requirements.map((item, i) => (
                <div key={i} className="job-detail__req-card">
                  <div className="job-detail__req-check"><Check size={16} /></div>
                  <p className="job-detail__req-text">{item}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Perks */}
          <section className="job-detail__section">
            <h2 className="job-detail__section-title">PERKS & BENEFITS</h2>
            <div className="job-detail__perks-grid">
              {job.perks.map((perk, i) => (
                <div key={i} className="job-detail__perk-card">
                  <div className="job-detail__perk-check"><Check size={15} /></div>
                  <span>{perk.label}</span>
                </div>
              ))}
            </div>
          </section>
        </main>

        {/* ── Right Sidebar ── */}
        <aside className="job-detail__sidebar">
          {/* Job Summary */}
          <div className="job-detail__card">
            <h3 className="job-detail__card-title">JOB SUMMARY</h3>
            <div className="job-detail__summary-rows">
              <div className="job-detail__summary-row">
                <div className="job-detail__summary-icon"><DollarSign size={16} /></div>
                <div className="job-detail__summary-text">
                  <span className="job-detail__summary-label">Offered Salary</span>
                  <span className="job-detail__summary-value">{job.salary}</span>
                </div>
              </div>
              <div className="job-detail__summary-row">
                <div className="job-detail__summary-icon"><Clock size={16} /></div>
                <div className="job-detail__summary-text">
                  <span className="job-detail__summary-label">Experience</span>
                  <span className="job-detail__summary-value">{job.experience}</span>
                </div>
              </div>
              <div className="job-detail__summary-row">
                <div className="job-detail__summary-icon"><CalendarDays size={16} /></div>
                <div className="job-detail__summary-text">
                  <span className="job-detail__summary-label">Deadline</span>
                  <span className="job-detail__summary-value">{job.deadline}</span>
                </div>
              </div>
              <div className="job-detail__summary-row">
                <div className="job-detail__summary-icon"><Briefcase size={16} /></div>
                <div className="job-detail__summary-text">
                  <span className="job-detail__summary-label">Work Type</span>
                  <span className="job-detail__summary-value">{job.workType}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Target Skills */}
          <div className="job-detail__card">
            <h3 className="job-detail__card-title">TARGET SKILLS</h3>
            <div className="job-detail__skill-tags">
              {job.skills.map((skill) => (
                <span key={skill} className="job-detail__skill-tag">{skill}</span>
              ))}
            </div>
          </div>

          {/* CV Match Analysis */}
          <div className="job-detail__card job-detail__card--match">
            <div className="job-detail__match-score">{job.matchScore}%</div>
            <span className="job-detail__match-label">CANDIDATE MATCH SCORE</span>
            <div className="job-detail__progress-bar">
              <div className="job-detail__progress-fill" style={{ width: `${job.matchScore}%` }} />
            </div>
            <p className="job-detail__match-desc">
              Your profile matches {job.matchScore}% of the requirements for this role based on your resume.
            </p>
            <button className="job-detail__match-link">Improve your score &gt;</button>
          </div>

          {/* CV Selector */}
          <div className="job-detail__card">
            <h3 className="job-detail__card-title">SELECT CV FOR APPLICATION</h3>
            <div className="job-detail__cv-list">
              {MOCK_CVS.map((cv) => (
                <CVSelectorCard
                  key={cv.id}
                  filename={cv.filename}
                  uploadDate={cv.uploadDate}
                  isActive={selectedCvId === cv.id}
                  onSelect={() => setSelectedCvId(cv.id)}
                />
              ))}
            </div>
            <button className="job-detail__upload-btn">
              <Upload size={15} />
              UPLOAD NEW CV
            </button>
          </div>

          {/* Apply */}
          <button className="job-detail__begin-btn" onClick={() => setShowReview(true)}>BEGIN APPLICATION</button>

          {/* Verified */}
          <div className="job-detail__verified">
            <ShieldCheck size={16} />
            <span>IntelliHire Verified Job. This employer has undergone our identity verification process.</span>
          </div>

          {/* Report */}
          <button className="job-detail__report-btn">Report Job Posting</button>
        </aside>
      </div>

      {showReview && (
        <ApplicationReviewModal
          onConfirm={() => { setShowReview(false); navigate('/candidate/application-confirmation'); }}
          onClose={() => setShowReview(false)}
        />
      )}
    </div>
  );
}

export default JobDetail;
