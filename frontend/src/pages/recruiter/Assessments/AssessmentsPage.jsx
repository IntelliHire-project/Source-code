import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchQuestions, deleteQuestion, createQuestion } from '../../../api/questionApi';
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
  Code2,
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
  Printer,
  RefreshCw,
  Search,
  Send,
  Settings2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Shuffle,
  Sparkles,
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
  { id: 'Q-001', snippet: 'Explain the difference between REST and GraphQL APIs and when you would choose one over the other.', role: 'Software Engineer', skills: ['API Design', 'REST', 'GraphQL'], type: 'Short Answer', difficulty: 'Medium', evalMode: 'Manual Review', points: 10, section: 'Section 2: Technical Concepts' },
  { id: 'Q-002', snippet: 'Which of the following is NOT a JavaScript data type? (A) undefined (B) boolean (C) float (D) symbol', role: 'Software Engineer', skills: ['JavaScript', 'Core JS'], type: 'MCQ', difficulty: 'Easy', evalMode: 'Auto-graded', points: 5, options: ['undefined', 'boolean', 'float', 'symbol'], correct: 2, section: 'Section 2: Technical Concepts' },
  { id: 'Q-003', snippet: 'Write a function to find the longest substring without repeating characters.', role: 'Software Engineer', skills: ['Algorithms', 'Java'], type: 'Coding', difficulty: 'Hard', evalMode: 'Manual Review', points: 20, section: 'Section 3: Coding & Problem Solving' },
  { id: 'Q-004', snippet: 'Describe three key differences between SQL and NoSQL databases and provide use cases for each.', role: 'QA Engineer', skills: ['SQL', 'Database'], type: 'Short Answer', difficulty: 'Medium', evalMode: 'Manual Review', points: 10, section: 'Section 2: Technical Concepts' },
  { id: 'Q-005', snippet: 'What is the output of the following React code snippet? (A) renders null (B) throws error (C) renders empty div (D) renders children', role: 'Software Engineer', skills: ['React', 'JSX'], type: 'MCQ', difficulty: 'Medium', evalMode: 'Auto-graded', points: 5, options: ['renders null', 'throws error', 'renders empty div', 'renders children'], correct: 0, section: 'Section 2: Technical Concepts' },
  { id: 'Q-006', snippet: 'Describe the requirements gathering process you would follow when joining a new project mid-sprint.', role: 'Business Analyst', skills: ['Requirements', 'Agile'], type: 'Short Answer', difficulty: 'Medium', evalMode: 'Manual Review', points: 10, section: 'Section 1: General & Aptitude' },
  { id: 'Q-007', snippet: 'Implement a binary search tree with insert, search, and in-order traversal methods.', role: 'Software Engineer', skills: ['Algorithms', 'Data Structures'], type: 'Coding', difficulty: 'Hard', evalMode: 'Manual Review', points: 25, section: 'Section 3: Coding & Problem Solving' },
  { id: 'Q-008', snippet: 'Which HTTP status code represents a successful resource creation? (A) 200 (B) 201 (C) 204 (D) 301', role: 'QA Engineer', skills: ['HTTP', 'REST'], type: 'MCQ', difficulty: 'Easy', evalMode: 'Auto-graded', points: 5, options: ['200 OK', '201 Created', '204 No Content', '301 Redirect'], correct: 1, section: 'Section 1: General & Aptitude' },
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

function SectionBadge({ section }) {
  if (!section) return null;
  const isSec1 = section.includes('Aptitude') || section.includes('General') || section.includes('Section 1');
  const isSec2 = section.includes('Technical') || section.includes('Section 2');
  const isSec3 = section.includes('Coding') || section.includes('Section 3');
  const cls = isSec1 ? 'am-sec-badge--aptitude' : isSec2 ? 'am-sec-badge--tech' : isSec3 ? 'am-sec-badge--coding' : 'am-sec-badge--default';
  const label = isSec1 ? 'Sec 1: Aptitude' : isSec2 ? 'Sec 2: Technical' : isSec3 ? 'Sec 3: Coding' : section;
  return <span className={`am-sec-badge ${cls}`} title={section}>{label}</span>;
}

function ConfirmDeleteModal({
  isOpen,
  title = "Delete Question",
  subtitle = "Are you sure you want to delete this question? This action cannot be undone.",
  itemName,
  itemCode,
  isDeleting = false,
  onConfirm,
  onClose
}) {
  if (!isOpen) return null;

  return (
    <div className="am-overlay am-overlay--center" onMouseDown={e => e.target === e.currentTarget && !isDeleting && onClose()}>
      <div className="am-modal am-modal--confirm">
        <div className="am-confirm-body">
          <div className="am-confirm-icon">
            <Trash2 size={24} />
          </div>

          <h2 className="am-confirm-title">{title}</h2>
          <p className="am-confirm-desc">{subtitle}</p>

          {(itemCode || itemName) && (
            <div className="am-confirm-item-box">
              {itemCode && <div className="am-confirm-item-id">{itemCode}</div>}
              {itemName && <div className="am-confirm-item-name">{itemName}</div>}
            </div>
          )}

          <div className="am-confirm-actions">
            <button
              type="button"
              className="am-btn am-btn--ghost"
              onClick={onClose}
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="am-btn am-btn--danger"
              onClick={onConfirm}
              disabled={isDeleting}
            >
              <Trash2 size={15} />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   TAB 1 — QUESTION BANK
───────────────────────────────────────────────────────────────── */

function QuestionBankTab() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState(QUESTIONS);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [sectionFilter, setSectionFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');
  const [skillFilter, setSkillFilter] = useState('All');
  const [diffFilter, setDiffFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [evalFilter, setEvalFilter] = useState('All');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [previewQ, setPreviewQ] = useState(null);
  const [notice, setNotice] = useState('');
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const normalizeQuestion = (q) => ({
    id: q.id || q.questionCode,
    numericId: q.numericId,
    snippet: q.prompt || q.questionText || q.title || q.snippet,
    title: q.title || q.prompt || q.snippet,
    prompt: q.prompt || q.questionText || q.snippet,
    role: q.role || q.jobRole || 'Software Engineer',
    skills: Array.isArray(q.skills) ? q.skills : [],
    type: q.type === 'Multiple Choice' ? 'MCQ' : (q.type === 'Open Ended' ? 'Short Answer' : (q.type || 'MCQ')),
    rawType: q.type,
    difficulty: q.difficulty || 'Medium',
    evalMode: (q.evalMode === 'Automatic' || q.evalMode === 'Auto-graded') ? 'Auto-graded' : 'Manual Review',
    points: q.points || 10,
    section: q.section || 'Section 2: Technical Concepts',
    options: q.options || q.details?.options || [],
    correct: q.correctIndex != null ? q.correctIndex : (q.details?.correctIndex ?? 0),
    details: q.details || {},
    status: q.status || 'Published',
  });

  const loadQuestions = useCallback(async () => {
    try {
      const data = await fetchQuestions();
      if (data && Array.isArray(data.questions) && data.questions.length > 0) {
        setQuestions(data.questions.map(normalizeQuestion));
      } else {
        setQuestions(QUESTIONS);
      }
    } catch (err) {
      console.warn('Backend questions API unavailable, showing fallback questions:', err.message);
      setQuestions(QUESTIONS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const SECTION_TABS = [
    { id: 'All', label: 'All Sections' },
    { id: 'Section 1: General & Aptitude', label: 'Section 1: Aptitude' },
    { id: 'Section 2: Technical Concepts', label: 'Section 2: Technical' },
    { id: 'Section 3: Coding & Problem Solving', label: 'Section 3: Coding' },
  ];

  const availableSkills = useMemo(() => {
    const set = new Set();
    questions.forEach(q => {
      if (Array.isArray(q.skills)) {
        q.skills.forEach(s => s && set.add(s.trim()));
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [questions]);

  const openCreate = () => {
    navigate('/recruiter/question-bank/add');
  };

  const openEdit = (q) => {
    navigate(`/recruiter/question-bank/edit/${q.id}`, { state: { editMode: true, question: q } });
  };

  const filtered = useMemo(() => questions.filter(q => {
    const skillsText = Array.isArray(q.skills) ? q.skills.join(' ') : (q.skills || '');
    const text = `${q.snippet} ${q.title || ''} ${q.role} ${skillsText} ${q.type} ${q.difficulty} ${q.evalMode} ${q.section || ''} ${q.id || ''}`.toLowerCase();
    return text.includes(query.toLowerCase())
      && (sectionFilter === 'All' || q.section === sectionFilter)
      && (roleFilter === 'All' || q.role === roleFilter)
      && (skillFilter === 'All' || (Array.isArray(q.skills) && q.skills.some(s => s.toLowerCase() === skillFilter.toLowerCase())))
      && (diffFilter === 'All' || q.difficulty === diffFilter)
      && (typeFilter === 'All' || q.type === typeFilter)
      && (evalFilter === 'All' || q.evalMode === evalFilter);
  }), [questions, query, sectionFilter, roleFilter, skillFilter, diffFilter, typeFilter, evalFilter]);

  const duplicate = async (q) => {
    try {
      const payload = {
        title: `${q.title || q.snippet} (Copy)`,
        prompt: q.prompt || q.snippet,
        questionText: q.prompt || q.snippet,
        category: q.category || 'General',
        section: q.section,
        jobRole: q.role,
        role: q.role,
        skills: q.skills,
        difficulty: q.difficulty,
        type: q.rawType || q.type,
        status: 'Draft',
        points: q.points,
        evalMode: q.evalMode === 'Auto-graded' ? 'Automatic' : 'Manual',
        options: q.options,
        correctIndex: q.correct,
        details: q.details,
      };
      const res = await createQuestion(payload);
      if (res?.question) {
        setQuestions(prev => [normalizeQuestion(res.question), ...prev]);
        setNotice('Question duplicated as draft.');
        setTimeout(() => setNotice(''), 3000);
      }
    } catch (err) {
      console.error('Failed to duplicate question:', err);
      setNotice('Failed to duplicate question.');
    }
  };

  const confirmDeleteQuestion = async () => {
    if (!questionToDelete) return;
    setIsDeleting(true);
    try {
      await deleteQuestion(questionToDelete.id);
      setQuestions(prev => prev.filter(q => q.id !== questionToDelete.id));
      setNotice('Question deleted successfully.');
      setTimeout(() => setNotice(''), 3000);
    } catch (err) {
      console.error('Failed to delete question:', err);
      setQuestions(prev => prev.filter(q => q.id !== questionToDelete.id));
      setNotice('Question deleted.');
      setTimeout(() => setNotice(''), 3000);
    } finally {
      setIsDeleting(false);
      setQuestionToDelete(null);
    }
  };

  return (
    <div className="am-tab-panel">
      {/* ── Section Pills Navigation ── */}
      <div className="am-section-pills-bar">
        {SECTION_TABS.map(tab => {
          const count = tab.id === 'All' ? questions.length : questions.filter(q => q.section === tab.id).length;
          return (
            <button
              key={tab.id}
              className={`am-section-pill-btn ${sectionFilter === tab.id ? 'active' : ''}`}
              onClick={() => setSectionFilter(tab.id)}
            >
              <span>{tab.label}</span>
              <span className="am-section-pill-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* ── Toolbar ── */}
      <div className="am-toolbar">
        <label className="am-search">
          <Search size={16} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search questions by keyword, skill, role, or type..." />
        </label>
        <div className="am-filter-wrap">
          <button className={`am-btn am-btn--ghost ${filtersOpen ? 'is-active' : ''}`} onClick={() => setFiltersOpen(!filtersOpen)}>
            <Filter size={15} /> Filters {(sectionFilter !== 'All' || roleFilter !== 'All' || skillFilter !== 'All' || diffFilter !== 'All' || typeFilter !== 'All' || evalFilter !== 'All') && <span className="am-filter-dot" />}
          </button>
          {filtersOpen && (
            <div className="am-filter-panel">
              <div className="am-filter-panel__header">
                <span>Filters</span>
                <button onClick={() => { setSectionFilter('All'); setRoleFilter('All'); setSkillFilter('All'); setDiffFilter('All'); setTypeFilter('All'); setEvalFilter('All'); }}>Clear all</button>
              </div>
              <label className="am-filter-label">Section
                <select value={sectionFilter} onChange={e => setSectionFilter(e.target.value)}>
                  <option value="All">All Sections</option>
                  <option value="Section 1: General & Aptitude">Section 1: General & Aptitude</option>
                  <option value="Section 2: Technical Concepts">Section 2: Technical Concepts</option>
                  <option value="Section 3: Coding & Problem Solving">Section 3: Coding</option>
                </select>
              </label>
              <label className="am-filter-label">Job Role
                <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                  <option>All</option>
                  <option>Software Engineer</option>
                  <option>QA Engineer</option>
                  <option>Business Analyst</option>
                </select>
              </label>
              <label className="am-filter-label">Skill Tag
                <select value={skillFilter} onChange={e => setSkillFilter(e.target.value)}>
                  <option value="All">All Skills</option>
                  {availableSkills.map(s => <option key={s} value={s}>{s}</option>)}
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
              <th style={{ width: '32%' }}>Question Snippet</th>
              <th>Section</th>
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
                <td><SectionBadge section={q.section} /></td>
                <td>
                  <div className="am-skill-wrap">
                    <span className="am-role-pill">{q.role}</span>
                    {q.skills.map(s => (
                      <span
                        key={s}
                        className="am-skill-pill"
                        style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                        title={`Click to filter by skill "${s}"`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setQuery(s);
                        }}
                      >
                        {s}
                      </span>
                    ))}
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
                    <button title="Delete question" className="danger" onClick={() => setQuestionToDelete(q)}><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr><td colSpan={7} className="am-table-empty">
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
      <ConfirmDeleteModal
        isOpen={Boolean(questionToDelete)}
        title="Delete Question"
        subtitle="Are you sure you want to permanently delete this question from your Question Bank? This action cannot be undone."
        itemName={questionToDelete?.title || questionToDelete?.snippet}
        itemCode={questionToDelete?.id}
        isDeleting={isDeleting}
        onConfirm={confirmDeleteQuestion}
        onClose={() => !isDeleting && setQuestionToDelete(null)}
      />
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
  const [assessmentToDelete, setAssessmentToDelete] = useState(null);

  const [customVacancy, setCustomVacancy] = useState('');

  const [form, setForm] = useState({
    title: '', vacancy: '', duration: 90, passing: 70,
    autoSend: false, randomize: false, blockCopyPaste: false,
    sections: [
      { name: 'Section 1: General & Aptitude', duration: 15 },
      { name: 'Section 2: Technical Concepts', duration: 30 },
      { name: 'Section 3: Coding & Problem Solving', duration: 45 }
    ],
  });

  const filtered = assessments.filter(a => `${a.name} ${a.vacancy} ${a.status}`.toLowerCase().includes(query.toLowerCase()));

  const openWizard = () => {
    setWizardStep(1);
    setCustomVacancy('');
    setForm({
      title: '', vacancy: '', duration: 90, passing: 70,
      autoSend: false, randomize: false, blockCopyPaste: false,
      sections: [
        { name: 'Section 1: General & Aptitude', duration: 15 },
        { name: 'Section 2: Technical Concepts', duration: 30 },
        { name: 'Section 3: Coding & Problem Solving', duration: 45 }
      ]
    });
    setSelectedQs([]);
    setWizardOpen(true);
  };

  const publishAssessment = () => {
    if (!form.title.trim()) return;
    const resolvedVacancy = form.vacancy === 'Other' ? (customVacancy.trim() || 'Custom Vacancy') : (form.vacancy || 'Not linked');
    setAssessments([{
      id: `A-${String(Date.now()).slice(-3)}`, name: form.title, vacancy: resolvedVacancy,
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
                    <button title="Delete assessment" className="danger" onClick={() => setAssessmentToDelete(a)}><Trash2 size={15} /></button>
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
                  <label className="am-form-label" style={{ gridColumn: '1/-1' }}>Target Job Vacancy
                    <select
                      className="am-form-input"
                      value={form.vacancy}
                      onChange={e => {
                        const val = e.target.value;
                        setForm(prev => ({
                          ...prev,
                          vacancy: val,
                        }));
                      }}
                    >
                      <option value="">— Select a published vacancy —</option>
                      <option>Senior Software Engineer — React</option>
                      <option>QA Engineer — Automation</option>
                      <option>Business Analyst — Fintech</option>
                      <option>Junior DevOps Engineer</option>
                      <option>Java Backend Developer</option>
                      <option value="Other">Other (Custom vacancy / role...)</option>
                    </select>
                  </label>

                  {form.vacancy === 'Other' && (
                    <label className="am-form-label" style={{ gridColumn: '1/-1' }}>
                      Custom Vacancy / Role Name *
                      <input
                        className="am-form-input"
                        value={customVacancy}
                        onChange={e => setCustomVacancy(e.target.value)}
                        placeholder="Type custom role or vacancy (e.g. Lead Mobile Developer)..."
                        autoFocus
                      />
                    </label>
                  )}

                  <label className="am-form-label" style={{ gridColumn: '1/-1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span>Assessment Title *</span>
                      <button
                        type="button"
                        className="am-auto-gen-btn"
                        onClick={() => {
                          const targetRole = form.vacancy === 'Other' ? customVacancy.trim() : form.vacancy;
                          if (targetRole) {
                            setForm(prev => ({ ...prev, title: `${targetRole} Assessment` }));
                          } else {
                            setForm(prev => ({ ...prev, title: 'Technical Assessment' }));
                          }
                        }}
                        title="Auto-generate title based on selected vacancy"
                      >
                        <Sparkles size={12} /> Auto-Generate Title
                      </button>
                    </div>
                    <input
                      className="am-form-input"
                      value={form.title}
                      onChange={e => setForm({ ...form, title: e.target.value })}
                      placeholder="e.g., Senior Software Engineer — React Assessment"
                    />
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
                      <strong>Selected Questions ({selectedQs.length})</strong>
                      <span className="am-badge am-badge--neutral">
                        {selectedQs.reduce((sum, q) => sum + (q.points || 0), 0)} Total Points
                      </span>
                    </div>
                    <button className="am-btn am-btn--ghost" onClick={() => setPickerOpen(true)}><BookOpen size={15} /> Select from Question Bank</button>
                  </div>

                  {selectedQs.length > 0 ? (
                    <div className="am-wizard-sec-groups">
                      {['Section 1: General & Aptitude', 'Section 2: Technical Concepts', 'Section 3: Coding & Problem Solving'].map(secName => {
                        const secQs = selectedQs.filter(q => (q.section || 'Section 2: Technical Concepts') === secName);
                        if (!secQs.length) return null;
                        return (
                          <div key={secName} className="am-wizard-sec-group">
                            <div className="am-wizard-sec-head">
                              <span className="am-wizard-sec-title">{secName}</span>
                              <span className="am-badge am-badge--neutral">{secQs.length} Qs · {secQs.reduce((s, q) => s + (q.points || 0), 0)} pts</span>
                            </div>
                            <div className="am-selected-qs">
                              {secQs.map(q => (
                                <div key={q.id} className="am-selected-q">
                                  <span className="am-q-id">{q.id}</span>
                                  <span className="am-selected-q__text">{q.snippet.slice(0, 60)}…</span>
                                  <TypeBadge type={q.type} />
                                  <button className="am-icon-btn danger" onClick={() => setSelectedQs(selectedQs.filter(x => x.id !== q.id))}><X size={14} /></button>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="am-qpicker-empty" onClick={() => setPickerOpen(true)}>
                      <BookOpen size={28} />
                      <strong>No questions selected</strong>
                      <span>Click "Select from Question Bank" to add questions by section</span>
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

      {/* ── Question Picker Modal (Grouped by Section) ── */}
      {pickerOpen && (
        <div className="am-overlay" style={{ zIndex: 200 }} onMouseDown={e => e.target === e.currentTarget && setPickerOpen(false)}>
          <div className="am-modal am-modal--picker">
            <header className="am-modal__header">
              <div>
                <h2>Select from Question Bank</h2>
                <p>Questions are organized by section. Add entire sections or individual items.</p>
              </div>
              <button className="am-drawer__close" onClick={() => setPickerOpen(false)}><X size={20} /></button>
            </header>
            <div className="am-modal__body am-picker-body">
              {['Section 1: General & Aptitude', 'Section 2: Technical Concepts', 'Section 3: Coding & Problem Solving'].map(secName => {
                const secQs = QUESTIONS.filter(q => (q.section || 'Section 2: Technical Concepts') === secName);
                const allInSecSelected = secQs.length > 0 && secQs.every(q => selectedQs.some(x => x.id === q.id));
                const countSelectedInSec = secQs.filter(q => selectedQs.some(x => x.id === q.id)).length;

                return (
                  <div key={secName} className="am-picker-section-block">
                    <div className="am-picker-section-header">
                      <div className="am-picker-section-title">
                        <strong>{secName}</strong>
                        <span className="am-badge am-badge--neutral">{countSelectedInSec}/{secQs.length} selected</span>
                      </div>
                      <button
                        type="button"
                        className={`am-section-bulk-btn ${allInSecSelected ? 'is-selected' : ''}`}
                        onClick={() => {
                          if (allInSecSelected) {
                            const secIds = new Set(secQs.map(q => q.id));
                            setSelectedQs(selectedQs.filter(q => !secIds.has(q.id)));
                          } else {
                            const existingIds = new Set(selectedQs.map(q => q.id));
                            const toAdd = secQs.filter(q => !existingIds.has(q.id));
                            setSelectedQs([...selectedQs, ...toAdd]);
                          }
                        }}
                      >
                        {allInSecSelected ? <><CheckCircle2 size={13} /> Remove All Section</> : <><Plus size={13} /> Add All in Section ({secQs.length})</>}
                      </button>
                    </div>

                    <div className="am-picker-section-items">
                      {secQs.map(q => {
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
                  </div>
                );
              })}
            </div>
            <footer className="am-modal__footer">
              <span className="am-picker-count">
                <strong>{selectedQs.length}</strong> questions selected ({selectedQs.reduce((s, q) => s + (q.points || 0), 0)} pts)
              </span>
              <button className="am-btn am-btn--primary" onClick={() => setPickerOpen(false)}><CheckCircle2 size={16} /> Done</button>
            </footer>
          </div>
        </div>
      )}
      <ConfirmDeleteModal
        isOpen={Boolean(assessmentToDelete)}
        title="Delete Assessment"
        subtitle="Are you sure you want to delete this assessment package?"
        itemName={assessmentToDelete?.name}
        itemCode={assessmentToDelete?.id}
        onConfirm={() => {
          setAssessments(prev => prev.filter(x => x.id !== assessmentToDelete.id));
          setNotice("Assessment deleted.");
          setTimeout(() => setNotice(""), 3000);
          setAssessmentToDelete(null);
        }}
        onClose={() => setAssessmentToDelete(null)}
      />
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

  const [rubrics, setRubrics] = useState({});

  const openGrading = (c) => {
    setGradingCandidate(c);
    const initScores = {};
    const initComments = {};
    const initRubrics = {};
    c.responses.forEach(r => {
      if (r.type !== 'MCQ') {
        initScores[r.id] = r.manualScore ?? '';
        initComments[r.id] = r.evaluatorComment ?? '';
        if (r.type === 'Coding') {
          initRubrics[r.id] = {
            cleanliness: r.manualScore ? 4 : 0,
            optimization: r.manualScore ? 4 : 0,
            readability: r.manualScore ? 5 : 0,
            architecture: r.manualScore ? 4 : 0,
          };
        }
      }
    });
    setManualScores(initScores);
    setComments(initComments);
    setRubrics(initRubrics);
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
        recommendation: recommendation === 'Pending' ? (finalScore >= 70 ? 'Shortlist' : 'Reject') : recommendation,
        responses: c.responses.map(r => r.type !== 'MCQ' ? { ...r, manualScore: +manualScores[r.id] || 0, evaluatorComment: comments[r.id] || '' } : r),
      }
      : c
    ));
    setGradingCandidate(null);
    setNotice(`Technical evaluation finalized for ${gradingCandidate.name}! Official Score: ${finalScore}% · Report unlocked.`);
    setTimeout(() => setNotice(''), 6000);
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                    <span className={`am-review-status ${c.manualStatus === 'Graded' ? 'graded' : 'needs-grading'}`}>
                      {c.manualStatus === 'Graded' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                      {c.manualStatus === 'Graded' ? 'Graded' : 'Pending Review'}
                    </span>
                    {c.responses.some(r => r.type === 'Coding') && (
                      <span className="am-coding-flag-pill" title="Contains coding challenges requiring manual evaluation">
                        <Code2 size={10} /> Coding Assessment
                      </span>
                    )}
                  </div>
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
                    <Eye size={14} /> {c.manualStatus === 'Graded' ? 'View Report' : 'Review & Evaluate'}
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
              {/* Header with Title and Print/Export Dossier Action */}
              <div className="am-grading-right__header">
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#FFFFFF' }}>Response Review</h3>
                  <span className="am-badge am-badge--neutral" style={{ marginTop: '4px' }}>
                    {gradingCandidate.responses.length} questions
                  </span>
                </div>

                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {gradingCandidate.manualStatus === 'Graded' ? (
                    <button
                      type="button"
                      className="am-btn am-btn--print"
                      onClick={() => window.print()}
                      title="Print or Save Official Candidate Report as PDF"
                    >
                      <Printer size={15} /> Export PDF / Print Report
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="am-btn am-btn--print-locked"
                      disabled
                      title="Complete manual grading of all questions below and click 'Save Grades' to unlock official dossier printing"
                    >
                      <Lock size={14} /> Report Locked (Grade First)
                    </button>
                  )}
                </div>
              </div>

              {/* Printable Dossier Header (Only renders on @media print) */}
              <div className="am-print-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #222', paddingBottom: '12px', marginBottom: '16px' }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '20px', color: '#111827' }}>IntelliHire — Candidate Assessment Dossier</h2>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>Confidential Technical Interviewer Dossier &amp; Submission Audit</span>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '12px', color: '#374151' }}>
                    <div>Candidate: <strong>{gradingCandidate.name}</strong></div>
                    <div>Applied Role: <strong>{gradingCandidate.role}</strong></div>
                    <div>Final Score: <strong>{gradingCandidate.finalScore ?? gradingCandidate.autoScore}% ({gradingCandidate.manualStatus})</strong></div>
                    <div>Completed: <strong>{gradingCandidate.completedDate}</strong></div>
                  </div>
                </div>
              </div>

              {/* Mandatory Review Alert Banner */}
              {gradingCandidate.responses.some(r => r.type === 'Coding') && gradingCandidate.manualStatus !== 'Graded' && (
                <div className="am-mandatory-alert-card">
                  <div className="am-mandatory-alert-icon">
                    <ShieldAlert size={18} />
                  </div>
                  <div className="am-mandatory-alert-body">
                    <strong>Mandatory Technical Interviewer Review Required</strong>
                    <p>This assessment contains hands-on programming challenges. Final scores, candidate ranking, and printable dossier export remain locked until all coding solutions are manually evaluated.</p>
                  </div>
                </div>
              )}

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
                      {r.type === 'Coding' ? (
                        <div>
                          <div className="am-coding-meta-bar">
                            <span className="am-code-lang-tag"><Braces size={11} /> JavaScript · Algorithm Challenge</span>
                            <div className={`am-test-runner-pill ${r.answer.includes('Could not complete') ? 'failed' : 'passed'}`}>
                              {r.answer.includes('Could not complete') ? <XCircle size={12} /> : <CheckCircle2 size={12} />}
                              <span>{r.answer.includes('Could not complete') ? '0/4 Tests Passed (Incomplete Solution)' : '4/4 Automated Test Cases Passed'}</span>
                              <small>({r.answer.includes('Could not complete') ? 'DNF' : '28ms · 16.4 MB'})</small>
                            </div>
                          </div>
                          <pre className="am-code-block">{r.answer}</pre>
                        </div>
                      ) : (
                        <p className="am-answer-text">{r.answer}</p>
                      )}
                    </div>
                    {r.type !== 'MCQ' && (
                      <div className="am-manual-grading">
                        <div className="am-rubric">
                          <label className="am-response-answer__label"><Eye size={12} /> Scoring Rubric & Benchmark</label>
                          <p className="am-rubric-text">{r.rubric}</p>
                        </div>

                        {/* Interactive Coding Rubrics */}
                        {r.type === 'Coding' && (
                          <div className="am-coding-rubrics-card">
                            <div className="am-coding-rubrics-title">
                              <span>Technical Evaluation Criteria (1–5 Scale)</span>
                            </div>
                            <div className="am-coding-rubric-grid">
                              <div className="am-rubric-metric">
                                <span>Code Cleanliness</span>
                                <div className="am-star-row">
                                  {[1, 2, 3, 4, 5].map(star => (
                                    <button
                                      key={star}
                                      type="button"
                                      className={`am-star-btn ${(rubrics[r.id]?.cleanliness || 0) >= star ? 'active' : ''}`}
                                      onClick={() => setRubrics(prev => ({
                                        ...prev,
                                        [r.id]: { ...(prev[r.id] || {}), cleanliness: star }
                                      }))}
                                    >
                                      ★
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className="am-rubric-metric">
                                <span>Optimization</span>
                                <div className="am-star-row">
                                  {[1, 2, 3, 4, 5].map(star => (
                                    <button
                                      key={star}
                                      type="button"
                                      className={`am-star-btn ${(rubrics[r.id]?.optimization || 0) >= star ? 'active' : ''}`}
                                      onClick={() => setRubrics(prev => ({
                                        ...prev,
                                        [r.id]: { ...(prev[r.id] || {}), optimization: star }
                                      }))}
                                    >
                                      ★
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className="am-rubric-metric">
                                <span>Readability & Naming</span>
                                <div className="am-star-row">
                                  {[1, 2, 3, 4, 5].map(star => (
                                    <button
                                      key={star}
                                      type="button"
                                      className={`am-star-btn ${(rubrics[r.id]?.readability || 0) >= star ? 'active' : ''}`}
                                      onClick={() => setRubrics(prev => ({
                                        ...prev,
                                        [r.id]: { ...(prev[r.id] || {}), readability: star }
                                      }))}
                                    >
                                      ★
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className="am-rubric-metric">
                                <span>Edge Cases</span>
                                <div className="am-star-row">
                                  {[1, 2, 3, 4, 5].map(star => (
                                    <button
                                      key={star}
                                      type="button"
                                      className={`am-star-btn ${(rubrics[r.id]?.architecture || 0) >= star ? 'active' : ''}`}
                                      onClick={() => setRubrics(prev => ({
                                        ...prev,
                                        [r.id]: { ...(prev[r.id] || {}), architecture: star }
                                      }))}
                                    >
                                      ★
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

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
                          <label className="am-form-label am-comment-label">Evaluator Comments & Feedback
                            <textarea
                              className="am-form-input am-form-textarea"
                              value={comments[r.id] ?? ''}
                              onChange={e => setComments({ ...comments, [r.id]: e.target.value })}
                              placeholder="Add specific feedback or interview notes for this response..."
                              rows={2}
                            />
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Printable Interviewer Evaluation Scorecard */}
                <div className="am-print-scorecard">
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#111827' }}>
                    ✍️ Technical Interviewer Evaluation Scorecard
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px', color: '#374151' }}>
                    <div>Code Cleanliness &amp; Style: [ &nbsp;&nbsp;&nbsp;&nbsp; ] / 10</div>
                    <div>Algorithmic Optimization: [ &nbsp;&nbsp;&nbsp;&nbsp; ] / 10</div>
                    <div>System Architecture Knowledge: [ &nbsp;&nbsp;&nbsp;&nbsp; ] / 10</div>
                    <div>Technical Communication: [ &nbsp;&nbsp;&nbsp;&nbsp; ] / 10</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '10px', borderTop: '1px solid #d1d5db', fontSize: '12px', color: '#374151' }}>
                    <div>Interviewer Signature: _______________________</div>
                    <div>Decision: [ &nbsp;] Strong Hire &nbsp;&nbsp; [ &nbsp;] Hire &nbsp;&nbsp; [ &nbsp;] Hold &nbsp;&nbsp; [ &nbsp;] Reject</div>
                  </div>
                </div>
              </div>

              {/* Bottom Footer Actions */}
              <div className="am-grading-footer">
                <button className="am-btn am-btn--ghost" onClick={() => setGradingCandidate(null)}>
                  {gradingCandidate.manualStatus === 'Graded' ? 'Close' : 'Cancel'}
                </button>

                <button className="am-btn am-btn--primary" onClick={saveGrades}>
                  <CheckCircle2 size={16} /> {gradingCandidate.manualStatus === 'Graded' ? 'Update Evaluation & Grades' : 'Finalize Review & Unlock Report'}
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

function AssessmentsPage({ defaultTab = 'question-bank' }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(location.state?.tab || defaultTab);

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
