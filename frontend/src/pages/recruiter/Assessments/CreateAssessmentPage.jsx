import React, { useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, Clock3, FileText, HelpCircle, Plus, Save, SlidersHorizontal, Sparkles, Trash2, Upload } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import AssessmentShell from './AssessmentShell';
import './AssessmentFlow.css';

const JOB_ROLES = [
  'Senior Software Engineer — React',
  'Senior Backend Engineer — Node/Java',
  'Full Stack Developer',
  'QA Automation Engineer',
  'DevOps & Cloud Engineer',
  'Data Scientist & ML',
  'Business Analyst — Fintech'
];

const STARTER_QUESTIONS = [
  { id: 1, title: 'Describe the difference between server-side rendering and client-side rendering.', text: 'Describe the difference between server-side rendering and client-side rendering.', points: 10, type: 'Long Answer' },
  { id: 2, title: 'Implement a function to reverse a linked list.', text: 'Write a production-ready solution and explain its time complexity.', points: 20, type: 'Coding' },
];

function CreateAssessmentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isEditing = location.pathname.endsWith('/edit');
  const [questions, setQuestions] = useState(STARTER_QUESTIONS);
  const [expanded, setExpanded] = useState(1);
  const [saved, setSaved] = useState(false);
  const [autoTitle, setAutoTitle] = useState(!isEditing);

  const [config, setConfig] = useState({
    title: 'Senior Software Engineer — React Assessment — Senior',
    role: 'Senior Software Engineer — React',
    description: 'This assessment evaluates core competencies, architectural patterns, and hands-on coding problem-solving skills.',
    duration: 60,
    difficulty: 'Senior'
  });

  const handleRoleChange = (newRole) => {
    const updatedTitle = autoTitle ? `${newRole} Assessment — ${config.difficulty}` : config.title;
    setConfig({
      ...config,
      role: newRole,
      title: updatedTitle
    });
  };

  const handleDifficultyChange = (newDiff) => {
    const updatedTitle = autoTitle ? `${config.role} Assessment — ${newDiff}` : config.title;
    setConfig({
      ...config,
      difficulty: newDiff,
      title: updatedTitle
    });
  };

  const updateQuestion = (id, key, value) => setQuestions(questions.map((q) => q.id === id ? { ...q, [key]: value } : q));
  return (
    <AssessmentShell currentPage={isEditing ? 'Edit Assessment' : 'Create Assessment'}>
      <main className="af-page">
        <div className="af-page-title">
          <div><span className="af-eyebrow">Assessments / {isEditing ? 'Edit Assessment' : 'New Assessment'}</span><h1>{isEditing ? 'Edit Assessment' : 'Create New Assessment'}</h1><p>Configure your evaluation criteria and technical challenges.</p></div>
          <div className="af-title-actions"><button className="af-secondary" onClick={() => setSaved(true)}>Save as Draft</button><button className="af-primary" onClick={() => navigate('/recruiter/assessments')}><Save size={16} /> {isEditing ? 'Update Assessment' : 'Publish Assessment'}</button></div>
        </div>
        {saved && <div className="af-success"><CheckCircle2 size={17} /> Draft saved successfully.</div>}
        <div className="ca-layout">
          <aside>
            <section className="ca-config">
              <h2><SlidersHorizontal size={20} /> Configuration</h2><p>General settings for this assessment.</p>

              <label>Target Job Vacancy / Role
                <select value={config.role} onChange={(e) => handleRoleChange(e.target.value)}>
                  {JOB_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </label>

              <label>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span>Assessment Title</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {autoTitle ? (
                      <span style={{ fontSize: '11px', background: 'rgba(240,185,11,0.15)', color: '#F0B90B', padding: '2px 8px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                        <Sparkles size={11} /> Auto-generated
                      </span>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#9ca3af' }}>Custom</span>
                    )}
                    <button
                      type="button"
                      style={{ background: 'transparent', border: 'none', color: '#F0B90B', fontSize: '11px', cursor: 'pointer', textDecoration: 'underline' }}
                      onClick={() => {
                        if (!autoTitle) {
                          setAutoTitle(true);
                          setConfig(c => ({ ...c, title: `${c.role} Assessment — ${c.difficulty}` }));
                        } else {
                          setAutoTitle(false);
                        }
                      }}
                    >
                      {autoTitle ? 'Customize' : 'Revert to Auto'}
                    </button>
                  </div>
                </div>
                <input
                  value={config.title}
                  onChange={(e) => {
                    setAutoTitle(false);
                    setConfig({ ...config, title: e.target.value });
                  }}
                  placeholder="e.g., Senior Software Engineer Assessment"
                />
              </label>

              <label>Description<textarea value={config.description} onChange={(e) => setConfig({ ...config, description: e.target.value })} /></label>
              <div className="qb-form-grid">
                <label>Duration<div className="ca-input-icon"><Clock3 size={16} /><input type="number" value={config.duration} onChange={(e) => setConfig({ ...config, duration: e.target.value })} /></div><small>Minutes</small></label>
                <label>Difficulty
                  <select value={config.difficulty} onChange={(e) => handleDifficultyChange(e.target.value)}>
                    <option>Junior</option>
                    <option>Mid-level</option>
                    <option>Senior</option>
                  </select>
                </label>
              </div>
            </section>
            <section className="ca-tips"><div className="ca-tips-head"><h2>Recruiter Tips</h2><HelpCircle size={42} /></div><p><CheckCircle2 size={18} /> Keep assessments under <b>90 minutes</b> to ensure a high completion rate.</p><p><CheckCircle2 size={18} /> Include at least one coding challenge for senior roles.</p><button onClick={() => navigate('/recruiter/question-bank')}>View Best Practices <ChevronDown size={16} /></button></section>
          </aside>
          <section className="ca-bank">
            <div className="ca-bank-title"><h2><span><FileText size={18} /></span> Question Bank <small>{questions.length} Questions</small></h2><button onClick={() => setQuestions([...questions, { id: Date.now(), title: 'New assessment question', text: '', points: 10, type: 'Multiple Choice' }])}><Plus size={16} /> Add Question</button></div>
            {questions.map((question) => <article className="ca-question" key={question.id}>
              <header onClick={() => setExpanded(expanded === question.id ? null : question.id)}><span className="ca-q-icon">Q</span><strong>{question.title}</strong><span>{question.points} Points</span>{expanded === question.id ? <ChevronUp size={17} /> : <ChevronDown size={17} />}</header>
              {expanded === question.id && <div className="ca-question-body"><label>Question Text<textarea value={question.text} onChange={(e) => updateQuestion(question.id, 'text', e.target.value)} /></label><div className="qb-form-grid"><label>Points Value<input type="number" value={question.points} onChange={(e) => updateQuestion(question.id, 'points', e.target.value)} /></label><label>Type<select value={question.type} onChange={(e) => updateQuestion(question.id, 'type', e.target.value)}><option>Long Answer</option><option>Multiple Choice</option><option>Coding</option></select></label></div><button className="ca-remove" onClick={() => setQuestions(questions.filter((q) => q.id !== question.id))}><Trash2 size={15} /> Remove Question</button></div>}
            </article>)}
            <div className="ca-import"><div><strong>Bulk Import Questions</strong><p>Quickly populate this assessment from your existing organization bank.</p></div><div><button className="af-secondary" onClick={() => navigate('/recruiter/question-bank')}>Import from Bank</button><button className="af-secondary"><Upload size={15} /> Upload CSV</button></div></div>
          </section>
        </div>
      </main>
    </AssessmentShell>
  );
}
export default CreateAssessmentPage;
