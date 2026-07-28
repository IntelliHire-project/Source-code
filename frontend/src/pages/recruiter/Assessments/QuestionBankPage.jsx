import React, { useMemo, useState } from 'react';
import {
  Braces, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Copy,
  Edit3, FileQuestion, Filter, Globe2, Plus, Search, Trash2, X,
} from 'lucide-react';
import AssessmentShell from './AssessmentShell';
import './AssessmentFlow.css';

const INITIAL_QUESTIONS = [
  { id: 'Q-9842', title: 'Explain the difference between REST and GraphQL APIs', author: 'Sarah Miller', date: '2026-07-21', category: 'Technical', type: 'Open Ended', difficulty: 'Medium', status: 'Published', usage: 34 },
  { id: 'Q-9839', title: 'Build a reusable debounce utility in JavaScript', author: 'Marcus Chen', date: '2026-07-18', category: 'Technical', type: 'Coding', difficulty: 'Hard', status: 'Published', usage: 27 },
  { id: 'Q-9834', title: 'How would you resolve a conflict between stakeholders?', author: 'Sarah Miller', date: '2026-07-12', category: 'Soft Skills', type: 'Open Ended', difficulty: 'Medium', status: 'Draft', usage: 15 },
  { id: 'Q-9830', title: 'SQL Query Optimization for High Traffic Apps', author: 'Marcus Chen', date: '2026-07-05', category: 'Technical', type: 'Coding', difficulty: 'Hard', status: 'Archived', usage: 12 },
  { id: 'Q-9828', title: 'Effective Communication with Stakeholders', author: 'Sarah Miller', date: '2026-07-01', category: 'Soft Skills', type: 'Open Ended', difficulty: 'Medium', status: 'Published', usage: 20 },
];

function QuestionBankPage() {
  const [questions, setQuestions] = useState(INITIAL_QUESTIONS);
  const [query, setQuery] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [answerType, setAnswerType] = useState('Multiple Choice');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correct, setCorrect] = useState(0);
  const [form, setForm] = useState({ title: '', category: 'Technical', difficulty: 'Easy', prompt: '' });

  const visible = useMemo(() => questions.filter((q) =>
    `${q.title} ${q.category} ${q.type} ${q.status}`.toLowerCase().includes(query.toLowerCase())
  ), [questions, query]);

  const publish = (draft = false) => {
    if (!form.title.trim()) return;
    setQuestions([{ id: `Q-${9850 + questions.length}`, title: form.title, author: 'Sarah Parker', date: '2026-07-28', category: form.category, type: answerType, difficulty: form.difficulty, status: draft ? 'Draft' : 'Published', usage: 0 }, ...questions]);
    setDrawerOpen(false);
    setForm({ title: '', category: 'Technical', difficulty: 'Easy', prompt: '' });
  };

  return (
    <AssessmentShell onSearch={setQuery} searchPlaceholder="Search question bank...">
      <main className="af-page">
        <div className="af-page-title">
          <div><span className="af-eyebrow">Assessments / Question Bank</span><h1>Question Bank</h1><p>Create, organize, and reuse questions across your assessments.</p></div>
          <button className="af-primary" onClick={() => setDrawerOpen(true)}><Plus size={17} /> Add Question</button>
        </div>
        <div className="af-toolbar">
          <label className="af-search"><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by question, category, or type..." /></label>
          <button className="af-secondary"><Filter size={16} /> All Filters</button>
        </div>
        <section className="qb-table-card">
          <div className="qb-table-head"><span>Question</span><span>Classification</span><span>Status</span><span>Usage</span><span>Actions</span></div>
          {visible.map((q) => (
            <article className="qb-row" key={q.id}>
              <div className="qb-question"><small>{q.id}</small><div><strong>{q.title}</strong><span>{q.author} · {q.date}</span></div></div>
              <div className="qb-tags"><span>{q.category}</span><span>{q.type}</span><span className={`difficulty-${q.difficulty.toLowerCase()}`}>{q.difficulty}</span></div>
              <span className={`qb-status ${q.status.toLowerCase()}`}>{q.status}</span>
              <div className="qb-usage"><span><i style={{ width: `${Math.min(q.usage * 2, 100)}%` }} /></span><b>{q.usage} tests</b></div>
              <div className="qb-actions"><button title="Edit"><Edit3 size={16} /></button><button title="Duplicate" onClick={() => setQuestions([...questions, { ...q, id: `${q.id}-COPY` }])}><Copy size={16} /></button><button title="Delete" onClick={() => setQuestions(questions.filter((item) => item.id !== q.id))}><Trash2 size={16} /></button></div>
            </article>
          ))}
          <div className="qb-pagination"><button disabled><ChevronLeft size={15} /> Previous</button><span className="active">1</span><span>2</span><span>3</span><span>...</span><span>24</span><button>Next <ChevronRight size={15} /></button></div>
        </section>
        <section className="qb-guidelines">
          <div><h2>Question Guidelines</h2><p>Maintain high quality standards for the IntelliHire assessment marketplace.</p><button className="af-primary small">Read Style Guide</button></div>
          <div className="qb-guide-list"><details open><summary>Best practices for Multiple Choice logic? <ChevronDown size={16} /></summary><p>Include at least four options with one clearly correct answer. Keep distractors plausible and avoid ambiguous wording.</p></details><details><summary>Setting difficulty levels correctly <ChevronDown size={16} /></summary><p>Match difficulty to the expected role seniority and the reasoning depth required.</p></details></div>
        </section>
      </main>

      {drawerOpen && <div className="qb-drawer-overlay" onMouseDown={(e) => e.target === e.currentTarget && setDrawerOpen(false)}>
        <aside className="qb-drawer">
          <header><div><h2>Create New Question</h2><p>Configure question details and scoring logic.</p></div><button onClick={() => setDrawerOpen(false)}><X size={20} /></button></header>
          <div className="qb-form">
            <h3><FileQuestion size={17} /> Basic Information</h3>
            <label>Question Title<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g., Explain the difference between..." /></label>
            <div className="qb-form-grid"><label>Category<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option>Technical</option><option>Soft Skills</option><option>Aptitude</option></select></label><label>Difficulty<select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}><option>Easy</option><option>Medium</option><option>Hard</option></select></label></div>
            <h3><Braces size={17} /> Question Content</h3>
            <label>Prompt Description<textarea value={form.prompt} onChange={(e) => setForm({ ...form, prompt: e.target.value })} placeholder="Enter the full question text here..." /></label>
            <label>Answer Type</label>
            <div className="qb-answer-types">{[['Multiple Choice', CheckCircle2], ['Coding', Braces], ['Open Ended', Globe2]].map(([type, Icon]) => <button className={answerType === type ? 'selected' : ''} onClick={() => setAnswerType(type)} key={type}><Icon size={22} />{type}</button>)}</div>
            {answerType === 'Multiple Choice' && <div className="qb-options"><div><span>Options & Correctness</span><button onClick={() => setOptions([...options, ''])}><Plus size={15} /> Add Option</button></div>{options.map((option, index) => <label key={index}><button className={correct === index ? 'correct' : ''} onClick={() => setCorrect(index)} type="button" aria-label={`Mark option ${index + 1} correct`} /><input value={option} onChange={(e) => setOptions(options.map((item, i) => i === index ? e.target.value : item))} placeholder={`Option ${index + 1} text...`} /><button type="button" onClick={() => setOptions(options.filter((_, i) => i !== index))}><Trash2 size={15} /></button></label>)}</div>}
          </div>
          <footer><button className="af-secondary" onClick={() => setDrawerOpen(false)}>Discard Changes</button><div><button className="af-secondary" onClick={() => publish(true)}>Save as Draft</button><button className="af-primary" onClick={() => publish(false)}>Publish Question</button></div></footer>
        </aside>
      </div>}
    </AssessmentShell>
  );
}
export default QuestionBankPage;
