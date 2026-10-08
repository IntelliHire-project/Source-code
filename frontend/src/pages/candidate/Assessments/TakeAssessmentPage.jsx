import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Flag,
  ChevronLeft,
  ChevronRight,
  Send,
  Save,
  Play,
  FileCode,
  Award,
  HelpCircle,
  ArrowLeft,
  Lock,
  Sparkles,
  Info
} from 'lucide-react';
import './TakeAssessmentPage.css';

/* ── MOCK ASSESSMENT DATA FOR CANDIDATE ── */
const SAMPLE_ASSESSMENTS = {
  'A-001': {
    id: 'A-001',
    title: 'Senior Frontend Engineer Assessment',
    jobRole: 'Senior Software Engineer — React',
    company: 'TechFlow Systems',
    durationMinutes: 45,
    passingScore: 70,
    totalPoints: 100,
    instructions: [
      'Ensure a stable internet connection during the assessment session.',
      'Do not refresh or navigate away from the test window while the timer is active.',
      'Each question carries weightage based on complexity. Flag questions to review later.',
      'Coding assessments are evaluated against test cases and subject to interviewer review.'
    ],
    questions: [
      {
        id: 'Q1',
        title: 'React Virtual DOM & Reconciliation',
        category: 'Frontend Core',
        type: 'mcq',
        points: 15,
        prompt: 'Which of the following best describes React\'s Reconciliation algorithm when comparing Virtual DOM trees?',
        options: [
          'It re-renders every single node from the root down whenever state changes.',
          'It uses a heuristic O(n) algorithm by comparing element types and key attributes.',
          'It forces a full DOM re-parsing using innerHTML injection.',
          'It creates a synchronous thread block on the main browser thread.'
        ],
      },
      {
        id: 'Q2',
        title: 'State Management & Custom Hooks',
        category: 'React & Hooks',
        type: 'multi',
        points: 20,
        prompt: 'Which statements are TRUE regarding custom React hooks? (Select all that apply)',
        options: [
          'Custom hooks must always start with the keyword "use".',
          'Custom hooks can call other built-in or custom hooks.',
          'Custom hooks share state between different component instances.',
          'Custom hooks isolate stateful logic so each call gets isolated state.'
        ],
      },
      {
        id: 'Q3',
        title: 'Web Performance Optimization',
        category: 'Performance',
        type: 'text',
        points: 25,
        prompt: 'Explain how code-splitting, lazy loading, and React.memo improve web application performance under heavy load.',
      },
      {
        id: 'Q4',
        title: 'Algorithm: Array Debounce & Throttle Implementation',
        category: 'Coding Challenge',
        type: 'coding',
        points: 40,
        prompt: 'Implement a custom debounce function in JavaScript that delays invoking the target function until after `wait` milliseconds have elapsed since the last call.',
        defaultCode: `function debounce(func, wait) {\n  let timeout;\n  return function(...args) {\n    const context = this;\n    clearTimeout(timeout);\n    timeout = setTimeout(() => func.apply(context, args), wait);\n  };\n}\n\n// Test execution:\nconst log = () => console.log('Debounced Triggered!');\nconst debouncedLog = debounce(log, 300);\ndebouncedLog();`,
        language: 'javascript',
        sampleTestOutput: '✔ Test Case 1 (Single Call): PASSED\n✔ Test Case 2 (Burst Rapid Calls): PASSED (Execution delayed by 300ms)'
      }
    ]
  },
  'shortlist-2048': {
    id: 'shortlist-2048',
    title: 'Full Stack Engineering Evaluation',
    jobRole: 'Lead Full Stack Engineer',
    company: 'IntelliHire Tech',
    durationMinutes: 60,
    passingScore: 75,
    totalPoints: 100,
    instructions: [
      'You have 60 minutes to complete 3 questions.',
      'Auto-save is active every 5 seconds.',
      'Coding questions require manual technical review before final score confirmation.'
    ],
    questions: [
      {
        id: 'Q101',
        title: 'REST API & Idempotency',
        category: 'Backend Core',
        type: 'mcq',
        points: 30,
        prompt: 'Which HTTP method is naturally non-idempotent according to RFC specifications?',
        options: ['GET', 'PUT', 'DELETE', 'POST']
      },
      {
        id: 'Q102',
        title: 'Database Indexing Strategy',
        category: 'Databases',
        type: 'text',
        points: 30,
        prompt: 'Describe B-Tree vs Hash indexes in relational databases and when to choose compound indexes.'
      },
      {
        id: 'Q103',
        title: 'Coding Challenge: Two Sum Target Index',
        category: 'Coding Challenge',
        type: 'coding',
        points: 40,
        prompt: 'Write an efficient function that returns the indices of two numbers such that they add up to a target.',
        defaultCode: `function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const diff = target - nums[i];\n    if (map.has(diff)) {\n      return [map.get(diff), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}`,
        language: 'javascript',
        sampleTestOutput: '✔ Test Case 1: nums=[2,7,11,15], target=9 -> Output: [0,1] PASSED'
      }
    ]
  }
};

export default function TakeAssessmentPage() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();

  // Load assessment metadata or fallback to default
  const assessmentData = useMemo(() => {
    return SAMPLE_ASSESSMENTS[assessmentId] || SAMPLE_ASSESSMENTS['A-001'];
  }, [assessmentId]);

  // Assessment flow states
  const [showInstructions, setShowInstructions] = useState(true);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(assessmentData.durationMinutes * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('Saved');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Coding execution simulator states
  const [codeConsoleOut, setCodeConsoleOut] = useState('');
  const [isRunningCode, setIsRunningCode] = useState(false);

  const currentQuestion = assessmentData.questions[currentQIndex];

  // Timer Countdown Effect
  useEffect(() => {
    if (!isTimerRunning || isSubmitted) return;
    const interval = setInterval(() => {
      setTimeLeftSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinalSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, isSubmitted]);

  // Format Time string HH:MM:SS
  const formatTime = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Start Assessment Session
  const handleStartTest = () => {
    setShowInstructions(false);
    setIsTimerRunning(true);
  };

  // Answer selection handlers
  const handleOptionSelect = (optionIndex) => {
    const qId = currentQuestion.id;
    if (currentQuestion.type === 'multi') {
      const existing = userAnswers[qId] || [];
      const updated = existing.includes(optionIndex)
        ? existing.filter(i => i !== optionIndex)
        : [...existing, optionIndex];
      updateAnswer(qId, updated);
    } else {
      updateAnswer(qId, optionIndex);
    }
  };

  const handleTextAnswerChange = (val) => {
    updateAnswer(currentQuestion.id, val);
  };

  const handleCodeAnswerChange = (val) => {
    updateAnswer(currentQuestion.id, val);
  };

  const updateAnswer = (qId, val) => {
    setUserAnswers(prev => ({ ...prev, [qId]: val }));
    triggerAutoSave();
  };

  const triggerAutoSave = () => {
    setAutoSaveStatus('Saving...');
    setTimeout(() => {
      setAutoSaveStatus('Saved');
    }, 600);
  };

  const toggleFlagQuestion = (qId) => {
    setFlaggedQuestions(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  // Code Simulation runner
  const handleRunCode = () => {
    setIsRunningCode(true);
    setCodeConsoleOut('Running test cases against environment...');
    setTimeout(() => {
      setIsRunningCode(false);
      setCodeConsoleOut(currentQuestion.sampleTestOutput || '✔ Test execution completed successfully. All public test cases passed.');
    }, 900);
  };

  // Count metrics
  const totalQuestions = assessmentData.questions.length;
  const answeredCount = Object.keys(userAnswers).filter(k => {
    const ans = userAnswers[k];
    if (Array.isArray(ans)) return ans.length > 0;
    return ans !== undefined && ans !== '';
  }).length;
  const flaggedCount = Object.values(flaggedQuestions).filter(Boolean).length;
  const unansweredCount = totalQuestions - answeredCount;

  // Submit Handler
  const handleFinalSubmit = () => {
    setIsTimerRunning(false);
    setShowSubmitModal(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="cap-wrapper">
        <header className="cap-header">
          <div className="cap-brand">
            <div className="cap-logo-icon">IH</div>
            <div className="cap-title-block">
              <h1>IntelliHire Candidate Portal</h1>
              <span className="cap-subtitle">Assessment Submission</span>
            </div>
          </div>
        </header>

        <main className="cap-success-container">
          <div className="cap-success-icon">
            <CheckCircle2 size={44} />
          </div>
          <h2 className="cap-success-title">Assessment Submitted Successfully!</h2>
          <p className="cap-success-desc">
            Thank you for completing <strong>{assessmentData.title}</strong> for the position of{' '}
            <strong>{assessmentData.jobRole}</strong> at <strong>{assessmentData.company}</strong>.
          </p>

          <div className="cap-modal-summary" style={{ marginBottom: '32px' }}>
            <div className="cap-summary-card">
              <div className="cap-summary-num">{answeredCount}/{totalQuestions}</div>
              <div className="cap-summary-label">Questions Completed</div>
            </div>
            <div className="cap-summary-card">
              <div className="cap-summary-num">{formatTime(assessmentData.durationMinutes * 60 - timeLeftSeconds)}</div>
              <div className="cap-summary-label">Time Spent</div>
            </div>
            <div className="cap-summary-card">
              <div className="cap-summary-num" style={{ color: '#f59e0b' }}>Needs Review</div>
              <div className="cap-summary-label">Evaluation Status</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button className="cap-btn-sec" onClick={() => navigate('/candidate/my-assessments')}>
              <ArrowLeft size={16} /> My Assessments List
            </button>
            <button className="cap-btn-prim" onClick={() => navigate('/candidate/dashboard')}>
              Go to Candidate Dashboard
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="cap-wrapper">
      {/* ── Top Header Navigation Bar ── */}
      <header className="cap-header">
        <div className="cap-brand">
          <div className="cap-logo-icon">IH</div>
          <div className="cap-title-block">
            <h1>{assessmentData.title}</h1>
            <span className="cap-subtitle">{assessmentData.jobRole} • {assessmentData.company}</span>
          </div>
        </div>

        <div className="cap-header-center">
          <div className={`cap-timer-pill ${timeLeftSeconds < 300 ? 'warning' : ''}`}>
            <Clock size={18} />
            <span>{formatTime(timeLeftSeconds)}</span>
          </div>
          <div className="cap-autosave-status">
            <Save size={14} />
            <span>{autoSaveStatus}</span>
          </div>
        </div>

        <div className="cap-header-actions">
          <button className="cap-btn-submit" onClick={() => setShowSubmitModal(true)}>
            <Send size={16} /> Submit Assessment
          </button>
        </div>
      </header>

      {/* ── Progress Bar ── */}
      <div className="cap-progress-bar-container">
        <div
          className="cap-progress-bar-fill"
          style={{ width: `${((currentQIndex + 1) / totalQuestions) * 100}%` }}
        />
      </div>

      {/* ── Main Layout: Sidebar + Question Body ── */}
      <div className="cap-main-body">
        {/* Left Sidebar Navigator */}
        <aside className="cap-sidebar">
          <div className="cap-sidebar-title">
            <span>Question Navigator</span>
            <span style={{ color: '#818cf8' }}>{currentQIndex + 1} of {totalQuestions}</span>
          </div>

          <div className="cap-q-stats">
            <div className="cap-stat-chip">
              <span className="cap-stat-dot answered"></span> {answeredCount} Answered
            </div>
            <div className="cap-stat-chip">
              <span className="cap-stat-dot flagged"></span> {flaggedCount} Flagged
            </div>
            <div className="cap-stat-chip">
              <span className="cap-stat-dot unanswered"></span> {unansweredCount} Unanswered
            </div>
          </div>

          <div className="cap-q-grid">
            {assessmentData.questions.map((q, idx) => {
              const isAns = userAnswers[q.id] !== undefined && userAnswers[q.id] !== '';
              const isFlag = flaggedQuestions[q.id];
              const isCurrent = idx === currentQIndex;

              return (
                <button
                  key={q.id}
                  className={`cap-q-num-btn ${isCurrent ? 'active' : ''} ${isAns ? 'answered' : ''} ${isFlag ? 'flagged' : ''}`}
                  onClick={() => setCurrentQIndex(idx)}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Question Content Area */}
        <main className="cap-content-area">
          <div className="cap-question-card">
            {/* Header badges & Flag button */}
            <div className="cap-q-header">
              <div className="cap-q-badge-group">
                <span className="cap-badge category">{currentQuestion.category}</span>
                <span className="cap-badge type">{currentQuestion.type.toUpperCase()}</span>
                <span className="cap-badge points">{currentQuestion.points} Points</span>
              </div>

              <button
                className={`cap-btn-flag ${flaggedQuestions[currentQuestion.id] ? 'flagged' : ''}`}
                onClick={() => toggleFlagQuestion(currentQuestion.id)}
              >
                <Flag size={14} />
                {flaggedQuestions[currentQuestion.id] ? 'Flagged for Review' : 'Flag Question'}
              </button>
            </div>

            {/* Prompt */}
            <div className="cap-q-prompt">
              Question {currentQIndex + 1}: {currentQuestion.prompt}
            </div>

            {/* ── QUESTION TYPE RENDERERS ── */}

            {/* MCQ / Radio Choice */}
            {currentQuestion.type === 'mcq' && (
              <div className="cap-options-list">
                {currentQuestion.options.map((opt, optIdx) => {
                  const letters = ['A', 'B', 'C', 'D'];
                  const isSelected = userAnswers[currentQuestion.id] === optIdx;
                  return (
                    <div
                      key={optIdx}
                      className={`cap-option-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleOptionSelect(optIdx)}
                    >
                      <div className="cap-option-key">{letters[optIdx]}</div>
                      <div className="cap-option-text">{opt}</div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Multi-select Checkboxes */}
            {currentQuestion.type === 'multi' && (
              <div className="cap-options-list">
                {currentQuestion.options.map((opt, optIdx) => {
                  const selectedList = userAnswers[currentQuestion.id] || [];
                  const isSelected = selectedList.includes(optIdx);
                  return (
                    <div
                      key={optIdx}
                      className={`cap-option-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleOptionSelect(optIdx)}
                    >
                      <div className="cap-option-key">{isSelected ? '✓' : optIdx + 1}</div>
                      <div className="cap-option-text">{opt}</div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Written Essay / Short Answer */}
            {currentQuestion.type === 'text' && (
              <div>
                <textarea
                  className="cap-textarea"
                  placeholder="Type your explanation here..."
                  value={userAnswers[currentQuestion.id] || ''}
                  onChange={(e) => handleTextAnswerChange(e.target.value)}
                />
              </div>
            )}

            {/* Interactive Coding Editor */}
            {currentQuestion.type === 'coding' && (
              <div className="cap-code-editor-box">
                <div className="cap-code-toolbar">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9ca3af', fontSize: '13px' }}>
                    <FileCode size={16} /> Solution Code Editor
                  </div>
                  <select className="cap-lang-select" defaultValue={currentQuestion.language || 'javascript'}>
                    <option value="javascript">JavaScript (Node.js)</option>
                    <option value="python">Python 3.10</option>
                    <option value="typescript">TypeScript 5.0</option>
                    <option value="cpp">C++ 20</option>
                  </select>
                </div>

                <textarea
                  className="cap-code-input"
                  rows={10}
                  value={userAnswers[currentQuestion.id] !== undefined ? userAnswers[currentQuestion.id] : currentQuestion.defaultCode}
                  onChange={(e) => handleCodeAnswerChange(e.target.value)}
                />

                <div className="cap-code-actions">
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>Input test cases are evaluated automatically.</span>
                  <button className="cap-btn-run" onClick={handleRunCode} disabled={isRunningCode}>
                    <Play size={14} /> {isRunningCode ? 'Running...' : 'Run Test Cases'}
                  </button>
                </div>

                {codeConsoleOut && (
                  <div className="cap-console-out">
                    <pre style={{ margin: 0 }}>{codeConsoleOut}</pre>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons Bar */}
            <div className="cap-nav-bar">
              <button
                className="cap-btn-sec"
                disabled={currentQIndex === 0}
                onClick={() => setCurrentQIndex(prev => prev - 1)}
              >
                <ChevronLeft size={16} /> Previous Question
              </button>

              {currentQIndex < totalQuestions - 1 ? (
                <button
                  className="cap-btn-prim"
                  onClick={() => setCurrentQIndex(prev => prev + 1)}
                >
                  Next Question <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  className="cap-btn-submit"
                  onClick={() => setShowSubmitModal(true)}
                >
                  Review & Finish <Send size={16} />
                </button>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* ── START INSTRUCTIONS MODAL ── */}
      {showInstructions && (
        <div className="cap-modal-overlay">
          <div className="cap-modal-box">
            <div className="cap-modal-header">
              <div className="cap-modal-icon">
                <Sparkles size={24} />
              </div>
              <div>
                <h3 className="cap-modal-title">{assessmentData.title}</h3>
                <span className="cap-subtitle">{assessmentData.company} • {assessmentData.jobRole}</span>
              </div>
            </div>

            <div className="cap-modal-body">
              <div className="cap-modal-summary" style={{ margin: '12px 0 20px 0' }}>
                <div className="cap-summary-card">
                  <div className="cap-summary-num">{assessmentData.durationMinutes}m</div>
                  <div className="cap-summary-label">Duration</div>
                </div>
                <div className="cap-summary-card">
                  <div className="cap-summary-num">{totalQuestions}</div>
                  <div className="cap-summary-label">Questions</div>
                </div>
                <div className="cap-summary-card">
                  <div className="cap-summary-num">{assessmentData.passingScore}%</div>
                  <div className="cap-summary-label">Pass Score</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {assessmentData.instructions.map((inst, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', fontSize: '13px', color: '#d1d5db' }}>
                    <Info size={16} style={{ color: '#818cf8', flexShrink: 0, marginTop: '2px' }} />
                    <span>{inst}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="cap-modal-footer">
              <button className="cap-btn-sec" onClick={() => navigate('/candidate/my-assessments')}>
                Cancel & Exit
              </button>
              <button className="cap-btn-prim" onClick={handleStartTest}>
                Start Assessment Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SUBMIT CONFIRMATION MODAL ── */}
      {showSubmitModal && (
        <div className="cap-modal-overlay">
          <div className="cap-modal-box">
            <div className="cap-modal-header">
              <div className="cap-modal-icon" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}>
                <Send size={24} />
              </div>
              <div>
                <h3 className="cap-modal-title">Submit Assessment?</h3>
                <span className="cap-subtitle">Confirm your final submission</span>
              </div>
            </div>

            <div className="cap-modal-body">
              <p>Are you sure you want to finalize and submit your assessment answers?</p>

              <div className="cap-modal-summary">
                <div className="cap-summary-card">
                  <div className="cap-summary-num" style={{ color: '#34d399' }}>{answeredCount}</div>
                  <div className="cap-summary-label">Answered</div>
                </div>
                <div className="cap-summary-card">
                  <div className="cap-summary-num" style={{ color: '#f59e0b' }}>{flaggedCount}</div>
                  <div className="cap-summary-label">Flagged</div>
                </div>
                <div className="cap-summary-card">
                  <div className="cap-summary-num" style={{ color: '#f87171' }}>{unansweredCount}</div>
                  <div className="cap-summary-label">Unanswered</div>
                </div>
              </div>
            </div>

            <div className="cap-modal-footer">
              <button className="cap-btn-sec" onClick={() => setShowSubmitModal(false)}>
                Back to Test
              </button>
              <button className="cap-btn-submit" onClick={handleFinalSubmit}>
                Confirm Final Submission
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
