import React, { useState, useContext, useEffect } from 'react';
import { CandidatePageContext } from '../CandidateDashboard/CandidateDashboard';
import { KeyRound, ShieldCheck, Save, Eye, EyeOff } from 'lucide-react';
import { changePassword } from '../../../api/authApi';
import '../../../styles/candidate.css';

function SettingsPage() {
  const { setPageLabel } = useContext(CandidatePageContext);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    setPageLabel('SETTINGS');
  }, [setPageLabel]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: 'Please fill in all fields.' });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New password and confirm password do not match.' });
      return;
    }

    setLoading(true);
    
    // Real API call for changing password
    try {
      await changePassword(currentPassword, newPassword);
      
      setMessage({ type: 'success', text: 'Password successfully updated.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to update password. Please try again later.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="candidate-profile-content">
      <section className="candidate-grid">
        <div className="candidate-column">
          <article className="candidate-panel card-surface">
            <div className="candidate-panel__header candidate-panel__header--spread">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <KeyRound size={20} />
                <h2>Change Password</h2>
              </div>
            </div>
            
            <form onSubmit={handleChangePassword} className="candidate-form-grid" style={{ marginTop: '20px' }}>
              <div className="candidate-form-grid__wide">
                <label className="candidate-field">
                  <span className="candidate-field__label">Current Password</span>
                  <div style={{ position: 'relative' }}>
                    <input
                      className="candidate-input"
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      style={{ paddingRight: '40px' }}
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
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0'
                      }}
                    >
                      {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </label>
              </div>
              
              <div className="candidate-form-grid__wide">
                <label className="candidate-field">
                  <span className="candidate-field__label">New Password</span>
                  <div style={{ position: 'relative' }}>
                    <input
                      className="candidate-input"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      style={{ paddingRight: '40px' }}
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
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0'
                      }}
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </label>
              </div>

              <div className="candidate-form-grid__wide">
                <label className="candidate-field">
                  <span className="candidate-field__label">Confirm New Password</span>
                  <div style={{ position: 'relative' }}>
                    <input
                      className="candidate-input"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      style={{ paddingRight: '40px' }}
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
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0'
                      }}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </label>
              </div>

              {message.text && (
                <div className={`candidate-form-grid__wide`} style={{ 
                  padding: '12px', 
                  borderRadius: '6px', 
                  backgroundColor: message.type === 'error' ? 'rgba(255, 59, 48, 0.1)' : 'rgba(52, 199, 89, 0.1)',
                  color: message.type === 'error' ? '#ff3b30' : '#34c759',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px'
                }}>
                  {message.type === 'success' && <ShieldCheck size={16} />}
                  {message.text}
                </div>
              )}

              <div className="candidate-form-grid__wide" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button 
                  type="submit" 
                  className="candidate-btn candidate-btn--accent"
                  disabled={loading}
                >
                  <Save size={14} />
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </article>
        </div>

        <div className="candidate-rail">
          <article className="candidate-panel card-surface candidate-panel--compact">
            <div className="candidate-panel__header">
              <h2>Security Tips</h2>
            </div>
            <div className="candidate-info-stack" style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              <ul style={{ paddingLeft: '20px', margin: '0' }}>
                <li style={{ marginBottom: '8px' }}>Use at least 8 characters.</li>
                <li style={{ marginBottom: '8px' }}>Include a mix of uppercase and lowercase letters, numbers, and symbols.</li>
                <li style={{ marginBottom: '8px' }}>Do not use easily guessable information like your name or birthdate.</li>
                <li>Avoid using the same password for multiple online accounts.</li>
              </ul>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}

export default SettingsPage;
