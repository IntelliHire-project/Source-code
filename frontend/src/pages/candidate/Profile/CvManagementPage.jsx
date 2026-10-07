import React, { useState, useContext, useEffect, useRef } from 'react';
import {
  CheckCircle2,
  ChevronLeft,
  Download,
  FileText,
  Trash2,
  Upload,
  AlertCircle,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CandidatePageContext } from '../CandidateDashboard/CandidateDashboard';
import {
  getCandidateCVs,
  uploadCandidateCV,
  setActiveCandidateCV,
  downloadCandidateCV,
  deleteCandidateCV,
} from '../../../api/authApi';

function formatDoc(item) {
  if (!item) return null;
  return {
    id: item.id,
    filename: item.cv_name || item.filename || 'CV Document',
    url: item.cv_url || item.url || '',
    uploadDate: item.created_at
      ? new Date(item.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : item.uploadDate || 'Recently',
    size: item.file_size || item.size || 'PDF Document',
    status: item.is_active ? 'active' : 'archived',
  };
}

function CvManagementPage() {
  const { setPageLabel } = useContext(CandidatePageContext);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const activeDoc =
    documents.find((d) => d.status === 'active') ||
    (documents.length > 0 ? documents[0] : null);

  useEffect(() => {
    setPageLabel('CV MANAGEMENT');
  }, [setPageLabel]);

  // Load CV documents from backend
  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const res = await getCandidateCVs();
      const rawCvs =
        res?.cvs ||
        res?.data?.cvs ||
        (Array.isArray(res?.data) ? res.data : []) ||
        (Array.isArray(res) ? res : []);
      const formatted = rawCvs.map(formatDoc).filter(Boolean);
      setDocuments(formatted);
    } catch (err) {
      console.error('Error fetching CVs:', err);
      setFeedback({
        type: 'error',
        message: 'Could not load your uploaded CVs. Please refresh or try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  async function handleSetActive(id) {
    try {
      await setActiveCandidateCV(id);
      await fetchDocuments();
      setFeedback({
        type: 'success',
        message: 'Active CV updated successfully.',
      });
    } catch (err) {
      console.error('Error setting active CV:', err);
      setFeedback({
        type: 'error',
        message: 'Failed to update active CV. Please try again.',
      });
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this CV from your history?')) {
      return;
    }
    try {
      await deleteCandidateCV(id);
      await fetchDocuments();
      setFeedback({
        type: 'success',
        message: 'CV deleted successfully.',
      });
    } catch (err) {
      console.error('Error deleting CV:', err);
      setFeedback({
        type: 'error',
        message: 'Failed to delete CV. Please try again.',
      });
    }
  }

  function handleUploadNew() {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  }

  async function handleDownload(doc) {
    if (!doc?.id) {
      setFeedback({
        type: 'error',
        message: 'Document ID is not available.',
      });
      return;
    }
    try {
      const blob = await downloadCandidateCV(doc.id);
      if (!blob || blob.size === 0) {
        throw new Error('Downloaded file is empty (0 bytes).');
      }
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = doc.filename || 'resume.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      setFeedback(null);
    } catch (err) {
      console.error('Download error:', err);
      setFeedback({
        type: 'error',
        message: 'Failed to download CV file. Please try again.',
      });
    }
  }

  async function handleFileChange(e) {
    const file = e.target?.files?.[0];
    if (!file) return;

    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (fileExt !== '.pdf' && file.type !== 'application/pdf') {
      setFeedback({
        type: 'error',
        message: 'Invalid file format. Only PDF files (.pdf) are allowed.',
      });
      if (e.target) e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFeedback({
        type: 'error',
        message: 'File size exceeds 5MB limit. Please upload a smaller PDF.',
      });
      if (e.target) e.target.value = '';
      return;
    }

    try {
      setIsUploading(true);
      setFeedback(null);

      // Uploading new CV (automatically becomes active, archiving previous)
      const res = await uploadCandidateCV(file, true);
      const newCv = res?.cv || res?.data?.cv || res?.data;
      if (newCv && newCv.id) {
        const formatted = formatDoc(newCv);
        setDocuments((prev) => [
          formatted,
          ...prev.map((d) => ({ ...d, status: 'archived' })),
        ]);
      }
      await fetchDocuments();
      setFeedback({
        type: 'success',
        message: `CV "${file.name}" uploaded successfully and set as active document. Previous CV moved to history.`,
      });
    } catch (err) {
      console.error('Error uploading CV:', err);
      const errorMsg =
        err.response?.data?.message || 'Failed to upload CV. Please try again.';
      setFeedback({
        type: 'error',
        message: errorMsg,
      });
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileChange({ target: { files } });
    }
  };

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

      {/* ── Top Navigation Bar ── */}
      <div className="cv-management__top-nav">
        <button
          type="button"
          className="cv-management__back-btn"
          onClick={() => navigate('/candidate/profile')}
          title="Back to Candidate Profile"
          aria-label="Back to Candidate Profile"
        >
          <ChevronLeft size={18} />
        </button>
      </div>

      {/* ── Feedback Notification ── */}
      {feedback && (
        <div
          className={`cv-management__alert cv-management__alert--${feedback.type}`}
          role="alert"
        >
          <div className="cv-management__alert-content">
            {feedback.type === 'success' ? (
              <CheckCircle2 size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            className="cv-management__alert-close"
            onClick={() => setFeedback(null)}
            aria-label="Close notification"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* ── Loading Spinner ── */}
      {isLoading ? (
        <div className="cv-loading-wrap card-surface">
          <div className="cv-spinner" />
          <p>Loading your CV records...</p>
        </div>
      ) : documents.length === 0 ? (
        /* ── Empty State ── */
        <div
          className={`cv-empty-state ${isDragging ? 'cv-empty-state--dragover' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="cv-empty-state__icon-wrap">
            <Upload size={28} />
          </div>
          <h2 className="cv-empty-state__title">No CV uploaded yet</h2>
          <p className="cv-empty-state__desc">
            Upload your curriculum vitae in PDF format (up to 5MB). It will be securely stored
            and automatically used for AI job matching and application submissions.
          </p>
          <button
            type="button"
            className="candidate-btn candidate-btn--accent"
            onClick={handleUploadNew}
            disabled={isUploading}
          >
            <Upload size={14} />
            {isUploading ? 'Uploading & Processing...' : 'Upload Your First CV'}
          </button>
        </div>
      ) : (
        <>
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
                <div className="cv-active-banner__note">
                  Currently used for all AI job matching and recruiter evaluations
                </div>
              </div>
              <div className="cv-active-banner__actions">
                <button
                  type="button"
                  className="candidate-btn candidate-btn--ghost"
                  onClick={() => handleDownload(activeDoc)}
                >
                  <Download size={14} />
                  Download
                </button>
                <button
                  type="button"
                  className="candidate-btn candidate-btn--accent"
                  onClick={handleUploadNew}
                  disabled={isUploading}
                >
                  <Upload size={14} />
                  {isUploading ? 'Uploading...' : 'Upload New CV'}
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
              <span className="cv-history-header__types">
                Accepted types: .PDF (Max 5MB)
              </span>
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
                    className={`cv-table__row ${
                      doc.status === 'active' ? 'cv-table__row--active' : ''
                    }`}
                  >
                    <td className="cv-table__cell cv-table__cell--file">
                      <div className="cv-table__file-icon">
                        <FileText size={16} />
                      </div>
                      <span>{doc.filename}</span>
                    </td>
                    <td className="cv-table__cell cv-table__cell--muted">
                      {doc.uploadDate}
                    </td>
                    <td className="cv-table__cell cv-table__cell--muted">{doc.size}</td>
                    <td className="cv-table__cell">
                      <span className={`cv-status-pill cv-status-pill--${doc.status}`}>
                        {doc.status === 'active' ? 'ACTIVE' : 'ARCHIVED'}
                      </span>
                    </td>
                    <td className="cv-table__cell cv-table__cell--actions">
                      <div className="cv-actions">
                        {doc.status !== 'active' && (
                          <button
                            type="button"
                            className="cv-action-btn cv-action-btn--activate"
                            title="Set as Active CV"
                            onClick={() => handleSetActive(doc.id)}
                          >
                            <CheckCircle2 size={15} />
                          </button>
                        )}
                        <button
                          type="button"
                          className="cv-action-btn"
                          title="Download PDF"
                          onClick={() => handleDownload(doc)}
                        >
                          <Download size={14} />
                        </button>
                        <button
                          type="button"
                          className="cv-action-btn cv-action-btn--danger"
                          title="Delete"
                          onClick={() => handleDelete(doc.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* ── Footer note ── */}
          <footer className="cv-history-footer">
            End of history &mdash; showing {documents.length} document
            {documents.length !== 1 ? 's' : ''}
          </footer>
        </>
      )}
    </div>
  );
}

export default CvManagementPage;
