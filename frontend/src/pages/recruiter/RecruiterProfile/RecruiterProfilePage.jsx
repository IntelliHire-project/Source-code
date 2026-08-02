import React, { useState, useCallback } from 'react';
import {
  BellRing,
  Briefcase,
  Building2,
  Camera,
  CheckCircle2,
  Edit3,
  Globe2,
  Lock,
  Mail,
  UserRoundCheck,
  ShieldCheck,
} from 'lucide-react';
import RecruiterSidebar from '../../../components/common/RecruiterSidebar';
import TopBar from '../../../components/TopBar/TopBar';
import '../../../style.css';
import './RecruiterProfilePage.css';

const initialProfile = {
  firstName: 'Sarah',
  lastName: 'Parker',
  workEmail: 'sarah.parker@intellihire.com',
  contactNumber: '+94 77 123 4567',
  jobTitle: 'Talent Acquisition Partner',
  department: 'People Operations',
  employeeId: 'IH-2048',
  companyName: 'IntelliHire Labs',
  industry: 'HR Tech & Talent Intelligence',
  companyWebsite: 'https://www.intellihire.com',
  companyAddress: 'Colombo 03, Sri Lanka',
  companyDescription: 'IntelliHire Labs accelerates hiring with AI-driven recruiting, career preparation, and talent analytics.',
  yearsExperience: '8+',
  hiringSpecializations: 'Software Engineering, Product, Data & Design',
  preferredLocations: 'Colombo, Remote, Singapore',
  employmentTypes: ['Full-time', 'Part-time', 'Remote'],
  bio: 'Sarah leads strategic hiring programs, builds high-performing recruitment pipelines, and uses intelligent screening workflows to improve recruiter efficiency.',
  linkedin: 'https://www.linkedin.com/in/sarahparker',
  username: 'sarah.parker',
  lastLogin: 'Today, 09:42 AM',
  accountStatus: 'Active',
};

function RecruiterProfilePage() {
  const [profile, setProfile] = useState(initialProfile);
  const [notifications, setNotifications] = useState({
    email: true,
    alerts: true,
    reminders: true,
    aiMatches: true,
    reports: false,
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const completionPercent = 84;

  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  }, []);

  const toggleNotification = useCallback((key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleSidebarToggle = useCallback(() => setSidebarOpen((prev) => !prev), []);
  const handleSidebarClose = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className="create-vacancy vm-shell">
      <RecruiterSidebar
        isOpen={sidebarOpen}
        onClose={handleSidebarClose}
        activeItem="Profile"
      />

      <div className="create-vacancy__main">
        <TopBar
          user={{ name: 'Sarah Parker', role: 'Talent Acquisition Partner' }}
          notificationsCount={3}
          breadcrumbItems={[{ label: 'Recruiter Profile' }]}
          searchPlaceholder="Search profile details"
          onHamburgerClick={handleSidebarToggle}
        />

        <main className="recruiter-profile-page">
          {/* Profile Header Section */}
          <section className="profile-header">
            <div className="profile-header__content">
              <div className="profile-avatar-section">
                <div className="profile-avatar">SP</div>
                <button className="avatar-edit-btn" type="button" aria-label="Upload profile picture">
                  <Camera size={16} />
                </button>
              </div>
              <div className="profile-info">
                <div className="profile-info__header">
                  <div>
                    <span className="profile-badge">Active Recruiter</span>
                    <h1 className="profile-name">{profile.firstName} {profile.lastName}</h1>
                    <p className="profile-role">{profile.jobTitle}</p>
                  </div>
                  <button className="edit-profile-btn" type="button">
                    <Edit3 size={14} /> Edit Profile
                  </button>
                </div>
                <div className="profile-meta">
                  <span className="meta-item"><Building2 size={14} /> {profile.department}</span>
                  <span className="meta-item"><Briefcase size={14} /> {profile.companyName}</span>
                  <span className="meta-item"><Mail size={14} /> {profile.workEmail}</span>
                </div>
              </div>
            </div>
            <div className="profile-completion">
              <div className="completion-header">
                <span className="completion-label">Profile Completion</span>
                <span className="completion-percent">{completionPercent}%</span>
              </div>
              <div className="completion-bar">
                <div className="completion-fill" style={{ width: `${completionPercent}%` }} />
              </div>
              <p className="completion-text">Complete your profile to unlock all features</p>
            </div>
          </section>

          {/* Main Content Grid */}
          <div className="profile-layout">
            {/* Left Column - Primary Information */}
            <div className="profile-layout__main">
              {/* Personal Information Card */}
              <section className="info-card">
                <div className="info-card__header">
                  <div className="info-card__title">
                    <UserRoundCheck size={20} />
                    <div>
                      <h2>Personal Information</h2>
                      <p>Update your personal contact details</p>
                    </div>
                  </div>
                </div>
                <div className="info-card__body">
                  <div className="form-section">
                    <h3 className="form-section__title">Basic Details</h3>
                    <div className="form-row">
                      <div className="form-field">
                        <label htmlFor="firstName">First Name</label>
                        <input
                          id="firstName"
                          name="firstName"
                          value={profile.firstName}
                          onChange={handleChange}
                          placeholder="Enter first name"
                        />
                      </div>
                      <div className="form-field">
                        <label htmlFor="lastName">Last Name</label>
                        <input
                          id="lastName"
                          name="lastName"
                          value={profile.lastName}
                          onChange={handleChange}
                          placeholder="Enter last name"
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-field">
                        <label htmlFor="workEmail">Work Email</label>
                        <input
                          id="workEmail"
                          name="workEmail"
                          type="email"
                          value={profile.workEmail}
                          onChange={handleChange}
                          placeholder="Enter work email"
                        />
                      </div>
                      <div className="form-field">
                        <label htmlFor="contactNumber">Contact Number</label>
                        <input
                          id="contactNumber"
                          name="contactNumber"
                          type="tel"
                          value={profile.contactNumber}
                          onChange={handleChange}
                          placeholder="Enter contact number"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="form-section">
                    <h3 className="form-section__title">Work Details</h3>
                    <div className="form-row">
                      <div className="form-field">
                        <label htmlFor="jobTitle">Job Title</label>
                        <input
                          id="jobTitle"
                          name="jobTitle"
                          value={profile.jobTitle}
                          onChange={handleChange}
                          placeholder="Enter job title"
                        />
                      </div>
                      <div className="form-field">
                        <label htmlFor="department">Department</label>
                        <input
                          id="department"
                          name="department"
                          value={profile.department}
                          onChange={handleChange}
                          placeholder="Enter department"
                        />
                      </div>
                    </div>
                    <div className="form-field">
                      <label htmlFor="employeeId">Employee ID</label>
                      <input
                        id="employeeId"
                        name="employeeId"
                        value={profile.employeeId}
                        onChange={handleChange}
                        placeholder="Enter employee ID"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Company Information Card */}
              <section className="info-card">
                <div className="info-card__header">
                  <div className="info-card__title">
                    <Building2 size={20} />
                    <div>
                      <h2>Company Information</h2>
                      <p>Manage your organization details</p>
                    </div>
                  </div>
                </div>
                <div className="info-card__body">
                  <div className="company-preview">
                    <div className="company-preview__icon">
                      <Building2 size={24} />
                    </div>
                    <div className="company-preview__info">
                      <h3>{profile.companyName}</h3>
                      <p>{profile.industry}</p>
                    </div>
                  </div>
                  <div className="form-section">
                    <div className="form-row">
                      <div className="form-field">
                        <label htmlFor="companyName">Company Name</label>
                        <input
                          id="companyName"
                          name="companyName"
                          value={profile.companyName}
                          onChange={handleChange}
                          placeholder="Enter company name"
                        />
                      </div>
                      <div className="form-field">
                        <label htmlFor="industry">Industry</label>
                        <input
                          id="industry"
                          name="industry"
                          value={profile.industry}
                          onChange={handleChange}
                          placeholder="Enter industry"
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-field">
                        <label htmlFor="companyWebsite">Company Website</label>
                        <input
                          id="companyWebsite"
                          name="companyWebsite"
                          type="url"
                          value={profile.companyWebsite}
                          onChange={handleChange}
                          placeholder="https://example.com"
                        />
                      </div>
                      <div className="form-field">
                        <label htmlFor="companyAddress">Company Address</label>
                        <input
                          id="companyAddress"
                          name="companyAddress"
                          value={profile.companyAddress}
                          onChange={handleChange}
                          placeholder="Enter company address"
                        />
                      </div>
                    </div>
                    <div className="form-field">
                      <label htmlFor="companyDescription">Company Description</label>
                      <textarea
                        id="companyDescription"
                        name="companyDescription"
                        value={profile.companyDescription}
                        onChange={handleChange}
                        rows="3"
                        placeholder="Brief company description"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Professional Information Card */}
              <section className="info-card">
                <div className="info-card__header">
                  <div className="info-card__title">
                    <Briefcase size={20} />
                    <div>
                      <h2>Professional Information</h2>
                      <p>Your expertise and hiring focus</p>
                    </div>
                  </div>
                </div>
                <div className="info-card__body">
                  <div className="form-section">
                    <div className="form-row">
                      <div className="form-field">
                        <label htmlFor="yearsExperience">Years of Experience</label>
                        <input
                          id="yearsExperience"
                          name="yearsExperience"
                          value={profile.yearsExperience}
                          onChange={handleChange}
                          placeholder="e.g., 5+"
                        />
                      </div>
                      <div className="form-field">
                        <label htmlFor="hiringSpecializations">Specializations</label>
                        <input
                          id="hiringSpecializations"
                          name="hiringSpecializations"
                          value={profile.hiringSpecializations}
                          onChange={handleChange}
                          placeholder="e.g., Engineering, Design"
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-field">
                        <label htmlFor="preferredLocations">Preferred Locations</label>
                        <input
                          id="preferredLocations"
                          name="preferredLocations"
                          value={profile.preferredLocations}
                          onChange={handleChange}
                          placeholder="e.g., Colombo, Remote"
                        />
                      </div>
                      <div className="form-field">
                        <label htmlFor="employmentTypes">Employment Types</label>
                        <input
                          id="employmentTypes"
                          name="employmentTypes"
                          value={profile.employmentTypes.join(', ')}
                          onChange={handleChange}
                          placeholder="e.g., Full-time, Part-time"
                        />
                      </div>
                    </div>
                    <div className="form-field">
                      <label htmlFor="bio">Professional Bio</label>
                      <textarea
                        id="bio"
                        name="bio"
                        value={profile.bio}
                        onChange={handleChange}
                        rows="4"
                        placeholder="Write a brief professional bio"
                      />
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column - Settings & Preferences */}
            <div className="profile-layout__sidebar">
              {/* Notification Preferences */}
              <section className="settings-card">
                <div className="settings-card__header">
                  <BellRing size={20} />
                  <div>
                    <h2>Notifications</h2>
                    <p>Control your alert preferences</p>
                  </div>
                </div>
                <div className="settings-card__body">
                  {[
                    ['email', 'Email Notifications'],
                    ['alerts', 'Application Alerts'],
                    ['reminders', 'Interview Reminders'],
                    ['aiMatches', 'AI Match Alerts'],
                    ['reports', 'Weekly Reports'],
                  ].map(([key, label]) => (
                    <div key={key} className="setting-toggle">
                      <span className="setting-toggle__label">{label}</span>
                      <button
                        type="button"
                        className={`toggle-btn ${notifications[key] ? 'toggle-btn--active' : ''}`}
                        onClick={() => toggleNotification(key)}
                        aria-pressed={notifications[key]}
                      >
                        <span className="toggle-btn__thumb" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              {/* Security Settings */}
              <section className="settings-card">
                <div className="settings-card__header">
                  <ShieldCheck size={20} />
                  <div>
                    <h2>Security</h2>
                    <p>Account security settings</p>
                  </div>
                </div>
                <div className="settings-card__body">
                  <div className="security-item">
                    <div className="security-item__icon">
                      <ShieldCheck size={18} />
                    </div>
                    <div className="security-item__content">
                      <strong>Username</strong>
                      <span>{profile.username}</span>
                    </div>
                  </div>
                  <div className="security-item">
                    <div className="security-item__icon">
                      <Lock size={18} />
                    </div>
                    <div className="security-item__content">
                      <strong>Password</strong>
                      <span>••••••••</span>
                    </div>
                    <button className="security-item__action">Change</button>
                  </div>
                  <div className="security-item">
                    <div className="security-item__icon">
                      <CheckCircle2 size={18} />
                    </div>
                    <div className="security-item__content">
                      <strong>2FA Status</strong>
                      <span className="status-badge status-badge--success">Enabled</span>
                    </div>
                  </div>
                  <div className="security-item">
                    <div className="security-item__icon">
                      <BellRing size={18} />
                    </div>
                    <div className="security-item__content">
                      <strong>Last Login</strong>
                      <span>{profile.lastLogin}</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Professional Links */}
              <section className="settings-card">
                <div className="settings-card__header">
                  <Globe2 size={20} />
                  <div>
                    <h2>Links</h2>
                    <p>Connected profiles</p>
                  </div>
                </div>
                <div className="settings-card__body">
                  <a
                    href={profile.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-item"
                  >
                    <Globe2 size={16} />
                    <span>LinkedIn Profile</span>
                  </a>
                  <a
                    href={profile.companyWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-item"
                  >
                    <Globe2 size={16} />
                    <span>Company Website</span>
                  </a>
                </div>
              </section>
            </div>
          </div>

          {/* Action Buttons */}
          <section className="profile-actions">
            <button className="btn btn--primary" type="button">Save Changes</button>
            <button className="btn btn--secondary" type="button">Cancel</button>
          </section>
        </main>
      </div>
    </div>
  );
}

export default RecruiterProfilePage;
