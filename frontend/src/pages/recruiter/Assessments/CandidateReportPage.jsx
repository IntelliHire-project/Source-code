import React, { useState } from 'react';
import {
  Award, BarChart3, CheckCircle2, ChevronDown, ChevronUp, Clock3,
  Download, FileCode, FileText, MessageSquare, Printer, Share2, Sparkles, Target, Zap, Check, Copy
} from 'lucide-react';
import AssessmentShell from './AssessmentShell';
import './AssessmentFlow.css';

const REPORTS = [
  {
    title: 'Algorithmic Efficiency & Code Quality',
    score: 94,
    level: 'Expert',
    feedback: 'Exceptional performance in time complexity optimization ($O(N)$ vs $O(N^2)$). Code structure is clean, uses proper variable scoping, and handles edge cases gracefully.',
    strengths: ['Big O Awareness', 'Edge Case Handling', 'Memory Optimization']
  },
  {
    title: 'System Architecture & Data Modeling',
    score: 62,
    level: 'Intermediate',
    feedback: 'Solid understanding of basic REST microservices and indexing, but struggled with distributed caching invalidation patterns. Recommend diving deeper into Redis pub/sub.',
    strengths: ['Database Normalization', 'API Contract Definition'],
    growth: ['Message Queues', 'Distributed Cache Invalidation']
  },
  {
    title: 'React Hooks & State Management',
    score: 95,
    level: 'Expert',
    feedback: 'Excellent mastery of custom hooks, component lifecycle isolation, and memoization techniques.',
    strengths: ['Custom React Hooks', 'Reconciliation', 'Web Vitals Optimization']
  },
];

const AUDIT_QUESTIONS = [
  {
    id: 'Q1',
    title: 'React Virtual DOM & Reconciliation',
    category: 'Frontend Core',
    type: 'Multiple Choice (MCQ)',
    points: 15,
    maxPoints: 15,
    status: 'Passed',
    prompt: 'Which of the following best describes React\'s Reconciliation algorithm when comparing Virtual DOM trees?',
    candidateAnswer: 'Option B: It uses a heuristic O(n) algorithm by comparing element types and key attributes.',
    correctAnswer: 'Option B: It uses a heuristic O(n) algorithm by comparing element types and key attributes.',
    isCorrect: true
  },
  {
    id: 'Q2',
    title: 'Web Performance & Lazy Loading Architecture',
    category: 'Performance & Architecture',
    type: 'Written Technical Answer',
    points: 25,
    maxPoints: 25,
    status: 'Passed',
    prompt: 'Explain how code-splitting, lazy loading, and React.memo improve web application performance under heavy traffic loads.',
    candidateAnswer: 'Code-splitting breaks large JS bundles into smaller chunks loaded on-demand via dynamic imports. Combined with React.lazy and Suspense, it drastically reduces Initial Page Load Time (FCP & LCP). React.memo prevents unnecessary re-renders by shallowly comparing props.',
    benchmarkNotes: 'Key points to look for: FCP/LCP metrics awareness, dynamic import() syntax, memo shallow prop comparison caveats.',
    isCorrect: true
  },
  {
    id: 'Q3',
    title: 'Algorithm: Custom Debounce Utility',
    category: 'Algorithms & Coding',
    type: 'Interactive Coding Challenge',
    points: 40,
    maxPoints: 40,
    status: 'Passed',
    language: 'JavaScript (Node.js)',
    prompt: 'Implement a custom debounce function that delays invoking the target function until after wait milliseconds have elapsed.',
    submittedCode: `function debounce(func, wait) {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}`,
    benchmarkCode: `// Optimal Reference Implementation
function debounce(func, wait, immediate = false) {
  let timeout;
  return function(...args) {
    const context = this;
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      timeout = null;
      if (!immediate) func.apply(context, args);
    }, wait);
    if (callNow) func.apply(context, args);
  };
}`,
    testResults: [
      { name: 'Public Test 1: Rapid burst triggers', result: 'PASSED', detail: 'Execution delayed by 300ms as expected.' },
      { name: 'Public Test 2: Spaced sequential calls', result: 'PASSED', detail: 'Both calls executed at correct timestamps.' },
      { name: 'Hidden Test 1: Edge Case (0ms delay)', result: 'PASSED', detail: 'Asynchronous event loop queue verified.' },
      { name: 'Hidden Test 2: Context binding (this & args)', result: 'PASSED', detail: 'Correct scope preserved.' }
    ],
    interviewPrompts: [
      'Ask candidate how they would clean up pending timeouts when a component unmounts in React useEffect.',
      'Ask candidate to explain the difference between throttling and debouncing in user input fields.'
    ],
    isCorrect: true
  }
];

function CandidateReportPage() {
  const [open, setOpen] = useState([0, 1, 2]);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('full');

  const toggle = (i) => setOpen(open.includes(i) ? open.filter((item) => item !== i) : [...open, i]);

  const handleExportPDF = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AssessmentShell currentPage="Marcus Chen Report">
      <main className="af-page report-page print-container">
        {/* Header Profile & Action Buttons */}
        <header className="report-profile">
          <div className="report-avatar">
            MC<span><CheckCircle2 size={15} /></span>
          </div>
          <div>
            <h1>Marcus Chen</h1>
            <p><b>Senior Frontend Engineer</b> · Applied: Jul 24, 2026 · Candidate ID: #C-9042</p>
          </div>
          <div className="report-buttons no-print">
            <button className="af-secondary" onClick={handleExportPDF} title="Download Report as PDF or Print">
              <Printer size={16} /> Export PDF / Print
            </button>
            <button className="af-secondary" onClick={handleCopyLink}>
              {copied ? <Check size={16} color="#4ade80" /> : <Share2 size={16} />}
              {copied ? 'Link Copied' : 'Share Dossier'}
            </button>
            <button className="af-primary">Move to Technical Interview</button>
          </div>
        </header>

        {/* Printable Header Banner (Only visible on PDF print) */}
        <div className="print-only-header" style={{ display: 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', marginBottom: '20px', borderBottom: '2px solid #333' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '22px' }}>IntelliHire — Candidate Assessment Dossier</h2>
              <span style={{ fontSize: '13px', color: '#666' }}>Confidential Technical Interviewer Report</span>
            </div>
            <div style={{ textAlign: 'right', fontSize: '12px', color: '#666' }}>
              <div>Generated: Oct 8, 2026</div>
              <div>Position: Senior Frontend Engineer</div>
            </div>
          </div>
        </div>

        {/* Top KPIs */}
        <section className="report-kpis">
          {[
            ['Overall Proficiency', '84/100', 'Top 5% of candidates (Passed)', Award],
            ['Technical Logic', '92%', '+12% above benchmark average', BarChart3],
            ['Time Management', '42m 15s', 'Used 70% of 60m duration', Clock3],
            ['Evaluation Status', 'Verified', 'Ready for technical interview round', Zap],
          ].map(([label, value, sub, Icon]) => (
            <article key={label}>
              <div>
                <small>{label}</small>
                <strong>{value}</strong>
                <span>{sub}</span>
              </div>
              <Icon size={19} />
            </article>
          ))}
        </section>

        {/* Charts & Radar Matrix */}
        <section className="report-charts">
          <article>
            <h2>Skill Profile Matrix</h2>
            <p>Candidate performance relative to role domain requirements</p>
            <div className="radar-wrap">
              <svg viewBox="0 0 260 220" aria-label="Skill profile chart">
                <g transform="translate(130 110)">
                  <polygon points="0,-90 78,-45 78,45 0,90 -78,45 -78,-45" />
                  <polygon points="0,-68 60,-35 53,31 0,73 -72,42 -55,-32" className="radar-value" />
                  <line x1="0" y1="-90" x2="0" y2="90" />
                  <line x1="-78" y1="-45" x2="78" y2="45" />
                  <line x1="78" y1="-45" x2="-78" y2="45" />
                </g>
              </svg>
              <span className="r1">Problem Solving</span>
              <span className="r2">Coding Logic</span>
              <span className="r3">System Design</span>
              <span className="r4">Communication</span>
              <span className="r5">React Hooks</span>
            </div>
          </article>
          <article>
            <h2>Domain Benchmark Analysis</h2>
            <p>Candidate score vs. company benchmark average (%)</p>
            <div className="bar-chart">
              {[
                ['Algorithm & Code', 94, 72],
                ['Frontend & React', 95, 68],
                ['Architecture', 62, 58],
                ['Soft Skills & Communication', 81, 75]
              ].map(([name, candidate, average]) => (
                <div key={name}>
                  <div className="bars">
                    <i style={{ height: `${candidate}%` }} title={`Candidate: ${candidate}%`} />
                    <i style={{ height: `${average}%` }} title={`Benchmark Avg: ${average}%`} />
                  </div>
                  <span>{name}</span>
                </div>
              ))}
            </div>
          </article>
        </section>

        {/* Main Section Layout */}
        <div className="report-detail-layout">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Section 1: Detailed Evaluation Breakdown */}
            <section className="report-evaluation">
              <h2><FileText size={20} /> Domain Proficiency Breakdown</h2>
              {REPORTS.map((item, i) => (
                <article key={item.title}>
                  <header onClick={() => toggle(i)}>
                    <b>{item.score}%</b>
                    <div>
                      <strong>{item.title}</strong>
                      <span>Categorized Technical Assessment</span>
                    </div>
                    <em>{item.level}</em>
                    {open.includes(i) ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
                  </header>
                  {open.includes(i) && (
                    <div className="report-feedback">
                      <small>Expert Evaluation Note</small>
                      <p>{item.feedback}</p>
                      <div>
                        <div>
                          <small>Key Strengths</small>
                          {item.strengths.map((tag) => <span key={tag}>{tag}</span>)}
                        </div>
                        {item.growth && (
                          <div className="growth">
                            <small>Areas for Growth</small>
                            {item.growth.map((tag) => <span key={tag}>{tag}</span>)}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </section>

            {/* Section 2: Itemized Question-by-Question Audit for Interviewers */}
            <section style={{ background: '#292a2f', border: '1px solid #3c3d44', borderRadius: '8px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileCode size={20} style={{ color: '#ffd400' }} /> Itemized Question & Code Submission Audit
                  </h2>
                  <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#a8a9b1' }}>
                    Full questions, candidate responses, syntax code snippets, and automated test execution logs for technical interviewers.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {AUDIT_QUESTIONS.map((q, idx) => (
                  <div key={q.id} style={{ background: '#1e1f24', border: '1px solid #3d3e46', borderRadius: '8px', padding: '18px' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ background: '#ffd400', color: '#16120a', fontWeight: '800', fontSize: '12px', padding: '3px 9px', borderRadius: '4px' }}>
                          {q.id}
                        </span>
                        <h3 style={{ margin: 0, fontSize: '15px', color: '#fff' }}>{q.title}</h3>
                        <span style={{ fontSize: '12px', background: 'rgba(99,102,241,0.2)', color: '#818cf8', padding: '2px 8px', borderRadius: '10px' }}>
                          {q.category}
                        </span>
                      </div>
                      <span style={{ color: '#4ade80', fontWeight: '700', fontSize: '13px' }}>
                        {q.points} / {q.maxPoints} pts ({q.status})
                      </span>
                    </div>

                    {/* Question Prompt */}
                    <p style={{ color: '#cbd5e1', fontSize: '14px', margin: '0 0 14px 0', lineHeight: '1.5' }}>
                      <strong>Prompt:</strong> {q.prompt}
                    </p>

                    {/* MCQ or Text Answer */}
                    {q.type !== 'Interactive Coding Challenge' && (
                      <div style={{ background: '#121318', padding: '12px 14px', borderRadius: '6px', fontSize: '13px', borderLeft: '3px solid #4ade80' }}>
                        <div style={{ color: '#94a3b8', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' }}>Candidate Submission:</div>
                        <div style={{ color: '#f8fafc' }}>{q.candidateAnswer}</div>
                        {q.benchmarkNotes && (
                          <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.08)', color: '#ffd400', fontSize: '12px' }}>
                            💡 <strong>Interviewer Benchmark:</strong> {q.benchmarkNotes}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Coding Challenge Block */}
                    {q.type === 'Interactive Coding Challenge' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {/* Submitted Code */}
                        <div style={{ background: '#0d1117', borderRadius: '6px', overflow: 'hidden', border: '1px solid #30363d' }}>
                          <div style={{ background: '#161b22', padding: '8px 14px', fontSize: '12px', color: '#8b949e', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Candidate Code Submission ({q.language})</span>
                            <span style={{ color: '#7ee787' }}>✔ 4/4 Test Cases Passed</span>
                          </div>
                          <pre style={{ margin: 0, padding: '14px', color: '#7ee787', fontFamily: 'monospace', fontSize: '13px', lineHeight: '1.5', overflowX: 'auto' }}>
                            {q.submittedCode}
                          </pre>
                        </div>

                        {/* Test Results Matrix */}
                        <div style={{ background: '#121318', padding: '12px', borderRadius: '6px', fontSize: '12px' }}>
                          <div style={{ fontWeight: '700', color: '#a8a9b1', marginBottom: '8px', textTransform: 'uppercase', fontSize: '11px' }}>Automated Test Suite Execution Log:</div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '8px' }}>
                            {q.testResults.map((tr, i) => (
                              <div key={i} style={{ background: '#1b1c20', padding: '8px 10px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <span style={{ color: '#4ade80', fontWeight: '700', marginRight: '6px' }}>✔</span>
                                <span style={{ color: '#e2e8f0' }}>{tr.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Benchmark & Live Interview Discussion Prompts */}
                        <div style={{ background: 'rgba(255, 212, 0, 0.08)', border: '1px solid rgba(255, 212, 0, 0.25)', borderRadius: '6px', padding: '14px' }}>
                          <div style={{ fontWeight: '700', color: '#ffd400', fontSize: '12px', textTransform: 'uppercase', marginBottom: '6px' }}>
                            💡 Technical Interview Discussion Prompts:
                          </div>
                          <ul style={{ margin: 0, paddingLeft: '18px', color: '#fef08a', fontSize: '13px', lineHeight: '1.5' }}>
                            {q.interviewPrompts.map((promptText, pi) => (
                              <li key={pi}>{promptText}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Section 3: Technical Interviewer Evaluation Scorecard & Notes */}
            <section style={{ background: '#292a2f', border: '1px solid #3c3d44', borderRadius: '8px', padding: '24px' }}>
              <h2 style={{ fontSize: '1.2rem', margin: '0 0 14px 0', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                ✍️ Technical Interviewer Evaluation Scorecard
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                {['Code Cleanliness & Style', 'Algorithmic Optimization', 'System Architecture Knowledge', 'Communication & Problem Solving'].map((crit) => (
                  <div key={crit} style={{ background: '#1e1f24', padding: '12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <span style={{ fontSize: '12px', color: '#a8a9b1', display: 'block', marginBottom: '6px' }}>{crit}</span>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#ffd400' }}>[ &nbsp;&nbsp;&nbsp;&nbsp; ] / 10</div>
                  </div>
                ))}
              </div>

              <div style={{ background: '#1e1f24', padding: '14px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <span style={{ fontSize: '12px', color: '#a8a9b1', fontWeight: '700', textTransform: 'uppercase' }}>Interviewer Notes & Decision Remarks:</span>
                <div style={{ minHeight: '60px', marginTop: '8px', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '4px', padding: '10px', color: '#94a3b8', fontSize: '13px' }}>
                  Write interview feedback notes, architectural discussion notes, and hiring recommendations here during the technical interview round...
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '12px', color: '#cbd5e1' }}>
                  <div>Interviewer Signature: _______________________</div>
                  <div>Decision: [ &nbsp;] Strong Hire &nbsp;&nbsp; [ &nbsp;] Hire &nbsp;&nbsp; [ &nbsp;] Hold &nbsp;&nbsp; [ &nbsp;] Reject</div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Sidebar Details */}
          <aside className="report-side">
            <section>
              <h2>Submission Accuracy</h2>
              <div className="accuracy-ring">
                <strong>84%</strong>
                <span>Accuracy</span>
              </div>
              <ul>
                <li><i /> Correct <b>42 Qs</b></li>
                <li><i /> Incorrect <b>5 Qs</b></li>
                <li><i /> Partial <b>3 Qs</b></li>
              </ul>
            </section>

            <section className="report-note">
              <h2>Recruiter Notes <button>Add Note</button></h2>
              <blockquote>
                “Strong technical fit for the Frontend Lead team. Candidate demonstrated deep expertise in reconciliation and custom hook isolation.”
                <small>— Sarah Parker, Lead Recruiter</small>
              </blockquote>
            </section>

            <div className="report-next">
              <small>Recommended Next Steps</small>
              <button onClick={handleExportPDF}>
                <Printer size={18} />
                <span><b>Print / Download PDF Dossier</b>Generate interviewer packet</span>
              </button>
              <button>
                <MessageSquare size={18} />
                <span><b>Schedule Tech Interview</b>Focus on system architecture</span>
              </button>
            </div>
          </aside>
        </div>
      </main>

      {/* CSS Rules for PDF Printing & Export */}
      <style>{`
        @media print {
          body { background: #ffffff !important; color: #000000 !important; }
          .no-print, nav, header:not(.report-profile), .af-toolbar, .qb-pagination, .report-next, aside { display: none !important; }
          .print-container { padding: 0 !important; background: #ffffff !important; color: #000000 !important; }
          .print-only-header { display: block !important; }
          .report-profile h1 { color: #000000 !important; }
          .report-profile p { color: #333333 !important; }
          .report-kpis article, .report-charts > article, .report-evaluation > article { background: #ffffff !important; border: 1px solid #cccccc !important; color: #000000 !important; }
          .report-kpis strong, .report-kpis small, .report-kpis span { color: #000000 !important; }
          pre { background: #f8fafc !important; color: #0f172a !important; border: 1px solid #cbd5e1 !important; }
        }
      `}</style>
    </AssessmentShell>
  );
}

export default CandidateReportPage;
