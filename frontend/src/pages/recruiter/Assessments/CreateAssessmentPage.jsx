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
  { id: 1, title: 'Describe the difference between server-side rendering and client-side rendering.', text: 'Describe the difference between server-side rendering and client-side rendering.', points: 10, type: 'Long Answer' },
  { id: 2, title: 'Implement a function to reverse a linked list.', text: 'Write a production-ready solution and explain its time complexity.', points: 20, type: 'Coding' },
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
              setQuestions(a.questions);
              setExpanded(a.questions[0].id);
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
    setQuestions(questions.map((q) => (q.id === id ? { ...q, [key]: value } : q)));
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

      const payload = {
        title: assessmentTitle,
        description: config.description,
        jobRole: roleToSave,
        role: roleToSave,
        duration: Number(config.duration) || 60,
        difficulty: config.difficulty,
        status: targetStatus,
        questions: questions,
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
                  onClick={() =>
                    setQuestions([
                      ...questions,
                      {
                        id: Date.now(),
                        title: 'New assessment question',
                        text: '',
                        points: 10,
                        type: 'Multiple Choice',
                      },
                    ])
                  }
                >
                  <Plus size={16} /> Add Question
                </button>
              </div>
              {questions.map((question) => (
                <article className="ca-question" key={question.id}>
                  <header
                    onClick={() =>
                      setExpanded(expanded === question.id ? null : question.id)
                    }
                  >
                    <span className="ca-q-icon">Q</span>
                    <strong>{question.title}</strong>
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
                        Question Text
                        <textarea
                          value={question.text}
                          onChange={(e) =>
                            updateQuestion(question.id, 'text', e.target.value)
                          }
                        />
                      </label>
                      <div className="qb-form-grid">
                        <label>
                          Points Value
                          <input
                            type="number"
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
                            <option>Long Answer</option>
                            <option>Multiple Choice</option>
                            <option>Coding</option>
                          </select>
                        </label>
                      </div>
                      <button
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
