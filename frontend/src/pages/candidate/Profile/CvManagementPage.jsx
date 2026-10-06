import React, { useState, useContext, useEffect, useRef } from 'react';
import {
  CheckCircle2,
  ChevronLeft,
  Download,
  FileText,
  MoreVertical,
  Pencil,
  Replace,
  Trash2,
  Upload,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CandidatePageContext } from '../CandidateDashboard/CandidateDashboard';
import { uploadCV } from '../../../api/userApi';

const INITIAL_DOCUMENTS = [
  {
    id: 1,
    filename: 'Alex_Rivera_CV_2024_Final.pdf',
    uploadDate: 'May 12, 2024',
    size: '245 KB',
    status: 'active',
  },
  {
    id: 2,
    filename: 'Alex_Rivera_CV_2024_Draft.pdf',
    uploadDate: 'Apr 28, 2024',
    size: '198 KB',
    status: 'archived',
  },
  {
    id: 3,
    filename: 'Alex_Rivera_CV_2023.pdf',
    uploadDate: 'Dec 15, 2023',
    size: '220 KB',
    status: 'archived',
  },
  {
    id: 4,
    filename: 'Alex_Rivera_Resume_2023.pdf',
    uploadDate: 'Sep 3, 2023',
    size: '156 KB',
    status: 'archived',
  },
];

function CvManagementPage() {
  const { setPageLabel } = useContext(CandidatePageContext);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [documents, setDocuments] = useState(INITIAL_DOCUMENTS);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const activeDoc = documents.find((d) => d.status === 'active');

  useEffect(() => {
    setPageLabel('CV MANAGEMENT');
  }, [setPageLabel]);

  function handleSetActive(id) {
    setDocuments((prev) =>
      prev.map((doc) => ({
        ...doc,
        status: doc.id === id ? 'active' : doc.status === 'active' ? 'archived' : doc.status,
      })),
    );
  }

  function handleDelete(id) {
    if (!window.confirm('Remove this document from history?')) return;
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  }

  function handleReplace(id) {
    fileInputRef.current?.click();
  }

  function handleUploadNew() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (fileExt !== '.pdf' && file.type !== 'application/pdf') {
      alert('Only PDF files are currently supported for AI processing.');
      e.target.value = '';
      return;
    }

    try {
      setIsUploading(true);
      const data = await uploadCV(file);
      
      const newDoc = {
        id: Date.now(),
        filename: file.name,
        uploadDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        size: `${Math.round(file.size / 1024)} KB`,
        status: 'active', // Make the new CV active by default
      };

      setDocuments((prev) => [
        newDoc,
        ...prev.map(d => ({ ...d, status: d.status === 'active' ? 'archived' : d.status }))
      ]);

      alert(`CV uploaded successfully! Extracted ${data.skills?.length || 0} skills.`);

    } catch (error) {
      console.error('Error uploading CV:', error);
      alert('Failed to upload and process CV.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  }

  return (
    <div className="cv-management">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="cv-management__file-input"
        onChange={handleFileChange}
        aria-hidden="true"
        tabIndex={-1}
      />

      <button
        type="button"
        className="cv-management__back-btn"
        onClick={() => navigate('/candidate/profile')}
      >
        <ChevronLeft size={16} />
      </button>

      {/* ── Active Document Banner ── */}
      {activeDoc && (
        <section className="cv-active-banner card-surface">
          <div className="cv-active-banner__icon">
            <CheckCircle2 size={20} />
          </div>
          <div className="cv-active-banner__content">
            <div className="cv-active-banner__top">
              <span className="cv-active-banner__tag">ACTIVE DOCUMENT</span>
              <span className="cv-active-banner__filename">{activeDoc.filename}</span>
            </div>
            <div className="cv-active-banner__meta">
              Uploaded {activeDoc.uploadDate} &middot; {activeDoc.size}
            </div>
            <div className="cv-active-banner__note">Currently used for all AI job matching</div>
          </div>
          <div className="cv-active-banner__actions">
            <button type="button" className="candidate-btn candidate-btn--ghost">
              View
            </button>
            <button type="button" className="candidate-btn candidate-btn--accent" onClick={() => handleReplace(activeDoc.id)}>
              <Replace size={14} />
              Replace
            </button>
          </div>
        </section>
      )}

      {/* ── Upload History Header ── */}
      <header className="cv-history-header">
        <div>
          <h1 className="cv-history-header__title">Upload History</h1>
          <p className="cv-history-header__subtitle">
            Manage and audit all previously uploaded curriculum vitae
          </p>
        </div>
        <div className="cv-history-header__right">
          <p className="cv-history-header__types">
            Accepted types: .PDF (Max 10MB)
          </p>
          <button type="button" className="candidate-btn candidate-btn--accent" onClick={handleUploadNew} disabled={isUploading}>
            <Upload size={14} />
            {isUploading ? 'Processing...' : 'Upload New CV'}
          </button>
        </div>
      </header>

      {/* ── File Table ── */}
      <section className="cv-table-wrap card-surface">
        <table className="cv-table">
          <thead>
            <tr>
              <th className="cv-table__th">File Name</th>
              <th className="cv-table__th">Upload Date</th>
              <th className="cv-table__th">Size</th>
              <th className="cv-table__th">Status</th>
              <th className="cv-table__th cv-table__th--right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr
                key={doc.id}
                className={`cv-table__row ${doc.status === 'active' ? 'cv-table__row--active' : ''}`}
              >
                <td className="cv-table__cell cv-table__cell--file">
                  <div className="cv-table__file-icon">
                    <FileText size={16} />
                  </div>
                  <span>{doc.filename}</span>
                </td>
                <td className="cv-table__cell cv-table__cell--muted">{doc.uploadDate}</td>
                <td className="cv-table__cell cv-table__cell--muted">{doc.size}</td>
                <td className="cv-table__cell">
                  <span className={`cv-status-pill cv-status-pill--${doc.status}`}>
                    {doc.status === 'active' ? 'ACTIVE' : 'ARCHIVED'}
                  </span>
                </td>
                <td className="cv-table__cell cv-table__cell--actions">
                  <div className="cv-actions">
                    <button type="button" className="cv-action-btn" title="View">
                      <FileText size={14} />
                    </button>
                    <button type="button" className="cv-action-btn" title="Download">
                      <Download size={14} />
                    </button>
                    <button type="button" className="cv-action-btn" title="Replace" onClick={() => handleReplace(doc.id)}>
                      <Pencil size={14} />
                    </button>
                    {doc.status !== 'active' && (
                      <button
                        type="button"
                        className="cv-action-btn cv-action-btn--danger"
                        title="Delete"
                        onClick={() => handleDelete(doc.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                    <div className="cv-kebab-wrap">
                      <button
                        type="button"
                        className="cv-action-btn"
                        title="More actions"
                        onClick={() => setOpenMenuId(openMenuId === doc.id ? null : doc.id)}
                      >
                        <MoreVertical size={14} />
                      </button>
                      {openMenuId === doc.id && (
                        <div className="cv-kebab-menu">
                          {doc.status !== 'active' && (
                            <button
                              type="button"
                              className="cv-kebab-item"
                              onClick={() => {
                                handleSetActive(doc.id);
                                setOpenMenuId(null);
                              }}
                            >
                              Set as Active
                            </button>
                          )}
                          <button
                            type="button"
                            className="cv-kebab-item cv-kebab-item--danger"
                            onClick={() => {
                              handleDelete(doc.id);
                              setOpenMenuId(null);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* ── Footer note ── */}
      <footer className="cv-history-footer">
        End of history &mdash; showing {documents.length} document{documents.length !== 1 ? 's' : ''}
      </footer>
    </div>
  );
}

export default CvManagementPage;
