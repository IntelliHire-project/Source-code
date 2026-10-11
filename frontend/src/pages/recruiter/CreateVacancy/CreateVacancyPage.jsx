import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  FileText,
  Tag,
  Info,
  ChevronRight,
  AlertCircle,
  Calendar,
  Building2,
  Layers,
  Globe,
  Clock,
  Plus,
  X,
  CalendarRange,
  RotateCcw,
  Save,
  Eye,
} from 'lucide-react';
import RecruiterSidebar from '../../../components/common/RecruiterSidebar';
import TopBar from '../../../components/TopBar/TopBar';
import TagInput from '../../../components/common/TagInput';
import CalendarPicker from '../../../components/common/CalendarPicker';
import PillToggleGroup from '../../../components/common/PillToggleGroup';
import ProgressBar from '../../../components/common/ProgressBar';
import InsightPanel from '../../../components/common/InsightPanel';
import { createVacancy } from '../../../api/vacancyApi';
import '../../../style.css';
import './CreateVacancyPage.css';

const EXPERIENCE_OPTIONS = [
  { label: 'Junior', value: 'junior' },
  { label: 'Mid-Level', value: 'mid-level' },
  { label: 'Senior', value: 'senior' },
  { label: 'Lead', value: 'lead' },
];

const CATEGORY_SUGGESTIONS = [
  'Engineering',
  'Design',
  'Marketing',
  'Sales',
  'HR',
  'Finance',
  'Operations',
  'Legal',
  'Product',
  'Customer Support',
];

const WORK_MODE_OPTIONS = [
  { label: 'Remote', value: 'remote' },
  { label: 'Hybrid', value: 'hybrid' },
  { label: 'Onsite', value: 'onsite' },
];

const JOB_TYPE_OPTIONS = [
  { label: 'Full-Time', value: 'full-time' },
  { label: 'Part-Time', value: 'part-time' },
  { label: 'Contract', value: 'contract' },
  { label: 'Internship', value: 'internship' },
];

const LOCATION_SUGGESTIONS = [
  'London, UK',
  'New York, USA',
  'San Francisco, USA',
  'Berlin, Germany',
];

const INITIAL_SKILLS = ['React', 'TypeScript', 'REST APIs'];

const ASSESSMENT_OPTIONS = [
  { label: 'Yes', value: 'yes' },
  { label: 'No', value: 'no' },
];

function AutocompleteInput({ suggestions, value, onChange, placeholder, label, hint, id }) {
  const [inputValue, setInputValue] = useState(value || '');
  const [filtered, setFiltered] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const wrapperRef = useRef(null);

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  useEffect(() => {
    if (inputValue.length === 0) {
      setFiltered([]);
      setIsOpen(false);
      return;
    }
    const matches = suggestions.filter(
      (s) => s.toLowerCase().includes(inputValue.toLowerCase())
    );
    setFiltered(matches);
    setIsOpen(matches.length > 0);
    setActiveIdx(-1);
  }, [inputValue, suggestions]);

  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const select = (suggestion) => {
    setInputValue(suggestion);
    onChange(suggestion);
    setIsOpen(false);
    setActiveIdx(-1);
  };

  const handleChange = (e) => {
    setInputValue(e.target.value);
    onChange(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIdx((prev) => Math.min(prev + 1, filtered.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIdx((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIdx >= 0) {
          select(filtered[activeIdx]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setActiveIdx(-1);
        break;
    }
  };

  const highlight = (text, query) => {
    if (!query) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <strong className="autocomplete-highlight">{text.slice(idx, idx + query.length)}</strong>
        {text.slice(idx + query.length)}
      </>
    );
  };

  return (
    <div className="cv-field">
      {label && (
        <label className="cv-label" htmlFor={id}>
          {label}
        </label>
      )}
      {hint && (
        <span className="cv-field-hint" style={{ marginBottom: 4 }}>
          {hint}
        </span>
      )}
      <div className="autocomplete-wrapper" ref={wrapperRef}>
        <input
          id={id}
          type="text"
          className="cv-input autocomplete-input"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (inputValue && filtered.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          autoComplete="off"
        />
        {isOpen && (
          <ul className="autocomplete-list">
            {filtered.map((s, i) => (
              <li
                key={s}
                className={`autocomplete-item ${i === activeIdx ? 'autocomplete-item--active' : ''}`}
                onClick={() => select(s)}
                onMouseEnter={() => setActiveIdx(i)}
              >
                {highlight(s, inputValue)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function CreateVacancyPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
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
  const [milestones, setMilestones] = useState([
    { id: Date.now(), date: '', shortlistCount: '' },
  ]);
  const [category, setCategory] = useState('');
  const [workMode, setWorkMode] = useState('remote');
  const [jobType, setJobType] = useState('full-time');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [responsibilities, setResponsibilities] = useState(['']);

  /* ── Autosave timer ── */
  const [lastEdited, setLastEdited] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    setLastEdited(0);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setLastEdited((p) => p + 1), 60000);
    return () => clearInterval(timerRef.current);
  }, [jobTitle, jobDescription, skills, qualifications, experienceLevel, openings, salaryMin, salaryMax, deadline, shortlistCount, milestones, category, workMode, jobType, selectedLocation, responsibilities]);

  useEffect(() => {
    if (!showMilestoneModal) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setShowMilestoneModal(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [showMilestoneModal]);

  const addResponsibility = () => setResponsibilities([...responsibilities, '']);
  const removeResponsibility = (idx) => {
    const updated = responsibilities.filter((_, i) => i !== idx);
    setResponsibilities(updated.length ? updated : ['']);
  };
  const updateResponsibility = (idx, value) => {
    const updated = [...responsibilities];
    updated[idx] = value;
    setResponsibilities(updated);
  };

  const completedMilestones = milestones.filter((m) => m.date && m.shortlistCount);

  const addMilestone = () =>
    setMilestones([...milestones, { id: Date.now(), date: '', shortlistCount: '' }]);
  const removeMilestone = (id) =>
    setMilestones(milestones.filter((m) => m.id !== id));
  const updateMilestone = (id, field, value) =>
    setMilestones(milestones.map((m) => (m.id === id ? { ...m, [field]: value } : m)));

  const [isSaving, setIsSaving] = useState(false);

  const formatTime = (mins) => {
    if (mins === 0) return 'Just now';
    if (mins === 1) return '1 minute ago';
    return `${mins} minutes ago`;
  };

  const handleDiscardChanges = () => {
    if (window.confirm('Are you sure you want to discard your changes?')) {
      navigate('/recruiter/vacancies');
    }
  };

  const handleSaveDraft = async () => {
    if (!jobTitle.trim()) {
      alert('Please enter a job title before saving as draft.');
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        jobTitle,
        jobDescription,
        skills,
        qualifications,
        experienceLevel,
        requireAssessmentTest,
        openings,
        salaryMin,
        salaryMax,
        deadline,
        shortlistCount,
        milestones: completedMilestones,
        category,
        workMode,
        jobType,
        selectedLocation,
        responsibilities: responsibilities.filter(Boolean),
        status: 'draft',
      };
      const response = await createVacancy(payload);
      const newVacancy = response.vacancy || response;
      const targetId = newVacancy.id || newVacancy.vacancyCode || newVacancy.numericId;
      navigate(`/recruiter/vacancies/${targetId}`);
    } catch (err) {
      console.error('Failed to save draft:', err);
      alert(err.response?.data?.message || 'Failed to save draft. Please check your network and try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreviewVacancy = () => {
    navigate('/recruiter/vacancy-preview', {
      state: {
        jobTitle,
        jobDescription,
        skills,
        qualifications,
        experienceLevel,
        requireAssessmentTest,
        openings,
        salaryMin,
        salaryMax,
        deadline,
        shortlistCount,
        milestones: completedMilestones,
        category,
        workMode,
        jobType,
        selectedLocation,
        responsibilities: responsibilities.filter(Boolean),
      },
    });
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
              <button
                type="button"
                className="cv-btn cv-btn--discard"
                onClick={handleDiscardChanges}
                disabled={isSaving}
                title="Discard all changes and return to vacancies"
              >
                <RotateCcw size={15} />
                <span>Discard Changes</span>
              </button>
              <button
                type="button"
                className="cv-btn cv-btn--draft"
                onClick={handleSaveDraft}
                disabled={isSaving}
                title="Save current progress as a draft"
              >
                <Save size={15} />
                <span>{isSaving ? 'Saving Draft…' : 'Save Draft'}</span>
              </button>
              <button
                type="button"
                className="cv-btn cv-btn--preview"
                onClick={handlePreviewVacancy}
                disabled={isSaving}
              >
                <Eye size={15} />
                <span>Preview Vacancy</span>
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

                  <AutocompleteInput
                    id="cv-location"
                    label="Company Location"
                    hint="Fetched from company profile"
                    placeholder="Type a location or select from your offices…"
                    suggestions={LOCATION_SUGGESTIONS}
                    value={selectedLocation}
                    onChange={setSelectedLocation}
                  />

                  <AutocompleteInput
                    id="cv-category"
                    label="Category / Department"
                    placeholder="Type a department or select from suggestions…"
                    suggestions={CATEGORY_SUGGESTIONS}
                    value={category}
                    onChange={setCategory}
                  />

                  <div className="cv-field">
                    <label className="cv-label">Key Responsibilities</label>
                    <span className="cv-field-hint" style={{ marginBottom: 4 }}>
                      Add each responsibility as a separate bullet point
                    </span>
                    <div className="cv-repeater">
                      {responsibilities.map((item, idx) => (
                        <div key={idx} className="cv-repeater-item">
                          <span className="cv-repeater-bullet" aria-hidden="true" />
                          <input
                            type="text"
                            className="cv-input cv-repeater-input"
                            value={item}
                            onChange={(e) => updateResponsibility(idx, e.target.value)}
                            placeholder="e.g. Lead the design and implementation of…"
                          />
                          <button
                            type="button"
                            className="cv-repeater-remove"
                            onClick={() => removeResponsibility(idx)}
                            title="Remove responsibility"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="cv-repeater-add"
                      onClick={addResponsibility}
                    >
                      <Plus size={14} />
                      Add Responsibility
                    </button>
                  </div>
                </div>
              </section>

              {/* Card 1.5 — Job Details */}
              <section className="cv-card">
                <div className="cv-card__header">
                  <div className="cv-card__icon cv-card__icon--gold">
                    <Layers size={18} />
                  </div>
                  <div>
                    <h2 className="cv-card__title">Job Details</h2>
                    <p className="cv-card__subtitle">Work mode, type, and other conditions</p>
                  </div>
                </div>

                <div className="cv-card__body">
                  <div className="cv-field">
                    <label className="cv-label">Work Mode</label>
                    <div className="work-mode-toggle-wrapper">
                      <PillToggleGroup
                        name="work-mode"
                        options={WORK_MODE_OPTIONS}
                        value={workMode}
                        onChange={setWorkMode}
                      />
                    </div>
                  </div>

                  <div className="cv-field">
                    <label className="cv-label">Job Type</label>
                    <div className="job-type-toggle-wrapper">
                      <PillToggleGroup
                        name="job-type"
                        options={JOB_TYPE_OPTIONS}
                        value={jobType}
                        onChange={setJobType}
                      />
                    </div>
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

              <button
                type="button"
                className="cv-schedule-btn"
                onClick={() => navigate('/recruiter/interviews')}
              >
                <Calendar size={16} />
                Schedule Interview Panels &amp; Time Slots
                <ChevronRight size={14} />
              </button>
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
                  <CalendarPicker
                    value={deadline}
                    onChange={setDeadline}
                    placeholder="Select a deadline"
                    minDate={new Date().toISOString().slice(0, 10)}
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

                <div className="cv-field">
                  <label className="cv-label">In-Between Shortlisting</label>
                  <span className="cv-field-hint" style={{ marginBottom: 4 }}>
                    Optional: shortlist candidates on chosen dates before the application deadline.
                  </span>
                  <button
                    type="button"
                    className="cv-milestone-trigger"
                    onClick={() => setShowMilestoneModal(true)}
                  >
                    <Calendar size={14} />
                    {completedMilestones.length > 0
                      ? `Manage Milestones (${completedMilestones.length} set)`
                      : 'Add Milestone'}
                  </button>
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
              <button
                type="button"
                className="cv-btn cv-btn--discard"
                onClick={handleDiscardChanges}
                disabled={isSaving}
              >
                <RotateCcw size={15} />
                <span>Discard Changes</span>
              </button>
              <button
                type="button"
                className="cv-btn cv-btn--draft"
                onClick={handleSaveDraft}
                disabled={isSaving}
              >
                <Save size={15} />
                <span>{isSaving ? 'Saving Draft…' : 'Save Draft'}</span>
              </button>
              <button
                type="button"
                className="cv-btn cv-btn--preview"
                onClick={handlePreviewVacancy}
                disabled={isSaving}
              >
                <Eye size={15} />
                <span>Preview Vacancy</span>
              </button>
            </div>
          </footer>
        </main>
      </div>

      {showMilestoneModal && (
        <div className="cv-mm-overlay" onClick={() => setShowMilestoneModal(false)}>
          <div
            className="cv-mm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cv-mm-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cv-mm-header">
              <div className="cv-mm-header__left">
                <div className="cv-mm-header__icon">
                  <CalendarRange size={18} />
                </div>
                <div className="cv-mm-header__text">
                  <h2 className="cv-mm-title" id="cv-mm-title">
                    In-Between Shortlisting Milestones
                  </h2>
                  <p className="cv-mm-subtitle">
                    Set intermediate dates before the application deadline where a set number of
                    candidates will be shortlisted.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="cv-mm-close"
                onClick={() => setShowMilestoneModal(false)}
                aria-label="Close milestones modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="cv-mm-list">
              {milestones.map((m, idx) => (
                <div key={m.id} className="cv-mm-row">
                  <span className="cv-mm-index">{idx + 1}</span>
                  <div className="cv-mm-field">
                    <label className="cv-mm-label">Date</label>
                    <CalendarPicker
                      value={m.date}
                      onChange={(v) => updateMilestone(m.id, 'date', v)}
                      placeholder="Select a date"
                      minDate={new Date().toISOString().slice(0, 10)}
                      maxDate={deadline || undefined}
                    />
                  </div>
                  <div className="cv-mm-field">
                    <label className="cv-mm-label">Shortlist Count</label>
                    <input
                      type="number"
                      min="1"
                      className="cv-mm-input"
                      placeholder="e.g. 15"
                      value={m.shortlistCount}
                      onChange={(e) => updateMilestone(m.id, 'shortlistCount', e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    className="cv-mm-remove"
                    onClick={() => removeMilestone(m.id)}
                    title="Remove milestone"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            <button type="button" className="cv-mm-add" onClick={addMilestone}>
              <Plus size={14} />
              Add Milestone
            </button>

            <div className="cv-mm-footer">
              <span className="cv-mm-count">
                {milestones.length} milestone{milestones.length !== 1 ? 's' : ''} set
              </span>
              <div className="cv-mm-actions">
                <button
                  type="button"
                  className="cv-mm-btn cv-mm-btn--outline"
                  onClick={() => setShowMilestoneModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="cv-mm-btn cv-mm-btn--primary"
                  onClick={() => setShowMilestoneModal(false)}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateVacancyPage;
