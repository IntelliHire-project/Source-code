import React, { useState } from 'react';
import { Award, BarChart3, CheckCircle2, ChevronDown, ChevronUp, Clock3, Download, FileText, MessageSquare, Share2, Sparkles, Target, Zap } from 'lucide-react';
import AssessmentShell from './AssessmentShell';
import './AssessmentFlow.css';

const REPORTS = [
  { title: 'Algorithmic Efficiency', score: 94, level: 'Expert', feedback: 'Exceptional performance in time complexity optimization. Used efficient approaches where many candidates default to slower solutions. Code structure is clean and follows industry best practices.', strengths: ['Big O Awareness', 'Edge Case Handling', 'Clean Code'] },
  { title: 'System Architecture', score: 62, level: 'Intermediate', feedback: 'Solid understanding of basic microservices, but struggled with scaling strategies and cache invalidation patterns. Recommend further study on distributed systems.', strengths: ['Database Design', 'API Contract Definition'], growth: ['Message Queues', 'Caching Strategies'] },
  { title: 'React & Frontend Logic', score: 95, level: 'Expert', feedback: 'Excellent mastery of hooks, rendering behavior, and component architecture.', strengths: ['React Hooks', 'Performance'] },
];

function CandidateReportPage() {
  const [open, setOpen] = useState([0, 1]);
  const toggle = (i) => setOpen(open.includes(i) ? open.filter((item) => item !== i) : [...open, i]);
  return (
    <AssessmentShell currentPage="Marcus Chen Report">
      <main className="af-page report-page">
        <header className="report-profile"><div className="report-avatar">MC<span><CheckCircle2 size={15} /></span></div><div><h1>Marcus Chen</h1><p><b>Senior Frontend Engineer</b> · Applied: Jul 24, 2026 · Colombo, LK</p></div><div className="report-buttons"><button className="af-secondary"><Download size={16} /> Export PDF</button><button className="af-secondary"><Share2 size={16} /> Share</button><button className="af-primary">Move to Interview</button></div></header>
        <section className="report-kpis">{[
          ['Overall Proficiency', '84/100', 'Top 5% of candidates', Award],
          ['Technical Logic', '92%', '+12% above average', BarChart3],
          ['Time Management', '42m 15s', 'Used 70% of allotted time', Clock3],
          ['Confidence Score', 'High', 'Based on answer consistency', Zap],
        ].map(([label, value, sub, Icon]) => <article key={label}><div><small>{label}</small><strong>{value}</strong><span>{sub}</span></div><Icon size={19} /></article>)}</section>
        <section className="report-charts">
          <article><h2>Skill Profile</h2><p>Relative performance across domains</p><div className="radar-wrap"><svg viewBox="0 0 260 220" aria-label="Skill profile chart"><g transform="translate(130 110)"><polygon points="0,-90 78,-45 78,45 0,90 -78,45 -78,-45" /><polygon points="0,-68 60,-35 53,31 0,73 -72,42 -55,-32" className="radar-value" /><line x1="0" y1="-90" x2="0" y2="90" /><line x1="-78" y1="-45" x2="78" y2="45" /><line x1="78" y1="-45" x2="-78" y2="45" /></g></svg><span className="r1">Problem Solving</span><span className="r2">Coding Logic</span><span className="r3">System Design</span><span className="r4">Communication</span><span className="r5">React Hooks</span></div></article>
          <article><h2>Section Analysis</h2><p>Comparison with benchmark averages</p><div className="bar-chart">{[['Algorithm', 94, 72], ['Data Struct.', 88, 65], ['Architecture', 62, 58], ['Soft Skills', 81, 75]].map(([name, candidate, average]) => <div key={name}><div className="bars"><i style={{ height: `${candidate}%` }} /><i style={{ height: `${average}%` }} /></div><span>{name}</span></div>)}</div></article>
        </section>
        <div className="report-detail-layout">
          <section className="report-evaluation"><h2><FileText size={20} /> Detailed Evaluation Report</h2>{REPORTS.map((item, i) => <article key={item.title}><header onClick={() => toggle(i)}><b>{item.score}%</b><div><strong>{item.title}</strong><span>Categorized Technical Assessment</span></div><em>{item.level}</em>{open.includes(i) ? <ChevronUp size={17} /> : <ChevronDown size={17} />}</header>{open.includes(i) && <div className="report-feedback"><small>Expert Feedback</small><p>{item.feedback}</p><div><div><small>Key Strengths</small>{item.strengths.map((tag) => <span key={tag}>{tag}</span>)}</div>{item.growth && <div className="growth"><small>Areas for Growth</small>{item.growth.map((tag) => <span key={tag}>{tag}</span>)}</div>}</div></div>}</article>)}</section>
          <aside className="report-side"><section><h2>Submission Accuracy</h2><div className="accuracy-ring"><strong>84%</strong><span>Accuracy</span></div><ul><li><i /> Correct <b>42 Qs</b></li><li><i /> Incorrect <b>5 Qs</b></li><li><i /> Partial <b>3 Qs</b></li></ul></section><section className="report-note"><h2>Internal Notes <button>Add Note</button></h2><blockquote>“Strong cultural fit for the Frontend team. The way he handled the concurrent rendering questions shows deep expertise.”<small>— Sarah Parker, Lead Recruiter</small></blockquote></section><div className="report-next"><small>Recommended Next Steps</small><button><MessageSquare size={18} /><span><b>Schedule Tech Interview</b>Focus on architecture</span></button><button><Target size={18} /><span><b>Request Portfolio Review</b>Check recent OSS contributions</span></button></div></aside>
        </div>
      </main>
    </AssessmentShell>
  );
}
export default CandidateReportPage;
