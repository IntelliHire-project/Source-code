import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { createQuestion, updateQuestion, getQuestionById } from '../../../api/questionApi';
import {
  AlertCircle,
  Award,
  Braces,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Code2,
  Eye,
  EyeOff,
  FileText,
  Hash,
  HelpCircle,
  Info,
  Lightbulb,
  MessageSquare,
  Minus,
  Play,
  Plus,
  RotateCcw,
  Save,
  Search,
  Shield,
  Tag,
  Trash2,
  Type,
  Upload,
  X,
  Zap,
} from 'lucide-react';
import RecruiterSidebar from '../../../components/common/RecruiterSidebar';
import TopBar from '../../../components/TopBar/TopBar';
import './AddQuestionPage.css';

/* ─────────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────────── */
const CATEGORY_OPTIONS = [
  'Frontend Core',
  'Backend Engineering',
  'Algorithms & Data Structures',
  'System Architecture',
  'Aptitude & Reasoning',
  'Soft Skills',
];

const JOB_ROLES = [
  'Software Engineer',
  'Senior Software Engineer',
  'QA Engineer',
  'Business Analyst',
  'Data Analyst',
  'Data Scientist',
  'DevOps Engineer',
  'UX/UI Designer',
  'Product Manager',
  'Project Manager',
  'Marketing Analyst',
  'Customer Success Manager',
];

const SKILL_SUGGESTIONS = {
  'Software Engineer': ['JavaScript', 'React', 'Node.js', 'Java', 'Python', 'SQL', 'REST API', 'GraphQL', 'Data Structures', 'Algorithms', 'System Design', 'Git'],
  'Senior Software Engineer': ['System Design', 'Architecture', 'React', 'Microservices', 'Java', 'Python', 'Performance Optimization', 'Leadership'],
  'QA Engineer': ['Manual Testing', 'Automation', 'Selenium', 'Jest', 'API Testing', 'SQL', 'Test Planning', 'Bug Reporting'],
  'Business Analyst': ['Requirements Gathering', 'Agile', 'JIRA', 'SQL', 'Data Modeling', 'Stakeholder Management', 'User Stories', 'Process Mapping'],
  'Data Analyst': ['SQL', 'Python', 'Excel', 'Power BI', 'Tableau', 'Statistics', 'Data Visualization', 'ETL'],
  'Data Scientist': ['Python', 'Machine Learning', 'Deep Learning', 'Statistics', 'TensorFlow', 'SQL', 'Feature Engineering'],
  'DevOps Engineer': ['Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Linux', 'Terraform', 'Jenkins', 'Monitoring'],
};

const LANGUAGES = ['JavaScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'TypeScript', 'Ruby', 'Kotlin', 'Swift', 'PHP', 'Rust'];

const BOILERPLATE = {
  JavaScript: `// Write your solution below
function solution(input) {
  // Your code here
  return null;
}`,
  Python: `# Write your solution below
def solution(input):
    # Your code here
    pass`,
  Java: `// Write your solution below
public class Solution {
    public static Object solution(Object input) {
        // Your code here
        return null;
    }
}`,
  'C++': `// Write your solution below
#include <iostream>
using namespace std;

auto solution(auto input) {
    // Your code here
    return nullptr;
}`,
};

/* ─────────────────────────────────────────────────────────────────
   SMALL HELPER COMPONENTS
───────────────────────────────────────────────────────────────── */

function SectionCard({ icon: Icon, title, subtitle, accent, children }) {
  return (
    <div className={`aq-section-card ${accent ? 'aq-section-card--accent' : ''}`}>
      <div className="aq-section-card__header">
        <div className="aq-section-card__icon"><Icon size={18} /></div>
        <div>
          <h2 className="aq-section-card__title">{title}</h2>
          {subtitle && <p className="aq-section-card__sub">{subtitle}</p>}
        </div>
      </div>
      <div className="aq-section-card__body">{children}</div>
    </div>
  );
}

function FormField({ label, required, hint, error, children }) {
  return (
    <div className="aq-field">
      <label className="aq-field__label">
        {label}{required && <span className="aq-required">*</span>}
      </label>
      {children}
      {hint && <p className="aq-field__hint"><Info size={12} />{hint}</p>}
      {error && <p className="aq-field__error"><AlertCircle size={12} />{error}</p>}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   SKILL TAG INPUT
───────────────────────────────────────────────────────────────── */
function SkillTagInput({ tags, onChange, role }) {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = (SKILL_SUGGESTIONS[role] || []).filter(
    s => s.toLowerCase().includes(input.toLowerCase()) && !tags.includes(s)
  );

  const addTag = (tag) => {
    const t = tag.trim();
    if (t && !tags.includes(t)) onChange([...tags, t]);
    setInput('');
    setShowSuggestions(false);
  };

  const removeTag = (tag) => onChange(tags.filter(t => t !== tag));

  const handleKey = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && !input && tags.length) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div className="aq-tag-input-wrap">
      <div className="aq-tag-input">
        {tags.map(tag => (
          <span key={tag} className="aq-tag">
            <Tag size={11} />{tag}
            <button type="button" onClick={() => removeTag(tag)}><X size={10} /></button>
          </span>
        ))}
        <input
          value={input}
          onChange={e => { setInput(e.target.value); setShowSuggestions(true); }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          onKeyDown={handleKey}
          placeholder={tags.length ? '' : 'Type a skill and press Enter…'}
          className="aq-tag-input__field"
        />
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <div className="aq-tag-suggestions">
          {suggestions.slice(0, 8).map(s => (
            <button key={s} type="button" onMouseDown={() => addTag(s)}>
              <Tag size={12} />{s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   SIMPLE RICH TEXT TOOLBAR (simulated)
───────────────────────────────────────────────────────────────── */
function RichTextArea({ value, onChange, placeholder }) {
  const [showHint, setShowHint] = useState(false);

  const insertFormat = (prefix, suffix = '') => {
    const ta = document.getElementById('aq-question-body');
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = value.slice(start, end);
    const newVal = value.slice(0, start) + prefix + selected + suffix + value.slice(end);
    onChange(newVal);
    setTimeout(() => {
      ta.focus();
      ta.selectionStart = start + prefix.length;
      ta.selectionEnd = start + prefix.length + selected.length;
    }, 0);
  };

  const TOOLBAR = [
    { label: 'Bold', action: () => insertFormat('**', '**'), icon: <strong style={{fontSize:'0.75rem'}}>B</strong> },
    { label: 'Italic', action: () => insertFormat('_', '_'), icon: <em style={{fontSize:'0.75rem'}}>I</em> },
    { label: 'Code', action: () => insertFormat('`', '`'), icon: <Code2 size={13} /> },
    { label: 'Code Block', action: () => insertFormat('\n```\n', '\n```\n'), icon: <Braces size={13} /> },
    { label: 'Bullet List', action: () => insertFormat('\n• '), icon: <span style={{fontSize:'0.8rem'}}>•≡</span> },
    { label: 'Numbered List', action: () => insertFormat('\n1. '), icon: <Hash size={13} /> },
  ];

  return (
    <div className="aq-rte">
      <div className="aq-rte__toolbar">
        {TOOLBAR.map(t => (
          <button key={t.label} type="button" title={t.label} onClick={t.action} className="aq-rte__tool">
            {t.icon}
          </button>
        ))}
        <div className="aq-rte__divider" />
        <button type="button" className="aq-rte__tool" title="Attach image/file">
          <Upload size={13} />
        </button>
        <button type="button" className="aq-rte__tool" title="Formatting help" onClick={() => setShowHint(!showHint)}>
          <HelpCircle size={13} />
        </button>
      </div>
      <textarea
        id="aq-question-body"
        className="aq-rte__body"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={6}
      />
      {showHint && (
        <div className="aq-rte__hint">
          <strong>Markdown supported:</strong> **bold**, _italic_, `code`, ```code block```, • bullet
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MCQ CONFIG
───────────────────────────────────────────────────────────────── */
function MCQConfig({ options, setOptions, correctIdx, setCorrectIdx, explanation, setExplanation }) {
  const labels = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div className="aq-mcq">
      <div className="aq-mcq__header">
        <span className="aq-sub-label">Answer Options</span>
        <button
          type="button"
          className="aq-link-btn"
          onClick={() => setOptions([...options, ''])}
          disabled={options.length >= 6}
        >
          <Plus size={14} /> Add Option
        </button>
      </div>

      <div className="aq-mcq__options">
        {options.map((opt, i) => (
          <div key={i} className={`aq-mcq__row ${correctIdx === i ? 'is-correct' : ''}`}>
            <button
              type="button"
              className={`aq-radio ${correctIdx === i ? 'is-correct' : ''}`}
              onClick={() => setCorrectIdx(i)}
              title="Mark as correct"
            >
              {correctIdx === i && <CheckCircle2 size={12} />}
            </button>
            <span className="aq-mcq__label">{labels[i]}</span>
            <input
              className="aq-input"
              value={opt}
              onChange={e => setOptions(options.map((o, j) => j === i ? e.target.value : o))}
              placeholder={`Enter option ${labels[i]}…`}
            />
            {options.length > 2 && (
              <button
                type="button"
                className="aq-icon-btn aq-icon-btn--danger"
                onClick={() => {
                  const next = options.filter((_, j) => j !== i);
                  setOptions(next);
                  if (correctIdx >= next.length) setCorrectIdx(next.length - 1);
                }}
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
      </div>

      {correctIdx >= 0 && options[correctIdx] && (
        <div className="aq-mcq__correct-hint">
          <CheckCircle2 size={13} /> Correct answer: <strong>{labels[correctIdx]}. {options[correctIdx]}</strong>
        </div>
      )}

      <FormField label="Explanation / Rationale" hint="Optional — explain why this answer is correct for the candidate after submission">
        <textarea
          className="aq-input aq-textarea"
          value={explanation}
          onChange={e => setExplanation(e.target.value)}
          placeholder="e.g., 'float' is not a primitive JavaScript type — JS uses 'number' for all numeric values…"
          rows={3}
        />
      </FormField>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   SHORT ANSWER CONFIG
───────────────────────────────────────────────────────────────── */
function ShortAnswerConfig({ modelAnswer, setModelAnswer, rubricItems, setRubricItems }) {
  const [newItem, setNewItem] = useState('');

  const addItem = () => {
    if (newItem.trim()) {
      setRubricItems([...rubricItems, newItem.trim()]);
      setNewItem('');
    }
  };

  return (
    <div className="aq-short">
      <FormField
        label="Model / Sample Answer"
        hint="The ideal answer that evaluators will use as a reference benchmark"
      >
        <textarea
          className="aq-input aq-textarea"
          value={modelAnswer}
          onChange={e => setModelAnswer(e.target.value)}
          placeholder="Write the expected ideal response here. This will be shown to evaluators during manual review…"
          rows={5}
        />
      </FormField>

      <div className="aq-rubric">
        <div className="aq-rubric__header">
          <span className="aq-sub-label"><Lightbulb size={14} /> Evaluation Rubric / Key Criteria</span>
          <span className="aq-badge">{rubricItems.length} criteria</span>
        </div>
        <p className="aq-rubric__desc">Add key points or keywords evaluators should look for when grading this response.</p>

        <div className="aq-rubric__add">
          <input
            className="aq-input"
            value={newItem}
            onChange={e => setNewItem(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addItem()}
            placeholder='e.g., "Mentions component lifecycle", "Includes error handling"…'
          />
          <button type="button" className="aq-btn aq-btn--outline" onClick={addItem}>
            <Plus size={15} /> Add
          </button>
        </div>

        {rubricItems.length > 0 && (
          <ul className="aq-rubric__list">
            {rubricItems.map((item, i) => (
              <li key={i}>
                <CheckCircle2 size={14} />
                <span>{item}</span>
                <button type="button" onClick={() => setRubricItems(rubricItems.filter((_, j) => j !== i))}>
                  <X size={12} />
                </button>
              </li>
            ))}
          </ul>
        )}

        {rubricItems.length === 0 && (
          <div className="aq-rubric__empty">
            <Lightbulb size={22} />
            <p>No criteria added yet. Add key points evaluators should look for.</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   CODING CHALLENGE CONFIG
───────────────────────────────────────────────────────────────── */
function CodingConfig({ lang, setLang, boilerplate, setBoilerplate, testCases, setTestCases }) {
  const addTestCase = () => setTestCases([...testCases, { input: '', expected: '' }]);
  const updateCase = (i, field, val) =>
    setTestCases(testCases.map((tc, j) => j === i ? { ...tc, [field]: val } : tc));
  const removeCase = (i) => setTestCases(testCases.filter((_, j) => j !== i));

  return (
    <div className="aq-coding">
      <FormField label="Programming Language" required>
        <div className="aq-lang-grid">
          {LANGUAGES.map(l => (
            <button
              key={l}
              type="button"
              className={`aq-lang-pill ${lang === l ? 'selected' : ''}`}
              onClick={() => {
                setLang(l);
                setBoilerplate(BOILERPLATE[l] || `// Write your ${l} solution here\n`);
              }}
            >
              {l}
            </button>
          ))}
        </div>
      </FormField>

      <FormField
        label="Starter / Boilerplate Code"
        hint="Provide a template to help candidates get started"
      >
        <div className="aq-code-editor">
          <div className="aq-code-editor__bar">
            <div className="aq-code-editor__dots">
              <span /><span /><span />
            </div>
            <span className="aq-code-editor__lang">{lang || 'Select a language'}</span>
            <button
              type="button"
              className="aq-code-editor__reset"
              onClick={() => setBoilerplate(BOILERPLATE[lang] || '')}
              title="Reset to default boilerplate"
            >
              <RotateCcw size={12} /> Reset
            </button>
          </div>
          <textarea
            className="aq-code-editor__area"
            value={boilerplate}
            onChange={e => setBoilerplate(e.target.value)}
            placeholder="// Enter starter code here…"
            rows={8}
            spellCheck={false}
          />
        </div>
      </FormField>

      <div className="aq-testcases">
        <div className="aq-testcases__header">
          <span className="aq-sub-label"><Play size={14} /> Test Cases</span>
          <button type="button" className="aq-link-btn" onClick={addTestCase}>
            <Plus size={14} /> Add Test Case
          </button>
        </div>
        <p className="aq-rubric__desc">Define input/output pairs that the candidate's solution will be evaluated against.</p>

        {testCases.length === 0 && (
          <div className="aq-testcases__empty" onClick={addTestCase}>
            <Play size={24} />
            <strong>No test cases yet</strong>
            <span>Click to add your first test case</span>
          </div>
        )}

        <div className="aq-testcases__list">
          {testCases.map((tc, i) => (
            <div key={i} className="aq-testcase">
              <div className="aq-testcase__label">
                <span>Test Case #{i + 1}</span>
                <button type="button" className="aq-icon-btn aq-icon-btn--danger" onClick={() => removeCase(i)}>
                  <Trash2 size={13} />
                </button>
              </div>
              <div className="aq-testcase__fields">
                <label className="aq-field__label">Input</label>
                <textarea
                  className="aq-input aq-textarea aq-code-font"
                  value={tc.input}
                  onChange={e => updateCase(i, 'input', e.target.value)}
                  placeholder='e.g., "abcabcbb"'
                  rows={2}
                />
                <label className="aq-field__label">Expected Output</label>
                <textarea
                  className="aq-input aq-textarea aq-code-font"
                  value={tc.expected}
                  onChange={e => updateCase(i, 'expected', e.target.value)}
                  placeholder='e.g., 3'
                  rows={2}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   PREVIEW PANEL
───────────────────────────────────────────────────────────────── */
function PreviewPanel({ form, options, correctIdx, rubricItems, testCases, lang }) {
  const typeLabels = { MCQ: 'Multiple Choice', 'Short Answer': 'Short Answer / Written', Coding: 'Coding Challenge' };
  return (
    <div className="aq-preview">
      <div className="aq-preview__header">
        <Eye size={15} />
        <strong>Live Preview</strong>
        <span className="aq-badge">Candidate View</span>
      </div>
      <div className="aq-preview__card">
        {/* Meta */}
        <div className="aq-preview__meta">
          <span className="aq-preview__type">{typeLabels[form.questionType] || '—'}</span>
          <span className={`aq-preview__diff diff--${(form.difficulty || '').toLowerCase()}`}>{form.difficulty || '—'}</span>
          <span className="aq-preview__pts"><Award size={12} />{form.points} pts</span>
        </div>

        {/* Question */}
        <div className="aq-preview__question">
          {form.questionText
            ? <p>{form.questionText}</p>
            : <p className="aq-preview__placeholder">Your question will appear here…</p>
          }
        </div>

        {/* MCQ Options */}
        {form.questionType === 'MCQ' && (
          <div className="aq-preview__options">
            {options.map((opt, i) => (
              <div key={i} className={`aq-preview__option ${i === correctIdx ? 'correct' : ''}`}>
                <span className="aq-preview__opt-letter">{String.fromCharCode(65 + i)}</span>
                {opt || <em className="aq-preview__placeholder">Option {String.fromCharCode(65 + i)}</em>}
              </div>
            ))}
          </div>
        )}

        {/* Short Answer */}
        {form.questionType === 'Short Answer' && (
          <div className="aq-preview__sa">
            <textarea disabled placeholder="Candidate will type their answer here…" rows={4} />
          </div>
        )}

        {/* Coding */}
        {form.questionType === 'Coding' && (
          <div className="aq-preview__code">
            <div className="aq-code-editor__bar">
              <div className="aq-code-editor__dots"><span /><span /><span /></div>
              <span className="aq-code-editor__lang">{lang || 'Select language'}</span>
            </div>
            <pre className="aq-preview__codebody">{form.boilerplate || '// Code editor will appear here'}</pre>
          </div>
        )}
      </div>

      {/* Rubric summary */}
      {form.questionType !== 'MCQ' && rubricItems.length > 0 && (
        <div className="aq-preview__rubric">
          <strong><Eye size={12} /> Grading criteria ({rubricItems.length})</strong>
          <ul>{rubricItems.map((r, i) => <li key={i}>{r}</li>)}</ul>
        </div>
      )}

      {form.questionType === 'Coding' && testCases.length > 0 && (
        <div className="aq-preview__testcount">
          <Play size={12} /> {testCases.length} test case{testCases.length > 1 ? 's' : ''} defined
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────────── */
export default function AddQuestionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { questionId } = useParams();
  const isEdit = location.state?.editMode || Boolean(questionId);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [errors, setErrors] = useState({});

  // ── Form State ──
  const [form, setForm] = useState({
    role: '',
    category: 'Frontend Core',
    skills: [],
    difficulty: 'Medium',
    points: 10,
    questionType: 'MCQ',
    questionText: '',
    evalMode: 'Automatic',
    // MCQ
    explanation: '',
    // Short Answer
    modelAnswer: '',
    // Coding
    boilerplate: BOILERPLATE['JavaScript'],
    language: 'JavaScript',
  });

  const [options, setOptions] = useState(['', '', '', '']);
  const [correctIdx, setCorrectIdx] = useState(0);
  const [rubricItems, setRubricItems] = useState([]);
  const [testCases, setTestCases] = useState([{ input: '', expected: '' }]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const populateFromQuestion = (q) => {
    let qType = 'MCQ';
    if (q.type === 'Coding' || q.questionType === 'Coding') qType = 'Coding';
    else if (q.type === 'Open Ended' || q.type === 'Short Answer' || q.questionType === 'Short Answer') qType = 'Short Answer';

    setForm({
      role: q.role || q.jobRole || '',
      category: q.category || 'Frontend Core',
      skills: Array.isArray(q.skills) ? q.skills : [],
      difficulty: q.difficulty || 'Medium',
      points: q.points || 10,
      questionType: qType,
      questionText: q.prompt || q.questionText || q.title || '',
      evalMode: q.evalMode || 'Automatic',
      explanation: q.explanation || q.details?.explanation || '',
      modelAnswer: q.modelAnswer || q.details?.modelAnswer || '',
      boilerplate: q.boilerplate || q.details?.boilerplate || BOILERPLATE['JavaScript'],
      language: q.language || q.details?.language || 'JavaScript',
    });

    if (q.options?.length) {
      setOptions(q.options);
    } else if (q.details?.options?.length) {
      setOptions(q.details.options);
    }

    if (q.correctIndex != null) {
      setCorrectIdx(q.correctIndex);
    } else if (q.details?.correctIndex != null) {
      setCorrectIdx(q.details.correctIndex);
    }

    if (q.rubric?.length) {
      setRubricItems(q.rubric);
    } else if (q.details?.rubric?.length) {
      setRubricItems(q.details.rubric);
    }

    if (q.testCases?.length) {
      setTestCases(q.testCases);
    } else if (q.details?.testCases?.length) {
      setTestCases(q.details.testCases);
    }
  };

  useEffect(() => {
    if (isEdit) {
      const q = location.state?.question;
      if (q) {
        populateFromQuestion(q);
      } else if (questionId) {
        getQuestionById(questionId)
          .then(res => {
            if (res?.question) populateFromQuestion(res.question);
          })
          .catch(err => {
            console.error('Failed to load question details:', err);
            setApiError('Failed to load question data.');
          });
      }
    }
  }, [isEdit, questionId]);

  // ── Validation ──
  const validate = () => {
    const e = {};
    if (!form.role) e.role = 'Please select a job role.';
    if (form.skills.length === 0) e.skills = 'Add at least one skill tag.';
    if (!form.questionText.trim()) e.questionText = 'Question text is required.';
    if (form.questionType === 'MCQ') {
      const filled = options.filter(o => o && o.trim());
      if (filled.length < 2) e.options = 'Add at least 2 answer options.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async (addAnother = false) => {
    if (!validate()) return;
    setSubmitting(true);
    setApiError('');

    try {
      let resolvedType = 'Multiple Choice';
      if (form.questionType === 'Short Answer') resolvedType = 'Open Ended';
      else if (form.questionType === 'Coding') resolvedType = 'Coding';

      let section = 'Section 2: Technical Concepts';
      if (resolvedType === 'Coding') {
        section = 'Section 3: Coding & Problem Solving';
      } else if (form.category === 'Soft Skills' || form.category === 'Aptitude & Reasoning') {
        section = 'Section 1: General & Aptitude';
      }

      const payload = {
        title: form.questionText.trim().split('\n')[0].slice(0, 90),
        prompt: form.questionText.trim(),
        questionText: form.questionText.trim(),
        category: form.category || 'Frontend Core',
        section,
        jobRole: form.role,
        role: form.role,
        skills: form.skills,
        difficulty: form.difficulty,
        points: form.points,
        type: resolvedType,
        questionType: resolvedType,
        evalMode: form.evalMode,
        status: 'Published',
        options: options.filter(o => o && o.trim()),
        correctIndex: correctIdx,
        explanation: form.explanation,
        modelAnswer: form.modelAnswer,
        rubric: rubricItems,
        language: form.language,
        boilerplate: form.boilerplate,
        testCases: testCases.filter(tc => (tc.input && tc.input.trim()) || (tc.expected && tc.expected.trim())),
      };

      const targetId = questionId || location.state?.question?.id || location.state?.question?.questionCode;
      if (isEdit && targetId) {
        await updateQuestion(targetId, payload);
      } else {
        await createQuestion(payload);
      }

      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        if (addAnother) {
          setForm({
            role: form.role,
            category: form.category,
            skills: [],
            difficulty: 'Medium',
            points: 10,
            questionType: 'MCQ',
            questionText: '',
            evalMode: 'Automatic',
            explanation: '',
            modelAnswer: '',
            boilerplate: BOILERPLATE['JavaScript'],
            language: 'JavaScript',
          });
          setOptions(['', '', '', '']);
          setCorrectIdx(0);
          setRubricItems([]);
          setTestCases([{ input: '', expected: '' }]);
          setErrors({});
        } else {
          navigate('/recruiter/question-bank');
        }
      }, 1000);
    } catch (err) {
      console.error('Error saving question:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to save question to database.';
      setApiError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const QUESTION_TYPES = [
    { id: 'MCQ', label: 'Multiple Choice', icon: CheckCircle2, desc: 'Select the correct answer' },
    { id: 'Short Answer', label: 'Short Answer / Written', icon: MessageSquare, desc: 'Free-text response' },
    { id: 'Coding', label: 'Coding Challenge', icon: Code2, desc: 'Write & run code' },
  ];

  const EVAL_MODES = [
    { id: 'Automatic', icon: Zap, label: 'Automatic Evaluation', desc: 'System grades responses instantly. Best for MCQs and rule-based answers.' },
    { id: 'Manual', icon: Eye, label: 'Manual Evaluation', desc: 'Recruiter reviews and scores using the rubric. Best for written & subjective answers.' },
  ];

  return (
    <div className="aq-shell">
      <RecruiterSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activeItem="Assessments" />

      <div className="aq-shell__main">
        <TopBar
          user={{ name: 'Sarah Parker', role: 'Talent Acquisition Partner' }}
          notificationsCount={3}
          breadcrumbItems={[
            { label: 'Recruiter Dashboard', path: '/recruiter/dashboard' },
            { label: 'Assessment Management', path: '/recruiter/assessments' },
            { label: 'Question Bank', path: '/recruiter/assessments' },
            { label: isEdit ? 'Edit Question' : 'Add Question' },
          ]}
          onHamburgerClick={() => setSidebarOpen(true)}
        />

        <div className="aq-page">
          {/* ── Page Header ── */}
          <div className="aq-page__header">
            <div className="aq-page__header-left">
              <button className="aq-back-btn" onClick={() => navigate('/recruiter/question-bank')}>
                <ChevronLeft size={16} /> Back to Question Bank
              </button>
              <div>
                <h1 className="aq-page__title">
                  {isEdit ? 'Edit Question' : 'Add New Question'}
                </h1>
                <p className="aq-page__subtitle">
                  Add a role-specific assessment question to the company question bank.
                </p>
              </div>
            </div>
            <div className="aq-page__header-right">
              <button
                className="aq-btn aq-btn--ghost"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? <EyeOff size={15} /> : <Eye size={15} />}
                {showPreview ? 'Hide' : 'Show'} Preview
              </button>
            </div>
          </div>

          {/* ── Success Banner ── */}
          {saved && (
            <div className="aq-success-banner">
              <CheckCircle2 size={18} />
              Question saved successfully! Redirecting…
            </div>
          )}

          {apiError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: '8px', color: '#fca5a5', marginBottom: '16px', fontSize: '13px' }}>
              <AlertCircle size={16} /> {apiError}
            </div>
          )}

          {/* ── Content Grid ── */}
          <div className={`aq-content-grid ${showPreview ? 'with-preview' : ''}`}>
            <div className="aq-form-col">

              {/* ── 1. BASIC METADATA ── */}
              <SectionCard
                icon={FileText}
                title="Basic Metadata"
                subtitle="Define where this question fits in your assessment library"
              >
                <div className="aq-two-col">
                  <FormField label="Job Role" required error={errors.role}>
                    <div className="aq-select-wrap">
                      <select
                        className={`aq-select ${errors.role ? 'is-error' : ''}`}
                        value={form.role}
                        onChange={e => set('role', e.target.value)}
                      >
                        <option value="">— Select a job role —</option>
                        {JOB_ROLES.map(r => <option key={r}>{r}</option>)}
                      </select>
                    </div>
                  </FormField>

                  <FormField label="Question Category" required>
                    <div className="aq-select-wrap">
                      <select
                        className="aq-select"
                        value={form.category}
                        onChange={e => set('category', e.target.value)}
                      >
                        {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </FormField>
                </div>

                <div style={{ marginTop: '12px' }}>
                  <FormField
                    label="Point Value"
                    hint="Total marks for this question"
                  >
                    <div className="aq-points-input">
                      <button type="button" onClick={() => set('points', Math.max(1, form.points - 5))}><Minus size={14} /></button>
                      <input
                        type="number"
                        className="aq-input aq-input--center"
                        value={form.points}
                        min={1}
                        max={100}
                        onChange={e => set('points', Math.max(1, +e.target.value))}
                      />
                      <button type="button" onClick={() => set('points', Math.min(100, form.points + 5))}><Plus size={14} /></button>
                      <span className="aq-pts-label">points</span>
                    </div>
                  </FormField>
                </div>

                <FormField label="Skill / Category Tags" required error={errors.skills}
                  hint="Select or type skill tags. Press Enter or comma to add.">
                  <SkillTagInput
                    tags={form.skills}
                    onChange={v => set('skills', v)}
                    role={form.role}
                  />
                </FormField>

                <FormField label="Difficulty Level" required>
                  <div className="aq-diff-pills">
                    {['Easy', 'Medium', 'Hard'].map(d => (
                      <button
                        key={d}
                        type="button"
                        className={`aq-diff-pill aq-diff-pill--${d.toLowerCase()} ${form.difficulty === d ? 'selected' : ''}`}
                        onClick={() => set('difficulty', d)}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </FormField>
              </SectionCard>

              {/* ── 2. QUESTION CONTENT ── */}
              <SectionCard
                icon={Type}
                title="Question Content"
                subtitle="Write the question that candidates will see during the assessment"
              >
                {/* Question Type Selector */}
                <FormField label="Question Type" required>
                  <div className="aq-type-tabs">
                    {QUESTION_TYPES.map(({ id, label, icon: Icon, desc }) => (
                      <button
                        key={id}
                        type="button"
                        className={`aq-type-tab ${form.questionType === id ? 'selected' : ''}`}
                        onClick={() => {
                          set('questionType', id);
                          if (id === 'MCQ') set('evalMode', 'Automatic');
                          else set('evalMode', 'Manual');
                        }}
                      >
                        <div className="aq-type-tab__icon"><Icon size={20} /></div>
                        <strong>{label}</strong>
                        <small>{desc}</small>
                      </button>
                    ))}
                  </div>
                </FormField>

                {/* Question Statement */}
                <FormField
                  label="Question Statement"
                  required
                  error={errors.questionText}
                  hint="Use the toolbar for formatting. Markdown shortcuts are supported."
                >
                  <RichTextArea
                    value={form.questionText}
                    onChange={v => set('questionText', v)}
                    placeholder={
                      form.questionType === 'MCQ'
                        ? 'e.g., Which of the following is NOT a JavaScript primitive type?'
                        : form.questionType === 'Short Answer'
                        ? 'e.g., Explain the difference between REST and GraphQL APIs and when you would prefer each.'
                        : 'e.g., Write a function to find the longest substring without repeating characters. Explain the time complexity of your solution.'
                    }
                  />
                  {errors.questionText && <p className="aq-field__error"><AlertCircle size={12} />{errors.questionText}</p>}
                </FormField>
              </SectionCard>

              {/* ── 3. DYNAMIC ANSWER CONFIG ── */}
              <SectionCard
                icon={form.questionType === 'MCQ' ? CheckCircle2 : form.questionType === 'Coding' ? Code2 : MessageSquare}
                title={
                  form.questionType === 'MCQ' ? 'Answer Options & Correct Answer'
                  : form.questionType === 'Short Answer' ? 'Sample Answer & Grading Rubric'
                  : 'Code Environment & Test Cases'
                }
                subtitle={
                  form.questionType === 'MCQ' ? 'Define the answer choices and mark the correct one'
                  : form.questionType === 'Short Answer' ? 'Guide evaluators with a model answer and key criteria'
                  : 'Set up the coding environment and test cases'
                }
                accent
              >
                {form.questionType === 'MCQ' && (
                  <MCQConfig
                    options={options}
                    setOptions={setOptions}
                    correctIdx={correctIdx}
                    setCorrectIdx={setCorrectIdx}
                    explanation={form.explanation}
                    setExplanation={v => set('explanation', v)}
                  />
                )}
                {form.questionType === 'Short Answer' && (
                  <ShortAnswerConfig
                    modelAnswer={form.modelAnswer}
                    setModelAnswer={v => set('modelAnswer', v)}
                    rubricItems={rubricItems}
                    setRubricItems={setRubricItems}
                  />
                )}
                {form.questionType === 'Coding' && (
                  <CodingConfig
                    lang={form.language}
                    setLang={v => set('language', v)}
                    boilerplate={form.boilerplate}
                    setBoilerplate={v => set('boilerplate', v)}
                    testCases={testCases}
                    setTestCases={setTestCases}
                  />
                )}
                {errors.options && <p className="aq-field__error" style={{marginTop:12}}><AlertCircle size={12} />{errors.options}</p>}
              </SectionCard>

              {/* ── 4. EVALUATION METHOD ── */}
              <SectionCard
                icon={Shield}
                title="Evaluation Method"
                subtitle="Choose how candidate responses will be graded"
              >
                <div className="aq-eval-cards">
                  {EVAL_MODES.map(({ id, icon: Icon, label, desc }) => (
                    <button
                      key={id}
                      type="button"
                      className={`aq-eval-card ${form.evalMode === id ? 'selected' : ''}`}
                      onClick={() => set('evalMode', id)}
                    >
                      <div className="aq-eval-card__icon"><Icon size={22} /></div>
                      <div className="aq-eval-card__body">
                        <strong>{label}</strong>
                        <p>{desc}</p>
                      </div>
                      <div className={`aq-eval-card__check ${form.evalMode === id ? 'visible' : ''}`}>
                        <CheckCircle2 size={18} />
                      </div>
                    </button>
                  ))}
                </div>
                {form.questionType === 'MCQ' && form.evalMode === 'Manual' && (
                  <div className="aq-info-box">
                    <Info size={14} /> MCQ questions are best suited for <strong>Automatic Evaluation</strong>. Manual mode requires a recruiter to grade each response individually.
                  </div>
                )}
              </SectionCard>
            </div>

            {/* ── PREVIEW PANEL ── */}
            {showPreview && (
              <div className="aq-preview-col">
                <div className="aq-preview-sticky">
                  <PreviewPanel
                    form={form}
                    options={options}
                    correctIdx={correctIdx}
                    rubricItems={rubricItems}
                    testCases={testCases}
                    lang={form.language}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ── FOOTER ACTIONS ── */}
          <div className="aq-footer">
            <button
              className="aq-btn aq-btn--ghost"
              onClick={() => navigate('/recruiter/question-bank')}
            >
              <X size={15} /> Cancel
            </button>
            <div className="aq-footer__right">
              <button
                className="aq-btn aq-btn--outline"
                onClick={() => handleSave(true)}
              >
                <Plus size={15} /> {submitting ? 'Saving...' : 'Save & Add Another'}
              </button>
              <button
                className="aq-btn aq-btn--primary"
                onClick={() => handleSave(false)}
              >
                <Save size={15} /> {submitting ? 'Saving...' : (isEdit ? 'Update Question' : 'Save Question')}
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
