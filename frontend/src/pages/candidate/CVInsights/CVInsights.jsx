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
  ShieldCheck,
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
            Job-specific keyword gaps require a job description
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

export function ChatPanel({ messages, onSend, isTyping, selectedCvName }) {
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
    if (!text || isTyping) return;
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
        <div className="chat-panel__header-info">
          <h3>Ask the CV Assistant</h3>
          <p className="chat-panel__selected-cv">
            {selectedCvName ? `Chatting about: ${selectedCvName}` : 'Select a CV to chat'}
          </p>
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
          maxLength={2000}
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

const INITIAL_CHAT_MESSAGES = [{
  role: 'ai',
  text: "Hi! I'm your CV assistant. Ask me anything about improving your CV.",
}];

function CVInsights() {
  const { setPageLabel } = useContext(CandidatePageContext);
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const analysisRequestRef = useRef(0);
  const chatRequestRef = useRef(0);

  const [cvList, setCvList] = useState([]);
  const [selectedCvId, setSelectedCvId] = useState(null);
  const [cvDropdownOpen, setCvDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('strengths');
  const [analysis, setAnalysis] = useState(null);
  const [insightsCache, setInsightsCache] = useState({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoadingCvs, setIsLoadingCvs] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [chatMessages, setChatMessages] = useState(INITIAL_CHAT_MESSAGES);
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
        setCvList([]);
        setSelectedCvId(null);
        setAnalysis(null);
      }
    } catch (err) {
      console.error('Could not load CVs:', err);
      setFeedback({ type: 'error', message: 'Could not load CVs. Please try again.' });
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
    const requestId = ++analysisRequestRef.current;

    // Check client-side cache first to ensure instant, consistent summary without changing
    if (!force && insightsCache[cv.id]) {
      setAnalysis(insightsCache[cv.id]);
      setIsAnalyzing(false);
      setActiveTab('strengths');
      onComplete?.();
      return;
    }

    setIsAnalyzing(true);
    setAnalysis(null);
    setActiveTab('strengths');

    if (cv.isRealCv) {
      try {
        const res = await getCVInsightsApi(cv.id, force);
        if (requestId !== analysisRequestRef.current) return;
        const liveInsights = res?.insights || res?.data?.insights;
        if (liveInsights && Array.isArray(liveInsights.strengths)) {
          setInsightsCache((prev) => ({ ...prev, [cv.id]: liveInsights }));
          setAnalysis(liveInsights);
          setIsAnalyzing(false);
          onComplete?.();
          return;
        }
        throw new Error('The server returned invalid CV insights.');
      } catch (err) {
        if (requestId !== analysisRequestRef.current) return;
        console.error('CV insights request failed:', err);
        setFeedback({
          type: 'error',
          message: err.response?.data?.message || 'Could not generate CV insights. Please try again.',
        });
      }
    }
    setIsAnalyzing(false);
  }

  async function handleCvSelect(cv) {
    if (cv.id === selectedCvId) {
      setCvDropdownOpen(false);
      return;
    }

    setSelectedCvId(cv.id);
    setCvDropdownOpen(false);
    chatRequestRef.current += 1;
    setChatMessages(INITIAL_CHAT_MESSAGES);
    setIsChatTyping(false);
    runAnalysis(cv);
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

    if (file.size > 5 * 1024 * 1024) {
      setFeedback({
        type: 'error',
        message: 'File size exceeds 5MB limit. Please upload a smaller PDF.',
      });
      e.target.value = '';
      return;
    }

    try {
      setIsUploading(true);
      setFeedback(null);

      const res = await uploadCandidateCV(file, true);
      const rawNewCv = res?.cv || res?.data?.cv || res?.data;
      if (!rawNewCv || !rawNewCv.id) throw new Error('The server did not return the uploaded CV.');
      const newCvDoc = formatCvItem(rawNewCv);

      // Update state with newly uploaded CV
      setCvList((prev) => [
        newCvDoc,
        ...prev.map((item) => ({ ...item, isActive: false })),
      ]);
      setSelectedCvId(newCvDoc.id);
      setCvDropdownOpen(false);
      chatRequestRef.current += 1;
      setChatMessages(INITIAL_CHAT_MESSAGES);
      setIsChatTyping(false);

      setFeedback({
        type: 'success',
        message: `CV "${file.name}" uploaded successfully and set as active document!`,
      });

      runAnalysis(newCvDoc);
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
    if (!selectedCv || !selectedCv.isRealCv) {
      setFeedback({ type: 'error', message: 'Select or upload a CV before using the assistant.' });
      return;
    }

    const requestId = ++chatRequestRef.current;
    const updatedMessages = [...chatMessages, { role: 'user', text }];
    setChatMessages(updatedMessages);
    setIsChatTyping(true);
    setFeedback(null);

    try {
      const res = await chatWithCVApi(selectedCv.id, text, chatMessages.slice(-6));
      if (requestId !== chatRequestRef.current) return;
      const reply = res?.reply || res?.data?.reply;
      if (typeof reply !== 'string' || !reply.trim()) {
        throw new Error('The server returned an empty chat response.');
      }
      setChatMessages((prev) => [...prev, { role: 'ai', text: reply }]);
    } catch (err) {
      if (requestId !== chatRequestRef.current) return;
      console.error('CV assistant request failed:', err);
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'The CV assistant is unavailable. Please try again.',
      });
    } finally {
      if (requestId === chatRequestRef.current) setIsChatTyping(false);
    }
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
            ) : analysis ? (
              <InsightList
                type={activeTab}
                items={analysis[activeTab]}
                presentKeywords={analysis.presentKeywords}
                missingKeywords={analysis.missingKeywords}
              />
            ) : (
              <p>Select or upload a CV to generate insights.</p>
            )}
          </div>
        </div>

        {/* Chat Panel */}
        <div className="cv-insights__chat">
          <ChatPanel
            key={selectedCvId}
            selectedCvName={selectedCv?.filename}
            messages={chatMessages}
            onSend={handleSend}
            isTyping={isChatTyping}
          />
        </div>
      </div>

      <div className="cv-insights__privacy">
        <ShieldCheck size={14} className="cv-insights__privacy-icon" aria-hidden="true" />
        <p>
          CV content and chat messages may be sent to Google Gemini for AI insights and responses.
          Please avoid sharing sensitive information; personal details may remain despite filtering.
        </p>
      </div>
    </div>
  );
}

export default CVInsights;
