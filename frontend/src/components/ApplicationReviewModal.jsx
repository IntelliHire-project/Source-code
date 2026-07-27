import React from 'react';
import {
  X,
  ShieldCheck,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  CalendarDays,
  Tag,
} from 'lucide-react';
import './ApplicationReviewModal.css';

function ApplicationReviewModal({ onConfirm, onClose }) {
  return (
    <div className="arm-overlay" onClick={onClose}>
      <div className="arm-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="arm-modal__top">
          <span className="arm-modal__badge">
            <ShieldCheck size={13} />
            REVIEW STEP
          </span>
          <button className="arm-modal__close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <h2 className="arm-modal__title">Confirm Application Details</h2>
        <p className="arm-modal__subtitle">
          Please review your information carefully. Once submitted, you cannot edit this application.
        </p>

        <div className="arm-modal__divider" />

        {/* Personal Information */}
        <section className="arm-modal__section">
          <h3 className="arm-modal__section-header">
            <User size={15} />
            PERSONAL INFORMATION
          </h3>
          <div className="arm-modal__card">
            <div className="arm-modal__row">
              <span className="arm-modal__row-label">Full Name</span>
              <span className="arm-modal__row-value">Michael Chen</span>
            </div>
            <div className="arm-modal__row">
              <span className="arm-modal__row-label">
                <Mail size={14} />
                Email Address
              </span>
              <span className="arm-modal__row-value">michael.chen@example.com</span>
            </div>
            <div className="arm-modal__row">
              <span className="arm-modal__row-label">
                <Phone size={14} />
                Phone Number
              </span>
              <span className="arm-modal__row-value">+44 7700 900123</span>
            </div>
            <div className="arm-modal__row arm-modal__row--last">
              <span className="arm-modal__row-label">
                <MapPin size={14} />
                Current Location
              </span>
              <span className="arm-modal__row-value">Manchester, UK</span>
            </div>
          </div>
        </section>

        {/* Professional Summary */}
        <section className="arm-modal__section">
          <h3 className="arm-modal__section-header">
            <Briefcase size={15} />
            PROFESSIONAL SUMMARY
          </h3>
          <div className="arm-modal__card">
            <div className="arm-modal__row">
              <span className="arm-modal__row-label">Current Role</span>
              <span className="arm-modal__row-value">Lead Developer at TechFlow</span>
            </div>
            <div className="arm-modal__row">
              <span className="arm-modal__row-label">Total Experience</span>
              <span className="arm-modal__row-value">7 Years</span>
            </div>
            <div className="arm-modal__row arm-modal__row--last">
              <span className="arm-modal__row-label">
                <Tag size={14} />
                Key Skills
              </span>
              <div className="arm-modal__skill-tags">
                <span className="arm-modal__skill-tag">React</span>
                <span className="arm-modal__skill-tag">Node.js</span>
                <span className="arm-modal__skill-tag">TypeScript</span>
                <span className="arm-modal__skill-tag">System Architecture</span>
                <span className="arm-modal__skill-tag">AWS</span>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="arm-modal__footer">
          <button className="arm-modal__btn arm-modal__btn--outline" onClick={onClose}>
            Go Back
          </button>
          <button className="arm-modal__btn arm-modal__btn--gold" onClick={onConfirm}>
            Confirm & Submit
          </button>
        </div>
      </div>
    </div>
  );
}

export default ApplicationReviewModal;
