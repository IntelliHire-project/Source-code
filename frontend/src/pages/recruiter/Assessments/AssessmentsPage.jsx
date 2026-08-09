import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Award,
  BarChart3,
  BookOpen,
  Braces,
  CheckCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  Clock3,
  Copy,
  Download,
  Edit3,
  Eye,
  Filter,
  GripVertical,
  HelpCircle,
  Link2,
  Lock,
  MessageSquare,
  Plus,
  RefreshCw,
  Search,
  Send,
  Settings2,
  Shield,
  ShieldCheck,
  Shuffle,
  Star,
  Trash2,
  TrendingUp,
  Upload,
  Users,
  X,
  XCircle,
  Zap,
} from 'lucide-react';
import RecruiterSidebar from '../../../components/common/RecruiterSidebar';
import TopBar from '../../../components/TopBar/TopBar';
import './AssessmentsPage.css';

/* ─────────────────────────────────────────────────────────────────
   MOCK DATA
───────────────────────────────────────────────────────────────── */

const QUESTIONS = [
  { id: 'Q-001', snippet: 'Explain the difference between REST and GraphQL APIs and when you would choose one over the other.', role: 'Software Engineer', skills: ['API Design', 'REST', 'GraphQL'], type: 'Short Answer', difficulty: 'Medium', evalMode: 'Manual Review', points: 10 },
  { id: 'Q-002', snippet: 'Which of the following is NOT a JavaScript data type? (A) undefined (B) boolean (C) float (D) symbol', role: 'Software Engineer', skills: ['JavaScript', 'Core JS'], type: 'MCQ', difficulty: 'Easy', evalMode: 'Auto-graded', points: 5, options: ['undefined', 'boolean', 'float', 'symbol'], correct: 2 },
  { id: 'Q-003', snippet: 'Write a function to find the longest substring without repeating characters.', role: 'Software Engineer', skills: ['Algorithms', 'Java'], type: 'Coding', difficulty: 'Hard', evalMode: 'Manual Review', points: 20 },
  { id: 'Q-004', snippet: 'Describe three key differences between SQL and NoSQL databases and provide use cases for each.', role: 'QA Engineer', skills: ['SQL', 'Database'], type: 'Short Answer', difficulty: 'Medium', evalMode: 'Manual Review', points: 10 },
  { id: 'Q-005', snippet: 'What is the output of the following React code snippet? (A) renders null (B) throws error (C) renders empty div (D) renders children', role: 'Software Engineer', skills: ['React', 'JSX'], type: 'MCQ', difficulty: 'Medium', evalMode: 'Auto-graded', points: 5, options: ['renders null', 'throws error', 'renders empty div', 'renders children'], correct: 0 },
  { id: 'Q-006', snippet: 'Describe the requirements gathering process you would follow when joining a new project mid-sprint.', role: 'Business Analyst', skills: ['Requirements', 'Agile'], type: 'Short Answer', difficulty: 'Medium', evalMode: 'Manual Review', points: 10 },
  { id: 'Q-007', snippet: 'Implement a binary search tree with insert, search, and in-order traversal methods.', role: 'Software Engineer', skills: ['Algorithms', 'Data Structures'], type: 'Coding', difficulty: 'Hard', evalMode: 'Manual Review', points: 25 },
  { id: 'Q-008', snippet: 'Which HTTP status code represents a successful resource creation? (A) 200 (B) 201 (C) 204 (D) 301', role: 'QA Engineer', skills: ['HTTP', 'REST'], type: 'MCQ', difficulty: 'Easy', evalMode: 'Auto-graded', points: 5, options: ['200 OK', '201 Created', '204 No Content', '301 Redirect'], correct: 1 },
];

const ASSESSMENTS = [
  { id: 'A-001', name: 'Senior Frontend Engineer Assessment', vacancy: 'Senior Software Engineer — React', duration: 90, passing: 70, totalQ: 12, invited: 42, status: 'Active' },
  { id: 'A-002', name: 'QA Automation Fundamentals', vacancy: 'QA Engineer — Automation', duration: 60, passing: 65, totalQ: 8, invited: 18, status: 'Active' },
  { id: 'A-003', name: 'Business Analyst Case Study', vacancy: 'Business Analyst — Fintech', duration: 75, passing: 70, totalQ: 10, invited: 0, status: 'Draft' },
  { id: 'A-004', name: 'DevOps Fundamentals Challenge', vacancy: 'Junior DevOps Engineer', duration: 45, passing: 60, totalQ: 15, invited: 56, status: 'Active' },
  { id: 'A-005', name: 'Java Backend Proficiency Test', vacancy: 'Java Backend Developer', duration: 120, passing: 75, totalQ: 18, invited: 31, status: 'Draft' },
];

const CANDIDATES = [
  {
    id: 'C-001', name: 'Marcus Chen', initials: 'MC', role: 'Senior Software Engineer', completedDate: 'Jul 27, 2026',
    autoScore: 68, manualStatus: 'Graded', finalScore: 84, recommendation: 'Shortlist',
    responses: [
      { id: 'Q-002', question: 'Which of the following is NOT a JavaScript data type?', type: 'MCQ', answer: 'float', correct: true, points: 5, maxPoints: 5 },
      { id: 'Q-005', question: 'What is the output of the following React code snippet?', type: 'MCQ', answer: 'renders null', correct: true, points: 5, maxPoints: 5 },
      { id: 'Q-001', question: 'Explain the difference between REST and GraphQL APIs.', type: 'Short Answer', answer: 'REST is an architectural style that uses HTTP verbs and stateless communication. GraphQL is a query language that allows clients to request exactly what they need. I would choose REST for simple CRUD APIs and GraphQL for complex, interconnected data requirements.', rubric: 'Award full marks for mentioning: (1) HTTP verbs vs query language, (2) stateless vs flexible fetching, (3) appropriate use case differentiation.', manualScore: 8, maxPoints: 10, evaluatorComment: 'Good explanation of both paradigms. Missing discussion of over-fetching/under-fetching problem.' },
      { id: 'Q-003', question: 'Write a function to find the longest substring without repeating characters.', type: 'Coding', answer: 'function lengthOfLongestSubstring(s) {\n  let max = 0, left = 0;\n  const map = new Map();\n  for (let right = 0; right < s.length; right++) {\n    if (map.has(s[right])) left = Math.max(left, map.get(s[right]) + 1);\n    map.set(s[right], right);\n    max = Math.max(max, right - left + 1);\n  }\n  return max;\n}', rubric: 'Award marks for: (1) sliding window approach O(n), (2) correct pointer management, (3) handles edge cases.', manualScore: 18, maxPoints: 20, evaluatorComment: 'Excellent sliding window solution. Minor style points deducted.' },
    ],
    cvMatchRank: 2,
  },
  {
    id: 'C-002', name: 'Aisha Fernando', initials: 'AF', role: 'Senior Software Engineer', completedDate: 'Jul 27, 2026',
    autoScore: 75, manualStatus: 'Needs Grading', finalScore: null, recommendation: 'Pending',
    responses: [
      { id: 'Q-002', question: 'Which of the following is NOT a JavaScript data type?', type: 'MCQ', answer: 'float', correct: true, points: 5, maxPoints: 5 },
      { id: 'Q-005', question: 'What is the output of the following React code snippet?', type: 'MCQ', answer: 'throws error', correct: false, points: 0, maxPoints: 5 },
      { id: 'Q-001', question: 'Explain the difference between REST and GraphQL APIs.', type: 'Short Answer', answer: 'REST uses HTTP methods like GET POST PUT DELETE. GraphQL uses a single endpoint and lets you query exactly what you need avoiding over-fetching which REST sometimes causes.', rubric: 'Award full marks for mentioning: (1) HTTP verbs vs query language, (2) stateless vs flexible fetching, (3) appropriate use case differentiation.', manualScore: null, maxPoints: 10, evaluatorComment: '' },
      { id: 'Q-003', question: 'Write a function to find the longest substring without repeating characters.', type: 'Coding', answer: 'function solve(s) {\n  const set = new Set();\n  let max = 0, i = 0;\n  for (let j = 0; j < s.length; j++) {\n    while (set.has(s[j])) { set.delete(s[i]); i++; }\n    set.add(s[j]);\n    max = Math.max(max, j - i + 1);\n  }\n  return max;\n}', rubric: 'Award marks for: (1) sliding window approach O(n), (2) correct pointer management, (3) handles edge cases.', manualScore: null, maxPoints: 20, evaluatorComment: '' },
    ],
    cvMatchRank: 1,
  },
  {
    id: 'C-003', name: 'Daniel Silva', initials: 'DS', role: 'Senior Software Engineer', completedDate: 'Jul 26, 2026',
    autoScore: 50, manualStatus: 'Needs Grading', finalScore: null, recommendation: 'Pending',
    responses: [
      { id: 'Q-002', question: 'Which of the following is NOT a JavaScript data type?', type: 'MCQ', answer: 'boolean', correct: false, points: 0, maxPoints: 5 },
      { id: 'Q-005', question: 'What is the output of the following React code snippet?', type: 'MCQ', answer: 'renders null', correct: true, points: 5, maxPoints: 5 },
      { id: 'Q-001', question: 'Explain the difference between REST and GraphQL APIs.', type: 'Short Answer', answer: 'REST is old, GraphQL is newer and better. GraphQL lets you get data more easily.', rubric: 'Award full marks for mentioning: (1) HTTP verbs vs query language, (2) stateless vs flexible fetching, (3) appropriate use case differentiation.', manualScore: null, maxPoints: 10, evaluatorComment: '' },
      { id: 'Q-003', question: 'Write a function to find the longest substring without repeating characters.', type: 'Coding', answer: '// Could not complete this question in time', rubric: 'Award marks for: (1) sliding window approach O(n), (2) correct pointer management, (3) handles edge cases.', manualScore: null, maxPoints: 20, evaluatorComment: '' },
    ],
    cvMatchRank: 5,
  },
  {
    id: 'C-004', name: 'Nadia Perera', initials: 'NP', role: 'QA Engineer', completedDate: 'Jul 28, 2026',
    autoScore: 80, manualStatus: 'Graded', finalScore: 88, recommendation: 'Shortlist',
    responses: [
      { id: 'Q-008', question: 'Which HTTP status code represents a successful resource creation?', type: 'MCQ', answer: '201 Created', correct: true, points: 5, maxPoints: 5 },
      { id: 'Q-004', question: 'Describe three key differences between SQL and NoSQL databases.', type: 'Short Answer', answer: 'SQL is structured with fixed schema, ACID compliant and great for relational data. NoSQL is schema-less, horizontally scalable and better for unstructured data. Use cases: SQL for banking systems; NoSQL for social media feeds.', rubric: 'Award marks for: (1) schema difference, (2) ACID vs BASE, (3) scaling model, (4) correct use cases.', manualScore: 8, maxPoints: 10, evaluatorComment: 'Strong answer covering all key points.' },
    ],
    cvMatchRank: 3,
  },
];

/* ─────────────────────────────────────────────────────────────────
   HELPER COMPONENTS
───────────────────────────────────────────────────────────────── */

function Badge({ type, children }) {
  return <span className={`am-badge am-badge--${type}`}>{children}</span>;
}

function DifficultyBadge({ level }) {
  const map = { Easy: 'easy', Medium: 'medium', Hard: 'hard' };
  return <span className={`am-diff am-diff--${map[level] || 'medium'}`}>{level}</span>;
}

function TypeBadge({ type }) {
  const icons = { MCQ: <CheckCircle2 size={11} />, 'Short Answer': <MessageSquare size={11} />, Coding: <Braces size={11} /> };
  return <span className="am-type-badge">{icons[type]}{type}</span>;
}

function EvalBadge({ mode }) {
  const isAuto = mode === 'Auto-graded';
  return <span className={`am-eval-badge ${isAuto ? 'am-eval-badge--auto' : 'am-eval-badge--manual'}`}>{isAuto ? <Zap size={11} /> : <Eye size={11} />}{mode}</span>;
}

function StatusBadge({ status }) {
  return <span className={`am-status am-status--${status.toLowerCase().replace(/\s+/g, '-')}`}>{status}</span>;
}

function RecommendationBadge({ rec }) {
  if (rec === 'Shortlist') return <span className="am-rec am-rec--shortlist"><Star size={11} />Shortlist</span>;
  if (rec === 'Reject') return <span className="am-rec am-rec--reject"><XCircle size={11} />Reject</span>;
  return <span className="am-rec am-rec--pending"><Clock size={11} />Pending</span>;
}

/* ─────────────────────────────────────────────────────────────────
   TAB 1 — QUESTION BANK
───────────────────────────────────────────────────────────────── */

function QuestionBankTab() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState(QUESTIONS);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [diffFilter, setDiffFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [evalFilter, setEvalFilter] = useState('All');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [previewQ, setPreviewQ] = useState(null);
  const [notice, setNotice] = useState('');

  const openCreate = () => {
    navigate('/recruiter/question-bank/add');
  };

  const openEdit = (q) => {
    navigate(`/recruiter/question-bank/edit/${q.id}`, { state: { editMode: true, question: q } });
  };

  const filtered = useMemo(() => questions.filter(q => {
    const text = `${q.snippet} ${q.role} ${q.type} ${q.difficulty} ${q.evalMode}`.toLowerCase();
    return text.includes(query.toLowerCase())
      && (roleFilter === 'All' || q.role === roleFilter)
      && (diffFilter === 'All' || q.difficulty === diffFilter)
      && (typeFilter === 'All' || q.type === typeFilter)
      && (evalFilter === 'All' || q.evalMode === evalFilter);
  }), [questions, query, roleFilter, diffFilter, typeFilter, evalFilter]);

  const duplicate = (q) => {
    setQuestions([{ ...q, id: `Q-${String(Date.now()).slice(-3)}`, snippet: `${q.snippet} (Copy)` }, ...questions]);
    setNotice('Question duplicated.');
    setTimeout(() => setNotice(''), 3000);
  };

  const deleteQ = (id) => {
    if (!window.confirm('Delete this question?')) return;
    setQuestions(questions.filter(q => q.id !== id));
    setNotice('Question deleted.');
    setTimeout(() => setNotice(''), 3000);
  };

  return (
    <div className="am-tab-panel">
      {/* ── Toolbar ── */}
      <div className="am-toolbar">
        <label className="am-search">
          <Search size={16} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search questions by keyword, role, or type..." />
        </label>
        <div className="am-filter-wrap">
          <button className={`am-btn am-btn--ghost ${filtersOpen ? 'is-active' : ''}`} onClick={() => setFiltersOpen(!filtersOpen)}>
            <Filter size={15} /> Filters {(roleFilter !== 'All' || diffFilter !== 'All' || typeFilter !== 'All' || evalFilter !== 'All') && <span className="am-filter-dot" />}
          </button>
          {filtersOpen && (
            <div className="am-filter-panel">
              <div className="am-filter-panel__header">
                <span>Filters</span>
                <button onClick={() => { setRoleFilter('All'); setDiffFilter('All'); setTypeFilter('All'); setEvalFilter('All'); }}>Clear all</button>
              </div>
              <label className="am-filter-label">Job Role
                <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                  <option>All</option>
                  <option>Software Engineer</option>
                  <option>QA Engineer</option>
                  <option>Business Analyst</option>
                </select>
              </label>
              <label className="am-filter-label">Difficulty
                <select value={diffFilter} onChange={e => setDiffFilter(e.target.value)}>
                  <option>All</option>
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
              </label>
              <label className="am-filter-label">Question Type
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                  <option>All</option>
                  <option>MCQ</option>
                  <option>Short Answer</option>
                  <option>Coding</option>
                </select>
              </label>
              <label className="am-filter-label">Evaluation Mode
                <select value={evalFilter} onChange={e => setEvalFilter(e.target.value)}>
                  <option>All</option>
                  <option>Auto-graded</option>
                  <option>Manual Review</option>
                </select>
              </label>
            </div>
          )}
        </div>
        <button className="am-btn am-btn--ghost"><Upload size={15} /> Import CSV/Excel</button>
        <button className="am-btn am-btn--primary" onClick={openCreate}><Plus size={16} /> Add New Question</button>
      </div>

      {/* ── Notice ── */}
      {notice && (
        <div className="am-notice">
          <CheckCircle2 size={16} /> {notice}
          <button onClick={() => setNotice('')}><X size={14} /></button>
        </div>
      )}

      {/* ── Table ── */}
      <div className="am-table-wrap">
        <table className="am-table">
          <thead>
            <tr>
              <th style={{ width: '36%' }}>Question Snippet</th>
              <th>Job Role & Skills</th>
              <th>Type</th>
              <th>Difficulty</th>
              <th>Evaluation</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(q => (
              <tr key={q.id}>
                <td>
                  <div className="am-q-snippet">
                    <span className="am-q-id">{q.id}</span>
                    <p>{q.snippet.length > 90 ? q.snippet.slice(0, 90) + '…' : q.snippet}</p>
                    <span className="am-q-pts"><Award size={12} /> {q.points} pts</span>
                  </div>
                </td>
                <td>
                  <div className="am-skill-wrap">
                    <span className="am-role-pill">{q.role}</span>
                    {q.skills.map(s => <span key={s} className="am-skill-pill">{s}</span>)}
                  </div>
                </td>
                <td><TypeBadge type={q.type} /></td>
                <td><DifficultyBadge level={q.difficulty} /></td>
                <td><EvalBadge mode={q.evalMode} /></td>
                <td>
                  <div className="am-row-actions">
                    <button title="Preview question" onClick={() => setPreviewQ(q)}><Eye size={15} /></button>
                    <button title="Edit question" onClick={() => openEdit(q)}><Edit3 size={15} /></button>
                    <button title="Duplicate question" onClick={() => duplicate(q)}><Copy size={15} /></button>
                    <button title="Delete question" className="danger" onClick={() => deleteQ(q.id)}><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr><td colSpan={6} className="am-table-empty">
                <HelpCircle size={32} />
                <strong>No questions found</strong>
                <span>Try adjusting your search or filters, or add a new question.</span>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      <div className="am-table-footer">
        <span>Showing <strong>{filtered.length}</strong> of <strong>{questions.length}</strong> questions</span>
        <div className="am-pagination">
          <button disabled><ChevronLeft size={14} /> Previous</button>
          <button className="active">1</button>
          <button>2</button>
          <button>3</button>
          <span>…</span>
          <button>12</button>
          <button>Next <ChevronRight size={14} /></button>
        </div>
      </div>

      {/* ── Preview Modal ── */}
      {previewQ && (
        <div className="am-overlay" onMouseDown={e => e.target === e.currentTarget && setPreviewQ(null)}>
          <div className="am-modal">
            <header className="am-modal__header">
              <div>
                <span className="am-modal__eyebrow">{previewQ.id} · {previewQ.role}</span>
                <h2>Question Preview</h2>
              </div>
              <button className="am-drawer__close" onClick={() => setPreviewQ(null)}><X size={20} /></button>
            </header>
            <div className="am-modal__body">
              <div className="am-preview-meta">
                <TypeBadge type={previewQ.type} />
                <DifficultyBadge level={previewQ.difficulty} />
                <EvalBadge mode={previewQ.evalMode} />
                <span className="am-preview-pts"><Award size={13} /> {previewQ.points} points</span>
              </div>
              <div className="am-preview-question">{previewQ.snippet}</div>
              {previewQ.type === 'MCQ' && previewQ.options && (
                <div className="am-preview-options">
                  {previewQ.options.map((opt, i) => (
                    <div key={i} className={`am-preview-option ${i === previewQ.correct ? 'correct' : ''}`}>
                      <span className="am-preview-option__letter">{String.fromCharCode(65 + i)}</span>
                      {opt}
                      {i === previewQ.correct && <CheckCircle2 size={15} className="am-preview-check" />}
                    </div>
                  ))}
                </div>
              )}
              {previewQ.type !== 'MCQ' && (
                <div className="am-preview-rubric">
                  <strong><Eye size={13} /> Scoring Rubric / Model Answer</strong>
                  <p>Evaluator reviews candidate response against the defined rubric and awards partial or full marks.</p>
                </div>
              )}
              <div className="am-preview-skills">
                {previewQ.skills.map(s => <span key={s} className="am-skill-pill">{s}</span>)}
              </div>
            </div>
            <footer className="am-modal__footer">
              <button className="am-btn am-btn--ghost" onClick={() => setPreviewQ(null)}>Close</button>
              <button className="am-btn am-btn--primary" onClick={() => { openEdit(previewQ); setPreviewQ(null); }}><Edit3 size={15} /> Edit Question</button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   TAB 2 — ASSESSMENTS
───────────────────────────────────────────────────────────────── */

function AssessmentsTab() {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState(ASSESSMENTS);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [query, setQuery] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedQs, setSelectedQs] = useState([]);
  const [notice, setNotice] = useState('');

  const [form, setForm] = useState({
    title: '', vacancy: '', duration: 60, passing: 70,
    autoSend: false, randomize: false, blockCopyPaste: false,
    sections: [{ name: 'Section 1: Aptitude', duration: 15 }, { name: 'Section 2: Technical', duration: 30 }],
  });

  const filtered = assessments.filter(a => `${a.name} ${a.vacancy} ${a.status}`.toLowerCase().includes(query.toLowerCase()));

  const openWizard = () => { setWizardStep(1); setForm({ title: '', vacancy: '', duration: 60, passing: 70, autoSend: false, randomize: false, blockCopyPaste: false, sections: [{ name: 'Section 1: Aptitude', duration: 15 }, { name: 'Section 2: Technical', duration: 30 }] }); setSelectedQs([]); setWizardOpen(true); };

  const publishAssessment = () => {
    if (!form.title.trim()) return;
    setAssessments([{
      id: `A-${String(Date.now()).slice(-3)}`, name: form.title, vacancy: form.vacancy || 'Not linked',
      duration: form.duration, passing: form.passing, totalQ: selectedQs.length, invited: 0, status: 'Draft',
    }, ...assessments]);
    setWizardOpen(false);
    setNotice('Assessment created and saved as draft.');
    setTimeout(() => setNotice(''), 4000);
  };

  return (
    <div className="am-tab-panel">
      {/* ── Toolbar ── */}
      <div className="am-toolbar">
        <label className="am-search">
          <Search size={16} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search assessments by name, vacancy, or status..." />
        </label>
        <button className="am-btn am-btn--ghost"><Download size={15} /> Export</button>
        <button className="am-btn am-btn--primary" onClick={openWizard}><Plus size={16} /> Create New Assessment</button>
      </div>

      {notice && <div className="am-notice"><CheckCircle2 size={16} /> {notice}<button onClick={() => setNotice('')}><X size={14} /></button></div>}

      {/* ── Table ── */}
      <div className="am-table-wrap">
        <table className="am-table">
          <thead>
            <tr>
              <th style={{ width: '28%' }}>Assessment Name</th>
              <th>Linked Vacancy</th>
              <th>Duration</th>
              <th>Passing Score</th>
              <th>Questions</th>
              <th>Invited</th>
              <th>Status</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(a => (
              <tr key={a.id}>
                <td>
                  <div className="am-a-name">
                    <strong>{a.name}</strong>
                    <small>{a.id}</small>
                  </div>
                </td>
                <td>
                  <div className="am-a-vacancy"><Link2 size={13} />{a.vacancy}</div>
                </td>
                <td><span className="am-a-meta"><Clock3 size={13} />{a.duration} min</span></td>
                <td><span className="am-a-meta"><TrendingUp size={13} />{a.passing}%</span></td>
                <td><span className="am-badge am-badge--neutral">{a.totalQ} Qs</span></td>
                <td><span className="am-badge am-badge--neutral"><Users size={11} />{a.invited}</span></td>
                <td><StatusBadge status={a.status} /></td>
                <td>
                  <div className="am-row-actions">
                    <button title="View candidates" onClick={() => navigate(`/recruiter/assessments/${a.id}/candidates`)}><Users size={15} /></button>
                    <button title="Preview assessment" onClick={() => navigate(`/recruiter/assessments/${a.id}`)}><Eye size={15} /></button>
                    <button title="Edit assessment" onClick={() => navigate(`/recruiter/assessments/${a.id}/edit`)}><Edit3 size={15} /></button>
                    <button title="Duplicate assessment" onClick={() => { setAssessments([{ ...a, id: `A-${String(Date.now()).slice(-3)}`, name: `${a.name} (Copy)`, status: 'Draft', invited: 0 }, ...assessments]); setNotice('Assessment duplicated.'); setTimeout(() => setNotice(''), 3000); }}><Copy size={15} /></button>
                    <button title="Delete assessment" className="danger" onClick={() => { if (window.confirm(`Delete "${a.name}"?`)) setAssessments(assessments.filter(x => x.id !== a.id)); }}><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr><td colSpan={8} className="am-table-empty">
                <ClipboardList size={32} />
                <strong>No assessments found</strong>
                <span>Create your first assessment to start evaluating candidates.</span>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="am-table-footer">
        <span>Showing <strong>{filtered.length}</strong> of <strong>{assessments.length}</strong> assessments</span>
        <div className="am-pagination">
          <button disabled><ChevronLeft size={14} /> Previous</button>
          <button className="active">1</button>
          <button>Next <ChevronRight size={14} /></button>
        </div>
      </div>

      {/* ── Creation Wizard ── */}
      {wizardOpen && (
        <div className="am-overlay" onMouseDown={e => e.target === e.currentTarget && setWizardOpen(false)}>
          <div className="am-modal am-modal--wide">
            <header className="am-modal__header">
              <div>
                <span className="am-modal__eyebrow">Assessment Wizard · Step {wizardStep} of 3</span>
                <h2>{['', 'Basic Information', 'Question Selection', 'Trigger & Security'][wizardStep]}</h2>
              </div>
              <button className="am-drawer__close" onClick={() => setWizardOpen(false)}><X size={20} /></button>
            </header>

            {/* Step indicator */}
            <div className="am-wizard-steps">
              {[1, 2, 3].map(s => (
                <div key={s} className={`am-wizard-step ${wizardStep === s ? 'active' : ''} ${wizardStep > s ? 'done' : ''}`}>
                  <div className="am-wizard-step__dot">{wizardStep > s ? <CheckCircle2 size={14} /> : s}</div>
                  <span>{['', 'Basic Info', 'Questions', 'Rules'][s]}</span>
                </div>
              ))}
            </div>

            <div className="am-modal__body">
              {wizardStep === 1 && (
                <div className="am-form-grid am-form-grid--wide">
                  <label className="am-form-label" style={{ gridColumn: '1/-1' }}>Assessment Title *
                    <input className="am-form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g., Senior Frontend Engineer Assessment" />
                  </label>
                  <label className="am-form-label" style={{ gridColumn: '1/-1' }}>Target Job Vacancy
                    <select className="am-form-input" value={form.vacancy} onChange={e => setForm({ ...form, vacancy: e.target.value })}>
                      <option value="">— Select a published vacancy —</option>
                      <option>Senior Software Engineer — React</option>
                      <option>QA Engineer — Automation</option>
                      <option>Business Analyst — Fintech</option>
                      <option>Junior DevOps Engineer</option>
                      <option>Java Backend Developer</option>
                    </select>
                  </label>
                  <label className="am-form-label">Time Limit (minutes)
                    <input className="am-form-input" type="number" min={10} max={300} value={form.duration} onChange={e => setForm({ ...form, duration: +e.target.value })} />
                  </label>
                  <label className="am-form-label">Passing Threshold (%)
                    <input className="am-form-input" type="number" min={1} max={100} value={form.passing} onChange={e => setForm({ ...form, passing: +e.target.value })} />
                  </label>
                </div>
              )}

              {wizardStep === 2 && (
                <div>
                  <div className="am-section-builder">
                    <div className="am-section-builder__header">
                      <strong>Assessment Sections</strong>
                      <button className="am-link-btn" onClick={() => setForm({ ...form, sections: [...form.sections, { name: `Section ${form.sections.length + 1}`, duration: 15 }] })}><Plus size={13} /> Add Section</button>
                    </div>
                    {form.sections.map((sec, i) => (
                      <div key={i} className="am-section-row">
                        <GripVertical size={16} className="am-grip" />
                        <input className="am-form-input" value={sec.name} onChange={e => setForm({ ...form, sections: form.sections.map((s, j) => j === i ? { ...s, name: e.target.value } : s) })} />
                        <input className="am-form-input am-section-duration" type="number" value={sec.duration} onChange={e => setForm({ ...form, sections: form.sections.map((s, j) => j === i ? { ...s, duration: +e.target.value } : s) })} />
                        <span className="am-section-min">min</span>
                        <button className="am-icon-btn danger" onClick={() => setForm({ ...form, sections: form.sections.filter((_, j) => j !== i) })}><Trash2 size={14} /></button>
                      </div>
                    ))}
                  </div>

                  <div className="am-qpicker-header">
                    <div>
                      <strong>Selected Questions</strong>
                      <span className="am-badge am-badge--neutral">{selectedQs.length} selected</span>
                    </div>
                    <button className="am-btn am-btn--ghost" onClick={() => setPickerOpen(true)}><BookOpen size={15} /> Select from Question Bank</button>
                  </div>
                  {selectedQs.length > 0 ? (
                    <div className="am-selected-qs">
                      {selectedQs.map(q => (
                        <div key={q.id} className="am-selected-q">
                          <span className="am-q-id">{q.id}</span>
                          <span className="am-selected-q__text">{q.snippet.slice(0, 60)}…</span>
                          <TypeBadge type={q.type} />
                          <button className="am-icon-btn danger" onClick={() => setSelectedQs(selectedQs.filter(x => x.id !== q.id))}><X size={14} /></button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="am-qpicker-empty" onClick={() => setPickerOpen(true)}>
                      <BookOpen size={28} />
                      <strong>No questions selected</strong>
                      <span>Click "Select from Question Bank" to add questions</span>
                    </div>
                  )}
                </div>
              )}

              {wizardStep === 3 && (
                <div className="am-rules-grid">
                  <div className="am-rule-card">
                    <div className="am-rule-card__icon"><Send size={20} /></div>
                    <div className="am-rule-card__content">
                      <strong>Auto-send to Shortlisted Candidates</strong>
                      <small>Automatically send the assessment link to candidates shortlisted after CV screening</small>
                    </div>
                    <label className="am-toggle">
                      <input type="checkbox" checked={form.autoSend} onChange={e => setForm({ ...form, autoSend: e.target.checked })} />
                      <span />
                    </label>
                  </div>
                  <div className="am-rule-card">
                    <div className="am-rule-card__icon"><Shuffle size={20} /></div>
                    <div className="am-rule-card__content">
                      <strong>Randomize Question Order</strong>
                      <small>Shuffle the order of questions for each candidate to prevent answer sharing</small>
                    </div>
                    <label className="am-toggle">
                      <input type="checkbox" checked={form.randomize} onChange={e => setForm({ ...form, randomize: e.target.checked })} />
                      <span />
                    </label>
                  </div>
                  <div className="am-rule-card">
                    <div className="am-rule-card__icon"><Lock size={20} /></div>
                    <div className="am-rule-card__content">
                      <strong>Block Copy-Paste</strong>
                      <small>Prevent candidates from copy-pasting content into answer fields</small>
                    </div>
                    <label className="am-toggle">
                      <input type="checkbox" checked={form.blockCopyPaste} onChange={e => setForm({ ...form, blockCopyPaste: e.target.checked })} />
                      <span />
                    </label>
                  </div>
                  <div className="am-rule-summary">
                    <ShieldCheck size={18} />
                    <span>Security settings applied to this assessment:</span>
                    <ul>
                      {form.autoSend && <li>Auto-send to shortlisted candidates</li>}
                      {form.randomize && <li>Question order randomized</li>}
                      {form.blockCopyPaste && <li>Copy-paste blocked</li>}
                      {!form.autoSend && !form.randomize && !form.blockCopyPaste && <li style={{ color: 'var(--text-muted)' }}>No security rules enabled</li>}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <footer className="am-modal__footer">
              <button className="am-btn am-btn--ghost" onClick={() => wizardStep === 1 ? setWizardOpen(false) : setWizardStep(wizardStep - 1)}>
                {wizardStep === 1 ? 'Cancel' : <><ChevronLeft size={14} /> Back</>}
              </button>
              <div style={{ display: 'flex', gap: 10 }}>
                {wizardStep === 3 && <button className="am-btn am-btn--ghost" onClick={publishAssessment}>Save as Draft</button>}
                {wizardStep < 3
                  ? <button className="am-btn am-btn--primary" onClick={() => setWizardStep(wizardStep + 1)}>Next Step <ChevronRight size={14} /></button>
                  : <button className="am-btn am-btn--primary" onClick={publishAssessment}><CheckCircle2 size={16} /> Publish Assessment</button>
                }
              </div>
            </footer>
          </div>
        </div>
      )}

      {/* ── Question Picker Modal ── */}
      {pickerOpen && (
        <div className="am-overlay" style={{ zIndex: 200 }} onMouseDown={e => e.target === e.currentTarget && setPickerOpen(false)}>
          <div className="am-modal am-modal--picker">
            <header className="am-modal__header">
              <div><h2>Select from Question Bank</h2><p>Check questions to add them to this assessment</p></div>
              <button className="am-drawer__close" onClick={() => setPickerOpen(false)}><X size={20} /></button>
            </header>
            <div className="am-modal__body am-picker-body">
              {QUESTIONS.map(q => {
                const isSelected = selectedQs.some(x => x.id === q.id);
                return (
                  <label key={q.id} className={`am-picker-row ${isSelected ? 'selected' : ''}`}>
                    <input type="checkbox" checked={isSelected} onChange={e => {
                      if (e.target.checked) setSelectedQs([...selectedQs, q]);
                      else setSelectedQs(selectedQs.filter(x => x.id !== q.id));
                    }} />
                    <div className="am-picker-row__content">
                      <span className="am-q-id">{q.id}</span>
                      <p>{q.snippet.slice(0, 80)}…</p>
                      <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                        <TypeBadge type={q.type} />
                        <DifficultyBadge level={q.difficulty} />
                        <span className="am-skill-pill">{q.role}</span>
                      </div>
                    </div>
                    <span className="am-preview-pts"><Award size={12} /> {q.points}pts</span>
                  </label>
                );
              })}
            </div>
            <footer className="am-modal__footer">
              <span className="am-picker-count"><strong>{selectedQs.length}</strong> questions selected</span>
              <button className="am-btn am-btn--primary" onClick={() => setPickerOpen(false)}><CheckCircle2 size={16} /> Done</button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   TAB 3 — CANDIDATE RESULTS
───────────────────────────────────────────────────────────────── */

function CandidateResultsTab() {
  const [candidates, setCandidates] = useState(CANDIDATES);
  const [query, setQuery] = useState('');
  const [gradingCandidate, setGradingCandidate] = useState(null);
  const [manualScores, setManualScores] = useState({});
  const [comments, setComments] = useState({});
  const [recommendation, setRecommendation] = useState('');
  const [notice, setNotice] = useState('');

  const filtered = candidates.filter(c => `${c.name} ${c.role}`.toLowerCase().includes(query.toLowerCase()));

  const totalInvited = candidates.length;
  const completed = candidates.filter(c => c.manualStatus === 'Graded' || c.autoScore != null).length;
  const pendingReview = candidates.filter(c => c.manualStatus === 'Needs Grading').length;
  const avgScore = Math.round(candidates.filter(c => c.finalScore != null).reduce((acc, c) => acc + c.finalScore, 0) / (candidates.filter(c => c.finalScore != null).length || 1));

  const STATS = [
    { label: 'Total Invited', value: totalInvited, icon: Users, color: 'navy' },
    { label: 'Completed', value: completed, icon: CheckCircle2, color: 'success' },
    { label: 'Pending Manual Review', value: pendingReview, icon: AlertCircle, color: 'warning' },
    { label: 'Avg. Score', value: `${avgScore}%`, icon: BarChart3, color: 'gold' },
  ];

  const openGrading = (c) => {
    setGradingCandidate(c);
    const initScores = {};
    const initComments = {};
    c.responses.forEach(r => {
      if (r.type !== 'MCQ') { initScores[r.id] = r.manualScore ?? ''; initComments[r.id] = r.evaluatorComment ?? ''; }
    });
    setManualScores(initScores);
    setComments(initComments);
    setRecommendation(c.recommendation || 'Pending');
  };

  const saveGrades = () => {
    const totalAuto = gradingCandidate.responses.filter(r => r.type === 'MCQ').reduce((a, r) => a + (r.correct ? r.points : 0), 0);
    const totalManual = Object.values(manualScores).reduce((a, v) => a + (+v || 0), 0);
    const totalPossible = gradingCandidate.responses.reduce((a, r) => a + r.maxPoints, 0);
    const finalScore = Math.round(((totalAuto + totalManual) / totalPossible) * 100);
    setCandidates(candidates.map(c => c.id === gradingCandidate.id
      ? {
        ...c, manualStatus: 'Graded', finalScore,
        recommendation,
        responses: c.responses.map(r => r.type !== 'MCQ' ? { ...r, manualScore: +manualScores[r.id] || 0, evaluatorComment: comments[r.id] || '' } : r),
      }
      : c
    ));
    setGradingCandidate(null);
    setNotice(`Grades saved for ${gradingCandidate.name}. Final score: ${finalScore}%`);
    setTimeout(() => setNotice(''), 5000);
  };

  return (
    <div className="am-tab-panel">
      {/* ── Analytics Cards ── */}
      <div className="am-analytics-grid">
        {STATS.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`am-stat-card am-stat-card--${color}`}>
            <div className="am-stat-card__icon"><Icon size={20} /></div>
            <div className="am-stat-card__body">
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="am-toolbar">
        <label className="am-search">
          <Search size={16} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search candidates by name or role..." />
        </label>
        <button className="am-btn am-btn--ghost"><Download size={15} /> Export Results</button>
        <button className="am-btn am-btn--ghost"><RefreshCw size={15} /> Refresh</button>
      </div>

      {notice && <div className="am-notice"><CheckCircle2 size={16} /> {notice}<button onClick={() => setNotice('')}><X size={14} /></button></div>}

      {/* ── Submissions Table ── */}
      <div className="am-table-wrap">
        <table className="am-table">
          <thead>
            <tr>
              <th style={{ width: '22%' }}>Candidate</th>
              <th>Applied Role</th>
              <th>Completed</th>
              <th>Auto Score</th>
              <th>Review Status</th>
              <th>Final Score</th>
              <th>Recommendation</th>
              <th style={{ textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id}>
                <td>
                  <div className="am-candidate-cell">
                    <div className="am-avatar">{c.initials}</div>
                    <div>
                      <strong>{c.name}</strong>
                      <small>CV Rank #{c.cvMatchRank}</small>
                    </div>
                  </div>
                </td>
                <td><span className="am-role-pill">{c.role}</span></td>
                <td><span className="am-a-meta" style={{ fontSize: '0.8rem' }}>{c.completedDate}</span></td>
                <td><span className="am-score-chip">{c.autoScore != null ? `${c.autoScore}%` : '—'}</span></td>
                <td>
                  <span className={`am-review-status ${c.manualStatus === 'Graded' ? 'graded' : 'needs-grading'}`}>
                    {c.manualStatus === 'Graded' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                    {c.manualStatus}
                  </span>
                </td>
                <td>
                  {c.finalScore != null
                    ? <span className={`am-final-score ${c.finalScore >= 70 ? 'pass' : 'fail'}`}>{c.finalScore}%</span>
                    : <span style={{ color: 'var(--text-muted)' }}>—</span>
                  }
                </td>
                <td><RecommendationBadge rec={c.recommendation} /></td>
                <td style={{ textAlign: 'center' }}>
                  <button className="am-btn am-btn--review" onClick={() => openGrading(c)}>
                    <Eye size={14} /> {c.manualStatus === 'Needs Grading' ? 'Review & Grade' : 'View Report'}
                  </button>
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr><td colSpan={8} className="am-table-empty">
                <Users size={32} />
                <strong>No candidates found</strong>
                <span>Candidates will appear here once they submit their assessments.</span>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="am-table-footer">
        <span>Showing <strong>{filtered.length}</strong> of <strong>{candidates.length}</strong> submissions</span>
        <div className="am-pagination">
          <button disabled><ChevronLeft size={14} /> Previous</button>
          <button className="active">1</button>
          <button>Next <ChevronRight size={14} /></button>
        </div>
      </div>

      {/* ── Grading Drawer ── */}
      {gradingCandidate && (
        <div className="am-overlay" onMouseDown={e => e.target === e.currentTarget && setGradingCandidate(null)}>
          <div className="am-grading-drawer">
            {/* Left Panel */}
            <aside className="am-grading-left">
              <header className="am-grading-left__header">
                <button className="am-icon-btn" onClick={() => setGradingCandidate(null)}><X size={18} /></button>
                <span>Candidate Evaluation</span>
              </header>
              <div className="am-grading-profile">
                <div className="am-avatar am-avatar--lg">{gradingCandidate.initials}</div>
                <h3>{gradingCandidate.name}</h3>
                <p className="am-role-pill" style={{ alignSelf: 'center' }}>{gradingCandidate.role}</p>
              </div>
              <div className="am-grading-stats">
                <div className="am-grading-stat">
                  <span>CV Match Rank</span>
                  <strong>#{gradingCandidate.cvMatchRank}</strong>
                </div>
                <div className="am-grading-stat">
                  <span>Auto-Graded Score</span>
                  <strong className="am-score-chip">{gradingCandidate.autoScore}%</strong>
                </div>
                <div className="am-grading-stat">
                  <span>Completed</span>
                  <strong>{gradingCandidate.completedDate}</strong>
                </div>
                <div className="am-grading-stat">
                  <span>Manual Review</span>
                  <span className={`am-review-status ${gradingCandidate.manualStatus === 'Graded' ? 'graded' : 'needs-grading'}`}>
                    {gradingCandidate.manualStatus}
                  </span>
                </div>
              </div>
              <div className="am-grading-rec">
                <label className="am-form-label">Recommendation</label>
                <div className="am-rec-selector">
                  {['Shortlist', 'Pending', 'Reject'].map(r => (
                    <button key={r} className={`am-rec-opt ${recommendation === r ? 'selected' : ''} ${r.toLowerCase()}`} onClick={() => setRecommendation(r)}>
                      {r === 'Shortlist' && <Star size={14} />}
                      {r === 'Pending' && <Clock size={14} />}
                      {r === 'Reject' && <XCircle size={14} />}
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Right Panel */}
            <main className="am-grading-right">
              <div className="am-grading-right__header">
                <h3>Response Review</h3>
                <span className="am-badge am-badge--neutral">{gradingCandidate.responses.length} questions</span>
              </div>
              <div className="am-responses">
                {gradingCandidate.responses.map((r, idx) => (
                  <div key={r.id} className="am-response-card">
                    <div className="am-response-card__header">
                      <span className="am-response-num">Q{idx + 1}</span>
                      <TypeBadge type={r.type} />
                      <span className="am-response-pts">{r.maxPoints} pts</span>
                      {r.type === 'MCQ' && (
                        <span className={`am-mcq-result ${r.correct ? 'correct' : 'incorrect'}`}>
                          {r.correct ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                          {r.correct ? `Correct (+${r.points} pts)` : `Incorrect (0 pts)`}
                        </span>
                      )}
                    </div>
                    <p className="am-response-question">{r.question}</p>
                    <div className="am-response-answer">
                      <label className="am-response-answer__label"><MessageSquare size={12} /> Candidate's Answer</label>
                      {r.type === 'Coding'
                        ? <pre className="am-code-block">{r.answer}</pre>
                        : <p className="am-answer-text">{r.answer}</p>
                      }
                    </div>
                    {r.type !== 'MCQ' && (
                      <div className="am-manual-grading">
                        <div className="am-rubric">
                          <label className="am-response-answer__label"><Eye size={12} /> Scoring Rubric</label>
                          <p className="am-rubric-text">{r.rubric}</p>
                        </div>
                        <div className="am-score-input-row">
                          <label className="am-form-label">Score
                            <div className="am-score-input-wrap">
                              <input
                                className="am-form-input am-score-input"
                                type="number"
                                min={0}
                                max={r.maxPoints}
                                value={manualScores[r.id] ?? ''}
                                onChange={e => setManualScores({ ...manualScores, [r.id]: e.target.value })}
                                placeholder="0"
                              />
                              <span className="am-score-max">/ {r.maxPoints} pts</span>
                            </div>
                          </label>
                          <label className="am-form-label am-comment-label">Evaluator Comments
                            <textarea
                              className="am-form-input am-form-textarea"
                              value={comments[r.id] ?? ''}
                              onChange={e => setComments({ ...comments, [r.id]: e.target.value })}
                              placeholder="Add feedback or notes for this response..."
                              rows={2}
                            />
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="am-grading-footer">
                <button className="am-btn am-btn--ghost" onClick={() => setGradingCandidate(null)}>Cancel</button>
                <button className="am-btn am-btn--primary" onClick={saveGrades}>
                  <CheckCircle2 size={16} /> Save Grades &amp; Shortlist for Interview
                </button>
              </div>
            </main>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────────── */

const TABS = [
  { id: 'question-bank', label: 'Question Bank', icon: BookOpen },
  { id: 'assessments', label: 'Assessments', icon: ClipboardList },
  { id: 'candidate-results', label: 'Candidate Results', icon: BarChart3 },
];

function AssessmentsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('question-bank');

  return (
    <div className="am-shell">
      <RecruiterSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activeItem="Assessments" />
      <div className="am-shell__main">
        <TopBar
          user={{ name: 'Sarah Parker', role: 'Talent Acquisition Partner' }}
          notificationsCount={3}
          breadcrumbItems={[
            { label: 'Recruiter Dashboard', path: '/recruiter/dashboard' },
            { label: 'Assessment Management' },
          ]}
          searchPlaceholder="Search assessments..."
          onHamburgerClick={() => setSidebarOpen(true)}
        />
        <div className="am-page">
          {/* ── Page Header ── */}
          <div className="am-page__header">
            <div>
              <h1 className="am-page__title">Assessment Management</h1>
              <p className="am-page__subtitle">Build your question bank, configure assessment packages, and evaluate candidate responses all in one place.</p>
            </div>
          </div>

          {/* ── Tab Navigation ── */}
          <nav className="am-tab-nav" role="tablist" aria-label="Assessment sections">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                role="tab"
                aria-selected={activeTab === id}
                className={`am-tab-btn ${activeTab === id ? 'active' : ''}`}
                onClick={() => setActiveTab(id)}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </nav>

          {/* ── Tab Panels ── */}
          <div className="am-tab-content">
            {activeTab === 'question-bank' && <QuestionBankTab />}
            {activeTab === 'assessments' && <AssessmentsTab />}
            {activeTab === 'candidate-results' && <CandidateResultsTab />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AssessmentsPage;
