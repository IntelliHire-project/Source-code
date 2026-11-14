import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  Code2,
  Copy,
  Edit3,
  FileQuestion,
  FileText,
  Loader2,
  PlayCircle,
  Share2,
  Users,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAssessmentById } from '../../../api/assessmentApi';
import AssessmentShell from './AssessmentShell';
import './AssessmentFlow.css';

const DEFAULT_QUESTIONS = [
  {
    id: 'Q-001',
    title: 'JavaScript Event Loop & Asynchronous Execution',
    prompt: 'Explain how microtasks and macrotasks are ordered in the JavaScript event loop, and predict the output sequence for mixed Promise and setTimeout operations.',
    type: 'Short Answer',
    points: 10,
    difficulty: 'Medium',
    skills: ['JavaScript', 'Async', 'Event Loop'],
    evalMode: 'Manual Review',
  },
  {
    id: 'Q-002',
    title: 'JavaScript Data Types & Type Coercion',
    prompt: 'Which of the following is NOT a primitive data type in modern JavaScript? Select the best answer.',
    type: 'MCQ',
    points: 5,
    difficulty: 'Easy',
    options: ['undefined', 'boolean', 'float', 'symbol'],
    correct: 2,
    skills: ['JavaScript', 'Core JS'],
    evalMode: 'Auto-graded',
  },
  {
    id: 'Q-003',
    title: 'Longest Substring Without Repeating Characters',
    prompt: 'Implement an optimal sliding-window function to find the length of the longest substring without duplicate characters.',
    type: 'Coding',
    points: 20,
    difficulty: 'Hard',
    skills: ['Algorithms', 'Data Structures'],
    evalMode: 'Manual Review',
    boilerplate: 'function lengthOfLongestSubstring(s) {\n  // Implement sliding window approach O(n)\n}',
  },
  {
    id: 'Q-004',
    title: 'Frontend System Design & Architecture',
    prompt: 'Describe how you would architect real-time state management, optimistic UI updates, and caching for a high-traffic collaborative dashboard.',
    type: 'Long Answer',
    points: 20,
    difficulty: 'Hard',
    skills: ['System Design', 'React', 'Architecture'],
    evalMode: 'Manual Review',
  },
  {
    id: 'Q-005',
    title: 'HTTP Status Codes & REST Conventions',
    prompt: 'Which HTTP status code represents a successful resource creation where a new entity has been persisted?',
    type: 'MCQ',
    points: 5,
    difficulty: 'Easy',
    options: ['200 OK', '201 Created', '204 No Content', '301 Redirect'],
    correct: 1,
    skills: ['REST APIs', 'HTTP'],
    evalMode: 'Auto-graded',
  },
];

function AssessmentPreviewPage() {
  const navigate = useNavigate();
  const { assessmentId } = useParams();
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(Boolean(assessmentId));
  const [copied, setCopied] = useState(false);
  const [inviteMode, setInviteMode] = useState('Optional');
  const [inviteSent, setInviteSent] = useState(false);

  // Default to all questions open directly; keys set to true represent collapsed questions
  const [collapsedQuestions, setCollapsedQuestions] = useState({});

  useEffect(() => {
    if (assessmentId) {
      const loadData = async () => {
        try {
          setLoading(true);
          const res = await getAssessmentById(assessmentId);
          if (res?.assessment) {
            setAssessment(res.assessment);
          }
        } catch (err) {
          console.error('Failed to load assessment preview:', err);
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }
  }, [assessmentId]);

  const candidateLink = `https://intellihire.test/a/${assessmentId}?mode=${inviteMode.toLowerCase()}`;

  const sendInvite = () => {
    setInviteSent(true);
    if (inviteMode !== 'Skip') {
      navigator.clipboard?.writeText(candidateLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Helper to parse question items from either database, question bank, or starter sets
  const parseQuestion = (q, idx) => {
    const prompt = q.prompt || q.snippet || q.text || q.question || q.title || `Question ${idx + 1}`;

    let title = q.title;
    if (!title || title.trim().toLowerCase() === 'question') {
      title = prompt.length > 75 ? `${prompt.slice(0, 72)}...` : prompt;
    }

    let options = [];
    if (Array.isArray(q.options)) {
      options = q.options;
    } else if (typeof q.options === 'string') {
      try {
        options = JSON.parse(q.options);
      } catch {
        options = [];
      }
    }

    let skills = [];
    if (Array.isArray(q.skills)) {
      skills = q.skills;
    } else if (typeof q.skills === 'string') {
      skills = q.skills.split(',').map((s) => s.trim()).filter(Boolean);
    }

    return {
      id: q.id || q.code || `Q-${String(idx + 1).padStart(3, '0')}`,
      title,
      prompt,
      detail: q.detail || q.description || prompt,
      type: q.type || (options.length > 0 ? 'MCQ' : 'Short Answer'),
      points: q.points != null ? Number(q.points) : 10,
      difficulty: q.difficulty || assessment?.difficulty || 'Medium',
      evalMode: q.evalMode || (options.length > 0 ? 'Auto-graded' : 'Manual Review'),
      options,
      correct: q.correct != null ? Number(q.correct) : null,
      skills,
      section: q.section || '',
      boilerplate: q.boilerplate || q.starterCode || '',
    };
  };

  const rawQuestions =
    assessment?.questions && assessment.questions.length > 0
      ? assessment.questions
      : DEFAULT_QUESTIONS;

  const questions = rawQuestions.map(parseQuestion);

  const totalPoints = questions.reduce((sum, q) => sum + (Number(q.points) || 0), 0);
  const duration = assessment?.duration || 90;
  const title = assessment?.title || assessment?.name || 'Technical Assessment Preview';
  const jobRole = assessment?.jobRole || assessment?.vacancy || 'Senior Software Engineer — React';
  const difficulty = assessment?.difficulty || 'Mid-level';
  const passingScore = assessment?.passingScore || assessment?.passing || 70;
  const status = assessment?.status || 'Active';
  const invitedCount = assessment?.invited != null ? assessment.invited : 0;

  const isQuestionOpen = (index) => !collapsedQuestions[index];

  const toggleQuestion = (index) => {
    setCollapsedQuestions((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const areAllOpen = questions.every((_, i) => !collapsedQuestions[i]);

  const toggleAllQuestions = () => {
    if (areAllOpen) {
      const allCollapsed = {};
      questions.forEach((_, i) => {
        allCollapsed[i] = true;
      });
      setCollapsedQuestions(allCollapsed);
    } else {
      setCollapsedQuestions({});
    }
  };

  return (
    <AssessmentShell currentPage="Assessment Preview">
      <main className="af-page">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>
            <Loader2 size={32} className="spin" style={{ margin: '0 auto 12px' }} />
            <p>Loading assessment details...</p>
          </div>
        ) : (
          <>
            <div className="ap-header">
              <div>
                <span className="af-eyebrow">Assessment ID: {assessmentId}</span>
                <div className="ap-title-row">
                  <h1>{title}</h1>
                  <span>{status}</span>
                </div>
                <p>Send a secure assessment link to shortlisted candidates before the first interview.</p>
              </div>
              <div className="af-title-actions">
                <button
                  className="af-secondary"
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                >
                  <Share2 size={16} /> {copied ? 'Link Copied' : 'Share'}
                </button>
                <button
                  className="af-secondary"
                  onClick={() => navigate(`/recruiter/assessments/${assessmentId}/edit`)}
                >
                  <Edit3 size={16} /> Edit Assessment
                </button>
                <button
                  className="af-primary"
                  onClick={() => navigate(`/recruiter/assessments/${assessmentId}/candidates`)}
                >
                  <Users size={16} /> View Candidates
                </button>
              </div>
            </div>

            <section className="ap-summary">
              <article>
                <Clock3 />
                <div>
                  <small>Duration</small>
                  <strong>{duration} minutes</strong>
                </div>
              </article>
              <article>
                <FileQuestion />
                <div>
                  <small>Questions</small>
                  <strong>{questions.length} questions</strong>
                </div>
              </article>
              <article>
                <BarChart3 />
                <div>
                  <small>Total Points</small>
                  <strong>{assessment?.totalPoints || totalPoints} points</strong>
                </div>
              </article>
              <article>
                <Users />
                <div>
                  <small>Candidates</small>
                  <strong>{invitedCount} assigned</strong>
                </div>
              </article>
            </section>

            <div className="ap-preview-layout ap-layout">
              <section className="ap-main">
                <div className="ap-section-title">
                  <div>
                    <h2>Assessment Questions</h2>
                    <p>
                      Preview the questions candidates will receive ({questions.length} total •{' '}
                      {assessment?.totalPoints || totalPoints} points)
                    </p>
                  </div>
                  <div className="ap-title-buttons">
                    <button
                      type="button"
                      className="af-secondary"
                      onClick={toggleAllQuestions}
                      title={areAllOpen ? 'Collapse all questions' : 'Expand all questions'}
                    >
                      {areAllOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      {areAllOpen ? 'Collapse All' : 'Expand All'}
                    </button>
                    <button
                      type="button"
                      className="af-secondary"
                      onClick={() => navigate('/recruiter/question-bank')}
                    >
                      <FileQuestion size={16} /> Open Question Bank
                    </button>
                  </div>
                </div>

                <div className="ap-question-list">
                  {questions.map((question, index) => {
                    const isOpen = isQuestionOpen(index);
                    const isMcq = question.type === 'MCQ' || question.type === 'Multiple Choice';
                    const isCoding = question.type === 'Coding';
                    const isShort = question.type === 'Short Answer';

                    const typePillClass = isMcq
                      ? 'ap-type-pill--mcq'
                      : isCoding
                      ? 'ap-type-pill--coding'
                      : isShort
                      ? 'ap-type-pill--short'
                      : 'ap-type-pill--default';

                    const diffClass =
                      question.difficulty?.toLowerCase() === 'easy'
                        ? 'diff-easy'
                        : question.difficulty?.toLowerCase() === 'hard'
                        ? 'diff-hard'
                        : 'diff-medium';

                    return (
                      <article
                        key={question.id + index}
                        className={`ap-question-card ${isOpen ? 'is-open' : ''}`}
                      >
                        <header
                          className="ap-question-header"
                          onClick={() => toggleQuestion(index)}
                        >
                          <span className="ap-q-num">{index + 1}</span>
                          <div className="ap-q-head-content">
                            <h3 className="ap-q-title">{question.title}</h3>
                            <div className="ap-q-meta-inline">
                              <span className={`ap-type-pill ${typePillClass}`}>
                                {isMcq ? (
                                  <CheckCircle2 size={11} />
                                ) : isCoding ? (
                                  <Code2 size={11} />
                                ) : (
                                  <FileText size={11} />
                                )}
                                {question.type}
                              </span>
                              {question.section && (
                                <span className="ap-chip-tag">{question.section}</span>
                              )}
                              <span className={`ap-chip-tag ${diffClass}`}>
                                {question.difficulty}
                              </span>
                            </div>
                          </div>
                          <div className="ap-q-head-right">
                            <span className="ap-points-badge">{question.points} pts</span>
                            <div className="ap-chevron-btn">
                              {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </div>
                          </div>
                        </header>

                        {isOpen && (
                          <div className="ap-question-body">
                            <div className="ap-prompt-box">
                              <p>{question.prompt}</p>
                            </div>

                            {isMcq && question.options && question.options.length > 0 && (
                              <div className="ap-options-wrap">
                                <div className="ap-options-label">Multiple Choice Options:</div>
                                <div className="ap-options-list">
                                  {question.options.map((opt, optIdx) => {
                                    const letter = String.fromCharCode(65 + optIdx);
                                    const isCorrect = question.correct === optIdx;
                                    return (
                                      <div
                                        key={optIdx}
                                        className={`ap-option-row ${isCorrect ? 'is-correct' : ''}`}
                                      >
                                        <span className="ap-option-letter">{letter}</span>
                                        <span className="ap-option-text">{opt}</span>
                                        {isCorrect && (
                                          <span className="ap-option-badge">
                                            <CheckCircle2 size={13} /> Correct Answer
                                          </span>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {isCoding && (
                              <div className="ap-coding-preview">
                                <div className="ap-code-editor-hint">
                                  <Code2 size={13} />
                                  <span>Candidate Coding Sandbox Preview</span>
                                </div>
                                {question.boilerplate ? (
                                  <pre>{question.boilerplate}</pre>
                                ) : (
                                  <pre>{`// Interactive coding challenge\nfunction solution() {\n  // Implementation here\n}`}</pre>
                                )}
                              </div>
                            )}

                            <footer className="ap-question-footer">
                              <div className="ap-chips-group">
                                <span className={`ap-chip-tag ${diffClass}`}>
                                  Difficulty: <b>{question.difficulty}</b>
                                </span>
                                <span className="ap-chip-tag">
                                  Evaluation: <b>{question.evalMode}</b>
                                </span>
                                <span className="ap-chip-tag required-badge">Required</span>
                              </div>
                              {question.skills && question.skills.length > 0 && (
                                <div className="ap-chips-group">
                                  {question.skills.map((skill) => (
                                    <span key={skill} className="ap-skill-chip">
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </footer>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              </section>

              <aside className="ap-side">
                <section>
                  <h2>Assessment Settings</h2>
                  <dl>
                    <div>
                      <dt>Target role</dt>
                      <dd>{jobRole}</dd>
                    </div>
                    <div>
                      <dt>Difficulty</dt>
                      <dd>{difficulty}</dd>
                    </div>
                    <div>
                      <dt>Pass score</dt>
                      <dd>{passingScore}%</dd>
                    </div>
                    <div>
                      <dt>Question order</dt>
                      <dd>Standard</dd>
                    </div>
                    <div>
                      <dt>Attempts allowed</dt>
                      <dd>1 attempt</dd>
                    </div>
                  </dl>
                </section>
                <section>
                  <h2>Schedule</h2>
                  <p>
                    <CalendarDays size={17} /> Created{' '}
                    {assessment?.createdAt
                      ? new Date(assessment.createdAt).toLocaleDateString()
                      : 'Recently'}
                  </p>
                  <p>
                    <CheckCircle2 size={17} /> Accepting candidates
                  </p>
                </section>
                <section className="ap-delivery">
                  <div className="ap-section-head">
                    <div>
                      <h2>Assessment Delivery</h2>
                      <p>Choose whether this invite is mandatory or optional for the shortlisted candidate.</p>
                    </div>
                    <span className="ap-chip">Shortlist Only</span>
                  </div>
                  <div className="ap-mode-group" role="tablist" aria-label="Assessment invite mode">
                    {['Mandatory', 'Optional', 'Skip'].map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        className={inviteMode === mode ? 'is-active' : ''}
                        onClick={() => setInviteMode(mode)}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                  <ul className="ap-checklist">
                    <li>Email notification to the candidate</li>
                    <li>In-app notification with a secure link</li>
                    <li>Link expires in 72 hours</li>
                    <li>Recruiter can resend or waive later</li>
                  </ul>
                  <button
                    className="af-primary ap-send-btn"
                    type="button"
                    onClick={sendInvite}
                  >
                    <PlayCircle size={16} />
                    {inviteSent
                      ? inviteMode === 'Skip'
                        ? 'Marked as Skipped'
                        : 'Invitation Sent'
                      : inviteMode === 'Skip'
                        ? 'Skip Assessment'
                        : `Send ${inviteMode} Invite`}
                  </button>
                  {inviteSent && (
                    <div className="af-success ap-success">
                      {inviteMode === 'Skip'
                        ? 'Assessment skipped for this role. The candidate will not receive an invite.'
                        : 'Invite sent to the shortlisted candidate and copied to clipboard.'}
                    </div>
                  )}
                  <div className="ap-link">
                    <span>Candidate link</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(candidateLink);
                        setCopied(true);
                      }}
                    >
                      <span>{candidateLink.replace('https://', '')}</span>
                      <Copy size={16} />
                    </button>
                  </div>
                </section>
              </aside>
            </div>
          </>
        )}
      </main>
    </AssessmentShell>
  );
}

export default AssessmentPreviewPage;
