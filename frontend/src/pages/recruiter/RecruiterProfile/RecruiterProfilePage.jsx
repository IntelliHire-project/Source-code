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
  X,
  Eye,
  EyeOff,
  Save,
} from 'lucide-react';
import RecruiterSidebar from '../../../components/common/RecruiterSidebar';
import TopBar from '../../../components/TopBar/TopBar';
import { useAuth } from '../../../hooks/useAuth';
import { changePassword } from '../../../api/authApi';
import '../../../style.css';
import './RecruiterProfilePage.css';

const getInitialProfile = (user) => {
  if (!user) return {};
  
  const nameParts = (user.fullName || '').split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  
  return {
    firstName,
    lastName,
    workEmail: user.email || '',
    contactNumber: '',
    jobTitle: '',
    department: '',
    employeeId: '',
    companyName: '',
    industry: '',
    companyWebsite: '',
    companyAddress: '',
    companyDescription: '',
    yearsExperience: '',
    hiringSpecializations: '',
    preferredLocations: '',
    employmentTypes: [],
    bio: '',
    linkedin: '',
    username: user.email?.split('@')[0] || '',
    lastLogin: 'Today',
    accountStatus: 'Active',
  };
};

function RecruiterProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(() => getInitialProfile(user));
  const [initialProfile, setInitialProfile] = useState(() => getInitialProfile(user));
  const [notifications, setNotifications] = useState({
    email: true,
    alerts: true,
    reminders: true,
    aiMatches: true,
    reports: false,
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState(() => getInitialProfile(user));
  const [activeTab, setActiveTab] = useState('personal');
  const completionPercent = 30;

  // Change Password States
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMessage({ type: '', text: '' });

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Please fill in all fields.' });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New password and confirm password do not match.' });
      return;
    }

    setPasswordLoading(true);
    
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordMessage({ type: 'success', text: 'Password successfully updated.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to update password. Please try again later.';
      setPasswordMessage({ type: 'error', text: errorMsg });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  }, []);

  const toggleNotification = useCallback((key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleSidebarToggle = useCallback(() => setSidebarOpen((prev) => !prev), []);
  const handleSidebarClose = useCallback(() => setSidebarOpen(false), []);

  const handleEditClick = useCallback(() => {
    setEditFormData(profile);
    setEditModalOpen(true);
  }, [profile]);

  const handleEditClose = useCallback(() => {
    setEditModalOpen(false);
  }, []);

  const handleEditChange = useCallback((event) => {
    const { name, value } = event.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSaveProfile = useCallback(() => {
    setProfile(editFormData);
    setInitialProfile(editFormData);
    setEditModalOpen(false);
  }, [editFormData]);

  const handleSaveMainProfile = useCallback(() => {
    setInitialProfile(profile);
    alert('Profile changes saved successfully!');
  }, [profile]);

  const handleCancelMainProfile = useCallback(() => {
    setProfile(initialProfile);
  }, [initialProfile]);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  return (
    <div className="create-vacancy vm-shell">
      <RecruiterSidebar
        isOpen={sidebarOpen}
        onClose={handleSidebarClose}
        activeItem="Profile"
      />

      <div className="create-vacancy__main">
        <TopBar
          user={{ name: user?.fullName || 'Recruiter', role: profile.jobTitle || 'Recruiter' }}
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
                  <button className="edit-profile-btn" type="button" onClick={handleEditClick}>
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
                    <button className="security-item__action" onClick={() => setChangePasswordModalOpen(true)}>Change</button>
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
            <button className="btn btn--primary" type="button" onClick={handleSaveMainProfile}>Save Changes</button>
            <button className="btn btn--secondary" type="button" onClick={handleCancelMainProfile}>Cancel</button>
          </section>

          {/* Edit Profile Modal */}
          {editModalOpen && (
            <div className="modal-overlay" onClick={handleEditClose}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <div className="modal-header__title">
                    <Edit3 size={20} />
                    <div>
                      <h2>Edit Profile</h2>
                      <p>Update your profile information</p>
                    </div>
                  </div>
                  <button className="modal-close-btn" type="button" onClick={handleEditClose}>
                    <X size={20} />
                  </button>
                </div>
                <div className="modal-body">
                  <div className="modal-tabs">
                    <button 
                      className={`modal-tab ${activeTab === 'personal' ? 'modal-tab--active' : ''}`} 
                      onClick={() => handleTabChange('personal')}
                    >
                      Personal
                    </button>
                    <button 
                      className={`modal-tab ${activeTab === 'company' ? 'modal-tab--active' : ''}`} 
                      onClick={() => handleTabChange('company')}
                    >
                      Company
                    </button>
                    <button 
                      className={`modal-tab ${activeTab === 'professional' ? 'modal-tab--active' : ''}`} 
                      onClick={() => handleTabChange('professional')}
                    >
                      Professional
                    </button>
                  </div>
                  <div className="modal-form">
                    {activeTab === 'personal' && (
                      <>
                        <div className="form-section">
                          <h3 className="form-section__title">Basic Information</h3>
                          <div className="form-row">
                            <div className="form-field">
                              <label htmlFor="editFirstName">First Name</label>
                              <input
                                id="editFirstName"
                                name="firstName"
                                value={editFormData.firstName}
                                onChange={handleEditChange}
                                placeholder="Enter first name"
                              />
                            </div>
                            <div className="form-field">
                              <label htmlFor="editLastName">Last Name</label>
                              <input
                                id="editLastName"
                                name="lastName"
                                value={editFormData.lastName}
                                onChange={handleEditChange}
                                placeholder="Enter last name"
                              />
                            </div>
                          </div>
                          <div className="form-row">
                            <div className="form-field">
                              <label htmlFor="editWorkEmail">Work Email</label>
                              <input
                                id="editWorkEmail"
                                name="workEmail"
                                type="email"
                                value={editFormData.workEmail}
                                onChange={handleEditChange}
                                placeholder="Enter work email"
                              />
                            </div>
                            <div className="form-field">
                              <label htmlFor="editContactNumber">Contact Number</label>
                              <input
                                id="editContactNumber"
                                name="contactNumber"
                                type="tel"
                                value={editFormData.contactNumber}
                                onChange={handleEditChange}
                                placeholder="Enter contact number"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="form-section">
                          <h3 className="form-section__title">Work Details</h3>
                          <div className="form-row">
                            <div className="form-field">
                              <label htmlFor="editJobTitle">Job Title</label>
                              <input
                                id="editJobTitle"
                                name="jobTitle"
                                value={editFormData.jobTitle}
                                onChange={handleEditChange}
                                placeholder="Enter job title"
                              />
                            </div>
                            <div className="form-field">
                              <label htmlFor="editDepartment">Department</label>
                              <input
                                id="editDepartment"
                                name="department"
                                value={editFormData.department}
                                onChange={handleEditChange}
                                placeholder="Enter department"
                              />
                            </div>
                          </div>
                          <div className="form-field">
                            <label htmlFor="editEmployeeId">Employee ID</label>
                            <input
                              id="editEmployeeId"
                              name="employeeId"
                              value={editFormData.employeeId}
                              onChange={handleEditChange}
                              placeholder="Enter employee ID"
                            />
                          </div>
                        </div>
                      </>
                    )}
                    {activeTab === 'company' && (
                      <>
                        <div className="form-section">
                          <h3 className="form-section__title">Company Information</h3>
                          <div className="form-row">
                            <div className="form-field">
                              <label htmlFor="editCompanyName">Company Name</label>
                              <input
                                id="editCompanyName"
                                name="companyName"
                                value={editFormData.companyName}
                                onChange={handleEditChange}
                                placeholder="Enter company name"
                              />
                            </div>
                            <div className="form-field">
                              <label htmlFor="editIndustry">Industry</label>
                              <input
                                id="editIndustry"
                                name="industry"
                                value={editFormData.industry}
                                onChange={handleEditChange}
                                placeholder="Enter industry"
                              />
                            </div>
                          </div>
                          <div className="form-row">
                            <div className="form-field">
                              <label htmlFor="editCompanyWebsite">Company Website</label>
                              <input
                                id="editCompanyWebsite"
                                name="companyWebsite"
                                type="url"
                                value={editFormData.companyWebsite}
                                onChange={handleEditChange}
                                placeholder="https://example.com"
                              />
                            </div>
                            <div className="form-field">
                              <label htmlFor="editCompanyAddress">Company Address</label>
                              <input
                                id="editCompanyAddress"
                                name="companyAddress"
                                value={editFormData.companyAddress}
                                onChange={handleEditChange}
                                placeholder="Enter company address"
                              />
                            </div>
                          </div>
                          <div className="form-field">
                            <label htmlFor="editCompanyDescription">Company Description</label>
                            <textarea
                              id="editCompanyDescription"
                              name="companyDescription"
                              value={editFormData.companyDescription}
                              onChange={handleEditChange}
                              rows="3"
                              placeholder="Brief company description"
                            />
                          </div>
                        </div>
                      </>
                    )}
                    {activeTab === 'professional' && (
                      <>
                        <div className="form-section">
                          <h3 className="form-section__title">Professional Details</h3>
                          <div className="form-row">
                            <div className="form-field">
                              <label htmlFor="editYearsExperience">Years of Experience</label>
                              <input
                                id="editYearsExperience"
                                name="yearsExperience"
                                value={editFormData.yearsExperience}
                                onChange={handleEditChange}
                                placeholder="e.g., 5+"
                              />
                            </div>
                            <div className="form-field">
                              <label htmlFor="editHiringSpecializations">Specializations</label>
                              <input
                                id="editHiringSpecializations"
                                name="hiringSpecializations"
                                value={editFormData.hiringSpecializations}
                                onChange={handleEditChange}
                                placeholder="e.g., Engineering, Design"
                              />
                            </div>
                          </div>
                          <div className="form-row">
                            <div className="form-field">
                              <label htmlFor="editPreferredLocations">Preferred Locations</label>
                              <input
                                id="editPreferredLocations"
                                name="preferredLocations"
                                value={editFormData.preferredLocations}
                                onChange={handleEditChange}
                                placeholder="e.g., Colombo, Remote"
                              />
                            </div>
                            <div className="form-field">
                              <label htmlFor="editEmploymentTypes">Employment Types</label>
                              <input
                                id="editEmploymentTypes"
                                name="employmentTypes"
                                value={editFormData.employmentTypes.join(', ')}
                                onChange={handleEditChange}
                                placeholder="e.g., Full-time, Part-time"
                              />
                            </div>
                          </div>
                          <div className="form-field">
                            <label htmlFor="editBio">Professional Bio</label>
                            <textarea
                              id="editBio"
                              name="bio"
                              value={editFormData.bio}
                              onChange={handleEditChange}
                              rows="4"
                              placeholder="Write a brief professional bio"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn--secondary" type="button" onClick={handleEditClose}>Cancel</button>
                  <button className="btn btn--primary" type="button" onClick={handleSaveProfile}>Save Changes</button>
                </div>
              </div>
            </div>
          )}
          {/* Change Password Modal */}
          {changePasswordModalOpen && (
            <div className="modal-overlay" onClick={() => setChangePasswordModalOpen(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <div className="modal-header__title">
                    <Lock size={20} />
                    <div>
                      <h2>Change Password</h2>
                      <p>Update your account password</p>
                    </div>
                  </div>
                  <button className="modal-close-btn" type="button" onClick={() => setChangePasswordModalOpen(false)}>
                    <X size={20} />
                  </button>
                </div>
                <div className="modal-body">
                  <form onSubmit={handleChangePasswordSubmit} className="modal-form" style={{ gap: '20px' }}>
                    <div className="form-field">
                      <label>Current Password</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter current password"
                          style={{ paddingRight: '40px', width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '6px' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-muted)'
                          }}
                        >
                          {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="form-field">
                      <label>New Password</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                          style={{ paddingRight: '40px', width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '6px' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-muted)'
                          }}
                        >
                          {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="form-field">
                      <label>Confirm New Password</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                          style={{ paddingRight: '40px', width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '6px' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-muted)'
                          }}
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    {passwordMessage.text && (
                      <div style={{ 
                        padding: '12px', 
                        borderRadius: '6px', 
                        backgroundColor: passwordMessage.type === 'error' ? 'rgba(255, 59, 48, 0.1)' : 'rgba(52, 199, 89, 0.1)',
                        color: passwordMessage.type === 'error' ? '#ff3b30' : '#34c759',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        marginTop: '10px'
                      }}>
                        {passwordMessage.type === 'success' && <ShieldCheck size={16} />}
                        {passwordMessage.text}
                      </div>
                    )}

                    <div className="modal-footer" style={{ marginTop: '20px' }}>
                      <button className="btn btn--secondary" type="button" onClick={() => setChangePasswordModalOpen(false)}>Cancel</button>
                      <button className="btn btn--primary" type="submit" disabled={passwordLoading}>
                        <Save size={14} />
                        {passwordLoading ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default RecruiterProfilePage;
