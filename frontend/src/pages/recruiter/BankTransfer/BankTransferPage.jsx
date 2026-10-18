import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock3,
  FileUp,
  ShieldCheck,
} from 'lucide-react';
import RecruiterSidebar from '../../../components/common/RecruiterSidebar';
import TopBar from '../../../components/TopBar/TopBar';
import { submitBankTransfer } from '../../../api/paymentApi';
import '../../../style.css';
import './BankTransferPage.css';

const TOTAL_PAYABLE = 'LKR 2,497.50';

function BankTransferPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [paymentSlip, setPaymentSlip] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const vacancy = location.state?.formState || location.state?.vacancy;
  const paymentReference = useMemo(
    () => `IH-${Date.now().toString(36).toUpperCase()}`,
    []
  );

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setError('');
    if (!file) {
      setPaymentSlip(null);
      return;
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setPaymentSlip(null);
      setError('Choose a PDF, JPG, PNG, or WEBP payment slip.');
      event.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPaymentSlip(null);
      setError('Payment slip must be 5 MB or smaller.');
      event.target.value = '';
      return;
    }
    setPaymentSlip(file);
  };

  const handleSubmit = async () => {
    if (!vacancy) {
      setError('Vacancy details are missing. Return to the vacancy preview and start again.');
      return;
    }
    if (!paymentSlip) {
      setError('Upload your bank transfer slip to continue.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      const response = await submitBankTransfer({
        vacancy,
        paymentReference,
        paymentSlip,
      });
      navigate(`/recruiter/payment-status?reference=${encodeURIComponent(response.payment.payment_reference)}`, {
        state: {
          paymentStatus: 'pending',
          payment: response.payment,
          vacancyTitle: vacancy.jobTitle || vacancy.title,
        },
      });
    } catch (submitError) {
      setError(
        submitError.response?.data?.message
          || 'Could not submit the transfer. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-vacancy bt-shell">
      <RecruiterSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="create-vacancy__main">
        <TopBar
          user={{ name: 'Recruiter', role: 'Recruiter Account' }}
          breadcrumbItems={[
            { label: 'Recruitment', path: '/recruiter/dashboard' },
            { label: 'Select Payment Method', path: '/recruiter/select-payment' },
            { label: 'Bank Transfer' },
          ]}
          searchPlaceholder="Search..."
          onHamburgerClick={() => setSidebarOpen(true)}
        />

        <main className="bt-content">
          <button
            type="button"
            className="bt-back"
            onClick={() => navigate('/recruiter/select-payment', { state: location.state })}
          >
            <ArrowLeft size={16} />
            Back to payment methods
          </button>

          <header className="bt-header">
            <span className="bt-step">BANK TRANSFER</span>
            <h1>Transfer and upload your receipt</h1>
            <p>
              Pay for <strong>{vacancy?.jobTitle || vacancy?.title || 'your vacancy listing'}</strong>.
              Your listing remains pending until the transfer is verified and approved by an admin.
            </p>
          </header>

          <div className="bt-grid">
            <section className="bt-card">
              <h2><Building2 size={19} /> Bank account details</h2>
              <dl className="bt-details">
                <div><dt>Bank</dt><dd>Bank of Ceylon (BOC)</dd></div>
                <div><dt>Account holder</dt><dd>IntelliHire(Pvt)Ltd</dd></div>
                <div><dt>Account number</dt><dd>1112223456</dd></div>
                <div><dt>Branch</dt><dd>Thimbirigasyaya</dd></div>
                <div><dt>Amount to transfer</dt><dd>{TOTAL_PAYABLE}</dd></div>
                <div><dt>Transfer reference</dt><dd>{paymentReference}</dd></div>
              </dl>
              <p className="bt-instructions">
                Include the transfer reference in your bank transfer description. After making the
                transfer, upload a clear receipt or deposit slip below.
              </p>
            </section>

            <section className="bt-card bt-upload-card">
              <h2><FileUp size={19} /> Upload transfer slip</h2>
              <p className="bt-upload-copy">
                Accepted formats: PDF, JPG, PNG, or WEBP. Maximum file size: 5 MB.
              </p>
              <label className="bt-file-picker">
                <FileUp size={20} />
                <span>{paymentSlip ? paymentSlip.name : 'Choose your payment slip'}</span>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                />
              </label>
              {error && <p className="bt-error" role="alert">{error}</p>}
              <div className="bt-pending-note">
                <Clock3 size={17} />
                <span>After submission, payment status will remain pending until reviewed.</span>
              </div>
              <button
                type="button"
                className="btn btn-primary bt-submit"
                disabled={isSubmitting || !vacancy}
                onClick={handleSubmit}
              >
                <ShieldCheck size={17} />
                {isSubmitting ? 'Submitting slip…' : 'Submit for verification'}
              </button>
              <p className="bt-security">
                <CheckCircle2 size={14} />
                Your receipt is submitted securely for payment verification.
              </p>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default BankTransferPage;
