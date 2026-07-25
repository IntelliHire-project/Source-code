import React, { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  ExternalLink,
  MoreVertical,
  XCircle,
  CheckCircle2,
  Calendar,
  User,
  Building,
  ChevronRight,
  Plus,
  X,
  ChevronDown,
  Check,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import TopBar from '../../../components/TopBar/TopBar';
import AdminSidebar from '../../../components/common/AdminSidebar';
import './VerifyRecruiters.css';

// Seeding Mock Verification Requests
const INITIAL_REQUESTS = [
  {
    id: 1,
    companyName: 'Nexus Talent Partners',
    contactName: 'Sarah Jenkins',
    date: 'Oct 24, 2023',
    status: 'Pending',
    ref: 'REG-8820-01',
    regId: '10229-883-XP',
    taxId: 'VAT-992-001',
    operatingEntity: 'Nexus Global Group LTD',
    employeeCount: '50 - 200',
    submissionTime: 'Oct 24, 2023, 10:45 AM',
    website: 'www.nexustalent.io',
    category: 'Professional Recruitment Services',
    logoColor: '#F0B90B',
    notes: [
      {
        id: 101,
        author: 'MODERATOR SYSTEM',
        time: '2 HOURS AGO',
        text: 'Automatic domain check passed. The business registration number matches the UK Companies House database. Cross-referencing LinkedIn presence now.'
      }
    ]
  },
  {
    id: 2,
    companyName: 'Global Headhunters Inc.',
    contactName: 'Marcus Vane',
    date: 'Oct 23, 2023',
    status: 'Reviewing',
    ref: 'REG-4491-03',
    regId: '88301-442-LA',
    taxId: 'VAT-109-882',
    operatingEntity: 'Global Headhunters International',
    employeeCount: '201 - 500',
    submissionTime: 'Oct 23, 2023, 02:15 PM',
    website: 'www.globalheadhunters.com',
    category: 'Executive Staffing',
    logoColor: '#6B8CFF',
    notes: [
      {
        id: 102,
        author: 'SYSTEM MONITOR',
        time: '1 DAY AGO',
        text: 'Initial file upload virus check passed. Domain ownership verified via DNS TXT record.'
      },
      {
        id: 103,
        author: 'Julian Thorne',
        time: '4 HOURS AGO',
        text: 'Manually contacting corporate registrar due to minor spelling discrepancy in holding entity name.'
      }
    ]
  },
  {
    id: 3,
    companyName: 'Apex Executive Search',
    contactName: 'Elena Rodriguez',
    date: 'Oct 23, 2023',
    status: 'Flagged',
    ref: 'REG-9910-12',
    regId: '99281-002-NY',
    taxId: 'VAT-772-990',
    operatingEntity: 'Apex Group NY LLC',
    employeeCount: '10 - 49',
    submissionTime: 'Oct 23, 2023, 09:30 AM',
    website: 'www.apexexecsearch.com',
    category: 'C-Suite Executive Search',
    logoColor: '#E63946',
    notes: [
      {
        id: 104,
        author: 'FRAUD PREVENTION BOT',
        time: '2 DAYS AGO',
        text: 'FLAGGED: Domain name does not match official corporate registration. Email address uses a free domain (@gmail.com). Flagged for verification call.'
      }
    ]
  },
  {
    id: 4,
    companyName: 'Velocity Staffing Solutions',
    contactName: 'David Kim',
    date: 'Oct 22, 2023',
    status: 'Pending',
    ref: 'REG-1102-45',
    regId: '22108-993-TX',
    taxId: 'VAT-221-506',
    operatingEntity: 'Velocity Staffing Inc.',
    employeeCount: '50 - 200',
    submissionTime: 'Oct 22, 2023, 04:20 PM',
    website: 'www.velocitystaffing.com',
    category: 'Tech Contingent Staffing',
    logoColor: '#22C55E',
    notes: [
      {
        id: 105,
        author: 'MODERATOR SYSTEM',
        time: '2 DAYS AGO',
        text: 'Awaiting automatic registry check from Texas SOS database.'
      }
    ]
  },
  {
    id: 5,
    companyName: 'Stellar Hires',
    contactName: 'Amina Okoro',
    date: 'Oct 22, 2023',
    status: 'Pending',
    ref: 'REG-8822-77',
    regId: '55431-889-UK',
    taxId: 'VAT-883-112',
    operatingEntity: 'Stellar Consulting LTD',
    employeeCount: '1 - 9',
    submissionTime: 'Oct 22, 2023, 11:15 AM',
    website: 'www.stellarhires.co.uk',
    category: 'Creative & Design Staffing',
    logoColor: '#A79E8C',
    notes: [
      {
        id: 106,
        author: 'Julian Thorne',
        time: '3 HOURS AGO',
        text: 'Startup verification. Linked website is active and lists current LinkedIn profiles. Corporate registration matches UK Companies House.'
      }
    ]
  },
  {
    id: 6,
    companyName: 'Infinite Tech Talent',
    contactName: 'Tom Richards',
    date: 'Oct 21, 2023',
    status: 'Pending',
    ref: 'REG-5561-89',
    regId: '11029-774-CA',
    taxId: 'VAT-665-223',
    operatingEntity: 'Infinite Tech Partners LLC',
    employeeCount: '500+',
    submissionTime: 'Oct 21, 2023, 01:10 PM',
    website: 'www.infinitetech.io',
    category: 'Enterprise IT Placement',
    logoColor: '#6B8CFF',
    notes: [
      {
        id: 107,
        author: 'MODERATOR SYSTEM',
        time: '3 DAYS AGO',
        text: 'Automatic domain check passed. Digital signature verified on official filing document.'
      }
    ]
  },
  // Seeding filler items to match mockup numbers: Pending (18), Reviewing (4), Flagged (2)
  // Total pending: 6 detailed + 12 simple
  ...Array.from({ length: 12 }, (_, i) => ({
    id: 10 + i,
    companyName: `Pending Recruiter Partner ${i + 1}`,
    contactName: `John Doe ${i + 1}`,
    date: 'Oct 20, 2023',
    status: 'Pending',
    ref: `REG-1000-${10 + i}`,
    regId: `REG-ID-P-${10 + i}`,
    taxId: `VAT-TAX-P-${10 + i}`,
    operatingEntity: `Entity Pending Corp ${i + 1}`,
    employeeCount: '10 - 49',
    submissionTime: 'Oct 20, 2023, 09:00 AM',
    website: `www.pendingcorp${i + 1}.com`,
    category: 'General Staffing Solutions',
    logoColor: '#8E9AA6',
    notes: []
  })),
  // Total In Review: 1 detailed + 3 simple
  ...Array.from({ length: 3 }, (_, i) => ({
    id: 30 + i,
    companyName: `Reviewing Recruiter Agency ${i + 1}`,
    contactName: `Jane Smith ${i + 1}`,
    date: 'Oct 19, 2023',
    status: 'Reviewing',
    ref: `REG-2000-${30 + i}`,
    regId: `REG-ID-R-${30 + i}`,
    taxId: `VAT-TAX-R-${30 + i}`,
    operatingEntity: `Entity Reviewing Corp ${i + 1}`,
    employeeCount: '50 - 200',
    submissionTime: 'Oct 19, 2023, 11:30 AM',
    website: `www.reviewingcorp${i + 1}.com`,
    category: 'Specialized Placements',
    logoColor: '#8E9AA6',
    notes: []
  })),
  // Total Flagged: 1 detailed + 1 simple
  ...Array.from({ length: 1 }, (_, i) => ({
    id: 40 + i,
    companyName: `Flagged Entity Search`,
    contactName: `James Peterson`,
    date: 'Oct 18, 2023',
    status: 'Flagged',
    ref: `REG-3000-40`,
    regId: `REG-ID-F-40`,
    taxId: `VAT-TAX-F-40`,
    operatingEntity: `Flagged Holding LLC`,
    employeeCount: '500+',
    submissionTime: 'Oct 18, 2023, 03:45 PM',
    website: `www.flaggedcorp.com`,
    category: 'Overseas Recruiting',
    logoColor: '#E63946',
    notes: [
      {
        id: 110,
        author: 'FRAUD ALERT SYSTEM',
        time: '5 DAYS AGO',
        text: 'Duplicate tax identifier detected. Matching entity already registered.'
      }
    ]
  }))
];

function VerifyRecruiters() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [selectedId, setSelectedId] = useState(1); // Default to Nexus Talent Partners
  const [activeTab, setActiveTab] = useState('Pending'); // 'Pending', 'Reviewing', 'Flagged'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals for actions
  const [actionModal, setActionModal] = useState({ open: false, type: '', data: null }); // type: 'Approve' | 'Reject'
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');

  // Total Verification Queue Count (Pending + Reviewing + Flagged)
  const totalQueueCount = useMemo(() => {
    return requests.filter(r => r.status === 'Pending' || r.status === 'Reviewing' || r.status === 'Flagged').length;
  }, [requests]);

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      Pending: requests.filter(r => r.status === 'Pending').length,
      Reviewing: requests.filter(r => r.status === 'Reviewing').length,
      Flagged: requests.filter(r => r.status === 'Flagged').length,
    };
  }, [requests]);

  // Filtered requests list
  const filteredRequests = useMemo(() => {
    return requests
      .filter((r) => {
        // Tab Filter
        if (r.status !== activeTab) return false;
        
        // Search Filter
        if (searchQuery.trim() !== '') {
          const query = searchQuery.toLowerCase();
          return (
            r.companyName.toLowerCase().includes(query) ||
            r.contactName.toLowerCase().includes(query) ||
            r.regId.toLowerCase().includes(query)
          );
        }
        return true;
      });
  }, [requests, activeTab, searchQuery]);

  // Selected Recruiter Object
  const selectedRecruiter = useMemo(() => {
    const found = requests.find(r => r.id === selectedId);
    // If current selected is not in filtered list, fall back to first item in filtered list
    if (!found) return filteredRequests[0] || null;
    return found;
  }, [requests, selectedId, filteredRequests]);

  // Handle Tab Switch
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Reset selected recruiter to first in the switched tab
    const firstInTab = requests.find(r => r.status === tab);
    if (firstInTab) {
      setSelectedId(firstInTab.id);
    }
  };

  // Add Note Handler
  const handleAddNoteSubmit = (e) => {
    e.preventDefault();
    if (!newNoteText.trim() || !selectedRecruiter) return;

    const newNote = {
      id: Date.now(),
      author: 'Julian Thorne',
      time: 'JUST NOW',
      text: newNoteText.trim()
    };

    setRequests(prev => prev.map(r => {
      if (r.id === selectedRecruiter.id) {
        return {
          ...r,
          notes: [newNote, ...r.notes]
        };
      }
      return r;
    }));

    setNewNoteText('');
    setNoteModalOpen(false);
  };

  // Action Handler (Approve / Reject)
  const triggerAction = (type, data) => {
    setActionModal({ open: true, type, data });
  };

  const handleActionConfirm = () => {
    const { type, data } = actionModal;
    if (!data) return;

    setRequests(prev => prev.map(r => {
      if (r.id === data.id) {
        // If approved, we can change status to 'Approved'
        // If rejected, we can change status to 'Rejected'
        return {
          ...r,
          status: type === 'Approve' ? 'Approved' : 'Rejected'
        };
      }
      return r;
    }));

    // Find next available item in the filtered list to auto-select
    const currentIndex = filteredRequests.findIndex(r => r.id === data.id);
    let nextSelectedId = null;
    if (filteredRequests.length > 1) {
      if (currentIndex < filteredRequests.length - 1) {
        nextSelectedId = filteredRequests[currentIndex + 1].id;
      } else {
        nextSelectedId = filteredRequests[currentIndex - 1].id;
      }
    }
    
    if (nextSelectedId) {
      setSelectedId(nextSelectedId);
    }

    setActionModal({ open: false, type: '', data: null });
  };

  return (
    <div className="admin-theme admin-dashboard">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeItem="Companies"
      />

      <div className="admin-dashboard__main">
        {/* ── Standard TopBar ── */}
        <TopBar
          user={{ name: 'Admin User', role: 'System Controller' }}
          notificationsCount={5}
          searchPlaceholder="Search across system..."
          onSearch={(q) => console.log('Global search:', q)}
          onHamburgerClick={() => setSidebarOpen(true)}
        />



        <main className="verifier-content">
          {/* Header */}
          <div className="verifier-content-header">
            <div className="verifier-title-block">
              <h1 className="verifier-page-title">Recruiter Verification</h1>
              <p className="verifier-page-subtitle">
                Review submitted business credentials for marketplace access.
              </p>
            </div>

            {/* Status Tabs */}
            <div className="verifier-tabs">
              <button
                className={`verifier-tab-btn verifier-tab-btn--pending ${activeTab === 'Pending' ? 'is-active' : ''}`}
                onClick={() => handleTabChange('Pending')}
              >
                Pending ({tabCounts.Pending})
              </button>
              <button
                className={`verifier-tab-btn verifier-tab-btn--review ${activeTab === 'Reviewing' ? 'is-active' : ''}`}
                onClick={() => handleTabChange('Reviewing')}
              >
                In Review ({tabCounts.Reviewing})
              </button>
              <button
                className={`verifier-tab-btn verifier-tab-btn--flagged ${activeTab === 'Flagged' ? 'is-active' : ''}`}
                onClick={() => handleTabChange('Flagged')}
              >
                Flagged ({tabCounts.Flagged})
              </button>
            </div>
          </div>

          {/* Verification Workspace Split Layout */}
          <div className="verifier-workspace-grid">
            {/* Left requests list */}
            <div className="verifier-list-column">
              <div className="verifier-requests-list">
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((req) => (
                    <div
                      key={req.id}
                      className={`verifier-request-card ${selectedId === req.id ? 'is-selected' : ''}`}
                      onClick={() => setSelectedId(req.id)}
                    >
                      <div
                        className="verifier-request-logo"
                        style={{ backgroundColor: req.logoColor || '#3A3F50' }}
                      >
                        <Building size={16} />
                      </div>
                      <div className="verifier-request-details">
                        <h4 className="verifier-company-name">
                          {req.companyName}
                          {req.status === 'Flagged' && (
                            <AlertTriangle size={14} className="flagged-warn-icon" />
                          )}
                        </h4>
                        <div className="verifier-company-meta">
                          <span className="meta-contact"><User size={12} /> {req.contactName}</span>
                          <span className="meta-dot">•</span>
                          <span className="meta-date"><Calendar size={12} /> {req.date}</span>
                        </div>
                      </div>
                      <div className="verifier-request-badge-area">
                        <span className={`verifier-status-badge verifier-status-badge--${req.status.toLowerCase()}`}>
                          {req.status === 'Reviewing' ? 'Reviewing' : req.status}
                        </span>
                      </div>
                      <ChevronRight size={18} className="verifier-card-chevron" />
                    </div>
                  ))
                ) : (
                  <div className="verifier-empty-state">
                    No requests matching the selection criteria.
                  </div>
                )}
              </div>

              {filteredRequests.length > 5 && (
                <div className="verifier-load-more-container">
                  <button className="verifier-load-more-btn">
                    Load More Requests
                  </button>
                </div>
              )}
            </div>

            {/* Right inspection detail pane */}
            <div className="verifier-detail-column">
              {selectedRecruiter ? (
                <div className="verifier-detail-panel">
                  {/* Panel Header */}
                  <div className="verifier-detail-header">
                    <div
                      className="verifier-detail-logo"
                      style={{ backgroundColor: selectedRecruiter.logoColor || '#3A3F50' }}
                    >
                      <Building size={24} />
                    </div>
                    <div className="verifier-detail-title-info">
                      <h2 className="verifier-detail-company">{selectedRecruiter.companyName}</h2>
                      <div className="verifier-detail-meta-row">
                        <span className="verifier-detail-category">{selectedRecruiter.category}</span>
                        <span className="verifier-meta-dot">•</span>
                        <a
                          href={`https://${selectedRecruiter.website}`}
                          target="_blank"
                          rel="noreferrer"
                          className="verifier-detail-link"
                        >
                          {selectedRecruiter.website}
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                    <button className="verifier-detail-action-menu">
                      <MoreVertical size={20} />
                    </button>
                  </div>

                  {/* Document Box */}
                  <div className="verifier-document-section">
                    <div className="verifier-doc-section-header">
                      <span className="verifier-doc-section-title">BUSINESS REGISTRATION DOCUMENT</span>
                      <span className="verifier-doc-ref-badge">Ref: {selectedRecruiter.ref}</span>
                    </div>

                    <div className="verifier-doc-preview-box">
                      <div className="verifier-doc-preview-header-line"></div>
                      <div className="verifier-doc-preview-content">
                        <div className="verifier-doc-seal">
                          <span className="seal-text">OFFICIAL SEAL</span>
                        </div>
                        <div className="verifier-doc-sig">
                          <span className="sig-text">Digital Signature Verified</span>
                        </div>
                        <div className="verifier-doc-watermark">
                          CONFIDENTIAL - FOR INTERNAL USE ONLY
                        </div>
                      </div>
                    </div>

                    <button className="verifier-doc-audit-btn">
                      View Full Screen Audit Trail
                    </button>
                  </div>

                  {/* Detail Grid */}
                  <div className="verifier-details-grid">
                    <div className="verifier-details-row">
                      <span className="verifier-detail-label">Registration ID</span>
                      <span className="verifier-detail-value font-mono">{selectedRecruiter.regId}</span>
                    </div>
                    <div className="verifier-details-row">
                      <span className="verifier-detail-label">Tax Identification</span>
                      <span className="verifier-detail-value font-mono">{selectedRecruiter.taxId}</span>
                    </div>
                    <div className="verifier-details-row">
                      <span className="verifier-detail-label">Operating Entity</span>
                      <span className="verifier-detail-value">{selectedRecruiter.operatingEntity}</span>
                    </div>
                    <div className="verifier-details-row">
                      <span className="verifier-detail-label">Employee Count</span>
                      <span className="verifier-detail-value">{selectedRecruiter.employeeCount}</span>
                    </div>
                    <div className="verifier-details-row">
                      <span className="verifier-detail-label">Submission Date</span>
                      <span className="verifier-detail-value">{selectedRecruiter.submissionTime}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="verifier-actions-row">
                    <button
                      className="verifier-btn verifier-btn--reject"
                      onClick={() => triggerAction('Reject', selectedRecruiter)}
                    >
                      <XCircle size={18} />
                      <span>Reject Request</span>
                    </button>
                    <button
                      className="verifier-btn verifier-btn--approve"
                      onClick={() => triggerAction('Approve', selectedRecruiter)}
                    >
                      <CheckCircle2 size={18} />
                      <span>Approve Recruiter</span>
                    </button>
                  </div>

                  {/* Internal Review Notes */}
                  <div className="verifier-notes-section">
                    <div className="verifier-notes-header">
                      <span className="verifier-notes-title">INTERNAL REVIEW NOTES</span>
                      <button
                        className="verifier-add-note-btn"
                        onClick={() => setNoteModalOpen(true)}
                      >
                        Add Note
                      </button>
                    </div>

                    <div className="verifier-notes-list">
                      {selectedRecruiter.notes && selectedRecruiter.notes.length > 0 ? (
                        selectedRecruiter.notes.map((note) => (
                          <div key={note.id} className="verifier-note-card">
                            <div className="verifier-note-header">
                              <span className="verifier-note-author">{note.author}</span>
                              <span className="verifier-note-time">{note.time}</span>
                            </div>
                            <p className="verifier-note-text">"{note.text}"</p>
                          </div>
                        ))
                      ) : (
                        <div className="verifier-notes-empty">
                          No internal review notes added.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="verifier-detail-empty">
                  Select a recruiter verification request to inspect details.
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Confirmation Dialog Modal */}
      {actionModal.open && (
        <div className="verifier-modal-overlay" onClick={() => setActionModal({ open: false, type: '', data: null })}>
          <div className="verifier-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="verifier-modal-header">
              <h3 className="verifier-modal-title">
                {actionModal.type === 'Approve' ? 'Approve Marketplace Access?' : 'Reject Access Request?'}
              </h3>
              <button
                className="verifier-modal-close"
                onClick={() => setActionModal({ open: false, type: '', data: null })}
              >
                <X size={18} />
              </button>
            </div>
            <div className="verifier-modal-body">
              <p>
                Are you sure you want to <strong>{actionModal.type.toLowerCase()}</strong> access for{' '}
                <strong>{actionModal.data?.companyName}</strong>?
              </p>
              <p className="verifier-modal-help-text">
                {actionModal.type === 'Approve'
                  ? 'This will immediately enable job vacancy postings and access to candidates.'
                  : 'This will notify the company manager and move the request to rejected state.'}
              </p>
            </div>
            <div className="verifier-modal-footer">
              <button
                className="verifier-btn verifier-btn--cancel"
                onClick={() => setActionModal({ open: false, type: '', data: null })}
              >
                Cancel
              </button>
              <button
                className={`verifier-btn ${actionModal.type === 'Approve' ? 'verifier-btn--approve-solid' : 'verifier-btn--reject-solid'}`}
                onClick={handleActionConfirm}
              >
                Confirm {actionModal.type}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Note Modal */}
      {noteModalOpen && (
        <div className="verifier-modal-overlay" onClick={() => setNoteModalOpen(false)}>
          <div className="verifier-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="verifier-modal-header">
              <h3 className="verifier-modal-title">Add Review Note</h3>
              <button className="verifier-modal-close" onClick={() => setNoteModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddNoteSubmit}>
              <div className="verifier-modal-body">
                <div className="verifier-form-group">
                  <label className="verifier-form-label" htmlFor="new-note-textarea">
                    Review comments/observations
                  </label>
                  <textarea
                    id="new-note-textarea"
                    rows="4"
                    className="verifier-form-textarea"
                    placeholder="Enter your observation or reference details..."
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>
              <div className="verifier-modal-footer">
                <button
                  type="button"
                  className="verifier-btn verifier-btn--cancel"
                  onClick={() => setNoteModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="verifier-btn verifier-btn--approve-solid">
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default VerifyRecruiters;
