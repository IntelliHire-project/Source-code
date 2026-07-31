import React, { useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CandidatePageContext } from '../CandidateDashboard';
import {
  CheckCircle2,
  XCircle,
  MessageSquare,
  TrendingUp,
  RotateCcw,
  Download,
  ArrowLeft,
  Search,
  Bell,
  Award,
} from 'lucide-react';
import './InterviewPerformanceAnalysis.css';

export default function InterviewPerformanceAnalysis() {
  const location = useLocation();
  const navigate = useNavigate();
  const pageCtx = useContext(CandidatePageContext);

  useEffect(() => {
    if (pageCtx?.setPageLabel) {
      pageCtx.setPageLabel('MOCK INTERVIEWS');
    }
  }, [pageCtx]);

  const roleTitle = location.state?.roleTitle || 'Senior Software Engineer Feedback';
  const sessionId = location.state?.sessionId || '#INT-99218';
  const dateStr = location.state?.dateStr || 'October 24, 2023';
  const candidateName = location.state?.candidateName || 'Marcus Chen';
  const finalScore = location.state?.score || 84;

  const handleDownloadReport = () => {
    window.print();
  };

  const handlePracticeAgain = () => {
    navigate('/candidate/mock-interviews/roleselection');
  };

  const handleReturnDashboard = () => {
    navigate('/candidate/dashboard');
  };

  // SVG calculations for score gauge
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (finalScore / 100) * circumference;

  return (
    <div className="performance-analysis-container">
      {/* Top Header / Breadcrumb Bar */}
      <div className="analysis-top-nav">
        <div className="breadcrumb-trail">
          <span
            className="bc-muted"
            onClick={() => navigate('/candidate/mock-interviews/history')}
            style={{ cursor: 'pointer' }}
          >
            History
          </span>
          <span className="bc-separator">/</span>
          <span className="bc-active">{roleTitle}</span>
        </div>

        <div className="nav-right-controls">
          <div className="search-bar-small">
            <Search size={15} className="search-icon" />
            <input type="text" placeholder="Search feedback..." />
          </div>
          <button type="button" className="icon-notice-btn">
            <Bell size={16} />
          </button>
        </div>
      </div>

      <div className="analysis-content">
        {/* Title & Metadata Header */}
        <div className="analysis-header-row">
          <div className="header-titles">
            <h1 className="analysis-title">Interview Performance Analysis</h1>
            <p className="analysis-meta">
              Session ID: <span className="highlight-id">{sessionId}</span> &bull; Date: {dateStr}
            </p>
          </div>
          <div className="candidate-pool-badge">
            <Award size={14} />
            <span>Final Candidate Pool</span>
          </div>
        </div>

        {/* Top Cards Row: Overall Score & Radar Chart */}
        <div className="top-cards-grid">
          {/* Left: Overall Technical Score Card */}
          <div className="score-card">
            <div className="score-card-header">
              <h3 className="score-title">Overall Technical Score</h3>
              <p className="score-subtitle">
                Based on algorithmic efficiency and architectural depth
              </p>
            </div>

            <div className="donut-gauge-container">
              <svg className="gauge-svg" width="160" height="160" viewBox="0 0 160 160">
                <circle
                  className="gauge-bg"
                  cx="80"
                  cy="80"
                  r={radius}
                  strokeWidth="12"
                />
                <circle
                  className="gauge-fill"
                  cx="80"
                  cy="80"
                  r={radius}
                  strokeWidth="12"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  transform="rotate(-90 80 80)"
                />
              </svg>
              <div className="gauge-text-center">
                <span className="big-score-num">{finalScore}</span>
                <span className="out-of-text">Out of 100</span>
              </div>
            </div>
          </div>

          {/* Right: Skills Distribution Radar Chart Card */}
          <div className="skills-card">
            <h3 className="skills-title">Skills Distribution</h3>
            <div className="radar-chart-container">
              <svg className="radar-svg" viewBox="0 0 300 240">
                {/* Background Grid Lines */}
                <polygon
                  points="150,40 230,120 150,200 70,120"
                  fill="none"
                  stroke="#282a35"
                  strokeWidth="1"
                />
                <polygon
                  points="150,65 210,120 150,175 90,120"
                  fill="none"
                  stroke="#242630"
                  strokeWidth="1"
                />
                <polygon
                  points="150,90 190,120 150,150 110,120"
                  fill="none"
                  stroke="#242630"
                  strokeWidth="1"
                />
                {/* Axes */}
                <line x1="150" y1="40" x2="150" y2="200" stroke="#282a35" strokeWidth="1" />
                <line x1="70" y1="120" x2="230" y2="120" stroke="#282a35" strokeWidth="1" />

                {/* Filled Skill Polygon Data */}
                {/* Points calculated for 88% Tech (top), 82% Comm (right), 76% Lead (bottom), 90% System (left) */}
                <polygon
                  points="150,49 215,120 150,181 78,120"
                  fill="rgba(234, 179, 8, 0.35)"
                  stroke="#facc15"
                  strokeWidth="2.5"
                />
                {/* Vertices */}
                <circle cx="150" cy="49" r="4" fill="#ffc107" />
                <circle cx="215" cy="120" r="4" fill="#ffc107" />
                <circle cx="150" cy="181" r="4" fill="#ffc107" />
                <circle cx="78" cy="120" r="4" fill="#ffc107" />

                {/* Axis Labels */}
                <text x="150" y="28" textAnchor="middle" className="radar-label">
                  TECHNICAL
                </text>
                <text x="242" y="124" textAnchor="start" className="radar-label">
                  COMMUNICATION
                </text>
                <text x="150" y="218" textAnchor="middle" className="radar-label">
                  LEADERSHIP
                </text>
                <text x="58" y="124" textAnchor="end" className="radar-label">
                  SYSTEM DESIGN
                </text>
              </svg>
            </div>
          </div>
        </div>

        {/* Middle Row: Core Strengths & Areas for Improvement */}
        <div className="comparison-cards-grid">
          {/* Core Strengths */}
          <div className="feedback-block strengths-block">
            <div className="block-header strengths-header">
              <CheckCircle2 size={18} className="block-icon success-icon" />
              <h4>Core Strengths</h4>
            </div>
            <ul className="feedback-list">
              <li>
                Demonstrated exceptional proficiency in distributed systems architecture during the technical deep-dive.
              </li>
              <li>
                Articulated complex concepts clearly and adapted explanations based on interviewer feedback.
              </li>
              <li>
                Strong evidence of collaborative problem solving and active listening skills throughout the session.
              </li>
              <li>
                Showcased high ownership mentality when discussing past project failures and lessons learned.
              </li>
            </ul>
          </div>

          {/* Areas for Improvement */}
          <div className="feedback-block improvement-block">
            <div className="block-header improvement-header">
              <XCircle size={18} className="block-icon alert-icon" />
              <h4>Areas for Improvement</h4>
            </div>
            <ul className="feedback-list">
              <li>
                Initial response to high-level scalability questions lacked specific quantitative metrics.
              </li>
              <li>
                Could improve the structure of responses using the STAR method for behavioral questions.
              </li>
              <li>
                Technical walkthrough of data consistency models was slightly disorganized in the middle segment.
              </li>
              <li>
                Took longer than expected to identify edge cases in the live coding exercise.
              </li>
            </ul>
          </div>
        </div>

        {/* Narrative Feedback Summary Card */}
        <div className="narrative-card">
          <div className="narrative-header">
            <MessageSquare size={18} className="narrative-icon" />
            <h3>Feedback Summary</h3>
          </div>
          <p className="narrative-body">
            {candidateName} displayed a strong command of system design principles, particularly in high-availability environments. His explanation of database sharding and replica management was insightful and technically sound. While his technical depth is undeniable, there was a slight delay in communicating architectural tradeoffs when pressed on cost versus performance. Overall, he demonstrates the seniority level expected for a Level 6 Software Engineer, with minor refinements needed in rapid scenario-based decision making.
          </p>
        </div>

        {/* Actionable Improvement Suggestions Card */}
        <div className="suggestions-card">
          <div className="suggestions-header">
            <TrendingUp size={18} className="suggestions-icon" />
            <div>
              <h3>Improvement Suggestions</h3>
              <p className="suggestions-sub">
                Refining these areas will increase your score by an estimated 12 points in the next session.
              </p>
            </div>
          </div>

          <div className="suggestions-inner-box">
            <p>
              Focus on articulating quantitative results from previous projects. Practice explaining 'CAP theorem' tradeoffs in under 2 minutes. Review 'B-tree vs LSM-tree' storage engine differences for low-latency write scenarios...
            </p>
          </div>
        </div>

        {/* Bottom Action Controls */}
        <div className="analysis-actions-bar">
          <button
            type="button"
            className="action-btn return-btn"
            onClick={handleReturnDashboard}
          >
            <ArrowLeft size={16} />
            Return to Dashboard
          </button>

          <div className="right-action-buttons">
            <button
              type="button"
              className="action-btn practice-again-btn"
              onClick={handlePracticeAgain}
            >
              <RotateCcw size={15} />
              Practice Again
            </button>
            <button
              type="button"
              className="action-btn download-report-btn"
              onClick={handleDownloadReport}
            >
              <Download size={15} />
              Download Full Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
