const db = require('../config/db');

// Base Benchmark Data for Applicant Analytics Table
const BASE_APPLICANT_TABLE = [
  { id: '1', position: 'Senior Software Engineer', department: 'Engineering', total: 218, newApplicants: 44, shortlisted: 72, rejected: 58, pending: 88, avgScore: 84 },
  { id: '2', position: 'UI/UX Designer', department: 'Design', total: 156, newApplicants: 32, shortlisted: 48, rejected: 42, pending: 66, avgScore: 79 },
  { id: '3', position: 'QA Automation Engineer', department: 'QA & Testing', total: 134, newApplicants: 28, shortlisted: 38, rejected: 36, pending: 60, avgScore: 76 },
  { id: '4', position: 'Business Analyst', department: 'Operations', total: 192, newApplicants: 39, shortlisted: 66, rejected: 51, pending: 75, avgScore: 81 },
  { id: '5', position: 'Product Manager', department: 'Product', total: 141, newApplicants: 27, shortlisted: 44, rejected: 39, pending: 58, avgScore: 88 },
  { id: '6', position: 'DevOps Lead', department: 'Engineering', total: 117, newApplicants: 24, shortlisted: 36, rejected: 32, pending: 49, avgScore: 82 },
  { id: '7', position: 'Data Scientist', department: 'Engineering', total: 98, newApplicants: 22, shortlisted: 28, rejected: 24, pending: 46, avgScore: 85 },
  { id: '8', position: 'Cloud Architect', department: 'Engineering', total: 87, newApplicants: 20, shortlisted: 22, rejected: 19, pending: 46, avgScore: 90 },
];

// Unified Shortlisted Candidates
const BASE_SHORTLISTED_CANDIDATES = [
  { id: 'APP-001', rank: '#1', name: 'Alice Fernando', role: 'Senior Software Engineer', score: 88, expMatch: 'Matched', status: 'SHORTLISTED', criteriaMet: '5/5 Criteria' },
  { id: 'APP-002', rank: '#2', name: 'Kamal Perera', role: 'Senior Software Engineer', score: 82, expMatch: 'Matched', status: 'SHORTLISTED', criteriaMet: '5/5 Criteria' },
  { id: 'APP-003', rank: '#3', name: 'Nimal Silva', role: 'Senior Software Engineer', score: 79, expMatch: 'Matched', status: 'SHORTLISTED', criteriaMet: '5/5 Criteria' },
  { id: 'APP-004', rank: '#4', name: 'Dinesh Mendis', role: 'Senior Software Engineer', score: 76, expMatch: 'Matched', status: 'SHORTLISTED', criteriaMet: '4/5 Criteria' },
  { id: 'APP-005', rank: '#5', name: 'Sanduni Wickramasinghe', role: 'Senior Software Engineer', score: 74, expMatch: 'Partial Match', status: 'SHORTLISTED', criteriaMet: '4/5 Criteria' },
  { id: 'APP-006', rank: '#6', name: 'Ishara Gunasekara', role: 'Senior Software Engineer', score: 72, expMatch: 'Partial Match', status: 'UNDER REVIEW', criteriaMet: '4/5 Criteria' },
  { id: 'APP-007', rank: '#7', name: 'Malith Senanayake', role: 'UI/UX Designer', score: 70, expMatch: 'Matched', status: 'SHORTLISTED', criteriaMet: '4/5 Criteria' },
  { id: 'APP-008', rank: '#8', name: 'Tharindu Rathnayake', role: 'QA Automation Engineer', score: 68, expMatch: 'Matched', status: 'SHORTLISTED', criteriaMet: '4/5 Criteria' },
  { id: 'APP-009', rank: '#9', name: 'Kasun Wijesinghe', role: 'Backend Engineer', score: 65, expMatch: 'Partial Match', status: 'UNDER REVIEW', criteriaMet: '3/5 Criteria' },
];

/**
 * Helper to fetch live database counts from interview tables
 */
async function getLiveDatabaseMetrics() {
  try {
    const slotsRes = await db.query(`
      SELECT 
        s.id,
        s.job_position,
        s.round,
        s.interview_date,
        s.start_time,
        s.end_time,
        s.interview_type,
        s.status AS slot_status,
        a.id AS allocation_id,
        a.candidate_app_id,
        a.candidate_name,
        a.candidate_email,
        a.match_score,
        a.status AS allocation_status,
        e.id AS evaluation_id,
        e.score AS evaluation_score,
        e.tech_skills,
        e.comm_skills,
        e.problem_solving,
        e.teamwork,
        e.overall_rating,
        e.recommendation,
        e.evaluated_by,
        e.submitted_at
      FROM interview_slots s
      LEFT JOIN interview_allocations a ON a.slot_id = s.id
      LEFT JOIN interview_evaluations e ON e.slot_id = s.id
      ORDER BY s.id ASC
    `);

    return slotsRes.rows || [];
  } catch (err) {
    console.warn('[AnalyticsModel] Live DB query warning:', err.message);
    return [];
  }
}

/**
 * 1. Get Applicant Analytics Data
 */
async function getApplicantAnalytics({ position = 'all', department = 'all', search = '' } = {}) {
  const liveSlots = await getLiveDatabaseMetrics();

  // Dynamically update Senior Software Engineer with live candidates if available
  const allocatedSSE = liveSlots.filter(
    (s) => s.job_position === 'Senior Software Engineer' && s.candidate_name
  ).length;

  let tableData = BASE_APPLICANT_TABLE.map((row) => {
    if (row.position === 'Senior Software Engineer' && allocatedSSE > 0) {
      return {
        ...row,
        shortlisted: Math.max(row.shortlisted, 70 + allocatedSSE),
      };
    }
    return { ...row };
  });

  // Apply filters
  if (position && position !== 'all') {
    const posLower = position.toLowerCase();
    tableData = tableData.filter((item) =>
      item.position.toLowerCase().includes(posLower)
    );
  }

  if (department && department !== 'all') {
    const deptLower = department.toLowerCase();
    tableData = tableData.filter((item) =>
      item.department.toLowerCase().includes(deptLower)
    );
  }

  if (search && search.trim()) {
    const query = search.trim().toLowerCase();
    tableData = tableData.filter(
      (item) =>
        item.position.toLowerCase().includes(query) ||
        item.department.toLowerCase().includes(query)
    );
  }

  // Calculate totals
  const totals = tableData.reduce(
    (acc, item) => ({
      total: acc.total + item.total,
      newApplicants: acc.newApplicants + item.newApplicants,
      shortlisted: acc.shortlisted + item.shortlisted,
      rejected: acc.rejected + item.rejected,
      pending: acc.pending + item.pending,
    }),
    { total: 0, newApplicants: 0, shortlisted: 0, rejected: 0, pending: 0 }
  );

  const avgScore = tableData.length
    ? Math.round(tableData.reduce((acc, item) => acc + item.avgScore, 0) / tableData.length)
    : 0;

  const stats = [
    { label: 'Total Applicants', value: totals.total, key: 'total' },
    { label: 'New Applicants', value: totals.newApplicants, key: 'new' },
    { label: 'Shortlisted', value: totals.shortlisted, key: 'shortlisted' },
    { label: 'Rejected', value: totals.rejected, key: 'rejected' },
  ];

  const departments = Array.from(new Set(BASE_APPLICANT_TABLE.map((item) => item.department)));
  const positions = Array.from(new Set(BASE_APPLICANT_TABLE.map((item) => item.position)));

  return {
    totals: { ...totals, avgScore },
    stats,
    tableData,
    departments,
    positions,
  };
}

/**
 * 2. Get Assessment Performance Analytics
 */
async function getAssessmentAnalytics() {
  const liveSlots = await getLiveDatabaseMetrics();

  // Find evaluated slots from database
  const evaluatedSlots = liveSlots.filter((s) => s.evaluation_id && s.candidate_name);

  // Default evaluations
  let panelEvaluations = [
    { id: 'E-1', candidate: 'Alice Fernando', role: 'Senior Software Engineer', round: 'Technical Interview', comm: 4, tech: 5, problem: 4, teamwork: 4, overall: '4.5 / 5', recommendation: 'Hire' },
    { id: 'E-2', candidate: 'Kamal Perera', role: 'Senior Software Engineer', round: 'HR Portfolio Review', comm: 4, tech: 3, problem: 4, teamwork: 5, overall: '4.0 / 5', recommendation: 'Hold' },
    { id: 'E-3', candidate: 'Nimal Silva', role: 'Senior Software Engineer', round: 'System Architecture', comm: 3, tech: 4, problem: 3, teamwork: 4, overall: '3.5 / 5', recommendation: 'Reject' },
    { id: 'E-4', candidate: 'Dinesh Mendis', role: 'Senior Software Engineer', round: 'Technical Interview', comm: 4, tech: 4, problem: 4, teamwork: 4, overall: '4.0 / 5', recommendation: 'Hire' },
    { id: 'E-5', candidate: 'Sanduni Wickramasinghe', role: 'Senior Software Engineer', round: 'HR Screening', comm: 4, tech: 3, problem: 4, teamwork: 4, overall: '3.8 / 5', recommendation: 'Hold' },
    { id: 'E-6', candidate: 'Malith Senanayake', role: 'UI/UX Designer', round: 'Design Portfolio Review', comm: 5, tech: 4, problem: 4, teamwork: 5, overall: '4.5 / 5', recommendation: 'Hire' },
  ];

  // If live database evaluations exist, map and prepend them
  if (evaluatedSlots.length > 0) {
    const liveEvals = evaluatedSlots.map((s) => {
      const rec = s.recommendation === 'HIRE' ? 'Hire' : (s.recommendation === 'REJECT' ? 'Reject' : 'Hold');
      const ovr = s.overall_rating ? `${Number(s.overall_rating).toFixed(1)} / 5` : '4.5 / 5';
      return {
        id: `E-LIVE-${s.evaluation_id}`,
        candidate: s.candidate_name,
        role: s.job_position || 'Senior Software Engineer',
        round: s.round || 'Technical Interview',
        comm: s.comm_skills || 4,
        tech: s.tech_skills || s.evaluation_score || 5,
        problem: s.problem_solving || 4,
        teamwork: s.teamwork || 4,
        overall: ovr,
        recommendation: rec,
      };
    });

    const liveNames = new Set(liveEvals.map((e) => e.candidate.toLowerCase()));
    panelEvaluations = [...liveEvals, ...panelEvaluations.filter((p) => !liveNames.has(p.candidate.toLowerCase()))];
  }

  const assessmentStats = [
    { label: 'Assessments Sent', value: '856', change: '+12% this month' },
    { label: 'Completion Rate', value: '78.4%', change: '+3.2% vs last month' },
    { label: 'Avg Assessment Score', value: '71.2', change: 'Consistent benchmark' },
    { label: 'Failed Threshold', value: '124', change: '14.5% fail rate' },
  ];

  const scoreDistribution = [
    { range: '81–100 Score', label: 'High Distinction', count: 178, pct: 26.5, color: '#22C55E' },
    { range: '61–80 Score', label: 'Good Performance', count: 298, pct: 44.4, color: '#22C55E' },
    { range: '41–60 Score', label: 'Average Score', count: 145, pct: 21.6, color: '#F0B90B' },
    { range: '21–40 Score', label: 'Needs Improvement', count: 38, pct: 5.7, color: '#E63946' },
    { range: '0–20 Score', label: 'Below Threshold', count: 12, pct: 1.8, color: '#E63946' },
  ];

  return {
    stats: assessmentStats,
    scoreDistribution,
    panelEvaluations,
  };
}

/**
 * 3. Get Shortlisting Analytics
 */
async function getShortlistingAnalytics({ role = 'all', status = 'all', search = '' } = {}) {
  let candidates = [...BASE_SHORTLISTED_CANDIDATES];

  if (role && role !== 'all') {
    const roleLower = role.toLowerCase();
    candidates = candidates.filter((c) => c.role.toLowerCase().includes(roleLower));
  }

  if (status && status !== 'all') {
    const statusLower = status.toLowerCase();
    candidates = candidates.filter((c) => c.status.toLowerCase() === statusLower);
  }

  if (search && search.trim()) {
    const query = search.trim().toLowerCase();
    candidates = candidates.filter(
      (c) => c.name.toLowerCase().includes(query) || c.role.toLowerCase().includes(query)
    );
  }

  const shortlistedCount = candidates.filter((c) => c.status === 'SHORTLISTED').length;
  const reviewCount = candidates.filter((c) => c.status === 'UNDER REVIEW').length;
  const rate = candidates.length ? Math.round((shortlistedCount / candidates.length) * 100) : 0;

  const stats = [
    { label: 'Total Shortlisted', value: shortlistedCount },
    { label: 'Shortlist Rate', value: `${rate}%` },
    { label: 'Avg Time to Shortlist', value: '3.2d' },
    { label: 'Pending Review', value: reviewCount },
  ];

  const criteriaDefinitions = [
    { criteria: 'Technical Skills Match', test: (c) => c.score >= 80 },
    { criteria: 'Relevant Experience', test: (c) => c.expMatch === 'Matched' },
    { criteria: 'Educational Qualification', test: (c) => c.score >= 70 },
    { criteria: 'Communication & Soft Skills', test: (c) => Number(c.criteriaMet[0]) >= 4 },
    { criteria: 'Portfolio & System Projects', test: (c) => c.score >= 90 },
  ];

  const criteriaMetrics = criteriaDefinitions.map(({ criteria, test }) => {
    const met = candidates.filter(test).length;
    return {
      criteria,
      shortlisted: met,
      total: candidates.length,
      pct: candidates.length ? Math.round((met / candidates.length) * 100) : 0,
    };
  });

  return {
    stats,
    candidates,
    criteriaMetrics,
  };
}

/**
 * 4. Get Recruitment Progress and Funnel
 */
async function getRecruitmentProgress() {
  const liveSlots = await getLiveDatabaseMetrics();

  // Progress Stats
  const progressStats = [
    { label: 'Interview Progress', value: '68%', change: '+12% completion' },
    { label: 'Hired This Month', value: '48', change: '+6 candidates' },
    { label: 'Avg Time to Hire', value: '18d', change: '-2 days faster' },
    { label: 'Offer Accept Rate', value: '82%', change: 'Strong alignment' },
  ];

  // Funnel Stages
  const funnelStages = [
    { stage: 'Applied', count: 1284, pct: 100, color: '#6B8CFF' },
    { stage: 'CV Screened', count: 875, pct: 68, color: '#F0B90B' },
    { stage: 'Shortlisted', count: 418, pct: 33, color: '#F0B90B' },
    { stage: 'Assessment', count: 312, pct: 24, color: '#22C55E' },
    { stage: 'Interview', count: 156, pct: 12, color: '#22C55E' },
    { stage: 'Final Round', count: 72, pct: 6, color: '#22C55E' },
    { stage: 'Hired', count: 48, pct: 4, color: '#22C55E' },
  ];

  // Base progress records
  let stageRecords = [
    { id: 'P-1', candidate: 'Alice Fernando', role: 'Senior Software Engineer', date: '22 Oct 2026', time: '09:30 AM – 10:30 AM', type: 'Online', stage: 'Technical Interview', status: 'COMPLETED' },
    { id: 'P-2', candidate: 'Kamal Perera', role: 'Senior Software Engineer', date: '02 Nov 2026', time: '02:00 PM – 03:00 PM', type: 'Physical', stage: 'HR Portfolio Review', status: 'RESCHEDULE_REQUESTED' },
    { id: 'P-3', candidate: 'Nimal Silva', role: 'Senior Software Engineer', date: '04 Nov 2026', time: '11:00 AM – 12:00 PM', type: 'Online', stage: 'System Architecture', status: 'SCHEDULED' },
    { id: 'P-4', candidate: 'Dinesh Mendis', role: 'Senior Software Engineer', date: '05 Nov 2026', time: '10:00 AM – 11:00 AM', type: 'Online', stage: 'Technical Interview', status: 'PENDING' },
    { id: 'P-5', candidate: 'Sanduni Wickramasinghe', role: 'Senior Software Engineer', date: '06 Nov 2026', time: '01:30 PM – 02:30 PM', type: 'Physical', stage: 'HR Screening', status: 'PENDING' },
    { id: 'P-6', candidate: 'Malith Senanayake', role: 'UI/UX Designer', date: '10 Nov 2026', time: '03:00 PM – 04:00 PM', type: 'Online', stage: 'Design Portfolio Review', status: 'PENDING' },
  ];

  // If live slots with candidates exist, sync them
  const liveAllocated = liveSlots.filter((s) => s.candidate_name);
  if (liveAllocated.length > 0) {
    const liveMapped = liveAllocated.map((s) => ({
      id: `LIVE-SLOT-${s.id}`,
      candidate: s.candidate_name,
      role: s.job_position || 'Senior Software Engineer',
      date: s.interview_date ? new Date(s.interview_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '02 Nov 2026',
      time: `${s.start_time} – ${s.end_time}`,
      type: s.interview_type || 'Online',
      stage: s.round || 'Technical Interview',
      status: s.slot_status || 'ALLOCATED',
    }));

    const liveNames = new Set(liveMapped.map((r) => r.candidate.toLowerCase()));
    stageRecords = [...liveMapped, ...stageRecords.filter((r) => !liveNames.has(r.candidate.toLowerCase()))];
  }

  return {
    stats: progressStats,
    funnelStages,
    stageRecords,
  };
}

/**
 * 5. Overview Dashboard Analytics
 */
async function getOverviewAnalytics() {
  const [applicant, assessment, shortlisting, progress] = await Promise.all([
    getApplicantAnalytics(),
    getAssessmentAnalytics(),
    getShortlistingAnalytics(),
    getRecruitmentProgress(),
  ]);

  return {
    applicantSummary: applicant.totals,
    assessmentSummary: assessment.stats,
    shortlistingSummary: shortlisting.stats,
    progressSummary: progress.stats,
    funnel: progress.funnelStages,
  };
}

module.exports = {
  getApplicantAnalytics,
  getAssessmentAnalytics,
  getShortlistingAnalytics,
  getRecruitmentProgress,
  getOverviewAnalytics,
};

