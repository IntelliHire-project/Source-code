import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileCheck,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Award,
  Search,
  Filter,
  Loader2
} from 'lucide-react';
import { fetchAssessments } from '../../../api/assessmentApi';
import './TakeAssessmentPage.css';

const ASSIGNMENTS_MOCK = [
  {
    id: 'A-001',
    title: 'Senior Frontend Engineer Assessment',
    jobRole: 'Senior Software Engineer — React',
    company: 'TechFlow Systems',
    dueDate: 'Nov 1, 2026',
    duration: '45 mins',
    questionsCount: 4,
    passingScore: '70%',
    status: 'Pending',
    mode: 'Required',
    description: 'Technical skills evaluation on React architecture, state management, and JavaScript coding.'
  },
  {
    id: 'shortlist-2048',
    title: 'Full Stack Engineering Evaluation',
    jobRole: 'Lead Full Stack Engineer',
    company: 'IntelliHire Tech',
    dueDate: 'Oct 30, 2026',
    duration: '60 mins',
    questionsCount: 3,
    passingScore: '75%',
    status: 'In Progress',
    mode: 'Required',
    description: 'REST API design, database indexing strategies, and two-pointer coding problem.'
  },
  {
    id: 'A-003',
    title: 'System Design & Architecture Quiz',
    jobRole: 'Backend Tech Lead',
    company: 'Financier AI',
    dueDate: 'Oct 15, 2026',
    duration: '30 mins',
    questionsCount: 5,
    passingScore: '80%',
    status: 'Completed',
    mode: 'Optional',
    scoreAchieved: '88%',
    description: 'Scalability, microservices communication, and caching strategies evaluation.'
  }
];

export default function CandidateAssessmentsListPage() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadCandidateAssessments = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch published assessments from backend API
        const response = await fetchAssessments({ status: 'Published' });
        const rawList = response?.data?.assessments || response?.assessments || [];

        if (rawList && rawList.length > 0) {
          const formatted = rawList.map((item) => ({
            id: item.assessmentCode || item.id,
            title: item.title || item.name || 'Technical Assessment',
            jobRole: item.jobRole || item.role || item.vacancy || 'Software Engineering',
            company: item.company || 'IntelliHire Partner',
            dueDate: item.createdAt
              ? new Date(new Date(item.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'Flexible',
            duration: `${item.duration || 60} mins`,
            questionsCount: item.questionsCount || (Array.isArray(item.questions) ? item.questions.length : 0),
            passingScore: `${item.passingScore || item.passing || 70}%`,
            status: item.candidateStatus || 'Pending',
            mode: 'Required',
            description:
              item.description ||
              'Complete this technical assessment to demonstrate your domain skills for this job application.',
          }));

          if (isMounted) setAssignments(formatted);
        } else {
          // Graceful fallback if database has no published assessments yet
          if (isMounted) setAssignments(ASSIGNMENTS_MOCK);
        }
      } catch (err) {
        console.error('Failed to load candidate assessments:', err);
        if (isMounted) {
          // Fallback to sample data so UI stays functional
          setAssignments(ASSIGNMENTS_MOCK);
          setError('Could not connect to assessment service. Showing preview data.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadCandidateAssessments();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredAssignments = assignments.filter((item) => {
    const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      (item.title || '').toLowerCase().includes(query) ||
      (item.jobRole || '').toLowerCase().includes(query) ||
      (item.company || '').toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="cap-wrapper" style={{ padding: '32px 40px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        {/* Header Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FileCheck style={{ color: '#818cf8' }} size={32} /> My Assigned Assessments
            </h1>
            <p style={{ color: '#9ca3af', fontSize: '14px', marginTop: '6px' }}>
              View and take assessments assigned to your job applications.
            </p>
          </div>

          <button className="cap-btn-sec" onClick={() => navigate('/candidate/dashboard')}>
            Dashboard Home
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
            <input
              type="text"
              placeholder="Search by assessment name, position, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px 12px 44px',
                background: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {['All', 'Pending', 'In Progress', 'Completed'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: filterStatus === status ? '1px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.1)',
                  background: filterStatus === status ? 'rgba(99, 102, 241, 0.25)' : 'rgba(30, 41, 59, 0.4)',
                  color: filterStatus === status ? '#a5b4fc' : '#9ca3af',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
            <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 16px', color: '#818cf8', animation: 'spin 1s linear infinite' }} />
            <p style={{ fontSize: '15px', color: '#d1d5db' }}>Loading your assigned assessments...</p>
          </div>
        )}

        {/* Error / Notice Alert */}
        {!loading && error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '10px',
            padding: '12px 16px',
            marginBottom: '20px',
            color: '#f87171',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13px'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredAssignments.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
            <FileCheck size={44} style={{ margin: '0 auto 16px', color: '#6b7280' }} />
            <h3 style={{ color: '#fff', fontSize: '18px', marginBottom: '8px' }}>No assessments found</h3>
            <p style={{ fontSize: '14px' }}>There are no assessments matching your current filter.</p>
          </div>
        )}

        {/* Assessments Grid */}
        {!loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
            {filteredAssignments.map(item => (
              <div
                key={item.id}
                className="cap-question-card"
                style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <span className="cap-badge category">{item.company}</span>
                    <span
                      className="cap-badge"
                      style={{
                        background: item.status === 'Completed' ? 'rgba(16, 185, 129, 0.15)' : item.status === 'In Progress' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                        color: item.status === 'Completed' ? '#34d399' : item.status === 'In Progress' ? '#fcd34d' : '#818cf8',
                        border: '1px solid currentColor'
                      }}
                    >
                      {item.status}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '18px', fontWeight: 650, color: '#fff', marginBottom: '6px' }}>
                    {item.title}
                  </h3>
                  <p style={{ color: '#818cf8', fontSize: '13px', fontWeight: 500, marginBottom: '14px' }}>
                    {item.jobRole}
                  </p>
                  <p style={{ color: '#9ca3af', fontSize: '13px', lineHeight: 1.5, marginBottom: '20px' }}>
                    {item.description}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px', color: '#d1d5db', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={15} style={{ color: '#818cf8' }} /> {item.duration}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={15} style={{ color: '#818cf8' }} /> Due: {item.dueDate}
                    </div>
                  </div>
                </div>

                <div>
                  {item.status === 'Completed' ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(16, 185, 129, 0.1)', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                      <span style={{ fontSize: '13px', color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle2 size={16} /> Completed
                      </span>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>
                        Score: {item.scoreAchieved}
                      </span>
                    </div>
                  ) : (
                    <button
                      className="cap-btn-prim"
                      style={{ width: '100%', justifyContent: 'center' }}
                      onClick={() => navigate(`/a/${item.id}`)}
                    >
                      {item.status === 'In Progress' ? 'Continue Assessment' : 'Start Assessment'} <ChevronRight size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
