import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CandidatePageContext } from '../CandidateDashboard/CandidateDashboard';
import {
  Clock,
  CheckCircle2,
  MessageSquare,
  HelpCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  X,
} from 'lucide-react';
import './MockInterviewSession.css';

const DEFAULT_SESSION_QUESTIONS = [
  {
    id: 1,
    category: 'Technical Architecture',
    question: 'Design a scalable rate limiter for a high-traffic microservices API. Explain the differences between Token Bucket and Leaky Bucket algorithms and how you handle distributed redis lock contention.',
    hint: 'Focus on request rate, algorithm trade-offs, distributed lock strategies, and failure fallback modes.',
  },
  {
    id: 2,
    category: 'Scenario Based',
    question: 'How would you approach a situation where a key project stakeholder suddenly changes the priority of a feature that is already 80% complete, potentially delaying the launch by two weeks?',
    hint: 'Structure your answer using the STAR method (Situation, Task, Action, Result). Focus on communication, trade-off analysis, and team morale.',
  },
  {
    id: 3,
    category: 'System Performance',
    question: 'An enterprise API endpoint has seen response latency degrade from 120ms to 4.2 seconds under heavy load. Walk us through your systematic step-by-step diagnostic and troubleshooting workflow.',
    hint: 'Detail APM metrics (CPU, Memory, DB connection pool), slow query logs, thread dumps, and caching strategies.',
  },
  {
    id: 4,
    category: 'Data Engineering',
    question: 'Implement an LRU Cache supporting O(1) time complexity for get and put operations using a Doubly Linked List and Hash Map under high concurrency.',
    hint: 'Detail thread safety mechanisms, lock granularity (ReentrantLock vs ConcurrentHashMap), and memory eviction policies.',
  },
  {
    id: 5,
    category: 'Security & Auth',
    question: 'Discuss OAuth2.0 vs JWT authentication architecture for multi-tenant microservices. How do you implement zero-downtime token revocation and refresh token rotation safely?',
    hint: 'Cover key pair rotation, token blacklisting in Redis, token payload security, and CORS headers.',
  },
  {
    id: 6,
    category: 'Leadership & Conflict',
    question: 'Describe a time when two senior engineers on your team strongly disagreed on system architecture choice. How did you facilitate alignment and ensure delivery without compromising quality?',
    hint: 'Focus on objective evaluation criteria, proof-of-concept benchmarks, team consensus building, and accountability.',
  },
];

export default function MockInterviewSession() {
  const location = useLocation();
  const navigate = useNavigate();
  const pageCtx = useContext(CandidatePageContext);

  useEffect(() => {
    if (pageCtx?.setPageLabel) {
      pageCtx.setPageLabel('MOCK INTERVIEWS');
    }
  }, [pageCtx]);

  const roleTitle = location.state?.roleTitle || 'Technical Strategy Lead Interview';
  const candidateName = location.state?.candidateName || 'Alexander Wright';
  const candidateId = location.state?.candidateId || '#9942';

  const questionsList = location.state?.questionsList || DEFAULT_SESSION_QUESTIONS;
  const initialIndex = location.state?.startIndex || 1; // Default to question 2 if wanted or index 0

  const [currentIndex, setCurrentIndex] = useState(
    initialIndex < questionsList.length ? initialIndex : 0
  );
  const [responses, setResponses] = useState(() => {
    const initialMap = {};
    questionsList.forEach((_, idx) => {
      initialMap[idx] = '';
    });
    return initialMap;
  });

  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [showHintModal, setShowHintModal] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  // 15 Minutes countdown timer
  const [timeLeft, setTimeLeft] = useState(14 * 60 + 52);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleResponseChange = (text) => {
    setResponses((prev) => ({
      ...prev,
      [currentIndex]: text,
    }));
    setIsAutoSaving(true);
    setTimeout(() => {
      setIsAutoSaving(false);
    }, 500);
  };

  const currentQ = questionsList[currentIndex] || DEFAULT_SESSION_QUESTIONS[0];
  const totalQ = questionsList.length;
  const remainingCount = totalQ - (currentIndex + 1);

  // Calculate overall completion based on answered questions
  const answeredCount = Object.values(responses).filter((r) => r && r.trim().length > 0).length;
  const completionPercent = Math.round((answeredCount / totalQ) * 100);

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentIndex < totalQ - 1) setCurrentIndex((prev) => prev + 1);
  };

  const handleSubmitInterview = () => {
    setShowSubmitConfirm(true);
  };

  const confirmFinalize = () => {
    setShowSubmitConfirm(false);
    navigate('/candidate/mock-interviews/feedback', {
      state: {
        roleTitle: roleTitle,
        sessionId: '#INT-99218',
        dateStr: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        candidateName: candidateName,
        score: 84,
      },
    });
  };

  const handleEndEarly = () => {
    if (window.confirm('Are you sure you want to end this interview session early?')) {
      navigate('/candidate/mock-interviews/questions');
    }
  };

  return (
    <div className="interview-session-container">
      {/* Header Bar */}
      <header className="session-header">
        <div className="session-header-left">
          <h2 className="session-role-title">{roleTitle}</h2>
          <div className="live-session-badge">
            <span className="pulse-dot"></span>
            LIVE SESSION
          </div>
        </div>

        <div className="session-header-right">
        </div>
      </header>

      <div className="session-content">
        {/* Top Status Banner Card */}
        <div className="top-status-card">
          <div className="status-item">
            <span className="status-label">POSITION</span>
            <span className="status-value">
              Question {currentIndex + 1} of {totalQ}
            </span>
          </div>

          <div className="status-divider"></div>

          <div className="status-item">
            <span className="status-label">REMAINING</span>
            <span className="status-value">{remainingCount} Questions Left</span>
          </div>

          <div className="status-right-timer">
            <div className="timer-box">
              <Clock size={18} className="timer-icon" />
              <div className="timer-text-group">
                <span className="timer-label">TIME REMAINING</span>
                <span className="timer-countdown">{formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Question & Response Card */}
        <div className="main-question-card">
          <div className="card-top-row">
            <div className="category-pill">{currentQ.category || 'Scenario Based'}</div>
            <button
              type="button"
              className="hint-help-btn"
              onClick={() => setShowHintModal(true)}
              title="View Guidance Hint"
            >
              <HelpCircle size={18} />
            </button>
          </div>

          <h1 className="question-prompt-text">{currentQ.question}</h1>

          <div className="response-header-row">
            <label className="response-label">YOUR RESPONSE</label>
            <span className="autosave-status">
              {isAutoSaving ? 'Auto-saving...' : 'Auto-saved'}
            </span>
          </div>

          <div className="textarea-wrapper">
            <textarea
              className="response-textarea"
              placeholder="Structure your answer using the STAR method (Situation, Task, Action, Result). Focus on communication, trade-off analysis, and team morale..."
              value={responses[currentIndex] || ''}
              onChange={(e) => handleResponseChange(e.target.value)}
              rows={10}
            />
          </div>

          <div className="card-footer-controls">
            <div className="completion-progress-group">
              <div className="completion-label-row">
                <span className="completion-title">OVERALL COMPLETION</span>
                <span className="completion-percentage">{completionPercent}% COMPLETE</span>
              </div>
              <div className="progress-bar-track">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${completionPercent}%` }}
                ></div>
              </div>
            </div>

            <div className="nav-and-submit-group">
              <div className="nav-buttons-pair">
                <button
                  type="button"
                  className="nav-control-btn prev-btn"
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>
                <button
                  type="button"
                  className="nav-control-btn next-btn"
                  onClick={handleNext}
                  disabled={currentIndex === totalQ - 1}
                >
                  Next Question
                  <ChevronRight size={16} />
                </button>
              </div>

              <button
                type="button"
                className="finalize-submit-btn"
                onClick={handleSubmitInterview}
              >
                <Check size={16} />
                Finalize &amp; Submit Interview
              </button>
            </div>
          </div>
        </div>

        {/* Bottom 3 Tip Cards */}
        <div className="tips-grid">
          <div className="tip-card">
            <div className="tip-icon-box">
              <MessageSquare size={18} />
            </div>
            <div className="tip-text-box">
              <h5>TONE ANALYSIS</h5>
              <p>
                Maintain a professional, collaborative tone throughout your spoken and written responses.
              </p>
            </div>
          </div>

          <div className="tip-card">
            <div className="tip-icon-box">
              <Clock size={18} />
            </div>
            <div className="tip-text-box">
              <h5>TIMING TIP</h5>
              <p>
                Aim for 3-4 minutes per response to ensure you cover depth without losing momentum.
              </p>
            </div>
          </div>

          <div className="tip-card">
            <div className="tip-icon-box">
              <CheckCircle2 size={18} />
            </div>
            <div className="tip-text-box">
              <h5>AUTO-SAVE</h5>
              <p>
                All responses are securely cached. You can return to previous questions if time permits.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bar */}
      <footer className="session-footer">
        <span className="copyright-text">
          &copy; 2024 AUREUS AI RECRUITMENT SYSTEMS
        </span>
        <div className="footer-links">
          <button type="button" className="footer-link-btn">
            PRIVACY PROTOCOL
          </button>
          <span className="bullet-dot">&bull;</span>
          <button type="button" className="footer-link-btn">
            CANDIDATE SUPPORT
          </button>
          <span className="bullet-dot">&bull;</span>
          <button
            type="button"
            className="footer-link-btn danger-link"
            onClick={handleEndEarly}
          >
            END SESSION EARLY
          </button>
        </div>
      </footer>

      {/* Hint Modal */}
      {showHintModal && (
        <div className="modal-backdrop" onClick={() => setShowHintModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Question Guidance</h3>
              <button type="button" className="close-btn" onClick={() => setShowHintModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p>{currentQ.hint || 'No specific hint provided for this question.'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="modal-backdrop" onClick={() => setShowSubmitConfirm(false)}>
          <div className="modal-box confirm-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Finalize &amp; Submit Interview?</h3>
              <button type="button" className="close-btn" onClick={() => setShowSubmitConfirm(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p>
                You have answered <strong>{answeredCount}</strong> out of {totalQ} questions ({completionPercent}% complete). Once submitted, your answers will be submitted for AI evaluation.
              </p>
            </div>
            <div className="modal-footer">
              <button type="button" className="modal-cancel-btn" onClick={() => setShowSubmitConfirm(false)}>
                Continue Session
              </button>
              <button type="button" className="modal-confirm-btn" onClick={confirmFinalize}>
                Submit Interview Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
