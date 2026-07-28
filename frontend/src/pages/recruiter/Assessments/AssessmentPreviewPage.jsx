import React, { useState } from 'react';
import {
  BarChart3, CalendarDays, CheckCircle2, ChevronDown, ChevronUp, Clock3,
  Copy, Edit3, FileQuestion, PlayCircle, Share2, Users,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import AssessmentShell from './AssessmentShell';
import './AssessmentFlow.css';

const PREVIEW_QUESTIONS = [
  { title: 'JavaScript event loop and asynchronous execution', type: 'Multiple Choice', points: 10, detail: 'Explain how microtasks and macrotasks are ordered in the JavaScript event loop.' },
  { title: 'Build a reusable React data-fetching hook', type: 'Coding', points: 25, detail: 'Create a reusable hook with loading, error, caching, and cancellation support.' },
  { title: 'Frontend system design and scalability', type: 'Long Answer', points: 20, detail: 'Describe how you would structure and scale a large frontend application.' },
  { title: 'Testing strategy and quality assurance', type: 'Multiple Choice', points: 10, detail: 'Choose the most appropriate testing strategy for the presented scenario.' },
];

function AssessmentPreviewPage() {
  const navigate = useNavigate();
  const { assessmentId } = useParams();
  const [openQuestion, setOpenQuestion] = useState(0);
  const [copied, setCopied] = useState(false);

  return (
    <AssessmentShell currentPage="Assessment Preview">
      <main className="af-page">
        <div className="ap-header">
          <div>
            <span className="af-eyebrow">Assessment ID: {assessmentId}</span>
            <div className="ap-title-row"><h1>Senior Fullstack Engineering Challenge</h1><span>Active</span></div>
            <p>Technical evaluation for senior software engineering candidates.</p>
          </div>
          <div className="af-title-actions">
            <button className="af-secondary" onClick={() => { navigator.clipboard?.writeText(window.location.href); setCopied(true); }}><Share2 size={16} /> {copied ? 'Link Copied' : 'Share'}</button>
            <button className="af-secondary" onClick={() => navigate(`/recruiter/assessments/${assessmentId}/edit`)}><Edit3 size={16} /> Edit Assessment</button>
            <button className="af-primary" onClick={() => navigate(`/recruiter/assessments/${assessmentId}/candidates`)}><Users size={16} /> View Candidates</button>
          </div>
        </div>

        <section className="ap-summary">
          <article><Clock3 /><div><small>Duration</small><strong>90 minutes</strong></div></article>
          <article><FileQuestion /><div><small>Questions</small><strong>4 questions</strong></div></article>
          <article><BarChart3 /><div><small>Total Points</small><strong>65 points</strong></div></article>
          <article><Users /><div><small>Candidates</small><strong>42 assigned</strong></div></article>
        </section>

        <div className="ap-layout">
          <section className="ap-main">
            <div className="ap-section-title"><div><h2>Assessment Questions</h2><p>Preview the questions candidates will receive.</p></div><button className="af-secondary" onClick={() => navigate('/recruiter/question-bank')}><FileQuestion size={16} /> Open Question Bank</button></div>
            <div className="ap-question-list">
              {PREVIEW_QUESTIONS.map((question, index) => (
                <article key={question.title}>
                  <header onClick={() => setOpenQuestion(openQuestion === index ? null : index)}>
                    <span>{index + 1}</span><div><strong>{question.title}</strong><small>{question.type}</small></div><b>{question.points} pts</b>{openQuestion === index ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </header>
                  {openQuestion === index && <div className="ap-question-detail"><p>{question.detail}</p><div><span>Difficulty: Senior</span><span>Required</span></div></div>}
                </article>
              ))}
            </div>
          </section>

          <aside className="ap-side">
            <section><h2>Assessment Settings</h2><dl><div><dt>Target role</dt><dd>Senior Software Engineer</dd></div><div><dt>Difficulty</dt><dd>Senior</dd></div><div><dt>Pass score</dt><dd>70%</dd></div><div><dt>Question order</dt><dd>Randomized</dd></div><div><dt>Attempts allowed</dt><dd>1 attempt</dd></div></dl></section>
            <section><h2>Schedule</h2><p><CalendarDays size={17} /> Created July 18, 2026</p><p><CheckCircle2 size={17} /> Accepting candidates</p></section>
            <section className="ap-link"><h2>Candidate Link</h2><p>Share this link to invite candidates.</p><button onClick={() => { navigator.clipboard?.writeText('https://intellihire.test/a/sfe-2026'); setCopied(true); }}><span>intellihire.test/a/sfe-2026</span><Copy size={16} /></button></section>
          </aside>
        </div>
      </main>
    </AssessmentShell>
  );
}
export default AssessmentPreviewPage;
