import React, { useState, useEffect } from 'react';
import { 
  User, 
  Shield, 
  Bell, 
  Mail, 
  Phone, 
  Key, 
  Smartphone, 
  Save, 
  Camera,
  Activity
} from 'lucide-react';
import AdminSidebar from '../../../components/common/AdminSidebar';
import TopBar from '../../../components/TopBar/TopBar';
import AdminToast from '../../../components/common/AdminToast';
import { getAdminProfile, saveAdminProfile, appendAuditLog } from '../../../services/adminStorage';
import './AdminProfile.css';

const INITIAL_PROFILE = {
  name: 'Julian Thorne',
  email: 'julian.t@intellihire.com',
  phone: '+1 (555) 123-4567',
  role: 'Senior Moderator',
  avatar: null, // placeholder initials JT
  notifications: {
    newUsers: true,
    systemAlerts: true,
    weeklyReport: false,
    securityAlerts: true
  },
  twoFactorEnabled: true,
};

export default function AdminProfile() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);
  
  const [profile, setProfile] = useState(() => getAdminProfile(INITIAL_PROFILE));
  const [activeTab, setActiveTab] = useState('general'); // 'general', 'security', 'preferences'

  // Editable form state (General)
  const [formData, setFormData] = useState({
    name: profile.name || '',
    email: profile.email || '',
    phone: profile.phone || '',
  });

  // Keep form in sync if profile changes
  useEffect(() => {
    setFormData({
      name: profile.name || '',
      email: profile.email || '',
      phone: profile.phone || '',
    });
  }, [profile]);

  const handleGeneralSave = (e) => {
    e.preventDefault();
    const updated = { ...profile, ...formData };
    setProfile(updated);
    saveAdminProfile(updated);
    appendAuditLog({
      actionType: 'Admin Profile Updated',
      module: 'ADMIN_SETTINGS',
    });
    setToast({ type: 'success', message: 'Profile details saved successfully.' });
  };

  const toggleNotification = (key) => {
    const updated = { 
      ...profile, 
      notifications: { 
        ...profile.notifications, 
        [key]: !profile.notifications[key] 
      } 
    };
    setProfile(updated);
    saveAdminProfile(updated);
    setToast({ type: 'success', message: 'Notification preferences updated.' });
  };

  const toggle2FA = () => {
    const updated = { ...profile, twoFactorEnabled: !profile.twoFactorEnabled };
    setProfile(updated);
    saveAdminProfile(updated);
    appendAuditLog({
      actionType: `2FA ${updated.twoFactorEnabled ? 'Enabled' : 'Disabled'}`,
      module: 'ADMIN_SECURITY',
      status: updated.twoFactorEnabled ? 'success' : 'warning'
    });
    setToast({ 
      type: updated.twoFactorEnabled ? 'success' : 'warning', 
      message: `Two-Factor Authentication is now ${updated.twoFactorEnabled ? 'enabled' : 'disabled'}.` 
    });
  };

  // Avatar placeholder generator
  const initials = formData.name ? formData.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'A';

  return (
    <div className="admin-theme admin-dashboard">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <AdminToast toast={toast} onDismiss={() => setToast(null)} />

      <div className="admin-dashboard__main ap-page">
        <TopBar
          user={{ name: profile.name, role: profile.role }}
          notificationsCount={3}
          onHamburgerClick={() => setSidebarOpen(true)}
          breadcrumbItems={[{ label: 'Admin', path: '/admin/dashboard' }, { label: 'My Profile' }]}
        />

        <div className="ap-content">
          <div className="ap-header">
            <h1 className="ap-header__title">Admin Profile</h1>
            <p className="ap-header__subtitle">Manage your personal details, security settings, and preferences.</p>
          </div>

          <div className="ap-layout">
            
            {/* Sidebar Navigation */}
            <aside className="ap-sidebar">
              <button 
                className={`ap-nav-btn ${activeTab === 'general' ? 'active' : ''}`}
                onClick={() => setActiveTab('general')}
                type="button"
              >
                <User size={16} /> General Details
              </button>
              <button 
                className={`ap-nav-btn ${activeTab === 'security' ? 'active' : ''}`}
                onClick={() => setActiveTab('security')}
                type="button"
              >
                <Shield size={16} /> Security
              </button>
              <button 
                className={`ap-nav-btn ${activeTab === 'preferences' ? 'active' : ''}`}
                onClick={() => setActiveTab('preferences')}
                type="button"
              >
                <Bell size={16} /> Preferences
              </button>
            </aside>

            {/* Main Content Area */}
            <main className="ap-main">
              
              {/* ── GENERAL TAB ── */}
              {activeTab === 'general' && (
                <div className="ap-card slide-fade">
                  <div className="ap-card__header">
                    <h2>General Details</h2>
                    <p>Update your personal information and contact details.</p>
                  </div>
                  
                  <div className="ap-profile-hero">
                    <div className="ap-avatar-wrapper">
                      <div className="ap-avatar">{initials}</div>
                      <button className="ap-avatar-edit" title="Change Avatar" type="button">
                        <Camera size={14} />
                      </button>
                    </div>
                    <div className="ap-hero-info">
                      <h3>{profile.role}</h3>
                      <p>Your role grants you full access to moderation tools.</p>
                    </div>
                  </div>

                  <form className="ap-form" onSubmit={handleGeneralSave}>
                    <div className="ap-form-group">
                      <label>Full Name</label>
                      <div className="ap-input-with-icon">
                        <User size={15} />
                        <input 
                          type="text" 
                          value={formData.name} 
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="ap-form-row">
                      <div className="ap-form-group">
                        <label>Email Address</label>
                        <div className="ap-input-with-icon">
                          <Mail size={15} />
                          <input 
                            type="email" 
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="ap-form-group">
                        <label>Phone Number</label>
                        <div className="ap-input-with-icon">
                          <Phone size={15} />
                          <input 
                            type="tel" 
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="ap-form-footer">
                      <button type="submit" className="ap-btn ap-btn--primary">
                        <Save size={15} /> Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* ── SECURITY TAB ── */}
              {activeTab === 'security' && (
                <div className="ap-card slide-fade">
                  <div className="ap-card__header">
                    <h2>Security Settings</h2>
                    <p>Manage your password and secure your account.</p>
                  </div>

                  <div className="ap-security-section">
                    <div className="ap-section-info">
                      <div className="ap-icon-box ap-icon-box--blue"><Key size={18} /></div>
                      <div>
                        <h3>Change Password</h3>
                        <p>It's a good idea to use a strong password that you're not using elsewhere.</p>
                      </div>
                    </div>
                    <form className="ap-form ap-form--inline" onSubmit={(e) => { e.preventDefault(); setToast({ type: 'success', message: 'Password updated securely.' }); }}>
                      <div className="ap-form-group">
                        <label>Current Password</label>
                        <input type="password" placeholder="••••••••" required />
                      </div>
                      <div className="ap-form-group">
                        <label>New Password</label>
                        <input type="password" placeholder="••••••••" required />
                      </div>
                      <button type="submit" className="ap-btn ap-btn--outline" style={{ alignSelf: 'flex-end', height: '40px' }}>
                        Update Password
                      </button>
                    </form>
                  </div>

                  <div className="ap-divider" />

                  <div className="ap-security-section">
                    <div className="ap-section-info">
                      <div className="ap-icon-box ap-icon-box--green"><Smartphone size={18} /></div>
                      <div>
                        <h3>Two-Factor Authentication (2FA)</h3>
                        <p>Add an extra layer of security to your admin account. Recommended.</p>
                      </div>
                    </div>
                    
                    <div className="ap-toggle-box">
                      <div className="ap-toggle-info">
                        <strong>Authenticator App</strong>
                        <span>Use an app like Google Authenticator or Authy.</span>
                      </div>
                      <button 
                        className={`ap-toggle-btn ${profile.twoFactorEnabled ? 'on' : 'off'}`}
                        onClick={toggle2FA}
                        type="button"
                      >
                        <div className="ap-toggle-knob" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="ap-divider" />
                  
                  <div className="ap-security-section">
                     <div className="ap-section-info">
                      <div className="ap-icon-box ap-icon-box--purple"><Activity size={18} /></div>
                      <div>
                        <h3>Active Sessions</h3>
                        <p>You are currently logged in from 1 device.</p>
                      </div>
                    </div>
                    <div className="ap-session-list">
                      <div className="ap-session-item">
                        <div className="ap-session-device">
                          <strong>Windows PC • Chrome</strong>
                          <span>192.168.1.1 — Active now</span>
                        </div>
                        <span className="ap-badge-current">Current Session</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── PREFERENCES TAB ── */}
              {activeTab === 'preferences' && (
                <div className="ap-card slide-fade">
                  <div className="ap-card__header">
                    <h2>Notification Preferences</h2>
                    <p>Choose what you want to be notified about via email.</p>
                  </div>

                  <div className="ap-pref-list">
                    <div className="ap-pref-item">
                      <div>
                        <h4>New User Signups</h4>
                        <p>Receive a daily digest of new candidate and recruiter registrations.</p>
                      </div>
                      <button 
                        className={`ap-toggle-btn ${profile.notifications?.newUsers ? 'on' : 'off'}`}
                        onClick={() => toggleNotification('newUsers')}
                        type="button"
                      >
                        <div className="ap-toggle-knob" />
                      </button>
                    </div>
                    
                    <div className="ap-pref-item">
                      <div>
                        <h4>System Alerts</h4>
                        <p>Critical errors, downtime, and server health notifications.</p>
                      </div>
                      <button 
                        className={`ap-toggle-btn ${profile.notifications?.systemAlerts ? 'on' : 'off'}`}
                        onClick={() => toggleNotification('systemAlerts')}
                        type="button"
                      >
                        <div className="ap-toggle-knob" />
                      </button>
                    </div>

                    <div className="ap-pref-item">
                      <div>
                        <h4>Security Alerts</h4>
                        <p>Multiple failed login attempts and permission changes.</p>
                      </div>
                      <button 
                        className={`ap-toggle-btn ${profile.notifications?.securityAlerts ? 'on' : 'off'}`}
                        onClick={() => toggleNotification('securityAlerts')}
                        type="button"
                      >
                        <div className="ap-toggle-knob" />
                      </button>
                    </div>

                    <div className="ap-pref-item">
                      <div>
                        <h4>Weekly Report</h4>
                        <p>A comprehensive report of platform activity sent every Monday.</p>
                      </div>
                      <button 
                        className={`ap-toggle-btn ${profile.notifications?.weeklyReport ? 'on' : 'off'}`}
                        onClick={() => toggleNotification('weeklyReport')}
                        type="button"
                      >
                        <div className="ap-toggle-knob" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
