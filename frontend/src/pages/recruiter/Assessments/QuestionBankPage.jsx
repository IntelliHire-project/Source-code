import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Braces, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Copy,
  Edit3, FileQuestion, Filter, Globe2, Plus, Search, Trash2, X,
  Code2, Cpu, Database, Layers, Sparkles, Terminal, ShieldAlert
} from 'lucide-react';
import AssessmentShell from './AssessmentShell';
import './AssessmentFlow.css';

const CATEGORY_OPTIONS = [
  { id: 'All', label: 'All Categories' },
  { id: 'Frontend Core', label: 'Frontend Core', icon: Layers },
  { id: 'Backend Engineering', label: 'Backend Engineering', icon: Database },
  { id: 'Algorithms & Data Structures', label: 'Algorithms & DS', icon: Code2 },
  { id: 'System Architecture', label: 'System Architecture', icon: Cpu },
  { id: 'Aptitude & Reasoning', label: 'Aptitude & Logic', icon: Sparkles },
  { id: 'Soft Skills', label: 'Soft Skills', icon: Globe2 },
];

const INITIAL_QUESTIONS = [
  {
    id: 'Q-9842',
    title: 'Explain the difference between REST and GraphQL APIs',
    author: 'Sarah Miller',
    date: '2026-07-21',
    category: 'Backend Engineering',
    type: 'Open Ended',
    difficulty: 'Medium',
    status: 'Published',
    usage: 34,
    prompt: 'Compare REST over HTTP vs GraphQL query schemas regarding over-fetching, caching mechanisms, and schema evolution.'
  },
  {
    id: 'Q-9839',
    title: 'Build a reusable debounce utility with trailing invocation',
    author: 'Marcus Chen',
    date: '2026-07-18',
    category: 'Algorithms & Data Structures',
    type: 'Coding',
    difficulty: 'Hard',
    status: 'Published',
    usage: 27,
    language: 'JavaScript',
    prompt: 'Implement a debounce function in JavaScript that delays invoking func until after wait milliseconds have elapsed.',
    inputFormat: 'func (Function), wait (Number in ms)',
    outputFormat: 'Debounced function',
    constraints: 'Time Limit: 2000ms | Memory Limit: 256MB',
    sampleTestCases: [
      { input: 'debounce(fn, 300) -> Rapid burst 5 calls', expected: 'Invoked 1 time at t=350ms' }
    ],
    hiddenTestCount: 3
  },
  {
    id: 'Q-9835',
    title: 'React Reconciliation & Key Prop Heuristics',
    author: 'Sarah Miller',
    date: '2026-07-15',
    category: 'Frontend Core',
    type: 'Multiple Choice',
    difficulty: 'Medium',
    status: 'Published',
    usage: 41,
    prompt: 'How does React optimize virtual DOM tree diffing when lists rendered contain key props?'
  },
  {
    id: 'Q-9834',
    title: 'How would you resolve a technical conflict between engineering teams?',
    author: 'Sarah Miller',
    date: '2026-07-12',
    category: 'Soft Skills',
    type: 'Open Ended',
    difficulty: 'Medium',
    status: 'Draft',
    usage: 15,
    prompt: 'Describe a situation where backend and frontend teams disagreed on API contracts and how you reconciled it.'
  },
  {
    id: 'Q-9830',
    title: 'SQL Query Optimization for High Throughput Applications',
    author: 'Marcus Chen',
    date: '2026-07-05',
    category: 'Backend Engineering',
    type: 'Coding',
    difficulty: 'Hard',
    status: 'Published',
    usage: 22,
    language: 'SQL',
    prompt: 'Write an optimized SQL query using window functions (ROW_NUMBER) to fetch top 3 orders per candidate customer.',
    inputFormat: 'orders table (id, customer_id, order_date, total_amount)',
    outputFormat: 'Ranked results table',
    constraints: 'Must execute in < 150ms on 10,000,000 rows',
    sampleTestCases: [
      { input: '10 orders per customer across 500 customers', expected: 'Returns top 3 ordered by total_amount DESC per customer' }
    ],
    hiddenTestCount: 5
  },
  {
    id: 'Q-9828',
    title: 'Distributed System Rate Limiting Algorithms',
    author: 'Alex Vance',
    date: '2026-07-01',
    category: 'System Architecture',
    type: 'Multiple Choice',
    difficulty: 'Hard',
    status: 'Published',
    usage: 19,
    prompt: 'Which algorithm guarantees strict burst rate limits using Redis leaky bucket vs token bucket counters?'
  },
];

function QuestionBankPage() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState(INITIAL_QUESTIONS);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [notice, setNotice] = useState('');
  
  // Quick View / Sandbox Drawer State
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const visible = useMemo(() => questions.filter((q) => {
    const matchesQuery = `${q.title} ${q.category} ${q.type} ${q.status}`.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === 'All' || q.status === statusFilter;
    const matchesCategory = activeCategory === 'All' || q.category === activeCategory;
    return matchesQuery && matchesStatus && matchesCategory;
  }), [questions, query, statusFilter, activeCategory]);

  const openCreate = () => {
    navigate('/recruiter/question-bank/add');
  };

  const openEdit = (question) => {
    navigate(`/recruiter/question-bank/edit/${question.id}`, { state: { editMode: true, question } });
  };

  const openQuickView = (question) => {
    setSelectedQuestion(question);
    setDrawerOpen(true);
  };

  return (
    <AssessmentShell currentPage="Question Bank" onSearch={setQuery} searchPlaceholder="Search question bank by keyword, topic, or category...">
      <main className="af-page">
        {/* Title Header */}
        <div className="af-page-title">
          <div>
            <span className="af-eyebrow">Assessments / Question Repository</span>
            <h1>Question Bank & Categories</h1>
            <p>Organize questions by domain category and configure interactive Coding & Technical challenges.</p>
          </div>
          <button className="af-primary" onClick={openCreate}><Plus size={17} /> Add Question</button>
        </div>

        {notice && (
          <div className="af-success">
            <CheckCircle2 size={17} /> {notice}
            <button type="button" onClick={() => setNotice('')}><X size={15} /></button>
          </div>
        )}

        {/* ── Category Filter Pills Bar ── */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '16px' }}>
          {CATEGORY_OPTIONS.map((cat) => {
            const Icon = cat.icon || Filter;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: '600',
                  border: isActive ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.1)',
                  background: isActive ? 'rgba(99, 102, 241, 0.2)' : 'rgba(30, 41, 59, 0.5)',
                  color: isActive ? '#818cf8' : '#cbd5e1',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s'
                }}
              >
                {cat.icon && <Icon size={14} />}
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Toolbar */}
        <div className="af-toolbar">
          <label className="af-search">
            <Search size={17} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search questions..." />
          </label>
          <div className="qb-filter-wrap">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 14px', borderRadius: '8px', fontSize: '13px' }}
            >
              <option value="All">All Statuses</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Table Card */}
        <section className="qb-table-card">
          <div className="qb-table-head">
            <span>Question</span>
            <span>Category & Type</span>
            <span>Status</span>
            <span>Usage</span>
            <span>Actions</span>
          </div>

          {visible.map((q) => (
            <article className="qb-row" key={q.id} style={{ cursor: 'pointer' }} onClick={() => openQuickView(q)}>
              <div className="qb-question">
                <small>{q.id}</small>
                <div>
                  <strong>{q.title}</strong>
                  <span>{q.author} · {q.date}</span>
                </div>
              </div>

              <div className="qb-tags">
                <span style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                  {q.category}
                </span>
                <span style={{ background: q.type === 'Coding' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.06)', color: q.type === 'Coding' ? '#60a5fa' : '#cbd5e1', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>
                  {q.type === 'Coding' ? '💻 Coding' : q.type}
                </span>
                <span className={`difficulty-${q.difficulty.toLowerCase()}`}>{q.difficulty}</span>
              </div>

              <span className={`qb-status ${q.status.toLowerCase()}`}>{q.status}</span>

              <div className="qb-usage">
                <span><i style={{ width: `${Math.min(q.usage * 2, 100)}%` }} /></span>
                <b>{q.usage} tests</b>
              </div>

              <div className="qb-actions" onClick={(e) => e.stopPropagation()}>
                <button title="Edit question" onClick={() => openEdit(q)}><Edit3 size={16} /></button>
                <button title="Duplicate question" onClick={() => {
                  setQuestions([...questions, { ...q, id: `${q.id}-COPY-${Date.now()}`, title: `${q.title} (Copy)`, status: 'Draft', usage: 0 }]);
                  setNotice('Question duplicated as draft.');
                }}><Copy size={16} /></button>
                <button title="Delete question" onClick={() => {
                  if (window.confirm(`Delete "${q.title}"?`)) {
                    setQuestions(questions.filter((item) => item.id !== q.id));
                    setNotice('Question deleted.');
                  }
                }}><Trash2 size={16} /></button>
              </div>
            </article>
          ))}

          {!visible.length && (
            <div className="qb-empty">
              <FileQuestion size={30} />
              <strong>No questions found</strong>
              <span>Try clearing filters or changing category selection.</span>
            </div>
          )}

          <div className="qb-pagination">
            <button disabled><ChevronLeft size={15} /> Previous</button>
            <span className="active">1</span>
            <button>Next <ChevronRight size={15} /></button>
          </div>
        </section>
      </main>

      {/* ── Quick Sandbox / Details Drawer ── */}
      {drawerOpen && selectedQuestion && (
        <div className="qb-drawer-overlay" onMouseDown={(e) => e.target === e.currentTarget && setDrawerOpen(false)}>
          <aside className="qb-drawer" style={{ maxWidth: '580px', background: '#0f172a', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
            <header style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                    {selectedQuestion.category}
                  </span>
                  <span style={{ background: 'rgba(255,255,255,0.08)', color: '#e2e8f0', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>
                    {selectedQuestion.type}
                  </span>
                  <span style={{ color: '#f59e0b', fontSize: '12px', fontWeight: '600' }}>
                    {selectedQuestion.difficulty}
                  </span>
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', margin: 0 }}>{selectedQuestion.title}</h2>
                <small style={{ color: '#64748b' }}>{selectedQuestion.id} · Added by {selectedQuestion.author}</small>
              </div>
              <button onClick={() => setDrawerOpen(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
            </header>

            <div className="qb-form" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h3 style={{ fontSize: '14px', color: '#818cf8', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileQuestion size={16} /> Problem Statement & Description
                </h3>
                <div style={{ background: '#1e293b', padding: '14px', borderRadius: '8px', color: '#e2e8f0', fontSize: '14px', lineHeight: '1.6' }}>
                  {selectedQuestion.prompt}
                </div>
              </div>

              {selectedQuestion.type === 'Coding' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <h3 style={{ fontSize: '14px', color: '#60a5fa', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Code2 size={16} /> Coding Challenge Specifications
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px', background: '#090d16', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div><span style={{ color: '#94a3b8' }}>Language:</span> <strong style={{ color: '#60a5fa' }}>{selectedQuestion.language || 'JavaScript'}</strong></div>
                    <div><span style={{ color: '#94a3b8' }}>Hidden Test Cases:</span> <strong style={{ color: '#4ade80' }}>{selectedQuestion.hiddenTestCount || 3} Edge cases</strong></div>
                    <div style={{ gridColumn: '1 / -1' }}><span style={{ color: '#94a3b8' }}>Constraints:</span> <code style={{ color: '#fcd34d' }}>{selectedQuestion.constraints || 'Time Limit: 2000ms | Memory: 256MB'}</code></div>
                  </div>

                  {selectedQuestion.sampleTestCases && (
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Public Sample Test Cases:</span>
                      {selectedQuestion.sampleTestCases.map((tc, idx) => (
                        <div key={idx} style={{ background: '#090d16', padding: '10px', borderRadius: '6px', fontSize: '12px', marginTop: '6px', fontFamily: 'monospace' }}>
                          <div style={{ color: '#38bdf8' }}>Input: {tc.input}</div>
                          <div style={{ color: '#4ade80' }}>Expected Output: {tc.expected}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <footer style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button className="af-secondary" onClick={() => setDrawerOpen(false)}>Close</button>
              <button className="af-primary" onClick={() => { setDrawerOpen(false); openEdit(selectedQuestion); }}>
                <Edit3 size={15} /> Edit Question
              </button>
            </footer>
          </aside>
        </div>
      )}
    </AssessmentShell>
  );
}
export default QuestionBankPage;
