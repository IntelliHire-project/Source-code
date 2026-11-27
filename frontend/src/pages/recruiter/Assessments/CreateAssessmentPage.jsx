import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  FileText,
  HelpCircle,
  Loader2,
  Plus,
  Save,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { createAssessment, getAssessmentById, updateAssessment } from '../../../api/assessmentApi';
import AssessmentShell from './AssessmentShell';
import './AssessmentFlow.css';

const JOB_ROLES = [
  'Senior Software Engineer — React',
  'Senior Backend Engineer — Node/Java',
  'Full Stack Developer',
  'QA Automation Engineer',
  'DevOps & Cloud Engineer',
  'Data Scientist & ML',
  'Business Analyst — Fintech',
];

const STARTER_QUESTIONS = [
  { id: 1, title: 'Describe the difference between server-side rendering and client-side rendering.', text: 'Describe the difference between server-side rendering and client-side rendering.', prompt: 'Describe the difference between server-side rendering and client-side rendering.', points: 10, type: 'Long Answer' },
  { id: 2, title: 'Implement a function to reverse a linked list.', text: 'Write a production-ready solution and explain its time complexity.', prompt: 'Write a production-ready solution and explain its time complexity.', points: 20, type: 'Coding' },
];

function CreateAssessmentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { assessmentId } = useParams();
  const isEditing = Boolean(assessmentId) || location.pathname.endsWith('/edit');

  const [questions, setQuestions] = useState(STARTER_QUESTIONS);
  const [expanded, setExpanded] = useState(1);
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(Boolean(assessmentId));
  const [error, setError] = useState('');
  const [customRole, setCustomRole] = useState('');

  const [config, setConfig] = useState({
    title: '',
    role: '',
    description: 'This assessment evaluates core competencies, architectural patterns, and hands-on coding problem-solving skills.',
    duration: 60,
    difficulty: 'Senior',
  });

  // Fetch assessment details if editing an existing assessment
  useEffect(() => {
    if (assessmentId) {
      const loadAssessment = async () => {
        try {
          setLoading(true);
          setError('');
          const res = await getAssessmentById(assessmentId);
          if (res?.assessment) {
            const a = res.assessment;
            const roleVal = a.jobRole || a.role || '';
            const isStandardRole = JOB_ROLES.includes(roleVal);

            setConfig({
              title: a.title || a.name || '',
              role: isStandardRole ? roleVal : (roleVal ? 'Other' : ''),
              description: a.description || '',
              duration: a.duration || 60,
              difficulty: a.difficulty || 'Senior',
            });

            if (!isStandardRole && roleVal) {
              setCustomRole(roleVal);
            }

            if (Array.isArray(a.questions) && a.questions.length > 0) {
              const normalized = a.questions.map((q, idx) => {
                const textVal = q.text || q.prompt || q.questionText || q.question || q.snippet || '';
                const titleVal = q.title || (textVal ? (textVal.length > 55 ? textVal.substring(0, 55) + '...' : textVal) : `Question ${idx + 1}`);
                const rawType = q.type || 'Long Answer';
                const normType = (rawType === 'MCQ' || rawType === 'Multiple Choice' || rawType === 'mcq' || rawType === 'multi')
                  ? 'Multiple Choice'
                  : (rawType === 'Coding' || rawType === 'coding')
                    ? 'Coding'
                    : (rawType === 'Short Answer' || rawType === 'Open Ended')
                      ? 'Short Answer'
                      : 'Long Answer';

                return {
                  ...q,
                  id: q.id != null ? q.id : (q.questionCode || `q-${idx + 1}-${Date.now()}`),
                  title: titleVal,
                  text: textVal || titleVal,
                  prompt: textVal || titleVal,
                  points: q.points != null ? Number(q.points) : 10,
                  type: normType,
                  options: Array.isArray(q.options) && q.options.length > 0
                    ? q.options
                    : (normType === 'Multiple Choice' ? ['Option A', 'Option B', 'Option C', 'Option D'] : []),
                  correct: q.correct != null ? Number(q.correct) : 0,
                  boilerplate: q.boilerplate || q.defaultCode || '',
                };
              });
              setQuestions(normalized);
              setExpanded(normalized[0]?.id);
            }
          }
        } catch (err) {
          console.error('Failed to load assessment for editing:', err);
          setError(err.response?.data?.message || 'Failed to load assessment details.');
        } finally {
          setLoading(false);
        }
      };
      loadAssessment();
    }
  }, [assessmentId]);

  const handleRoleChange = (newRole) => {
    setConfig({
      ...config,
      role: newRole,
    });
  };

  const handleDifficultyChange = (newDiff) => {
    setConfig({
      ...config,
      difficulty: newDiff,
    });
  };

  const handleAutoGenerateTitle = () => {
    const target = config.role === 'Other' ? customRole.trim() : config.role;
    if (target) {
      setConfig((prev) => ({ ...prev, title: `${target} Assessment — ${prev.difficulty}` }));
    } else {
      setConfig((prev) => ({ ...prev, title: `Technical Assessment — ${prev.difficulty}` }));
    }
  };

  const updateQuestion = (id, key, value) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) => {
        if (q.id === id) {
          const updated = { ...q, [key]: value };
          if (key === 'text') {
            updated.prompt = value;
            if (!q.title || q.title.startsWith('Question ') || q.title === q.text || q.title === q.prompt) {
              updated.title = value.length > 55 ? value.substring(0, 55) + '...' : value;
            }
          } else if (key === 'prompt') {
            updated.text = value;
          } else if (key === 'type') {
            if (value === 'Multiple Choice' && (!updated.options || updated.options.length === 0)) {
              updated.options = ['Option A', 'Option B', 'Option C', 'Option D'];
              updated.correct = 0;
            }
          }
          return updated;
        }
        return q;
      })
    );
  };

  const updateOption = (questionId, optIndex, value) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) => {
        if (q.id === questionId) {
          const newOpts = [...(q.options || [])];
          newOpts[optIndex] = value;
          return { ...q, options: newOpts };
        }
        return q;
      })
    );
  };

  const addOption = (questionId) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) => {
        if (q.id === questionId) {
          const currentOpts = q.options || [];
          const nextLetter = String.fromCharCode(65 + currentOpts.length);
          return { ...q, options: [...currentOpts, `Option ${nextLetter}`] };
        }
        return q;
      })
    );
  };

  const removeOption = (questionId, optIndex) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) => {
        if (q.id === questionId) {
          const newOpts = (q.options || []).filter((_, idx) => idx !== optIndex);
          const newCorrect = (q.correct || 0) >= newOpts.length ? Math.max(0, newOpts.length - 1) : (q.correct || 0);
          return { ...q, options: newOpts, correct: newCorrect };
        }
        return q;
      })
    );
  };

  const setCorrectOption = (questionId, optIndex) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) => (q.id === questionId ? { ...q, correct: optIndex } : q))
    );
  };

  const handleSave = async (targetStatus = 'Draft') => {
    const roleToSave = config.role === 'Other' ? customRole.trim() : config.role;
    const assessmentTitle = config.title.trim();

    if (!assessmentTitle) {
      setError('Please provide an assessment title before saving.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const questionsToSave = questions.map((q, idx) => {
        const textContent = (q.text || q.prompt || q.title || '').trim();
        const rawType = q.type || 'Long Answer';
        const titleContent = q.title && q.title.trim()
          ? q.title.trim()
          : (textContent ? (textContent.length > 55 ? textContent.substring(0, 55) + '...' : textContent) : `Question ${idx + 1}`);

        return {
          ...q,
          id: q.id || `q-${idx + 1}`,
          title: titleContent,
          prompt: textContent || titleContent,
          text: textContent || titleContent,
          points: Number(q.points) || 10,
          type: rawType,
          options: rawType === 'Multiple Choice' || rawType === 'MCQ' ? (Array.isArray(q.options) ? q.options : []) : undefined,
          correct: rawType === 'Multiple Choice' || rawType === 'MCQ' ? (q.correct != null ? Number(q.correct) : 0) : undefined,
          boilerplate: rawType === 'Coding' ? (q.boilerplate || '') : undefined,
        };
      });

      const payload = {
        title: assessmentTitle,
        description: config.description,
        jobRole: roleToSave,
        role: roleToSave,
        duration: Number(config.duration) || 60,
        difficulty: config.difficulty,
        status: targetStatus,
        questions: questionsToSave,
      };

      if (isEditing && assessmentId) {
        await updateAssessment(assessmentId, payload);
      } else {
        await createAssessment(payload);
      }

      setSaved(true);
      setTimeout(() => {
        navigate('/recruiter/assessments');
      }, 1200);
    } catch (err) {
      console.error('Failed to save assessment:', err);
      setError(err.response?.data?.message || err.message || 'Failed to save assessment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AssessmentShell currentPage={isEditing ? 'Edit Assessment' : 'Create Assessment'}>
      <main className="af-page">
        <div className="af-page-title">
          <div>
            <span className="af-eyebrow">Assessments / {isEditing ? 'Edit Assessment' : 'New Assessment'}</span>
            <h1>{isEditing ? 'Edit Assessment' : 'Create New Assessment'}</h1>
            <p>Configure your evaluation criteria and technical challenges.</p>
          </div>
          <div className="af-title-actions">
            <button
              className="af-secondary"
              disabled={submitting || loading}
              onClick={() => handleSave('Draft')}
            >
              {submitting ? 'Saving...' : 'Save as Draft'}
            </button>
            <button
              className="af-primary"
              disabled={submitting || loading}
              onClick={() => handleSave('Active')}
            >
              <Save size={16} />{' '}
              {submitting
                ? 'Saving...'
                : isEditing
                  ? 'Update Assessment'
                  : 'Publish Assessment'}
            </button>
          </div>
        </div>

        {error && (
          <div
            className="af-error"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 16px',
              borderRadius: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#ef4444',
              marginBottom: '16px',
              fontSize: '14px',
            }}
          >
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {saved && (
          <div className="af-success">
            <CheckCircle2 size={17} /> Assessment {isEditing ? 'updated' : 'saved'} successfully. Redirecting...
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
            <Loader2 size={32} className="spin" style={{ margin: '0 auto 12px' }} />
            <p>Loading assessment details...</p>
          </div>
        ) : (
          <div className="ca-layout">
            <aside>
              <section className="ca-config">
                <h2>
                  <SlidersHorizontal size={20} /> Configuration
                </h2>
                <p>General settings for this assessment.</p>

                <label>
                  Target Job Vacancy / Role
                  <select value={config.role} onChange={(e) => handleRoleChange(e.target.value)}>
                    <option value="">— Select a vacancy / role —</option>
                    {JOB_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                    <option value="Other">Other (Custom vacancy / role...)</option>
                  </select>
                </label>

                {config.role === 'Other' && (
                  <label>
                    Custom Vacancy / Role Name *
                    <input
                      value={customRole}
                      onChange={(e) => setCustomRole(e.target.value)}
                      placeholder="Type custom role or vacancy..."
                      autoFocus
                    />
                  </label>
                )}

                <label>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '6px',
                    }}
                  >
                    <span>Assessment Title</span>
                    <button
                      type="button"
                      className="af-auto-gen-btn"
                      onClick={handleAutoGenerateTitle}
                      title="Auto-generate title based on selected vacancy and difficulty"
                    >
                      <Sparkles size={12} /> Auto-Generate Title
                    </button>
                  </div>
                  <input
                    value={config.title}
                    onChange={(e) => setConfig({ ...config, title: e.target.value })}
                    placeholder="e.g., Senior Software Engineer Assessment"
                  />
                </label>

                <label>
                  Description
                  <textarea
                    value={config.description}
                    onChange={(e) => setConfig({ ...config, description: e.target.value })}
                  />
                </label>
                <div className="qb-form-grid">
                  <label>
                    Duration
                    <div className="ca-input-icon">
                      <Clock3 size={16} />
                      <input
                        type="number"
                        value={config.duration}
                        onChange={(e) => setConfig({ ...config, duration: e.target.value })}
                      />
                    </div>
                    <small>Minutes</small>
                  </label>
                  <label>
                    Difficulty
                    <select
                      value={config.difficulty}
                      onChange={(e) => handleDifficultyChange(e.target.value)}
                    >
                      <option>Junior</option>
                      <option>Mid-level</option>
                      <option>Senior</option>
                    </select>
                  </label>
                </div>
              </section>
              <section className="ca-tips">
                <div className="ca-tips-head">
                  <h2>Recruiter Tips</h2>
                  <HelpCircle size={42} />
                </div>
                <p>
                  <CheckCircle2 size={18} /> Keep assessments under <b>90 minutes</b> to ensure a
                  high completion rate.
                </p>
                <p>
                  <CheckCircle2 size={18} /> Include at least one coding challenge for senior
                  roles.
                </p>
                <button onClick={() => navigate('/recruiter/question-bank')}>
                  View Best Practices <ChevronDown size={16} />
                </button>
              </section>
            </aside>
            <section className="ca-bank">
              <div className="ca-bank-title">
                <h2>
                  <span>
                    <FileText size={18} />
                  </span>{' '}
                  Question Bank <small>{questions.length} Questions</small>
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    const newId = Date.now();
                    setQuestions([
                      ...questions,
                      {
                        id: newId,
                        title: `Question ${questions.length + 1}`,
                        text: '',
                        prompt: '',
                        points: 10,
                        type: 'Long Answer',
                        options: ['Option A', 'Option B', 'Option C', 'Option D'],
                        correct: 0,
                        boilerplate: '',
                      },
                    ]);
                    setExpanded(newId);
                  }}
                >
                  <Plus size={16} /> Add Question
                </button>
              </div>
              {questions.map((question, idx) => (
                <article className="ca-question" key={question.id || idx}>
                  <header
                    onClick={() =>
                      setExpanded(expanded === question.id ? null : question.id)
                    }
                  >
                    <span className="ca-q-icon">Q</span>
                    <strong>{question.title || question.text || question.prompt || `Question ${idx + 1}`}</strong>
                    <span style={{ fontSize: '11px', color: '#ffd400', background: 'rgba(255, 212, 0, 0.1)', padding: '3px 8px', borderRadius: '4px', border: '1px solid rgba(255, 212, 0, 0.3)' }}>
                      {question.type}
                    </span>
                    <span>{question.points} Points</span>
                    {expanded === question.id ? (
                      <ChevronUp size={17} />
                    ) : (
                      <ChevronDown size={17} />
                    )}
                  </header>
                  {expanded === question.id && (
                    <div className="ca-question-body">
                      <label>
                        Question Title / Summary
                        <input
                          type="text"
                          value={question.title || ''}
                          onChange={(e) =>
                            updateQuestion(question.id, 'title', e.target.value)
                          }
                          placeholder="Short question title or headline..."
                        />
                      </label>
                      <label>
                        Question Text / Prompt *
                        <textarea
                          value={question.text || question.prompt || ''}
                          onChange={(e) =>
                            updateQuestion(question.id, 'text', e.target.value)
                          }
                          placeholder="Type question prompt, instructions, or problem statement..."
                        />
                      </label>
                      <div className="qb-form-grid">
                        <label>
                          Points Value
                          <input
                            type="number"
                            min="1"
                            value={question.points}
                            onChange={(e) =>
                              updateQuestion(question.id, 'points', e.target.value)
                            }
                          />
                        </label>
                        <label>
                          Type
                          <select
                            value={question.type}
                            onChange={(e) =>
                              updateQuestion(question.id, 'type', e.target.value)
                            }
                          >
                            <option value="Long Answer">Long Answer</option>
                            <option value="Short Answer">Short Answer</option>
                            <option value="Multiple Choice">Multiple Choice</option>
                            <option value="Coding">Coding</option>
                          </select>
                        </label>
                      </div>

                      {/* Multiple Choice Options Editor */}
                      {(question.type === 'Multiple Choice' || question.type === 'MCQ') && (
                        <div style={{ marginTop: '16px', marginBottom: '20px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#ffd400', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              Multiple Choice Options (Select Correct Answer):
                            </span>
                            <button
                              type="button"
                              onClick={() => addOption(question.id)}
                              style={{
                                background: 'rgba(255, 212, 0, 0.1)',
                                border: '1px solid #ffd400',
                                color: '#ffd400',
                                borderRadius: '4px',
                                padding: '4px 10px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontWeight: 600
                              }}
                            >
                              <Plus size={13} /> Add Option
                            </button>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {(question.options || []).map((opt, optIdx) => {
                              const isCorrect = Number(question.correct) === optIdx;
                              return (
                                <div
                                  key={optIdx}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    background: isCorrect ? 'rgba(255, 212, 0, 0.1)' : '#1f2024',
                                    border: isCorrect ? '1px solid #ffd400' : '1px solid #4a4b53',
                                    borderRadius: '6px',
                                    padding: '8px 12px'
                                  }}
                                >
                                  <input
                                    type="radio"
                                    name={`correct-${question.id}`}
                                    checked={isCorrect}
                                    onChange={() => setCorrectOption(question.id, optIdx)}
                                    title="Click to mark as correct answer"
                                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#ffd400' }}
                                  />
                                  <span style={{ fontWeight: 700, color: isCorrect ? '#ffd400' : '#aaa', minWidth: '22px', fontSize: '13px' }}>
                                    {String.fromCharCode(65 + optIdx)}.
                                  </span>
                                  <input
                                    type="text"
                                    value={opt}
                                    onChange={(e) => updateOption(question.id, optIdx, e.target.value)}
                                    placeholder={`Option ${String.fromCharCode(65 + optIdx)} text...`}
                                    style={{
                                      flex: 1,
                                      border: 'none',
                                      background: 'transparent',
                                      color: '#eee',
                                      outline: 'none',
                                      fontSize: '14px',
                                      height: 'auto',
                                      padding: '2px 0'
                                    }}
                                  />
                                  {isCorrect && (
                                    <span style={{ fontSize: '11px', color: '#ffd400', fontWeight: 700, padding: '2px 6px', background: 'rgba(255, 212, 0, 0.15)', borderRadius: '4px' }}>
                                      ✓ Correct
                                    </span>
                                  )}
                                  {(question.options || []).length > 2 && (
                                    <button
                                      type="button"
                                      onClick={() => removeOption(question.id, optIdx)}
                                      style={{ background: 'transparent', border: 'none', color: '#e33142', cursor: 'pointer', padding: '4px' }}
                                      title="Remove option"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Coding Boilerplate Editor */}
                      {question.type === 'Coding' && (
                        <div style={{ marginTop: '16px', marginBottom: '20px' }}>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#ffd400', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Candidate Starter Code Boilerplate
                          </label>
                          <textarea
                            value={question.boilerplate || ''}
                            onChange={(e) => updateQuestion(question.id, 'boilerplate', e.target.value)}
                            placeholder="// Starter code boilerplate for candidate solution...\nfunction solution(input) {\n  // Your code here\n}"
                            style={{
                              fontFamily: 'Consolas, monospace',
                              fontSize: '13px',
                              minHeight: '110px',
                              background: '#18191d',
                              border: '1px solid #4a4b53',
                              color: '#a7f3d0'
                            }}
                          />
                        </div>
                      )}

                      <button
                        type="button"
                        className="ca-remove"
                        onClick={() =>
                          setQuestions(questions.filter((q) => q.id !== question.id))
                        }
                      >
                        <Trash2 size={15} /> Remove Question
                      </button>
                    </div>
                  )}
                </article>
              ))}
              <div className="ca-import">
                <div>
                  <strong>Bulk Import Questions</strong>
                  <p>Quickly populate this assessment from your existing organization bank.</p>
                </div>
                <div>
                  <button
                    className="af-secondary"
                    onClick={() => navigate('/recruiter/question-bank')}
                  >
                    Import from Bank
                  </button>
                  <button className="af-secondary">
                    <Upload size={15} /> Upload CSV
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
    </AssessmentShell>
  );
}

export default CreateAssessmentPage;
