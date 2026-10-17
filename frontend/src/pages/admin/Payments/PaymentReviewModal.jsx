import React, { useEffect, useState } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Download,
} from 'lucide-react';
import { fetchPaymentProofBlob } from '../../../api/paymentApi';
import './PaymentReviewModal.css';

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];

const extensionOf = (filename = '') => {
  const idx = filename.lastIndexOf('.');
  return idx > -1 ? filename.substring(idx + 1).toLowerCase() : '';
};

export default function PaymentReviewModal({
  payment,
  busy = false,
  onClose,
  onApprove,
  onReject,
}) {
  const [proofUrl, setProofUrl] = useState('');
  const [proofLoading, setProofLoading] = useState(false);
  const [proofError, setProofError] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');

  useEffect(() => {
    setShowReject(false);
    setReason('');
    setReasonError('');
  }, [payment?.rawId]);

  useEffect(() => {
    if (!payment) return undefined;

    let active = true;
    let objectUrl = '';

    setProofUrl('');
    setProofError('');
    setProofLoading(true);

    fetchPaymentProofBlob(payment.rawId)
      .then((blob) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setProofUrl(objectUrl);
      })
      .catch(() => {
        if (!active) return;
        setProofError('Could not load the payment slip. It may have been removed.');
      })
      .finally(() => {
        if (active) setProofLoading(false);
      });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [payment]);

  if (!payment) return null;

  const isPending = payment.dbStatus === 'pending';
  const extension = extensionOf(payment.proofFilename);
  const isImage = IMAGE_EXTENSIONS.includes(extension);

  const handleRejectSubmit = () => {
    if (!reason.trim()) {
      setReasonError('Please provide a reason for rejecting this payment slip.');
      return;
    }
    setReasonError('');
    onReject(payment, reason.trim());
  };

  return (
    <div className="pm-overlay" onClick={onClose}>
      <div className="pm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pm-header">
          <div>
            <h2 className="pm-title">Bank Transfer Verification</h2>
            <p className="pm-subtitle">
              {payment.company} · {payment.id}
            </p>
          </div>
          <button className="pm-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="pm-body">
          {/* Slip preview */}
          <div className="pm-preview">
            <div className="pm-preview__label">PAYMENT SLIP</div>
            <div className="pm-preview__frame">
              {proofLoading && <div className="pm-preview__state">Loading slip…</div>}
              {!proofLoading && proofError && (
                <div className="pm-preview__state pm-preview__state--error">{proofError}</div>
              )}
              {!proofLoading && !proofError && proofUrl && isImage && (
                <img src={proofUrl} alt="Payment slip" className="pm-preview__img" />
              )}
              {!proofLoading && !proofError && proofUrl && !isImage && (
                <iframe
                  src={proofUrl}
                  title="Payment slip"
                  className="pm-preview__frame-content"
                />
              )}
            </div>
            {proofUrl && (
              <a
                className="pm-preview__download"
                href={proofUrl}
                download={payment.proofFilename || `payment-slip-${payment.rawId}`}
              >
                <Download size={14} /> Download slip
              </a>
            )}
          </div>

          {/* Details + decision */}
          <div className="pm-side">
            <div className="pm-info">
              <div className="pm-info__row">
                <span>Recruiter</span>
                <strong>{payment.recruiterName}</strong>
              </div>
              {payment.recruiterEmail && (
                <div className="pm-info__row">
                  <span>Email</span>
                  <strong>{payment.recruiterEmail}</strong>
                </div>
              )}
              <div className="pm-info__row">
                <span>Job Title</span>
                <strong>{payment.jobTitle}</strong>
              </div>
              <div className="pm-info__row">
                <span>Reference</span>
                <strong>{payment.id}</strong>
              </div>
              <div className="pm-info__row">
                <span>Amount</span>
                <strong>{`${payment.currency} ${payment.amount.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`}</strong>
              </div>
              <div className="pm-info__row">
                <span>Uploaded</span>
                <strong>{payment.date}</strong>
              </div>
              <div className="pm-info__row">
                <span>Status</span>
                <strong className={`pm-status pm-status--${payment.dbStatus}`}>
                  {payment.dbStatus === 'pending' ? (
                    <>
                      <Clock size={12} /> Pending
                    </>
                  ) : payment.dbStatus === 'paid' ? (
                    <>
                      <CheckCircle2 size={12} /> Approved
                    </>
                  ) : (
                    <>
                      <XCircle size={12} /> Rejected
                    </>
                  )}
                </strong>
              </div>
            </div>

            {isPending ? (
              <>
                {showReject && (
                  <div className="pm-reject">
                    <label htmlFor="pm-reason">Rejection reason</label>
                    <textarea
                      id="pm-reason"
                      rows={3}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Explain why this payment slip is being rejected…"
                      disabled={busy}
                    />
                    {reasonError && <span className="pm-reject__error">{reasonError}</span>}
                  </div>
                )}

                <div className="pm-actions">
                  {showReject ? (
                    <>
                      <button
                        type="button"
                        className="pm-btn pm-btn--danger"
                        onClick={handleRejectSubmit}
                        disabled={busy}
                      >
                        <XCircle size={16} /> {busy ? 'Rejecting…' : 'Confirm Reject'}
                      </button>
                      <button
                        type="button"
                        className="pm-btn pm-btn--ghost"
                        onClick={() => {
                          setShowReject(false);
                          setReasonError('');
                        }}
                        disabled={busy}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="pm-btn pm-btn--success"
                        onClick={() => onApprove(payment)}
                        disabled={busy}
                      >
                        <CheckCircle2 size={16} /> {busy ? 'Approving…' : 'Approve & Publish'}
                      </button>
                      <button
                        type="button"
                        className="pm-btn pm-btn--danger"
                        onClick={() => setShowReject(true)}
                        disabled={busy}
                      >
                        <XCircle size={16} /> Reject
                      </button>
                    </>
                  )}
                </div>
                <p className="pm-hint">
                  <FileText size={13} /> Approving publishes the recruiter's vacancy. Rejecting
                  keeps it pending and notifies the recruiter with your reason.
                </p>
              </>
            ) : (
              <div className={`pm-outcome pm-outcome--${payment.dbStatus}`}>
                {payment.dbStatus === 'paid' ? (
                  <p>This payment was approved. The recruiter's vacancy has been published.</p>
                ) : (
                  <>
                    <p className="pm-outcome__title">Rejection reason</p>
                    <p className="pm-outcome__reason">
                      {payment.rejectionReason || 'No reason recorded.'}
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
