import React, { useState, useEffect } from 'react';
import { Briefcase, Users, Clock, Check } from 'lucide-react';
import './VacancySelectorModal.css';

export const MOCK_VACANCIES = [
  {
    id: 1,
    title: 'Software Engineer',
    code: '#1023',
    status: 'Active',
    postedTime: 'Posted 12 days ago',
    totalApplicants: 48,
    avgScore: '72%',
    lastMatched: '2 mins ago',
    lastMatchedBy: 'By Admin Recruiter',
    applicantsCountSubtext: '+12 since last run',
    engineConfidence: 'Engine Confidence: High',
    insightText: 'The matching engine has prioritised React and AWS for this role. Check the Job Parsing preview to adjust weighted skill importance.',
  },
  {
    id: 2,
    title: 'Product Manager',
    code: '#1024',
    status: 'Active',
    postedTime: 'Posted 5 days ago',
    totalApplicants: 14,
    avgScore: '81%',
    lastMatched: '1 hour ago',
    lastMatchedBy: 'By Senior Recruiter',
    applicantsCountSubtext: '+3 since last run',
    engineConfidence: 'Engine Confidence: Very High',
    insightText: 'The matching engine has prioritised Product Strategy and Agile Roadmap for this role. Check the Job Parsing preview to adjust weighted skill importance.',
  },
  {
    id: 3,
    title: 'UX Designer',
    code: '#1025',
    status: 'Closed',
    postedTime: 'Posted 20 days ago',
    totalApplicants: 35,
    avgScore: '79%',
    lastMatched: '2 days ago',
    lastMatchedBy: 'By HR Assistant',
    applicantsCountSubtext: 'Finalized',
    engineConfidence: 'Engine Confidence: High',
    insightText: 'The matching engine has prioritised Figma prototyping and User Research for this role. Check the Job Parsing preview to adjust weighted skill importance.',
  }
];

function VacancySelectorModal({ onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    const hasChosen = sessionStorage.getItem('hasChosenVacancy');
    if (hasChosen !== 'true') {
      setIsOpen(true);
    }
  }, []);

  const handleConfirm = () => {
    if (!selectedId) return;
    sessionStorage.setItem('selectedVacancyId', selectedId.toString());
    sessionStorage.setItem('hasChosenVacancy', 'true');
    setIsOpen(false);
    if (onSelect) {
      onSelect(selectedId);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="vacancy-modal-overlay">
      <div className="vacancy-modal-container">
        <div className="vacancy-modal-header">
          <div className="vacancy-modal-icon-wrap">
            <Briefcase size={24} className="vacancy-modal-icon" />
          </div>
          <h2 className="vacancy-modal-title">Choose Job Opportunity</h2>
          <p className="vacancy-modal-subtitle">
            To view candidates, rankings, and shortlists, please select one of the active job opportunities below.
          </p>
        </div>

        <div className="vacancy-modal-body">
          <div className="vacancy-cards-list">
            {MOCK_VACANCIES.map((vac) => {
              const isSelected = selectedId === vac.id;
              return (
                <div
                  key={vac.id}
                  className={`vacancy-select-card ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => setSelectedId(vac.id)}
                >
                  <div className="vacancy-card-main">
                    <div className="vacancy-card-info">
                      <span className="vacancy-card-code">{vac.code}</span>
                      <h3 className="vacancy-card-title">{vac.title}</h3>
                      <div className="vacancy-card-meta">
                        <span className="vacancy-meta-item">
                          <Clock size={12} /> {vac.postedTime}
                        </span>
                        <span className="vacancy-meta-item">
                          <Users size={12} /> {vac.totalApplicants} Applicants
                        </span>
                      </div>
                    </div>
                    <div className="vacancy-card-status-wrap">
                      <span className={`vacancy-status-badge status-${vac.status.toLowerCase()}`}>
                        {vac.status}
                      </span>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="vacancy-selected-checkmark">
                      <Check size={16} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="vacancy-modal-footer">
          <button
            type="button"
            className="vacancy-confirm-btn"
            disabled={!selectedId}
            onClick={handleConfirm}
          >
            Select & Continue
          </button>
        </div>
      </div>
    </div>
  );
}

export default VacancySelectorModal;
