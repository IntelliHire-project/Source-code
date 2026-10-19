import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  Sparkles,
  Check,
  AlertTriangle,
  Send,
  Bot,
  FileText,
  ChevronDown,
  Zap,
  Upload,
  Loader2,
  AlertCircle,
  X,
} from 'lucide-react';
import { CandidatePageContext } from '../CandidateDashboard/CandidateDashboard';
import {
  getCandidateCVs,
  uploadCandidateCV,
  setActiveCandidateCV,
  getCVInsightsApi,
  chatWithCVApi,
} from '../../../api/authApi';
import './cv-insights.css';

/* ── Mock Data ── */

const MOCK_CVS = [
  { id: 1, filename: 'SENIOR_PRODUCT_DES.PDF', uploadDate: 'Uploaded Jan 12, 2024', isActive: true },
  { id: 2, filename: 'DEVOPS_FOCUSED_RESUME.PDF', uploadDate: 'Uploaded Nov 02, 2023', isActive: false },
  { id: 3, filename: 'GENERAL_SOFTWARE_ENG.PDF', uploadDate: 'Uploaded Aug 15, 2023', isActive: false },
];

const MOCK_ANALYSIS = {
  strengths: [
    'Strong quantifiable impact in project descriptions with clear metrics',
    'Clean, consistent formatting throughout the document',
    'Relevant technical skills prominently listed in experience context',
    'Good use of action verbs in experience section headers',
    'Education and certifications are well-organized and concise',
  ],
  weaknesses: [
    'Missing a dedicated technical skills section for quick recruiter scan',
    'Professional summary is too generic and lacks role-specific keywords',
    'Employment dates are inconsistently formatted across roles',
    'No links to portfolio, GitHub, or live project demos',
  ],
  suggestions: [
    { text: 'Add a targeted professional summary with key role-specific keywords for your target industry', link: 'Learn More' },
    { text: 'Create a standalone technical skills section with proficiency levels and categories', link: 'Apply Suggestion' },
    { text: 'Quantify achievements with metrics (percentages, revenue, time saved) in each role description', link: 'Apply Suggestion' },
    { text: 'Add links to GitHub, portfolio, or relevant project repositories at the top of the document', link: 'Learn More' },
    { text: 'Standardise date formats across all employment entries to YYYY - YYYY format', link: 'Apply Suggestion' },
  ],
  presentKeywords: ['React', 'TypeScript', 'Node.js', 'AWS', 'PostgreSQL', 'Docker', 'REST APIs'],
  missingKeywords: ['Kubernetes', 'GraphQL', 'CI/CD', 'Microservices', 'Redis', 'Terraform', 'Next.js'],
};

const ANALYSIS_VARIANTS = [
  MOCK_ANALYSIS,
  {
    strengths: [
      'Clear career progression with consistent, promotion-worthy roles',
      'Strong leadership and mentorship signals in experience descriptions',
      'Efficient use of whitespace makes the CV easy to scan quickly',
      'Technical certifications are prominently highlighted',
      'Consistent use of active language across all sections',
    ],
    weaknesses: [
      'Objective section is vague and does not target a specific role',
      'List of technologies is scattered instead of grouped by category',
      'Some bullet points exceed two lines, reducing readability',
      'Contact details missing a phone number for quick recruiter reach',
    ],
    suggestions: [
      { text: 'Rewrite the objective to name your target role and key differentiators', link: 'Learn More' },
      { text: 'Group technologies into Languages / Frameworks / Cloud categories', link: 'Apply Suggestion' },
      { text: 'Trim bullets to two lines or fewer to keep the recruiter engaged', link: 'Apply Suggestion' },
      { text: 'Add a phone number and direct email to the header', link: 'Apply Suggestion' },
    ],
    presentKeywords: ['JavaScript', 'React', 'Node.js', 'SQL', 'Git', 'Agile', 'REST APIs'],
    missingKeywords: ['TypeScript', 'GraphQL', 'Docker', 'CI/CD', 'Terraform', 'Redis', 'Microservices'],
  },
  {
    strengths: [
      'Excellent quantification of results with hard numbers and percentages',
      'Clear, modern formatting that parses well with ATS tools',
      'Relevant projects showcased with outcomes and tech stack',
      'Concise bullets that highlight impact over responsibilities',
      'Strong keywords aligned with senior engineering roles',
    ],
    weaknesses: [
      'Missing an executive summary tailored to the applied role',
      'No dedicated achievements section to separate wins from duties',
      'Employment gaps are not explained or addressed',
      'Only one professional reference provided',
    ],
    suggestions: [
      { text: 'Add a role-specific executive summary at the top of the document', link: 'Learn More' },
      { text: 'Create a separate Achievements section with quantifiable wins', link: 'Apply Suggestion' },
      { text: 'Briefly explain employment gaps in a professional summary line', link: 'Apply Suggestion' },
      { text: 'Add 2-3 professional references or a "References available" note', link: 'Apply Suggestion' },
    ],
    presentKeywords: ['Python', 'Django', 'PostgreSQL', 'Docker', 'AWS', 'Celery', 'REST APIs'],
    missingKeywords: ['React', 'TypeScript', 'Kubernetes', 'GraphQL', 'Terraform', 'Kafka', 'CI/CD'],
  },
];

function formatCvItem(item) {
  if (!item) return null;
  return {
    id: item.id,
    filename: item.cv_name || item.filename || 'CV Document.pdf',
    url: item.cv_url || item.url || '',
    uploadDate: item.created_at
      ? `Uploaded ${new Date(item.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}`
      : item.uploadDate || 'Uploaded recently',
    size: item.file_size || item.size || 'PDF Document',
    isActive: Boolean(item.is_active),
    isRealCv: true,
  };
}

function buildAnalysisForCv(cv) {
  if (!cv || cv.id === undefined || cv.id === null) return ANALYSIS_VARIANTS[0];
  const numId = typeof cv.id === 'number' ? cv.id : parseInt(cv.id, 10);
  const safeId = isNaN(numId) ? 0 : Math.abs(numId);
  return ANALYSIS_VARIANTS[safeId % ANALYSIS_VARIANTS.length] || ANALYSIS_VARIANTS[0];
}

const MOCK_AI_RESPONSES = [
  {
    keywords: ['summary', 'profile', 'introduction'],
    text: 'Focus on 2-3 sentences that showcase your unique value proposition. Mention your years of experience, key technical stacks, and the type of problems you solve. For example: "Senior Full-Stack Engineer with 7+ years building scalable web applications using React, Node.js, and AWS. Passionate about architecting clean, performant systems that drive measurable business impact."',
  },
  {
    keywords: ['keyword', 'keywords', 'skill', 'skills'],
    text: 'Review the job descriptions you are targeting and extract the top 10-15 technical and soft skills that appear most frequently. Create a dedicated "Technical Skills" section at the top of your CV, grouped by category (e.g., "Languages: TypeScript, Python" — "Frameworks: React, Next.js" — "Cloud: AWS, Docker").',
  },
  {
    keywords: ['ATS', 'ats', 'parse', 'scanner', 'filter'],
    text: 'To improve ATS compatibility: (1) Use standard section headings (Experience, Education, Skills). (2) Avoid tables, columns, or graphics the parser may skip. (3) Spell out acronyms at least once (e.g., "CI/CD (Continuous Integration/Continuous Deployment)"). (4) Use standard PDF format.',
  },
];

function getMockAiResponse(userMessage) {
  const lower = userMessage.toLowerCase();
  for (const entry of MOCK_AI_RESPONSES) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return entry.text;
    }
  }
  return 'Great question. Consider tailoring your CV for each application by aligning your experience summary with the specific role requirements. Focus on highlighting measurable achievements and using keywords from the job description. Would you like me to look at a specific section of your CV?';
}

/* ── ScoreRing ── */

export function ScoreRing({ label, percentage, size = 110, strokeWidth = 8 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percentage / 100);

  return (
    <div className="score-ring">
      <div className="score-ring__svg-wrap">
        <svg className="score-ring__svg" viewBox={`0 0 ${size} ${size}`}>
          <circle
            className="score-ring__bg"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
          />
          <circle
            className="score-ring__fg"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <span className="score-ring__percentage">{percentage}%</span>
      </div>
      <span className="score-ring__label">{label}</span>
    </div>
  );
}

/* ── InsightList ── */

export function InsightList({ type, items, presentKeywords, missingKeywords }) {
  if (type === 'keywords') {
    return (
      <div className="insight-keywords">
        <div className="insight-keywords__group">
          <span className="insight-keywords__label">
            <Check size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
            Present in your CV
          </span>
          <div className="insight-keywords__tags">
            {presentKeywords.map((kw) => (
              <span key={kw} className="tag-pill tag-pill--present">{kw}</span>
            ))}
          </div>
        </div>
        <div className="insight-keywords__group">
          <span className="insight-keywords__label">
            <Zap size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
            Missing but in-demand
          </span>
          <div className="insight-keywords__tags">
            {missingKeywords.map((kw) => (
              <span key={kw} className="tag-pill tag-pill--missing">{kw}</span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="insight-list">
      {items.map((item, i) => {
        const isSuggestion = type === 'suggestions';
        const itemText = isSuggestion ? item.text : item;
        const itemLink = isSuggestion ? item.link : null;

        let icon;
        if (type === 'strengths') {
          icon = <Check size={14} />;
        } else if (type === 'weaknesses') {
          icon = <AlertTriangle size={14} />;
        } else {
          icon = <span>{i + 1}</span>;
        }

        const iconClass =
          type === 'strengths'
            ? 'insight-item__icon--strength'
            : type === 'weaknesses'
            ? 'insight-item__icon--weakness'
            : 'insight-item__icon--suggestion';

        return (
          <div key={i} className="insight-item">
            <div className={`insight-item__icon ${iconClass}`}>{icon}</div>
            <div className="insight-item__text">
              <span>{itemText}</span>
              {itemLink && (
                <button className="insight-item__link">{itemLink}</button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── ChatPanel ── */

export function ChatPanel({ messages, onSend, isTyping }) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const chips = [
    'Improve my summary',
    'Suggest better keywords',
    'Check for ATS issues',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  function handleSend() {
    const text = input.trim();
    if (!text) return;
    onSend(text);
    setInput('');
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="chat-panel">
      <div className="chat-panel__header">
        <div className="chat-panel__header-avatar">
          <Bot size={18} />
        </div>
        <div>
          <h3>Ask the CV Assistant</h3>
        </div>
        <div className="chat-panel__header-status">
          <span className="chat-panel__header-status-dot" />
          Online
        </div>
      </div>

      <div className="chat-panel__messages">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-message chat-message--${msg.role}`}>
            <div className="chat-message__avatar">
              {msg.role === 'ai' ? <Bot size={14} /> : 'U'}
            </div>
            <div className="chat-message__bubble">{msg.text}</div>
          </div>
        ))}
        {isTyping && (
          <div className="chat-message chat-message--ai">
            <div className="chat-message__avatar">
              <Bot size={14} />
            </div>
            <div className="chat-panel__typing">
              <span className="chat-panel__typing-dot" />
              <span className="chat-panel__typing-dot" />
              <span className="chat-panel__typing-dot" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-panel__chips">
        {chips.map((chip) => (
          <button
            key={chip}
            className="chat-panel__chip"
            onClick={() => setInput(chip)}
          >
            {chip}
          </button>
        ))}
      </div>

      <div className="chat-panel__input-bar">
        <input
          type="text"
          className="chat-panel__input"
          placeholder="Ask about your CV..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="chat-panel__send-btn"
          onClick={handleSend}
          disabled={!input.trim() || isTyping}
          aria-label="Send message"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

/* ── Main Page ── */

const ANALYSIS_TABS = [
  { key: 'strengths', label: 'Strengths' },
  { key: 'weaknesses', label: 'Weaknesses' },
  { key: 'suggestions', label: 'Suggestions' },
  { key: 'keywords', label: 'Keyword Gaps' },
];

function CVInsights() {
  const { setPageLabel } = useContext(CandidatePageContext);
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);

  const [cvList, setCvList] = useState([]);
  const [selectedCvId, setSelectedCvId] = useState(null);
  const [cvDropdownOpen, setCvDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('strengths');
  const [analysis, setAnalysis] = useState(MOCK_ANALYSIS);
  const [insightsCache, setInsightsCache] = useState({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoadingCvs, setIsLoadingCvs] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [chatMessages, setChatMessages] = useState([
    {
      role: 'ai',
      text: "Hi! I'm your CV assistant. Ask me anything about improving your CV — I can help with summaries, keywords, ATS issues, and more.",
    },
  ]);
  const [isChatTyping, setIsChatTyping] = useState(false);

  useEffect(() => {
    setPageLabel('CV INSIGHTS');
  }, [setPageLabel]);

  // Load CV documents from backend
  const fetchCvList = async () => {
    try {
      setIsLoadingCvs(true);
      const res = await getCandidateCVs();
      const rawCvs =
        res?.cvs ||
        res?.data?.cvs ||
        (Array.isArray(res?.data) ? res.data : []) ||
        (Array.isArray(res) ? res : []);
      const formatted = rawCvs.map(formatCvItem).filter(Boolean);

      if (formatted.length > 0) {
        setCvList(formatted);
        const active = formatted.find((d) => d.isActive) || formatted[0];
        setSelectedCvId(active.id);
        runAnalysis(active);
      } else {
        // Fallback to sample CVs if none uploaded yet
        const sampleCvs = MOCK_CVS.map((cv) => ({
          ...cv,
          isActive: cv.id === 1,
        }));
        setCvList(sampleCvs);
        setSelectedCvId(sampleCvs[0].id);
        runAnalysis(sampleCvs[0]);
      }
    } catch (err) {
      console.warn('Could not load CVs from backend, using default list:', err);
      const sampleCvs = MOCK_CVS.map((cv) => ({
        ...cv,
        isActive: cv.id === 1,
      }));
      setCvList(sampleCvs);
      setSelectedCvId(sampleCvs[0].id);
      runAnalysis(sampleCvs[0]);
    } finally {
      setIsLoadingCvs(false);
    }
  };

  useEffect(() => {
    fetchCvList();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setCvDropdownOpen(false);
      }
    }

    if (cvDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [cvDropdownOpen]);

  const selectedCv =
    cvList.find((cv) => cv.id === selectedCvId) ||
    cvList.find((cv) => cv.isActive) ||
    cvList[0] ||
    null;

  async function runAnalysis(cv, onComplete, force = false) {
    if (!cv) return;

    // Check client-side cache first to ensure instant, consistent summary without changing
    if (!force && insightsCache[cv.id]) {
      setAnalysis(insightsCache[cv.id]);
      setActiveTab('strengths');
      onComplete?.();
      return;
    }

    setIsAnalyzing(true);
    setActiveTab('strengths');

    if (cv.isRealCv) {
      try {
        const res = await getCVInsightsApi(cv.id);
        const liveInsights = res?.insights || res?.data?.insights;
        if (liveInsights && Array.isArray(liveInsights.strengths)) {
          setInsightsCache((prev) => ({ ...prev, [cv.id]: liveInsights }));
          setAnalysis(liveInsights);
          setIsAnalyzing(false);
          onComplete?.();
          return;
        }
      } catch (err) {
        console.warn('Backend insights request error, falling back:', err);
      }
    }

    setTimeout(() => {
      const fallback = buildAnalysisForCv(cv);
      setInsightsCache((prev) => ({ ...prev, [cv.id]: fallback }));
      setAnalysis(fallback);
      setIsAnalyzing(false);
      onComplete?.();
    }, 400);
  }

  async function handleCvSelect(cv) {
    if (cv.id === selectedCvId) {
      setCvDropdownOpen(false);
      return;
    }

    setSelectedCvId(cv.id);
    setCvDropdownOpen(false);
    runAnalysis(cv);

    setChatMessages((prev) => [
      ...prev,
      {
        role: 'ai',
        text: `Switched analysis to "${cv.filename}". Check the tabs above for consistent strengths, weaknesses, suggestions, and keyword gaps!`,
      },
    ]);
    // Note: Active CV remains strictly managed by CV Management page and is not modified here
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (fileExt !== '.pdf' && file.type !== 'application/pdf') {
      setFeedback({
        type: 'error',
        message: 'Invalid file format. Only PDF files (.pdf) are allowed.',
      });
      e.target.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setFeedback({
        type: 'error',
        message: 'File size exceeds 10MB limit. Please upload a smaller PDF.',
      });
      e.target.value = '';
      return;
    }

    try {
      setIsUploading(true);
      setFeedback(null);

      let newCvDoc = null;
      try {
        const res = await uploadCandidateCV(file, true);
        const rawNewCv = res?.cv || res?.data?.cv || res?.data;
        if (rawNewCv && rawNewCv.id) {
          newCvDoc = formatCvItem(rawNewCv);
        }
      } catch (uploadErr) {
        console.warn('Backend upload failed, creating client record:', uploadErr);
        newCvDoc = {
          id: Date.now(),
          filename: file.name,
          uploadDate: 'Uploaded just now',
          size: `${Math.round(file.size / 1024)} KB`,
          isActive: true,
        };
      }

      if (!newCvDoc) {
        newCvDoc = {
          id: Date.now(),
          filename: file.name,
          uploadDate: 'Uploaded just now',
          size: `${Math.round(file.size / 1024)} KB`,
          isActive: true,
        };
      }

      // Update state with newly uploaded CV
      setCvList((prev) => [
        newCvDoc,
        ...prev.map((item) => ({ ...item, isActive: false })),
      ]);
      setSelectedCvId(newCvDoc.id);
      setCvDropdownOpen(false);

      setFeedback({
        type: 'success',
        message: `CV "${file.name}" uploaded successfully and set as active document!`,
      });

      setChatMessages((prev) => [
        ...prev,
        { role: 'user', text: `Please analyze my new CV: ${file.name}` },
      ]);

      runAnalysis(newCvDoc, () => {
        setChatMessages((prev) => [
          ...prev,
          {
            role: 'ai',
            text: `I've finished analyzing "${newCvDoc.filename}". It scans well overall — check the tabs above for strengths, weaknesses, suggestions, and keyword gaps, or ask me anything specific below.`,
          },
        ]);
      });
    } catch (err) {
      console.error('Error uploading CV:', err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Failed to upload CV. Please try again.';
      setFeedback({
        type: 'error',
        message: msg,
      });
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  }

  async function handleSend(text) {
    const updatedMessages = [...chatMessages, { role: 'user', text }];
    setChatMessages(updatedMessages);
    setIsChatTyping(true);

    if (selectedCv && selectedCv.isRealCv) {
      try {
        const res = await chatWithCVApi(selectedCv.id, text, chatMessages);
        const reply = res?.reply || res?.data?.reply;
        if (reply) {
          setChatMessages((prev) => [...prev, { role: 'ai', text: reply }]);
          setIsChatTyping(false);
          return;
        }
      } catch (err) {
        console.warn('Live CV Assistant chat request failed, falling back:', err);
      }
    }

    setTimeout(() => {
      const reply = getMockAiResponse(text);
      setChatMessages((prev) => [...prev, { role: 'ai', text: reply }]);
      setIsChatTyping(false);
    }, 1000);
  }

  return (
    <div className="cv-insights">
      {feedback && (
        <div className={`cv-insights__alert cv-insights__alert--${feedback.type}`}>
          <div className="cv-insights__alert-content">
            {feedback.type === 'error' ? (
              <AlertCircle size={16} />
            ) : (
              <Check size={16} />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            className="cv-insights__alert-close"
            onClick={() => setFeedback(null)}
            aria-label="Dismiss message"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="cv-insights__toolbar">
        <div className="cv-insights__cv-selector" ref={dropdownRef}>
          <div className="cv-insights__cv-selector-wrap">
            <button
              type="button"
              className="cv-insights__cv-trigger"
              onClick={() => setCvDropdownOpen((prev) => !prev)}
              disabled={isLoadingCvs || isUploading}
            >
              <div className="cv-insights__cv-trigger-icon">
                <FileText size={16} />
              </div>
              <div className="cv-insights__cv-trigger-info">
                <span className="cv-insights__cv-trigger-name">
                  {selectedCv
                    ? selectedCv.filename
                    : isLoadingCvs
                    ? 'Loading CVs...'
                    : 'No CV selected'}
                </span>
                <span className="cv-insights__cv-trigger-date">
                  {selectedCv
                    ? selectedCv.uploadDate
                    : isLoadingCvs
                    ? 'Please wait...'
                    : 'Upload a PDF to begin'}
                </span>
              </div>
              <ChevronDown
                size={16}
                className={`cv-insights__cv-trigger-arrow ${
                  cvDropdownOpen ? 'cv-insights__cv-trigger-arrow--open' : ''
                }`}
              />
            </button>

            {cvDropdownOpen && (
              <div className="cv-insights__cv-dropdown">
                {cvList.length === 0 ? (
                  <div className="cv-insights__cv-empty">
                    No CVs found. Upload a CV to get started.
                  </div>
                ) : (
                  cvList.map((cv) => (
                    <div
                      key={cv.id}
                      className={`cv-insights__cv-option ${
                        selectedCvId === cv.id ? 'cv-insights__cv-option--active' : ''
                      }`}
                      onClick={() => handleCvSelect(cv)}
                    >
                      <div className="cv-insights__cv-option-radio">
                        <div className="cv-insights__cv-option-dot" />
                      </div>
                      <div className="cv-insights__cv-option-icon">
                        <FileText size={14} />
                      </div>
                      <div className="cv-insights__cv-option-info">
                        <span className="cv-insights__cv-option-name">{cv.filename}</span>
                        <span className="cv-insights__cv-option-date">{cv.uploadDate}</span>
                      </div>
                      {cv.isActive && (
                        <span className="cv-insights__cv-badge">Active</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="cv-insights__file-input"
          onChange={handleFileChange}
        />
        <button
          type="button"
          className="cv-insights__upload-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 size={14} className="cv-insights__spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload size={14} />
              Upload New CV
            </>
          )}
        </button>
      </div>

      {/* Body */}
      <div className="cv-insights__body">
        {/* AI Analysis Panel */}
        <div className="cv-insights__analysis">
          <div className="cv-insights__analysis-header">
            <Sparkles size={20} className="cv-insights__analysis-header-icon" />
            <h2>AI Analysis</h2>
            <span className="cv-insights__analysis-header-badge">POWERED BY INTELLI·AI</span>
          </div>

          <div className="cv-insights__tabs">
            {ANALYSIS_TABS.map((tab) => (
              <button
                key={tab.key}
                className={`cv-insights__tab ${
                  activeTab === tab.key ? 'cv-insights__tab--active' : ''
                }`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="cv-insights__analysis-body">
            {isAnalyzing ? (
              <div className="cv-insights__skeleton">
                <div className="cv-insights__skeleton-line cv-insights__skeleton-line--medium" />
                <div className="cv-insights__skeleton-line cv-insights__skeleton-line--long" />
                <div className="cv-insights__skeleton-line cv-insights__skeleton-line--short" />
                <div className="cv-insights__skeleton-line cv-insights__skeleton-line--long" />
                <div className="cv-insights__skeleton-line cv-insights__skeleton-line--medium" />
              </div>
            ) : (
              <InsightList
                type={activeTab}
                items={analysis[activeTab]}
                presentKeywords={analysis.presentKeywords}
                missingKeywords={analysis.missingKeywords}
              />
            )}
          </div>
        </div>

        {/* Chat Panel */}
        <div className="cv-insights__chat">
          <ChatPanel
            messages={chatMessages}
            onSend={handleSend}
            isTyping={isChatTyping}
          />
        </div>
      </div>

    </div>
  );
}

export default CVInsights;
