import React, { useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, Clock3, FileText, HelpCircle, Plus, Save, SlidersHorizontal, Trash2, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AssessmentShell from './AssessmentShell';
import './AssessmentFlow.css';

const STARTER_QUESTIONS = [
  { id: 1, title: 'Describe the difference between server-side rendering and client-side rendering.', text: 'Describe the difference between server-side rendering and client-side rendering.', points: 10, type: 'Long Answer' },
  { id: 2, title: 'Implement a function to reverse a linked list.', text: 'Write a production-ready solution and explain its time complexity.', points: 20, type: 'Coding' },
];

function CreateAssessmentPage() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState(STARTER_QUESTIONS);
  const [expanded, setExpanded] = useState(1);
  const [saved, setSaved] = useState(false);
  const [config, setConfig] = useState({ title: 'Senior Frontend Engineer - React', role: 'Software Engineering', description: 'This assessment evaluates core React competencies, architectural patterns, and problem-solving skills for senior-level candidates.', duration: 60, difficulty: 'Senior' });
  const updateQuestion = (id, key, value) => setQuestions(questions.map((q) => q.id === id ? { ...q, [key]: value } : q));
  return (
    <AssessmentShell>
      <main className="af-page">
        <div className="af-page-title">
          <div><span className="af-eyebrow">Assessments / New Assessment</span><h1>Create New Assessment</h1><p>Configure your evaluation criteria and technical challenges.</p></div>
          <div className="af-title-actions"><button className="af-secondary" onClick={() => setSaved(true)}>Save as Draft</button><button className="af-primary" onClick={() => navigate('/recruiter/assessments')}><Save size={16} /> Publish Assessment</button></div>
        </div>
        {saved && <div className="af-success"><CheckCircle2 size={17} /> Draft saved successfully.</div>}
        <div className="ca-layout">
          <aside>
            <section className="ca-config">
              <h2><SlidersHorizontal size={20} /> Configuration</h2><p>General settings for this assessment.</p>
              <label>Assessment Title<input value={config.title} onChange={(e) => setConfig({ ...config, title: e.target.value })} /></label>
              <label>Target Role<input value={config.role} onChange={(e) => setConfig({ ...config, role: e.target.value })} /></label>
              <label>Description<textarea value={config.description} onChange={(e) => setConfig({ ...config, description: e.target.value })} /></label>
              <div className="qb-form-grid"><label>Duration<div className="ca-input-icon"><Clock3 size={16} /><input type="number" value={config.duration} onChange={(e) => setConfig({ ...config, duration: e.target.value })} /></div><small>Minutes</small></label><label>Difficulty<select value={config.difficulty} onChange={(e) => setConfig({ ...config, difficulty: e.target.value })}><option>Junior</option><option>Mid-level</option><option>Senior</option></select></label></div>
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
