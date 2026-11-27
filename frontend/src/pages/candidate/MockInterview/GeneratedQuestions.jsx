import React, { useState, useContext, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Clock, RotateCcw, Play, HelpCircle, Sparkles, Brain, ChevronDown, ChevronUp, Target, Lightbulb, Briefcase, Award } from 'lucide-react';
import { CandidatePageContext } from '../CandidateDashboard/CandidateDashboard';
import { analyzeMockInterviewJobDescription } from '../../../api/mockInterviewApi';
import './GeneratedQuestions.css';

const DEFAULT_QUESTIONS = [
  {
    id: 1,
    number: 1,
    title: 'Question 1',
    topic: 'System Architecture & Scalability',
    difficulty: 'Medium',
    duration: '5 min',
    description: 'Design a scalable rate limiter for a high-traffic microservices API. Explain the differences between Token Bucket and Leaky Bucket algorithms.',
  },
  {
    id: 2,
    number: 2,
    title: 'Question 2',
    topic: 'Data Structures & Algorithms',
    difficulty: 'Hard',
    duration: '8 min',
    description: 'Implement an LRU Cache supporting O(1) time complexity for get and put operations using a Doubly Linked List and Hash Map.',
  },
  {
    id: 3,
    number: 3,
    title: 'Question 3',
    topic: 'API Design & Integration',
    difficulty: 'Easy',
    duration: '3 min',
    description: 'Explain RESTful API idempotency, HTTP status codes selection (200 vs 201 vs 204), and semantic payload versioning strategies.',
  },
  {
    id: 4,
    number: 4,
    title: 'Question 4',
    topic: 'Database Optimization & Indexing',
    difficulty: 'Medium',
    duration: '5 min',
    description: 'Analyze an expensive SQL query with multiple table joins. Detail B-Tree indexing strategies and query execution plan optimization.',
  },
  {
    id: 5,
    number: 5,
    title: 'Question 5',
    topic: 'Asynchronous Event-Driven Systems',
    difficulty: 'Hard',
    duration: '10 min',
    description: 'Architect an event-driven messaging flow using Kafka/RabbitMQ to process spike order volume while maintaining strict idempotency.',
  },
];

export default function GeneratedQuestions() {
  const location = useLocation();
  const navigate = useNavigate();
  const pageCtx = useContext(CandidatePageContext);

  useEffect(() => {
    if (pageCtx?.setPageLabel) {
      pageCtx.setPageLabel('MOCK INTERVIEWS');
    }
  }, [pageCtx]);

  const roleId = location.state?.roleId || null;
  const roleName = location.state?.roleTitle || 'Selected Role';
  const roleCategory = location.state?.category || null;
  const roleSkills = location.state?.skills || [];
  const jobDescription =
    location.state?.jobDescription ||
    (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('mock_interview_job_description') : '') ||
    '';

  const getInitialAnalysis = () => {
    if (location.state?.jdAnalysis && typeof location.state.jdAnalysis === 'object') {
      return location.state.jdAnalysis;
    }
    try {
      const cached = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('mock_interview_jd_analysis') : null;
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  };

  const [jdAnalysis, setJdAnalysis] = useState(getInitialAnalysis);
  const [isAnalyzingJd, setIsAnalyzingJd] = useState(false);
  const [showAnalysisDetails, setShowAnalysisDetails] = useState(false);
  const hasAutoAnalyzedRef = useRef(false);
  const [questions, setQuestions] = useState(() => {
    const initial = getInitialAnalysis();
    if (initial && Array.isArray(initial.recommendedQuestions) && initial.recommendedQuestions.length > 0) {
      return initial.recommendedQuestions;
    }
    return DEFAULT_QUESTIONS;
  });
  const [generatingId, setGeneratingId] = useState(null);
  const [interviewMode, setInterviewMode] = useState('text');

  useEffect(() => {
    let isMounted = true;
    const cleanJd = (jobDescription || '').trim();
    if (!jdAnalysis && !hasAutoAnalyzedRef.current && cleanJd.length >= 5) {
      hasAutoAnalyzedRef.current = true;
      setIsAnalyzingJd(true);
      analyzeMockInterviewJobDescription({
        jobDescription: cleanJd,
        roleId,
        roleTitle: roleName !== 'Selected Role' ? roleName : undefined,
        category: roleCategory || undefined,
        skills: Array.isArray(roleSkills) ? roleSkills : undefined,
      })
        .then((res) => {
          if (!isMounted) return;
          const analysis = res?.analysis || null;
          if (analysis) {
            setJdAnalysis(analysis);
            if (Array.isArray(analysis.recommendedQuestions) && analysis.recommendedQuestions.length > 0) {
              setQuestions(analysis.recommendedQuestions);
            }
            try {
              sessionStorage.setItem('mock_interview_jd_analysis', JSON.stringify(analysis));
            } catch {}
          }
        })
        .catch((err) => {
          console.warn('Could not fetch AI JD analysis on questions page:', err.message);
        })
        .finally(() => {
          if (isMounted) setIsAnalyzingJd(false);
        });
    }
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobDescription, roleId, roleName, roleCategory]);

  const handleRegenerateQuestion = async (qId) => {
    setGeneratingId(qId);
    const cleanJd = (jobDescription || '').trim();
    if (cleanJd.length >= 5) {
      try {
        const res = await analyzeMockInterviewJobDescription({
          jobDescription: cleanJd,
          roleId,
          roleTitle: roleName !== 'Selected Role' ? roleName : undefined,
          category: roleCategory || undefined,
          skills: Array.isArray(roleSkills) ? roleSkills : undefined,
        });
        const refreshed = res?.analysis?.recommendedQuestions;
        const replacement = Array.isArray(refreshed)
          ? refreshed.find((item) => item.id === qId) || refreshed[0]
          : null;
        if (replacement && replacement.description) {
          setQuestions((prev) =>
            prev.map((q) => (q.id === qId ? { ...q, ...replacement, id: q.id, number: q.number } : q))
          );
          setGeneratingId(null);
          return;
        }
      } catch (err) {
        console.warn('Could not regenerate question via AI, using local variant:', err.message);
      }
    }

    setTimeout(() => {
      setQuestions((prev) =>
        prev.map((q) => {
          if (q.id === qId) {
            return {
              ...q,
              description: `[Updated Variant] ${q.description}`,
            };
          }
          return q;
        })
      );
      setGeneratingId(null);
    }, 600);
  };

  const handleBackToRoles = () => {
    navigate('/candidate/mock-interviews/roleselection');
  };

  const handleStartInterview = (question, mode = 'text') => {
    navigate('/candidate/mock-interviews/session', {
      state: {
        roleTitle:
          roleName !== 'Selected Role'
            ? `${roleName} Interview`
            : jdAnalysis?.detectedRole
              ? `${jdAnalysis.detectedRole} Interview`
              : 'Technical Strategy Lead Interview',
        selectedQuestion: question,
        questionsList: questions.map((q) => ({
          id: q.id,
          category: q.topic || 'Scenario Based',
          question: q.description,
          hint:
            q.hint ||
            `Focus on technical depth, trade-off analysis, and clear communication strategy for ${q.topic}.`,
        })),
        startIndex: question ? questions.findIndex((q) => q.id === question.id) : 0,
        interviewMode: mode,
        jobDescription,
        jdAnalysis,
      },
    });
  };

  return (
    <div className="generated-questions-container">
      <div className="generated-questions-content">
        <div className="ai-success-badge">
          <Sparkles size={13} className="badge-icon" />
          <span>AI GENERATION SUCCESS</span>
        </div>
        
        <h1 className="page-heading">Generated Interview Questions</h1>
        <p className="page-subheading">
          {roleName !== 'Selected Role'
            ? `We've integrated your selected role (${roleName}) with the AI job description analysis to generate targeted, high-impact mock questions.`
            : "We've analyzed the job description and your profile to create these high-impact mock questions. Ready to practice?"}
        </p>

        {/* AI Job Description Analysis Summary */}
        {(isAnalyzingJd || jdAnalysis) && (
          <div className="gq-jd-analysis-card">
            <div className="gq-jd-analysis-top">
              <div className="gq-jd-analysis-title-wrap">
                <div className="gq-jd-icon-box">
                  <Brain size={18} />
                </div>
                <div>
                  <div className="gq-jd-title-row">
                    <h3>AI Job Description Analysis</h3>
                    {jdAnalysis && (
                      <span className={`gq-jd-source-pill ${jdAnalysis.analysisSource === 'gemini' ? 'gemini' : 'fallback'}`}>
                        {jdAnalysis.analysisSource === 'gemini' ? 'Gemini AI' : 'Smart Analysis'}
                      </span>
                    )}
                  </div>
                  {isAnalyzingJd ? (
                    <p className="gq-jd-meta">Analyzing job description and tailoring interview questions...</p>
                  ) : (
                    <p className="gq-jd-meta">
                      Target Role: <strong>{jdAnalysis.detectedRole}</strong> &bull; Level:{' '}
                      <span className="gq-jd-seniority">{jdAnalysis.seniorityLevel}</span>
                      {jdAnalysis.yearsOfExperience && (
                        <>
                          {' '}&bull; Experience:{' '}
                          <span className="gq-jd-seniority">{jdAnalysis.yearsOfExperience}</span>
                        </>
                      )}
                    </p>
                  )}
                </div>
              </div>

              {jdAnalysis && (
                <button
                  type="button"
                  className="gq-jd-toggle-btn"
                  onClick={() => setShowAnalysisDetails((prev) => !prev)}
                >
                  {showAnalysisDetails ? (
                    <>
                      <span>Hide Insights</span>
                      <ChevronUp size={15} />
                    </>
                  ) : (
                    <>
                      <span>View Insights</span>
                      <ChevronDown size={15} />
                    </>
                  )}
                </button>
              )}
            </div>

            {jdAnalysis && (
              <>
                <div className="gq-jd-tags-row">
                  {(jdAnalysis.technicalSkills || []).slice(0, 7).map((skill) => (
                    <span key={skill} className="gq-jd-skill-pill">
                      {skill}
                    </span>
                  ))}
                  {(jdAnalysis.focusAreas || []).slice(0, 3).map((area, idx) => (
                    <span key={`${area.topic}-${idx}`} className="gq-jd-focus-pill">
                      <Target size={11} />
                      {area.topic}
                    </span>
                  ))}
                </div>

                {showAnalysisDetails && (
                  <div className="gq-jd-details">
                    {jdAnalysis.summary && <p className="gq-jd-summary">{jdAnalysis.summary}</p>}
                    <div className="gq-jd-details-grid">
                      {Array.isArray(jdAnalysis.responsibilities) && jdAnalysis.responsibilities.length > 0 && (
                        <div className="gq-jd-tips">
                          <div className="gq-jd-tips-title">
                            <Briefcase size={14} />
                            <span>Key Responsibilities</span>
                          </div>
                          <ul>
                            {jdAnalysis.responsibilities.map((resp, idx) => (
                              <li key={idx}>{resp}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {Array.isArray(jdAnalysis.experienceRequirements) && jdAnalysis.experienceRequirements.length > 0 && (
                        <div className="gq-jd-tips">
                          <div className="gq-jd-tips-title">
                            <Award size={14} />
                            <span>Experience Requirements</span>
                          </div>
                          <ul>
                            {jdAnalysis.experienceRequirements.map((exp, idx) => (
                              <li key={idx}>{exp}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    {Array.isArray(jdAnalysis.preparationTips) && jdAnalysis.preparationTips.length > 0 && (
                      <div className="gq-jd-tips">
                        <div className="gq-jd-tips-title">
                          <Lightbulb size={14} />
                          <span>Preparation Tips</span>
                        </div>
                        <ul>
                          {jdAnalysis.preparationTips.map((tip, idx) => (
                            <li key={idx}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <div className="interview-mode-toggle">
          <button 
            type="button"
            className={`mode-btn ${interviewMode === 'text' ? 'active' : ''}`}
            onClick={() => setInterviewMode('text')}
          >
            Generated Questions
          </button>
          <button 
            type="button"
            className={`mode-btn ${interviewMode === 'voice' ? 'active' : ''}`}
            onClick={() => setInterviewMode('voice')}
          >
            Voice Bot Interview
          </button>
        </div>

        {interviewMode === 'text' ? (
        <div className="questions-list">
          {questions.map((q) => {
            const isRegenerating = generatingId === q.id;
            const diffClass = q.difficulty.toLowerCase();
            
            return (
              <div key={q.id} className="question-card">
                <div className="question-card-header">
                  <div className="left-info">
                    <div className="question-number-circle">{q.number}</div>
                    <div className="question-title-group">
                      <div className="title-row">
                        <h3 className="question-title">{q.title}</h3>
                        {q.topic && (
                          <span className="topic-badge">{q.topic}</span>
                        )}
                        <span className={`difficulty-badge ${diffClass}`}>
                          {q.difficulty}
                        </span>
                        <span className="duration-badge">
                          <Clock size={13} />
                          {q.duration}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="card-actions">
                    <button
                      type="button"
                      className="card-action-btn back-btn"
                      onClick={handleBackToRoles}
                    >
                      &lt; Back
                    </button>
                    <button
                      type="button"
                      className={`card-action-btn generate-btn ${isRegenerating ? 'spinning' : ''}`}
                      onClick={() => handleRegenerateQuestion(q.id)}
                      disabled={isRegenerating}
                    >
                      <RotateCcw size={14} />
                      {isRegenerating ? 'Generating...' : 'Generate Again'}
                    </button>
                    <button
                      type="button"
                      className="card-action-btn start-btn"
                      onClick={() => handleStartInterview(q)}
                    >
                      <Play size={13} fill="currentColor" />
                      Start Interview
                    </button>
                  </div>
                </div>

                <div className="question-card-body">
                  <p className="question-description">{q.description}</p>
                </div>
              </div>
            );
          })}
        </div>
        ) : (
        <div className="voice-bot-container">
          <div className="voice-bot-card">
            <h2>Interactive Voice Bot</h2>
            <p>Practice with our AI Voice Bot using speech-to-text. It will dynamically ask questions and evaluate your spoken answers in real time.</p>
            <button 
              type="button"
              className="start-voice-btn" 
              onClick={() => handleStartInterview(null, 'voice')}
            >
              Start Voice Interview
            </button>
          </div>
        </div>
        )}

        <div className="bottom-banner-card">
          <div className="banner-left">
            <div className="help-icon-wrapper">
              <HelpCircle size={22} />
            </div>
            <div className="banner-text">
              <h4>Need a Different Set?</h4>
              <p>Adjust your parameters to focus on specific technical skills or behavioral traits.</p>
            </div>
          </div>
          <button type="button" className="change-params-btn" onClick={handleBackToRoles}>
            Change Parameters
          </button>
        </div>
      </div>
    </div>
  );
}
