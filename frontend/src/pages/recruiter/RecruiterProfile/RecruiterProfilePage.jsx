import React, { useState } from 'react';
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
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  CalendarDays,
  UserRoundCheck,
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

  const handleChange = (event) => {
    const { name, value } = event.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const toggleNotification = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="create-vacancy vm-shell">
      <RecruiterSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeItem="Profile"
      />

      <div className="create-vacancy__main">
        <TopBar
          user={{ name: 'Sarah Parker', role: 'Talent Acquisition Partner' }}
          notificationsCount={3}
          breadcrumbItems={[{ label: 'Recruiter Profile' }]}
          searchPlaceholder="Search profile details"
          onHamburgerClick={() => setSidebarOpen(true)}
        />

        <main className="recruiter-profile-page">
          <section className="profile-hero-card">
            <div className="profile-hero-main">
              <div className="profile-avatar-wrap">
                <div className="profile-avatar">SP</div>
                <button className="profile-photo-btn" type="button" aria-label="Upload profile picture">
                  <Camera size={16} />
                </button>
              </div>

              <div className="profile-hero-content">
                <div className="profile-header-row">
                  <div>
                    <p className="profile-eyebrow">IntelliHire Recruiter</p>
                    <h1>{profile.firstName} {profile.lastName}</h1>
                    <p className="profile-title">{profile.jobTitle}</p>
                  </div>
                  <div className="profile-action-group">
                    <button className="ghost-action" type="button">
                      <Edit3 size={15} /> Edit Profile
                    </button>
                  </div>
                </div>

                <div className="profile-meta-row">
                  <span><Building2 size={15} /> {profile.department}</span>
                  <span><Briefcase size={15} /> {profile.companyName}</span>
                  <span><Mail size={15} /> {profile.workEmail}</span>
                </div>

                <div className="profile-progress-card">
                  <div className="progress-labels">
                    <span>Profile completion</span>
                    <strong>{completionPercent}%</strong>
                  </div>
                  <div className="progress-bar">
                    <span style={{ width: `${completionPercent}%` }} />
                  </div>
                  <p>Complete company details and security settings to unlock deeper analytics.</p>
                </div>
              </div>
            </div>
          </section>

          <div className="content-grid">
            <section className="profile-card">
              <div className="section-heading">
                <h2>Personal Information</h2>
                <span className="muted-pill">Editable</span>
              </div>
              <div className="form-grid">
                <label>
                  <span>First Name</span>
                  <input name="firstName" value={profile.firstName} onChange={handleChange} />
                </label>
                <label>
                  <span>Last Name</span>
                  <input name="lastName" value={profile.lastName} onChange={handleChange} />
                </label>
                <label>
                  <span>Work Email</span>
                  <input name="workEmail" value={profile.workEmail} onChange={handleChange} />
                </label>
                <label>
                  <span>Contact Number</span>
                  <input name="contactNumber" value={profile.contactNumber} onChange={handleChange} />
                </label>
                <label>
                  <span>Job Title</span>
                  <input name="jobTitle" value={profile.jobTitle} onChange={handleChange} />
                </label>
                <label>
                  <span>Department</span>
                  <input name="department" value={profile.department} onChange={handleChange} />
                </label>
                <label>
                  <span>Employee ID</span>
                  <input name="employeeId" value={profile.employeeId} onChange={handleChange} />
                </label>
              </div>
            </section>

            <section className="profile-card">
              <div className="section-heading">
                <h2>Company Information</h2>
                <span className="muted-pill">Corporate</span>
              </div>
              <div className="company-card">
                <div className="company-logo">
                  <Building2 size={22} />
                </div>
                <div className="company-card-content">
                  <h3>{profile.companyName}</h3>
                  <p>{profile.industry}</p>
                </div>
              </div>
              <div className="form-grid compact">
                <label>
                  <span>Company Name</span>
                  <input name="companyName" value={profile.companyName} onChange={handleChange} />
                </label>
                <label>
                  <span>Industry</span>
                  <input name="industry" value={profile.industry} onChange={handleChange} />
                </label>
                <label>
                  <span>Company Website</span>
                  <input name="companyWebsite" value={profile.companyWebsite} onChange={handleChange} />
                </label>
                <label>
                  <span>Company Address</span>
                  <input name="companyAddress" value={profile.companyAddress} onChange={handleChange} />
                </label>
                <label className="full-width">
                  <span>Short Company Description</span>
                  <textarea name="companyDescription" value={profile.companyDescription} onChange={handleChange} rows="3" />
                </label>
              </div>
            </section>

            <section className="profile-card">
              <div className="section-heading">
                <h2>Professional Information</h2>
                <span className="muted-pill">Talent Strategy</span>
              </div>
              <div className="form-grid">
                <label>
                  <span>Years of Recruitment Experience</span>
                  <input name="yearsExperience" value={profile.yearsExperience} onChange={handleChange} />
                </label>
                <label>
                  <span>Hiring Specializations</span>
                  <input name="hiringSpecializations" value={profile.hiringSpecializations} onChange={handleChange} />
                </label>
                <label>
                  <span>Preferred Hiring Locations</span>
                  <input name="preferredLocations" value={profile.preferredLocations} onChange={handleChange} />
                </label>
                <label>
                  <span>Employment Types Managed</span>
                  <input name="employmentTypes" value={profile.employmentTypes.join(', ')} onChange={handleChange} />
                </label>
                <label className="full-width">
                  <span>Professional Bio</span>
                  <textarea name="bio" value={profile.bio} onChange={handleChange} rows="4" />
                </label>
              </div>
            </section>

            <section className="profile-card">
              <div className="section-heading">
                <h2>Notification Preferences</h2>
                <span className="muted-pill">Alerts</span>
              </div>
              <div className="toggle-list">
                {[
                  ['email', 'Email Notifications'],
                  ['alerts', 'New Application Alerts'],
                  ['reminders', 'Interview Reminders'],
                  ['aiMatches', 'AI Match Notifications'],
                  ['reports', 'Weekly Recruitment Reports'],
                ].map(([key, label]) => (
                  <label key={key} className="toggle-row">
                    <span>{label}</span>
                    <button
                      type="button"
                      className={`toggle-switch ${notifications[key] ? 'active' : ''}`}
                      onClick={() => toggleNotification(key)}
                      aria-pressed={notifications[key]}
                    >
                      <span />
                    </button>
                  </label>
                ))}
              </div>
            </section>

            <section className="profile-card">
              <div className="section-heading">
                <h2>Security & Account Settings</h2>
                <span className="muted-pill">Secure</span>
              </div>
              <div className="settings-stack">
                <div className="setting-item">
                  <span className="setting-icon"><ShieldCheck size={16} /></span>
                  <div>
                    <strong>Username</strong>
                    <p>{profile.username}</p>
                  </div>
                </div>
                <div className="setting-item">
                  <span className="setting-icon"><Lock size={16} /></span>
                  <div>
                    <strong>Change Password</strong>
                    <p>Update credentials regularly</p>
                  </div>
                </div>
                <div className="setting-item">
                  <span className="setting-icon"><ShieldCheck size={16} /></span>
                  <div>
                    <strong>Two-Factor Authentication</strong>
                    <p>Enabled</p>
                  </div>
                </div>
                <div className="setting-item">
                  <span className="setting-icon"><BellRing size={16} /></span>
                  <div>
                    <strong>Last Login</strong>
                    <p>{profile.lastLogin}</p>
                  </div>
                </div>
                <div className="setting-item">
                  <span className="setting-icon"><CheckCircle2 size={16} /></span>
                  <div>
                    <strong>Account Status</strong>
                    <p>{profile.accountStatus}</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="profile-card">
              <div className="section-heading">
                <h2>Professional Links</h2>
                <span className="muted-pill">External</span>
              </div>
              <div className="link-stack">
                <a href={profile.linkedin} target="_blank" rel="noreferrer">
                  <span><Globe2 size={15} /></span> LinkedIn Profile
                </a>
                <a href={profile.companyWebsite} target="_blank" rel="noreferrer">
                  <span><MapPin size={15} /></span> Company Website
                </a>
              </div>
            </section>
          </div>

          <section className="profile-card action-card">
            <div className="action-buttons">
              <button className="primary-action" type="button">Save Changes</button>
              <button className="secondary-action" type="button">Cancel</button>
              <button className="secondary-action" type="button">Change Password</button>
              <button className="secondary-action" type="button">Upload Profile Picture</button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default RecruiterProfilePage;
