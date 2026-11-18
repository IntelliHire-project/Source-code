import React, { useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Clock, RotateCcw, Play, ArrowLeft, HelpCircle, Sparkles } from 'lucide-react';
import { CandidatePageContext } from '../CandidateDashboard/CandidateDashboard';
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

  const roleName = location.state?.roleTitle || 'Selected Role';
  const jobDescription =
    location.state?.jobDescription ||
    (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('mock_interview_job_description') : '') ||
    '';
  
  const [questions, setQuestions] = useState(DEFAULT_QUESTIONS);
  const [generatingId, setGeneratingId] = useState(null);
  const [interviewMode, setInterviewMode] = useState('text');

  const handleRegenerateQuestion = (qId) => {
    setGeneratingId(qId);
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
        roleTitle: roleName !== 'Selected Role' ? `${roleName} Interview` : 'Technical Strategy Lead Interview',
        selectedQuestion: question,
        questionsList: questions.map((q) => ({
          id: q.id,
          category: q.topic || 'Scenario Based',
          question: q.description,
          hint: `Focus on technical depth, trade-off analysis, and clear communication strategy for ${q.topic}.`
        })),
        startIndex: question ? questions.findIndex((q) => q.id === question.id) : 0,
        interviewMode: mode,
        jobDescription,
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
          We've analyzed the job description and your profile to create these high-impact mock questions. Ready to practice?
        </p>

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
