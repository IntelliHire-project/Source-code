import React, { useMemo, useState } from 'react';
import { CheckCircle2, Clock3, Eye, Search, Users } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import AssessmentShell from './AssessmentShell';
import './AssessmentFlow.css';

const CANDIDATES = [
  { name: 'Marcus Chen', initials: 'MC', score: 84, status: 'Completed', time: '42m 15s', submitted: 'Jul 27, 2026' },
  { name: 'Aisha Fernando', initials: 'AF', score: 91, status: 'Completed', time: '47m 08s', submitted: 'Jul 27, 2026' },
  { name: 'Daniel Silva', initials: 'DS', score: 76, status: 'Needs Review', time: '58m 34s', submitted: 'Jul 26, 2026' },
  { name: 'Nadia Perera', initials: 'NP', score: null, status: 'In Progress', time: '31m 20s', submitted: '—' },
];

function AssessmentCandidatesPage() {
  const navigate = useNavigate();
  const { assessmentId } = useParams();
  const [query, setQuery] = useState('');
  const visible = useMemo(() => CANDIDATES.filter((candidate) => candidate.name.toLowerCase().includes(query.toLowerCase())), [query]);
  return (
    <AssessmentShell currentPage="Candidate Results" onSearch={setQuery} searchPlaceholder="Search candidates...">
      <main className="af-page">
        <div className="af-page-title"><div><span className="af-eyebrow">Senior Fullstack Engineering Challenge</span><h1>Candidate Results</h1><p>Review submissions and open individual evaluation reports.</p></div><button className="af-secondary" onClick={() => navigate(`/recruiter/assessments/${assessmentId}`)}>Assessment Preview</button></div>
        <section className="acr-summary"><article><Users /><div><strong>42</strong><span>Assigned</span></div></article><article><CheckCircle2 /><div><strong>31</strong><span>Completed</span></div></article><article><Clock3 /><div><strong>7</strong><span>In Progress</span></div></article><article><strong>82%</strong><span>Average Score</span></article></section>
        <label className="af-search acr-search"><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search candidates..." /></label>
        <section className="acr-table">
          <div className="acr-head"><span>Candidate</span><span>Score</span><span>Status</span><span>Time Used</span><span>Submitted</span><span>Report</span></div>
          {visible.map((candidate) => <article key={candidate.name}><div className="acr-candidate"><b>{candidate.initials}</b><strong>{candidate.name}</strong></div><strong className={candidate.score >= 80 ? 'high' : ''}>{candidate.score == null ? '—' : `${candidate.score}%`}</strong><span className={`acr-status ${candidate.status.toLowerCase().replace(' ', '-')}`}>{candidate.status}</span><span>{candidate.time}</span><span>{candidate.submitted}</span><button disabled={candidate.score == null} onClick={() => navigate('/recruiter/assessments/report/marcus-chen')}><Eye size={16} /> View Report</button></article>)}
        </section>
      </main>
    </AssessmentShell>
  );
}
export default AssessmentCandidatesPage;
