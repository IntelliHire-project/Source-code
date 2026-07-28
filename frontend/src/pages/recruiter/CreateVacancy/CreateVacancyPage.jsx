import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  FileText,
  Tag,
  Info,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import RecruiterSidebar from '../../../components/common/RecruiterSidebar';
import TopBar from '../../../components/TopBar/TopBar';
import TagInput from '../../../components/common/TagInput';
import PillToggleGroup from '../../../components/common/PillToggleGroup';
import ProgressBar from '../../../components/common/ProgressBar';
import InsightPanel from '../../../components/common/InsightPanel';
import '../../../style.css';
import './CreateVacancyPage.css';

const EXPERIENCE_OPTIONS = [
  { label: 'Junior', value: 'junior' },
  { label: 'Mid-Level', value: 'mid-level' },
  { label: 'Senior', value: 'senior' },
  { label: 'Lead', value: 'lead' },
];

const INITIAL_SKILLS = ['React', 'TypeScript', 'REST APIs'];

const ASSESSMENT_OPTIONS = [
  { label: 'Yes', value: 'yes' },
  { label: 'No', value: 'no' },
];

function CreateVacancyPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  /* ── Form state ── */
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [skills, setSkills] = useState(INITIAL_SKILLS);
  const [qualifications, setQualifications] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('senior');
  const [requireAssessmentTest, setRequireAssessmentTest] = useState('no');
  const [openings, setOpenings] = useState('3');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [deadline, setDeadline] = useState('');
  const [shortlistCount, setShortlistCount] = useState('');

  /* ── Autosave timer ── */
  const [lastEdited, setLastEdited] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    setLastEdited(0);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setLastEdited((p) => p + 1), 60000);
    return () => clearInterval(timerRef.current);
  }, [jobTitle, jobDescription, skills, qualifications, experienceLevel, openings, salaryMin, salaryMax, deadline]);

  const formatTime = (mins) => {
    if (mins === 0) return 'Just now';
    if (mins === 1) return '1 minute ago';
    return `${mins} minutes ago`;
  };

  return (
    <div className="create-vacancy cv-shell">
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
            { label: 'Create Vacancy' },
          ]}
          searchPlaceholder="Search vacancies…"
          onSearch={(q) => console.log('Search:', q)}
          onNotificationClick={() => console.log('Notifications clicked')}
          onLogout={() => console.log('Logout')}
          onHamburgerClick={() => setSidebarOpen(true)}
        />

        {/* ── Page content ── */}
        <main className="cv-content">
          {/* ── Section header ── */}
          <div className="cv-header">
            <div className="cv-header__text">
              <span className="cv-eyebrow">RECRUITMENT PIPELINE</span>
              <h1 className="cv-title">Create New Job Vacancy</h1>
              <p className="cv-subtitle">
                Define your role, requirements, and let Intelli-Audit guide you to the perfect posting.
              </p>
            </div>
            <div className="cv-header__actions">
              <button type="button" className="comm-btn comm-btn--outline">
                View More Details
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigate('/recruiter/vacancy-preview')}
              >
                Preview Vacancy
              </button>
            </div>
          </div>

          {/* ── Two-column layout: form + rail ── */}
          <div className="cv-layout">
            {/* ── Left: form cards ── */}
            <div className="cv-form-col">
              {/* Card 1 — Job Foundation */}
              <section className="cv-card">
                <div className="cv-card__header">
                  <div className="cv-card__icon cv-card__icon--gold">
                    <Briefcase size={18} />
                  </div>
                  <div>
                    <h2 className="cv-card__title">Job Foundation</h2>
                    <p className="cv-card__subtitle">Core details about the position</p>
                  </div>
                </div>

                <div className="cv-card__body">
                  <div className="cv-field">
                    <label className="cv-label" htmlFor="cv-job-title">
                      Job Title
                    </label>
                    <input
                      id="cv-job-title"
                      className="cv-input"
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="e.g. Senior Frontend Engineer"
                    />
                  </div>

                  <div className="cv-field">
                    <label className="cv-label" htmlFor="cv-job-desc">
                      Job Description
                    </label>
                    <textarea
                      id="cv-job-desc"
                      className="cv-textarea"
                      rows={5}
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Describe the role, responsibilities, and what a typical day looks like…"
                    />
                    <span className="cv-field-hint">
                      Tip: Be specific about daily responsibilities and team structure.
                    </span>
                  </div>
                </div>
              </section>

              {/* Card 2 — Skills & Qualifications */}
              <section className="cv-card">
                <div className="cv-card__header">
                  <div className="cv-card__icon cv-card__icon--info">
                    <Tag size={18} />
                  </div>
                  <div>
                    <h2 className="cv-card__title">Skills &amp; Qualifications</h2>
                    <p className="cv-card__subtitle">Required competencies for this role</p>
                  </div>
                </div>

                <div className="cv-card__body">
                  <div className="cv-field">
                    <label className="cv-label">Target Skills</label>
                    <TagInput
                      tags={skills}
                      onChange={setSkills}
                      placeholder="Type a skill and press Enter…"
                    />
                    <span className="cv-field-hint">
                      Add key technical and soft skills the ideal candidate should have.
                    </span>
                  </div>

                  <div className="cv-field">
                    <label className="cv-label">Require Assessment Test?</label>
                    <div className="assessment-toggle-wrapper">
                      <PillToggleGroup
                        name="assessment-test"
                        options={ASSESSMENT_OPTIONS}
                        value={requireAssessmentTest}
                        onChange={setRequireAssessmentTest}
                      />
                    </div>
                  </div>

                  <div className="cv-field">
                    <label className="cv-label" htmlFor="cv-qualifications">
                      Minimum Qualifications
                    </label>
                    <textarea
                      id="cv-qualifications"
                      className="cv-textarea"
                      rows={4}
                      value={qualifications}
                      onChange={(e) => setQualifications(e.target.value)}
                      placeholder="e.g. Bachelor's degree in CS, 3+ years experience…"
                    />
                  </div>
                </div>
              </section>
            </div>

            {/* ── Right: rail ── */}
            <aside className="cv-rail">
              {/* Vacancy Metrics */}
              <section className="cv-card cv-rail-card">
                <h3 className="cv-rail-heading">Vacancy Metrics</h3>

                <div className="cv-field">
                  <label className="cv-label">Experience Level</label>
                  <PillToggleGroup
                    name="experience-level"
                    options={EXPERIENCE_OPTIONS}
                    value={experienceLevel}
                    onChange={setExperienceLevel}
                  />
                </div>

                <div className="cv-field">
                  <label className="cv-label" htmlFor="cv-openings">
                    Number of Openings
                  </label>
                  <input
                    id="cv-openings"
                    className="cv-input"
                    type="number"
                    min="1"
                    value={openings}
                    onChange={(e) => setOpenings(e.target.value)}
                  />
                </div>

                <div className="cv-field">
                  <label className="cv-label">Salary Range</label>
                  <div className="cv-salary-row">
                    <div className="cv-salary-field">
                      <span className="cv-salary-prefix">$</span>
                      <input
                        id="cv-salary-min"
                        className="cv-input cv-input--salary"
                        type="number"
                        min="0"
                        placeholder="Min"
                        value={salaryMin}
                        onChange={(e) => setSalaryMin(e.target.value)}
                      />
                    </div>
                    <span className="cv-salary-separator">–</span>
                    <div className="cv-salary-field">
                      <span className="cv-salary-prefix">$</span>
                      <input
                        id="cv-salary-max"
                        className="cv-input cv-input--salary"
                        type="number"
                        min="0"
                        placeholder="Max"
                        value={salaryMax}
                        onChange={(e) => setSalaryMax(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="cv-field">
                  <label className="cv-label" htmlFor="cv-deadline">
                    Application Deadline
                  </label>
                  <input
                    id="cv-deadline"
                    className="cv-input"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>

                <div className="cv-field">
                  <label className="cv-label" htmlFor="cv-shortlist-count">
                    Number of Candidates to Shortlist
                  </label>
                  <input
                    id="cv-shortlist-count"
                    className="cv-input"
                    type="number"
                    min="1"
                    value={shortlistCount}
                    onChange={(e) => setShortlistCount(e.target.value)}
                  />
                </div>
              </section>

              {/* Intelli-Audit Insight */}
              <InsightPanel className="cv-insight-card">
                <p className="cv-insight-text">
                  Your description strongly matches the profile for{' '}
                  <strong>Senior Frontend Engineers</strong>. Market data suggests a competitive salary range of{' '}
                  <strong>$120,000 – $165,000</strong> for this role.
                </p>
                <ProgressBar label="Clarity Score" value={84} />
                <a href="#optimization" className="cv-insight-link" onClick={(e) => e.preventDefault()}>
                  See Optimization Tips <ChevronRight size={14} />
                </a>
              </InsightPanel>

              {/* Status note */}
              <div className="cv-status-note">
                <Info size={16} className="cv-status-note__icon" />
                <p className="cv-status-note__text">
                  This vacancy is currently a <strong>Draft</strong>. It will not be visible to
                  candidates until it is published.
                </p>
              </div>
            </aside>
          </div>

          {/* ── Footer action bar ── */}
          <footer className="cv-footer">
            <div className="cv-footer__left">
              <span className="cv-autosave">
                <span className="cv-autosave__dot" />
                Auto-save enabled · Last edited {formatTime(lastEdited)}
              </span>
            </div>
            <div className="cv-footer__right">
              <button type="button" className="cv-link-btn">
                Discard Changes
              </button>
              <button type="button" className="comm-btn comm-btn--outline">
                Save Draft
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigate('/recruiter/vacancy-preview')}
              >
                Preview Vacancy
              </button>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default CreateVacancyPage;
