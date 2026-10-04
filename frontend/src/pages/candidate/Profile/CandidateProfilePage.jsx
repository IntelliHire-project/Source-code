import React, { useState, useContext, useEffect } from 'react';
import {
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  ChevronLeft,
  FileText,
  Globe,
  Grid2X2,
  Link2,
  Mail,
  Menu,
  MessageSquare,
  MapPin,
  PencilLine,
  Phone,
  Plus,
  Save,
  Settings,
  ShieldCheck,
  Trash2,
  Upload,
  UserCircle2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CandidatePageContext } from '../CandidateDashboard/CandidateDashboard';

const getInitialProfile = (user) => {
  const hasCV = Boolean(user?.cv);

  return {
    fullName: user?.name || '',
    headline: hasCV ? 'Senior Full Stack Engineer' : '',
    email: user?.email || '',
    phone: hasCV ? '+1 (555) 123-4567' : '',
    location: hasCV ? 'San Francisco, CA' : '',
    linkedIn: hasCV ? 'linkedin.com/in/airivera' : '',
    portfolio: hasCV ? 'alexrivera.dev' : '',
    bioSummary: hasCV
      ? 'Innovative software engineer with 8+ years of experience in building scalable web applications. Passionate about AI-driven solutions and user-centric design.'
      : '',
    status: hasCV ? 'Open to Work' : 'Open to Work',
    language: hasCV ? 'English (Native)' : 'English',
    joined: user?.joined || 'Joined May 2024',
    avatar:
      user?.avatar ||
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=280&h=280&q=80',
    cv: hasCV
      ? {
          name: 'Alex_Rivera_CV_2024_Final.pdf',
          meta: 'Uploaded on May 12, 2024',
          note: 'PDF, DOCX up to 10MB',
        }
      : {
          name: '',
          meta: '',
          note: 'PDF, DOCX up to 10MB',
        },
    skills: hasCV
      ? ['React', 'TypeScript', 'Node.js', 'Next.js', 'AWS', 'Python', 'Docker', 'GraphQL']
      : [],
    workExperience: hasCV
      ? [
          {
            id: 'exp-1',
            title: 'Senior Software Engineer',
            company: 'TechFlow Solutions',
            period: 'Jan 2021 - Present',
            description:
              'Leading the core platform team in migrating legacy systems to a microservices architecture using React and Node.js.',
          },
          {
            id: 'exp-2',
            title: 'Full Stack Developer',
            company: 'CloudSphere Inc.',
            period: 'Mar 2018 - Dec 2020',
            description:
              'Developed and maintained client-facing dashboards, improving user engagement by 40% through optimized performance.',
          },
        ]
      : [],
    education: hasCV
      ? [
          {
            id: 'edu-1',
            title: 'Master of Computer Science',
            school: 'Stanford University',
            period: '2016 - 2018',
          },
          {
            id: 'edu-2',
            title: 'B.S. in Software Engineering',
            school: 'Georgia Institute of Technology',
            period: '2012 - 2016',
          },
        ]
      : [],
  };
};

function Field({ label, value, onChange, placeholder, type = 'text', textarea = false }) {
  return (
    <label className="candidate-field">
      <span className="candidate-field__label">{label}</span>
      {textarea ? (
        <textarea
          className="candidate-input candidate-input--textarea"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={5}
        />
      ) : (
        <input
          className="candidate-input"
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
      )}
    </label>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="candidate-info-row">
      <div className="candidate-info-row__icon">
        <Icon size={14} />
      </div>
      <div className="candidate-info-row__text">
        <span className="candidate-info-row__label">{label}</span>
        <span className="candidate-info-row__value">{value || '-'}</span>
      </div>
    </div>
  );
}

function CandidateProfilePage({ initialMode = 'view' }) {
  const { setPageLabel, user } = useContext(CandidatePageContext);
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(initialMode === 'edit');
  const [profile, setProfile] = useState(() => getInitialProfile(user));
  const [draft, setDraft] = useState(() => getInitialProfile(user));

  const current = isEditing ? draft : profile;
  const pageLabel = isEditing ? 'EDIT PROFILE' : 'CANDIDATE PROFILE';

  useEffect(() => {
    setPageLabel(pageLabel);
  }, [pageLabel, setPageLabel]);

  // Update profile if user context changes (e.g. login updates)
  useEffect(() => {
    if (user) {
      setProfile(getInitialProfile(user));
      setDraft(getInitialProfile(user));
    }
  }, [user]);

  const setDraftValue = (field) => (event) => {
    const { value } = event.target;
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const setDraftExperience = (id, field) => (event) => {
    const { value } = event.target;
    setDraft((prev) => ({
      ...prev,
      workExperience: prev.workExperience.map((job) =>
        job.id === id ? { ...job, [field]: value } : job
      ),
    }));
  };

  const setDraftEducation = (id, field) => (event) => {
    const { value } = event.target;
    setDraft((prev) => ({
      ...prev,
      education: prev.education.map((edu) =>
        edu.id === id ? { ...edu, [field]: value } : edu
      ),
    }));
  };

  const handleAddExperience = () => {
    setDraft((prev) => ({
      ...prev,
      workExperience: [
        ...prev.workExperience,
        {
          id: `exp-${Date.now()}`,
          title: '',
          company: '',
          period: '',
          description: '',
        },
      ],
    }));
  };

  const handleRemoveExperience = (id) => {
    setDraft((prev) => ({
      ...prev,
      workExperience: prev.workExperience.filter((job) => job.id !== id),
    }));
  };

  const handleAddEducation = () => {
    setDraft((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          id: `edu-${Date.now()}`,
          title: '',
          school: '',
          period: '',
        },
      ],
    }));
  };

  const handleRemoveEducation = (id) => {
    setDraft((prev) => ({
      ...prev,
      education: prev.education.filter((edu) => edu.id !== id),
    }));
  };

  const handleOpenEditor = () => {
    setDraft(profile);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setDraft(profile);
    setIsEditing(false);
  };

  const handleSave = () => {
    setProfile(draft);
    setIsEditing(false);
  };

  return (
    <div className="candidate-profile-content">
      {!isEditing ? (
        <>
          <section className="candidate-hero card-surface">
            <div className="candidate-hero__avatar-wrap">
              <img src={current.avatar} alt={current.fullName} className="candidate-hero__avatar" />
              <button type="button" className="candidate-hero__edit-badge" onClick={handleOpenEditor}>
                <PencilLine size={14} />
              </button>
            </div>

            <div className="candidate-hero__content">
              <h1 className="candidate-hero__name">{current.fullName}</h1>
              <p className="candidate-hero__headline">{current.headline} | AI Enthusiast</p>
              <div className="candidate-hero__meta">
                <span><MapPin size={14} /> {current.location}</span>
                <span><CalendarDays size={14} /> {current.joined}</span>
              </div>
              <div className="candidate-hero__skills">
                {current.skills.map((skill) => (
                  <span key={skill} className="candidate-pill">{skill}</span>
                ))}
              </div>
            </div>

            <div className="candidate-hero__actions">
              <button type="button" className="candidate-btn candidate-btn--accent" onClick={handleOpenEditor}>
                Edit Profile
              </button>
            </div>
          </section>

          <section className="candidate-grid candidate-grid--view">
            <div className="candidate-column">
              <article className="candidate-panel card-surface">
                <div className="candidate-panel__header">
                  <h2>Work Experience</h2>
                </div>
                <div className="candidate-list">
                  {current.workExperience.map((job) => (
                    <div className="candidate-entry" key={job.id}>
                      <div className="candidate-entry__header">
                        <div>
                          <div className="candidate-entry__title">{job.title}</div>
                          <div className="candidate-entry__company">{job.company}</div>
                        </div>
                        <div className="candidate-entry__period">{job.period}</div>
                      </div>
                      <p className="candidate-entry__body">{job.description}</p>
                    </div>
                  ))}
                </div>
              </article>

              <article className="candidate-panel card-surface">
                <div className="candidate-panel__header">
                  <h2>Education</h2>
                </div>
                <div className="candidate-list">
                  {current.education.map((edu) => (
                    <div className="candidate-entry candidate-entry--education" key={edu.id}>
                      <div className="candidate-entry__header">
                        <div>
                          <div className="candidate-entry__title">{edu.title}</div>
                          <div className="candidate-entry__company">{edu.school}</div>
                        </div>
                        <div className="candidate-entry__period">{edu.period}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </div>

            <div className="candidate-rail">
              <article className="candidate-panel card-surface candidate-panel--compact">
                <div className="candidate-panel__header">
                  <h2>Personal Information</h2>
                </div>
                <div className="candidate-info-stack">
                  <InfoRow icon={UserCircle2} label="Full Name" value={current.fullName} />
                  <InfoRow icon={BriefcaseBusiness} label="Professional Headline" value={current.headline} />
                  <InfoRow icon={Mail} label="Email Address" value={current.email} />
                  <InfoRow icon={Phone} label="Phone Number" value={current.phone} />
                  <InfoRow icon={MapPin} label="Location" value={current.location} />
                  <InfoRow icon={Globe} label="Main Language" value={current.language} />
                  <InfoRow icon={ShieldCheck} label="Current Status" value={current.status} />
                  <InfoRow icon={PencilLine} label="Bio Summary" value={current.bioSummary} />
                </div>
              </article>

              <article className="candidate-panel card-surface candidate-panel--compact">
                <div className="candidate-panel__header">
                  <h2>Professional Links</h2>
                </div>
                <div className="candidate-link-list">
                  <div className="candidate-link-row">
                    <div className="candidate-link-row__icon"><Link2 size={14} /></div>
                    <div>
                      <div className="candidate-link-row__label">LinkedIn Profile</div>
                      <div className="candidate-link-row__value">{current.linkedIn}</div>
                    </div>
                  </div>
                  <div className="candidate-link-row">
                    <div className="candidate-link-row__icon"><Globe size={14} /></div>
                    <div>
                      <div className="candidate-link-row__label">Portfolio</div>
                      <div className="candidate-link-row__value">{current.portfolio}</div>
                    </div>
                  </div>
                </div>
              </article>

              <article className="candidate-panel card-surface candidate-panel--compact">
                <div className="candidate-panel__header candidate-panel__header--spread">
                  <h2>Active CV</h2>
                  <span className="candidate-badge candidate-badge--muted">Manage</span>
                </div>
                <div className="candidate-cv-card">
                  <div className="candidate-cv-card__file">
                    <div className="candidate-cv-card__icon">
                      <FileText size={18} />
                    </div>
                    <div>
                      <div className="candidate-cv-card__name">{current.cv.name}</div>
                      <div className="candidate-cv-card__meta">{current.cv.meta}</div>
                      <div className="candidate-cv-card__note">{current.cv.note}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="candidate-btn candidate-btn--ghost candidate-btn--full"
                    onClick={() => navigate('/candidate/cv-management')}
                  >
                    View CV Management
                  </button>
                </div>
              </article>
            </div>
          </section>
        </>
      ) : (
        <>
          <div className="candidate-edit-header">
            <div className="candidate-edit-header__copy">
              <button type="button" className="candidate-back-btn" onClick={handleCancel}>
                <ChevronLeft size={16} />
              </button>
              <div>
                <h1>Edit Profile</h1>
                <p>Update your professional information and CV to stay competitive.</p>
              </div>
            </div>

            <div className="candidate-edit-header__actions">
              <button type="button" className="candidate-btn candidate-btn--ghost" onClick={handleCancel}>
                Cancel
              </button>
              <button type="button" className="candidate-btn candidate-btn--accent" onClick={handleSave}>
                <Save size={14} />
                Save Changes
              </button>
            </div>
          </div>

          <section className="candidate-grid candidate-grid--edit">
            <div className="candidate-column">
              <article className="candidate-panel card-surface">
                <div className="candidate-panel__header">
                  <h2>Personal Information</h2>
                </div>
                <div className="candidate-form-grid">
                  <Field label="Full Name" value={draft.fullName} onChange={setDraftValue('fullName')} placeholder="Your full name" />
                  <Field label="Professional Headline" value={draft.headline} onChange={setDraftValue('headline')} placeholder="e.g. Senior Full Stack Engineer" />
                  <Field label="Email Address" value={draft.email} onChange={setDraftValue('email')} placeholder="name@example.com" type="email" />
                  <Field label="Phone Number" value={draft.phone} onChange={setDraftValue('phone')} placeholder="+1 (555) 123-4567" />
                  <Field label="Location" value={draft.location} onChange={setDraftValue('location')} placeholder="City, Country" />
                  <Field label="Main Language" value={draft.language} onChange={setDraftValue('language')} placeholder="e.g. English (Native)" />
                  <Field label="Current Status" value={draft.status} onChange={setDraftValue('status')} placeholder="e.g. Open to Work" />
                  <div className="candidate-form-grid__wide">
                    <Field
                      label="Bio Summary"
                      value={draft.bioSummary}
                      onChange={setDraftValue('bioSummary')}
                      placeholder="Write a short professional summary"
                      textarea
                    />
                  </div>
                </div>
              </article>

              <article className="candidate-panel card-surface">
                <div className="candidate-panel__header candidate-panel__header--spread">
                  <h2>Work Experience</h2>
                  <button type="button" className="candidate-panel__action-link" onClick={handleAddExperience}>
                    <Plus size={14} /> Add Experience
                  </button>
                </div>
                <div className="candidate-list">
                  {current.workExperience.map((job) => (
                    <div className="candidate-entry candidate-entry--edit" key={job.id}>
                      <div className="candidate-entry__header">
                        <div className="candidate-entry__title">{job.title || 'New Experience'}</div>
                        <button
                          type="button"
                          className="candidate-entry__remove"
                          aria-label="Remove experience"
                          onClick={() => handleRemoveExperience(job.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="candidate-form-stack candidate-form-stack--entry">
                        <Field label="Job Title" value={job.title} onChange={setDraftExperience(job.id, 'title')} placeholder="e.g. Senior Software Engineer" />
                        <Field label="Company" value={job.company} onChange={setDraftExperience(job.id, 'company')} placeholder="Company name" />
                        <Field label="Period" value={job.period} onChange={setDraftExperience(job.id, 'period')} placeholder="Jan 2021 - Present" />
                        <Field label="Description" value={job.description} onChange={setDraftExperience(job.id, 'description')} placeholder="Describe your role and achievements" textarea />
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <article className="candidate-panel card-surface">
                <div className="candidate-panel__header candidate-panel__header--spread">
                  <h2>Education</h2>
                  <button type="button" className="candidate-panel__action-link" onClick={handleAddEducation}>
                    <Plus size={14} /> Add Education
                  </button>
                </div>
                <div className="candidate-list">
                  {current.education.map((edu) => (
                    <div className="candidate-entry candidate-entry--education" key={edu.id}>
                      <div className="candidate-entry__header">
                        <div className="candidate-entry__title">{edu.title || 'New Education'}</div>
                        <button
                          type="button"
                          className="candidate-entry__remove"
                          aria-label="Remove education"
                          onClick={() => handleRemoveEducation(edu.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="candidate-form-stack candidate-form-stack--entry">
                        <Field label="Degree / Title" value={edu.title} onChange={setDraftEducation(edu.id, 'title')} placeholder="e.g. Master of Computer Science" />
                        <Field label="School" value={edu.school} onChange={setDraftEducation(edu.id, 'school')} placeholder="University name" />
                        <Field label="Period" value={edu.period} onChange={setDraftEducation(edu.id, 'period')} placeholder="2016 - 2018" />
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </div>

            <div className="candidate-rail">
              <article className="candidate-panel card-surface candidate-panel--compact">
                <div className="candidate-panel__header">
                  <h2>Active CV</h2>
                </div>
                <div className="candidate-cv-file">
                  <div className="candidate-cv-card__file candidate-cv-card__file--dark">
                    <div className="candidate-cv-card__icon">
                      <FileText size={18} />
                    </div>
                    <div>
                      <div className="candidate-cv-card__name">{current.cv.name}</div>
                      <div className="candidate-cv-card__meta">{current.cv.meta}</div>
                      <div className="candidate-cv-card__note">{current.cv.note}</div>
                    </div>
                  </div>

                  <div className="candidate-upload-dropzone">
                    <Upload size={24} />
                    <div className="candidate-upload-dropzone__title">Click to replace CV</div>
                    <div className="candidate-upload-dropzone__meta">PDF, DOCX up to 10MB</div>
                  </div>

                  <button
                    type="button"
                    className="candidate-btn candidate-btn--ghost candidate-btn--full"
                    onClick={() => navigate('/candidate/cv-management')}
                  >
                    CV Management
                  </button>
                </div>
              </article>

              <article className="candidate-panel card-surface candidate-panel--compact">
                <div className="candidate-panel__header">
                  <h2>Professional Links</h2>
                </div>
                <div className="candidate-form-stack">
                  <Field label="LinkedIn Profile" value={draft.linkedIn} onChange={setDraftValue('linkedIn')} placeholder="linkedin.com/in/yourname" />
                  <Field label="Portfolio" value={draft.portfolio} onChange={setDraftValue('portfolio')} placeholder="yourdomain.com" />
                </div>
              </article>

              <article className="candidate-panel card-surface candidate-panel--compact">
                <div className="candidate-panel__header candidate-panel__header--spread">
                  <h2>Skills Snapshot</h2>
                  <span className="candidate-badge candidate-badge--verified">
                    <ShieldCheck size={12} /> Verified
                  </span>
                </div>
                <div className="candidate-skills-grid">
                  {draft.skills.map((skill) => (
                    <span key={skill} className="candidate-pill candidate-pill--compact">{skill} +</span>
                  ))}
                  <button type="button" className="candidate-pill candidate-pill--compact candidate-pill--add">
                    + Add More
                  </button>
                </div>
              </article>
            </div>
          </section>

          <section className="candidate-review-banner card-surface">
            <div className="candidate-review-banner__icon">+</div>
            <div className="candidate-review-banner__copy">
              <div className="candidate-review-banner__title">Reviewing your changes?</div>
              <div className="candidate-review-banner__text">Make sure your experience reflects your most recent achievements.</div>
            </div>
            <div className="candidate-review-banner__actions">
              <button type="button" className="candidate-btn candidate-btn--ghost" onClick={handleCancel}>
                Discard Changes
              </button>
              <button type="button" className="candidate-btn candidate-btn--accent" onClick={handleSave}>
                <Save size={14} />
                Confirm &amp; Save
              </button>
            </div>
          </section>
        </>
      )}

      <footer className="candidate-footer">
        <div className="candidate-footer__copy">&copy; 2024 IntelliHire AI. All rights reserved.</div>
        <div className="candidate-footer__links">
          <a href="#" onClick={(event) => event.preventDefault()}>Privacy Policy</a>
          <a href="#" onClick={(event) => event.preventDefault()}>Terms of Service</a>
          <a href="#" onClick={(event) => event.preventDefault()}>Support</a>
        </div>
      </footer>
    </div>
  );
}

export default CandidateProfilePage;
