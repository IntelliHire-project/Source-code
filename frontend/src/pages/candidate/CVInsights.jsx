import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Check,
  AlertTriangle,
  Send,
  Bot,
  FileText,
  ChevronDown,
  Download,
  RefreshCw,
  Zap,
} from 'lucide-react';
import './cv-insights.css';

/* ── Mock Data ── */

const MOCK_CVS = [
  { id: 1, filename: 'SENIOR_PRODUCT_DES', uploadDate: 'Uploaded Jan 12, 2024' },
  { id: 2, filename: 'DEVOPS_FOCUSED_RESUME.PDF', uploadDate: 'Uploaded Nov 02, 2023' },
  { id: 3, filename: 'GENERAL_SOFTWARE_ENG.PDF', uploadDate: 'Uploaded Aug 15, 2023' },
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
    text: 'To improve ATS compatibility: (1) Use standard section headings (Experience, Education, Skills). (2) Avoid tables, columns, or graphics the parser may skip. (3) Spell out acronyms at least once (e.g., "CI/CD (Continuous Integration/Continuous Deployment)"). (4) Use .docx or PDF format as the job post recommends.',
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
  const [selectedCvId, setSelectedCvId] = useState(1);
  const [cvDropdownOpen, setCvDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('strengths');
  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', text: 'Hi! I\'m your CV assistant. Ask me anything about improving your CV — I can help with summaries, keywords, ATS issues, and more.' },
  ]);
  const [isChatTyping, setIsChatTyping] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const selectedCv = MOCK_CVS.find((cv) => cv.id === selectedCvId) || MOCK_CVS[0];

  function handleSend(text) {
    setChatMessages((prev) => [...prev, { role: 'user', text }]);
    setIsChatTyping(true);

    setTimeout(() => {
      const reply = getMockAiResponse(text);
      setChatMessages((prev) => [...prev, { role: 'ai', text: reply }]);
      setIsChatTyping(false);
    }, 1500);
  }

  function handleReanalyze() {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 2000);
  }

  return (
    <div className="cv-insights">
      {/* Header */}
      <div className="cv-insights__header">
        <div className="cv-insights__header-left">
          <h1 className="cv-insights__title">
            <Sparkles size={28} className="cv-insights__title-icon" />
            CV Insights
          </h1>
          <p className="cv-insights__subtext">
            Get AI-powered feedback on your CV to improve your match rate
          </p>
        </div>

        <div className="cv-insights__cv-selector">
          <div className="cv-insights__cv-selector-wrap">
            <button
              className="cv-insights__cv-trigger"
              onClick={() => setCvDropdownOpen((prev) => !prev)}
            >
              <div className="cv-insights__cv-trigger-icon">
                <FileText size={16} />
              </div>
              <div className="cv-insights__cv-trigger-info">
                <span className="cv-insights__cv-trigger-name">
                  {selectedCv.filename}
                </span>
                <span className="cv-insights__cv-trigger-date">
                  {selectedCv.uploadDate}
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
                {MOCK_CVS.map((cv) => (
                  <div
                    key={cv.id}
                    className={`cv-insights__cv-option ${
                      selectedCvId === cv.id ? 'cv-insights__cv-option--active' : ''
                    }`}
                    onClick={() => {
                      setSelectedCvId(cv.id);
                      setCvDropdownOpen(false);
                    }}
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
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
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

          <InsightList
            type={activeTab}
            items={MOCK_ANALYSIS[activeTab]}
            presentKeywords={MOCK_ANALYSIS.presentKeywords}
            missingKeywords={MOCK_ANALYSIS.missingKeywords}
          />
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

      {/* Bottom Actions */}
      <div className="cv-insights__bottom">
        <button
          className="cv-insights__btn cv-insights__btn--primary"
          onClick={handleReanalyze}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <span className="cv-insights__btn-spinner" />
          ) : (
            <RefreshCw size={16} />
          )}
          {isAnalyzing ? 'Analyzing...' : 'Re-analyze CV'}
        </button>
        <button className="cv-insights__btn cv-insights__btn--outline">
          <Download size={16} />
          Download Full Report
        </button>
      </div>
    </div>
  );
}

export default CVInsights;
