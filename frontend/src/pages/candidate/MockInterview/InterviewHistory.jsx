import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CandidatePageContext } from '../CandidateDashboard';
import {
  Users,
  TrendingUp,
  Briefcase,
  Clock,
  Search,
  ChevronDown,
  SlidersHorizontal,
  Calendar,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
} from 'lucide-react';
import './InterviewHistory.css';

const EVALUATIONS_DATA = [
  {
    id: 1,
    candidateName: 'Alex Rivera',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    jobRole: 'Senior Frontend Engineer',
    date: 'Oct 24, 2023',
    score: 92,
    status: 'Hired',
    statusClass: 'status-hired',
  },
  {
    id: 2,
    candidateName: 'Sarah Chen',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
    jobRole: 'Product Designer',
    date: 'Oct 22, 2023',
    score: 78,
    status: 'Round 2',
    statusClass: 'status-round2',
  },
  {
    id: 3,
    candidateName: 'Michael Scott',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    jobRole: 'Fullstack Developer',
    date: 'Oct 20, 2023',
    score: 45,
    scoreClass: 'score-low',
    status: 'Rejected',
    statusClass: 'status-rejected',
  },
  {
    id: 4,
    candidateName: 'Jordan Lee',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    jobRole: 'DevOps Lead',
    date: 'Oct 18, 2023',
    score: 88,
    status: 'Offer Sent',
    statusClass: 'status-offer',
  },
  {
    id: 5,
    candidateName: 'Emily Blunt',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    jobRole: 'UX Researcher',
    date: 'Oct 15, 2023',
    score: 81,
    status: 'Pending',
    statusClass: 'status-pending',
  },
];

export default function InterviewHistory() {
  const navigate = useNavigate();
  const pageCtx = useContext(CandidatePageContext);

  useEffect(() => {
    if (pageCtx?.setPageLabel) {
      pageCtx.setPageLabel('MOCK INTERVIEWS');
    }
  }, [pageCtx]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('History');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredEvaluations = EVALUATIONS_DATA.filter(
    (item) =>
      item.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.jobRole.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNewInterview = () => {
    navigate('/candidate/mock-interviews/roleselection');
  };

  const handleViewDetails = (item) => {
    navigate('/candidate/mock-interviews/feedback', {
      state: {
        roleTitle: `${item.jobRole} Feedback`,
        candidateName: item.candidateName,
        score: item.score,
        sessionId: `#INT-${99200 + item.id}`,
        dateStr: item.date,
      },
    });
  };

  return (
    <div className="interview-history-container">
      {/* Top Header Navigation */}
      <header className="history-top-nav">
        <div className="nav-brand-group">
          <div className="brand-logo-icon">
            <span className="logo-symbol">&#x2B22;</span>
          </div>
          <span className="brand-name">IntelliHire</span>

          <nav className="top-nav-links">
            <button
              type="button"
              className={`nav-tab-btn ${activeTab === 'History' ? 'active' : ''}`}
              onClick={() => setActiveTab('History')}
            >
              History
            </button>
            <button
              type="button"
              className={`nav-tab-btn ${activeTab === 'Jobs' ? 'active' : ''}`}
              onClick={() => navigate('/candidate/jobs')}
            >
              Jobs
            </button>
            <button
              type="button"
              className={`nav-tab-btn ${activeTab === 'Candidates' ? 'active' : ''}`}
              onClick={() => setActiveTab('Candidates')}
            >
              Candidates
            </button>
            <button
              type="button"
              className={`nav-tab-btn ${activeTab === 'Analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('Analytics')}
            >
              Analytics
            </button>
          </nav>
        </div>

        <div className="top-nav-right">
          <button type="button" className="nav-icon-button" title="Session Clock">
            <Clock size={16} />
          </button>
          <div className="nav-user-avatar">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
              alt="User Avatar"
            />
            <span className="online-dot"></span>
          </div>
        </div>
      </header>

      {/* Main Content Workspace */}
      <div className="history-main-content">
        {/* Page Header */}
        <div className="history-page-header">
          <div className="header-titles">
            <h1 className="page-main-title">Interview History</h1>
            <p className="page-sub-title">
              Review past performance, scores, and candidate progression.
            </p>
          </div>
          <button type="button" className="new-interview-btn" onClick={handleNewInterview}>
            New Interview
            <ExternalLink size={15} />
          </button>
        </div>

        {/* 4 KPI Summary Cards */}
        <div className="kpi-cards-grid">
          <div className="kpi-card">
            <div className="kpi-header">
              <span className="kpi-label">TOTAL INTERVIEWS</span>
              <div className="kpi-icon-box">
                <Users size={16} />
              </div>
            </div>
            <div className="kpi-value-row">
              <span className="kpi-value">1,284</span>
              <span className="kpi-trend positive">+12%</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <span className="kpi-label">AVG. SCORE</span>
              <div className="kpi-icon-box">
                <TrendingUp size={16} />
              </div>
            </div>
            <div className="kpi-value-row">
              <span className="kpi-value">78.4</span>
              <span className="kpi-trend positive">+5.2%</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <span className="kpi-label">HIRING RATE</span>
              <div className="kpi-icon-box">
                <Briefcase size={16} />
              </div>
            </div>
            <div className="kpi-value-row">
              <span className="kpi-value">24%</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <span className="kpi-label">ACTIVE ROUNDS</span>
              <div className="kpi-icon-box">
                <Clock size={16} />
              </div>
            </div>
            <div className="kpi-value-row">
              <span className="kpi-value">42</span>
            </div>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="search-filters-bar">
          <div className="search-input-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search by candidate or job role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filters-right-group">
            <div className="filter-dropdown">
              <Briefcase size={15} />
              <span>All Roles</span>
              <ChevronDown size={14} />
            </div>

            <div className="filter-dropdown">
              <Calendar size={15} />
              <span>This Month</span>
              <ChevronDown size={14} />
            </div>

            <button type="button" className="filter-action-btn">
              <SlidersHorizontal size={15} />
              <span>Advanced</span>
            </button>
          </div>
        </div>

        {/* Workspace Layout Grid: Left Table & Right Analytics */}
        <div className="history-content-grid">
          {/* Left Table Section */}
          <div className="evaluations-table-card">
            <div className="table-card-header">
              <h3 className="card-heading">Recent Evaluations</h3>
              <button type="button" className="export-csv-btn">
                Export CSV
              </button>
            </div>

            <div className="table-responsive-wrapper">
              <table className="evaluations-table">
                <thead>
                  <tr>
                    <th>CANDIDATE</th>
                    <th>JOB ROLE</th>
                    <th>INTERVIEW DATE</th>
                    <th>SCORE</th>
                    <th>STATUS</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvaluations.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="candidate-cell">
                          <img
                            src={item.avatar}
                            alt={item.candidateName}
                            className="candidate-avatar"
                          />
                          <span className="candidate-name-text">{item.candidateName}</span>
                        </div>
                      </td>
                      <td className="role-text">{item.jobRole}</td>
                      <td className="date-text">{item.date}</td>
                      <td>
                        <span className={`score-badge ${item.scoreClass || ''}`}>
                          {item.score}
                        </span>
                      </td>
                      <td>
                        <span className={`status-pill ${item.statusClass}`}>
                          {item.status}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="view-details-btn"
                          onClick={() => handleViewDetails(item)}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="table-card-footer">
              <span className="showing-records-text">
                Showing 1-{filteredEvaluations.length} of 124 interviews
              </span>

              <div className="pagination-controls">
                <button
                  type="button"
                  className="page-btn"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  type="button"
                  className={`page-btn ${currentPage === 1 ? 'active' : ''}`}
                  onClick={() => setCurrentPage(1)}
                >
                  1
                </button>
                <button
                  type="button"
                  className={`page-btn ${currentPage === 2 ? 'active' : ''}`}
                  onClick={() => setCurrentPage(2)}
                >
                  2
                </button>
                <button
                  type="button"
                  className={`page-btn ${currentPage === 3 ? 'active' : ''}`}
                  onClick={() => setCurrentPage(3)}
                >
                  3
                </button>
                <span className="page-ellipsis">&hellip;</span>
                <button
                  type="button"
                  className="page-btn"
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Right Analytics Panel */}
          <div className="analytics-right-panel">
            {/* Performance Trend Card */}
            <div className="trend-card">
              <div className="trend-card-header">
                <div className="trend-title-group">
                  <TrendingUp size={16} className="trend-header-icon" />
                  <h4>PERFORMANCE TREND</h4>
                </div>
                <p className="trend-subtitle">Candidate average score over last 6 months</p>
              </div>

              {/* Area Chart SVG */}
              <div className="area-chart-wrapper">
                <svg className="trend-svg" viewBox="0 0 320 160">
                  <defs>
                    <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ffc107" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#ffc107" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Grid Lines */}
                  <line x1="30" y1="20" x2="300" y2="20" stroke="#252731" strokeDasharray="3 3" />
                  <text x="20" y="24" className="y-axis-label">100</text>

                  <line x1="30" y1="55" x2="300" y2="55" stroke="#252731" strokeDasharray="3 3" />
                  <text x="20" y="59" className="y-axis-label">75</text>

                  <line x1="30" y1="90" x2="300" y2="90" stroke="#252731" strokeDasharray="3 3" />
                  <text x="20" y="94" className="y-axis-label">50</text>

                  <line x1="30" y1="125" x2="300" y2="125" stroke="#252731" strokeDasharray="3 3" />
                  <text x="20" y="129" className="y-axis-label">25</text>

                  <line x1="30" y1="145" x2="300" y2="145" stroke="#252731" />
                  <text x="20" y="148" className="y-axis-label">0</text>

                  {/* Filled Gradient Path */}
                  <path
                    d="M 40,80 Q 80,60 120,70 T 200,35 T 280,25 L 280,145 L 40,145 Z"
                    fill="url(#goldGradient)"
                  />
                  {/* Smooth Curve Line */}
                  <path
                    d="M 40,80 Q 80,60 120,70 T 200,35 T 280,25"
                    fill="none"
                    stroke="#ffc107"
                    strokeWidth="2.5"
                  />

                  {/* X Axis Labels */}
                  <text x="40" y="158" className="x-axis-label">Jun</text>
                  <text x="88" y="158" className="x-axis-label">Jul</text>
                  <text x="136" y="158" className="x-axis-label">Aug</text>
                  <text x="184" y="158" className="x-axis-label">Sep</text>
                  <text x="232" y="158" className="x-axis-label">Oct</text>
                  <text x="280" y="158" className="x-axis-label">Nov</text>
                </svg>
              </div>

              <div className="trend-stats-rows">
                <div className="stat-subrow">
                  <div className="stat-sublabel-group">
                    <span className="stat-sublabel">QUARTERLY AVG</span>
                    <span className="stat-subval">82.1</span>
                  </div>
                  <span className="stat-badge-small positive">+14%</span>
                </div>

                <div className="stat-subrow">
                  <div className="stat-sublabel-group">
                    <span className="stat-sublabel">INDUSTRY BENCHMARK</span>
                    <span className="stat-subval">74.5</span>
                  </div>
                  <span className="stat-badge-small ahead">Ahead</span>
                </div>
              </div>
            </div>

            {/* Hiring Insights Card */}
            <div className="hiring-insights-card">
              <div className="insights-header">
                <h4>Hiring Insights</h4>
              </div>
              <p className="insights-body">
                Your candidate evaluation scores have increased by <strong>5.2%</strong> compared to last month. Consider reviewing candidates with scores above <strong>85</strong> for expedited final rounds.
              </p>
              <button type="button" className="generate-report-btn">
                Generate Full Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="history-footer">
        <span className="footer-copyright">
          <strong>IntelliHire</strong> &copy; 2023 TalentGold Intelligence Platform. All rights reserved.
        </span>
        <div className="footer-links">
          <button type="button" className="footer-link">Privacy Policy</button>
          <button type="button" className="footer-link">Terms of Service</button>
          <button type="button" className="footer-link">Support</button>
        </div>
      </footer>
    </div>
  );
}
