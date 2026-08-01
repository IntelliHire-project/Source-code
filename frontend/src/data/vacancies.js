/**
 * vacancies.js — shared vacancy dataset + helpers.
 *
 * Both the Active Vacancies list (VacancyManagementPage) and the
 * Vacancy Detail Dashboard (VacancyDetailPage) read from this single
 * module so the detail view always shows the same id / title /
 * department / status / applicant counts as the list row.
 *
 * This is mock seed data (there is no backend wiring for vacancies yet),
 * matching the existing pattern in the app. The "BA Intern" vacancy
 * (VAC-004) is the worked example: 3 shortlisted candidates, 0
 * interviews scheduled → tracker sits at "Shortlisted" and the next-step
 * callout prompts the recruiter to schedule interviews.
 */

export const TRACKER_STAGES = [
  { id: 'requisition', label: 'Requisition Approved' },
  { id: 'sourcing', label: 'Sourcing / Applications Open' },
  { id: 'screening', label: 'Screening' },
  { id: 'shortlisted', label: 'Shortlisted' },
  { id: 'interviewing', label: 'Interviewing' },
  { id: 'offer', label: 'Offer' },
  { id: 'hired', label: 'Hired / Closed' },
];

export const APPROVAL_STEPS = ['Submitted', 'Manager Review', 'HR Review', 'Published'];

export const VACANCIES = [
  {
    id: 'VAC-001',
    title: 'Senior Frontend Engineer',
    department: 'Engineering',
    status: 'published',
    dateCreated: '12 Jul 2026',
    location: 'London, UK',
    employmentType: 'Hybrid',
    salaryRange: '£65,000 – £80,000',
    hiringManager: 'Emma Clarke',
    description:
      'We are looking for a Senior Frontend Engineer to own the developer experience of our recruitment platform. You will build fast, accessible interfaces with React and help mentor mid-level engineers across two squads.',
    requirements: [
      '5+ years building production React applications',
      'Strong TypeScript and modern CSS (design tokens, custom properties)',
      'Accessibility (WCAG 2.1 AA) and performance mindset',
      'Experience mentoring other engineers',
    ],
    candidates: [
      { id: 'c1', name: 'Ayesha Khan', email: 'ayesha.khan@example.com', score: 92, stage: 'offer', appliedDate: '14 Jul 2026', resumeLink: '#resume-VAC-001-c1' },
      { id: 'c2', name: 'Tom Bradley', email: 'tom.bradley@example.com', score: 88, stage: 'interviewed', appliedDate: '15 Jul 2026', resumeLink: '#resume-VAC-001-c2' },
      { id: 'c3', name: 'Priya Nair', email: 'priya.nair@example.com', score: 87, stage: 'interviewed', appliedDate: '16 Jul 2026', resumeLink: '#resume-VAC-001-c3' },
      { id: 'c4', name: 'Leo Martins', email: 'leo.martins@example.com', score: 85, stage: 'shortlisted', appliedDate: '18 Jul 2026', resumeLink: '#resume-VAC-001-c4' },
      { id: 'c5', name: 'Sofia Rossi', email: 'sofia.rossi@example.com', score: 83, stage: 'shortlisted', appliedDate: '18 Jul 2026', resumeLink: '#resume-VAC-001-c5' },
      { id: 'c6', name: 'David Osei', email: 'david.osei@example.com', score: 76, stage: 'applied', appliedDate: '20 Jul 2026', resumeLink: '#resume-VAC-001-c6' },
      { id: 'c7', name: 'Hannah Lee', email: 'hannah.lee@example.com', score: 74, stage: 'applied', appliedDate: '21 Jul 2026', resumeLink: '#resume-VAC-001-c7' },
      { id: 'c8', name: 'Marcus Webb', email: 'marcus.webb@example.com', score: 62, stage: 'rejected', appliedDate: '19 Jul 2026', resumeLink: '#resume-VAC-001-c8' },
    ],
    interviews: [
      { id: 'i1', candidateName: 'Tom Bradley', date: '24 Jul 2026', time: '10:00 AM', round: 'Round 1', status: 'completed', interviewer: 'Jordan Patel', location: 'Google Meet' },
      { id: 'i2', candidateName: 'Priya Nair', date: '25 Jul 2026', time: '02:00 PM', round: 'Round 1', status: 'completed', interviewer: 'Jordan Patel', location: 'Google Meet' },
      { id: 'i3', candidateName: 'Leo Martins', date: '28 Jul 2026', time: '11:00 AM', round: 'Round 1', status: 'scheduled', interviewer: 'Jordan Patel', location: 'Google Meet' },
      { id: 'i4', candidateName: 'Sofia Rossi', date: '29 Jul 2026', time: '03:00 PM', round: 'Round 1', status: 'scheduled', interviewer: 'Jordan Patel', location: 'Google Meet' },
      { id: 'i5', candidateName: 'Tom Bradley', date: '31 Jul 2026', time: '10:00 AM', round: 'Round 2', status: 'completed', interviewer: 'Amelia Stone', location: 'Office — Room 2A' },
    ],
    attendees: [
      { id: 'a1', name: 'Jordan Patel', role: 'Senior Frontend Lead', confirmed: true, interviews: ['Round 1 — 24 Jul', 'Round 1 — 28 Jul', 'Round 1 — 29 Jul'], availability: 'Mornings' },
      { id: 'a2', name: 'Amelia Stone', role: 'Engineering Manager', confirmed: true, interviews: ['Round 2 — 31 Jul', 'Panel — 02 Aug'], availability: 'Afternoons' },
      { id: 'a3', name: 'Rohan Fernando', role: 'Product Manager', confirmed: false, interviews: ['Panel — 02 Aug'], availability: 'Flexible' },
    ],
    adminReviews: [
      { id: 'r1', reviewerName: 'Emma Clarke', role: 'Hiring Manager', decision: 'approved', comment: 'Strong pipeline for the senior role.', timestamp: '16 Jul 2026' },
      { id: 'r2', reviewerName: 'Jordan Patel', role: 'Interviewer', decision: 'pending', comment: 'Compare final-round candidates before extending an offer.', timestamp: '30 Jul 2026' },
    ],
    approvalHistory: [
      { step: 'Submitted', state: 'done', timestamp: '01 Jul 2026' },
      { step: 'Manager Review', state: 'done', timestamp: '03 Jul 2026' },
      { step: 'HR Review', state: 'done', timestamp: '08 Jul 2026' },
      { step: 'Published', state: 'done', timestamp: '12 Jul 2026' },
    ],
    activityLog: [
      { id: 'l1', text: 'Vacancy created', timestamp: '01 Jul 2026' },
      { id: 'l2', text: 'Requisition approved', timestamp: '03 Jul 2026' },
      { id: 'l3', text: 'Vacancy published', timestamp: '12 Jul 2026' },
      { id: 'l4', text: '4 candidates shortlisted', timestamp: '20 Jul 2026' },
      { id: 'l5', text: 'First-round interviews completed', timestamp: '25 Jul 2026' },
      { id: 'l6', text: 'Offer extended to Ayesha Khan', timestamp: '30 Jul 2026' },
    ],
    timeToFill: 19,
  },
  {
    id: 'VAC-002',
    title: 'Product Designer',
    department: 'Design',
    status: 'published',
    dateCreated: '08 Jul 2026',
    location: 'Remote',
    employmentType: 'Remote',
    salaryRange: '£45,000 – £58,000',
    hiringManager: 'Sophie Turner',
    description:
      'We are hiring a Product Designer to shape end-to-end candidate and recruiter experiences. You will own design deliverables from research through high-fidelity UI, working closely with product and engineering.',
    requirements: [
      '4+ years in product/UX design for web applications',
      'Strong Figma skills and a solid design-system mindset',
      'Comfortable running usability tests and synthesizing findings',
      'Portfolio showing shipped, accessible interfaces',
    ],
    candidates: [
      { id: 'c1', name: 'Nina Petrova', email: 'nina.petrova@example.com', score: 89, stage: 'shortlisted', appliedDate: '10 Jul 2026', resumeLink: '#resume-VAC-002-c1' },
      { id: 'c2', name: 'Arjun Mehta', email: 'arjun.mehta@example.com', score: 88, stage: 'shortlisted', appliedDate: '11 Jul 2026', resumeLink: '#resume-VAC-002-c2' },
      { id: 'c3', name: 'Elena Vargas', email: 'elena.vargas@example.com', score: 86, stage: 'shortlisted', appliedDate: '12 Jul 2026', resumeLink: '#resume-VAC-002-c3' },
      { id: 'c4', name: 'Daniel Kim', email: 'daniel.kim@example.com', score: 85, stage: 'shortlisted', appliedDate: '12 Jul 2026', resumeLink: '#resume-VAC-002-c4' },
      { id: 'c5', name: 'Mia Chen', email: 'mia.chen@example.com', score: 82, stage: 'interviewed', appliedDate: '18 Jul 2026', resumeLink: '#resume-VAC-002-c5' },
      { id: 'c6', name: 'Leo Duarte', email: 'leo.duarte@example.com', score: 80, stage: 'interviewed', appliedDate: '19 Jul 2026', resumeLink: '#resume-VAC-002-c6' },
      { id: 'c7', name: 'Grace Liu', email: 'grace.liu@example.com', score: 71, stage: 'applied', appliedDate: '20 Jul 2026', resumeLink: '#resume-VAC-002-c7' },
      { id: 'c8', name: 'Peter Novak', email: 'peter.novak@example.com', score: 65, stage: 'rejected', appliedDate: '17 Jul 2026', resumeLink: '#resume-VAC-002-c8' },
      { id: 'c9', name: 'Fatima Ali', email: 'fatima.ali@example.com', score: 63, stage: 'rejected', appliedDate: '16 Jul 2026', resumeLink: '#resume-VAC-002-c9' },
    ],
    interviews: [
      { id: 'i1', candidateName: 'Mia Chen', date: '25 Jul 2026', time: '09:30 AM', round: 'Round 1', status: 'completed', interviewer: 'Amelia Stone', location: 'Google Meet' },
      { id: 'i2', candidateName: 'Leo Duarte', date: '26 Jul 2026', time: '01:00 PM', round: 'Round 1', status: 'completed', interviewer: 'Amelia Stone', location: 'Google Meet' },
      { id: 'i3', candidateName: 'Nina Petrova', date: '04 Aug 2026', time: '10:00 AM', round: 'Round 1', status: 'scheduled', interviewer: 'Amelia Stone', location: 'Google Meet' },
      { id: 'i4', candidateName: 'Arjun Mehta', date: '04 Aug 2026', time: '02:00 PM', round: 'Round 1', status: 'scheduled', interviewer: 'Amelia Stone', location: 'Google Meet' },
      { id: 'i5', candidateName: 'Elena Vargas', date: '04 Aug 2026', time: '04:00 PM', round: 'Round 1', status: 'scheduled', interviewer: 'Lucy Grant', location: 'Google Meet' },
    ],
    attendees: [
      { id: 'a1', name: 'Amelia Stone', role: 'Design Director', confirmed: true, interviews: ['Round 1 — 04 Aug', 'Round 2 — 06 Aug'], availability: 'Flexible' },
      { id: 'a2', name: 'Rohan Fernando', role: 'Product Manager', confirmed: true, interviews: ['Round 1 — 04 Aug'], availability: 'Mornings' },
      { id: 'a3', name: 'Lucy Grant', role: 'UX Researcher', confirmed: false, interviews: ['Round 2 — 06 Aug'], availability: 'Afternoons' },
    ],
    adminReviews: [
      { id: 'r1', reviewerName: 'Sophie Turner', role: 'Hiring Manager', decision: 'approved', comment: 'Candidate pool looks strong.', timestamp: '13 Jul 2026' },
    ],
    approvalHistory: [
      { step: 'Submitted', state: 'done', timestamp: '03 Jul 2026' },
      { step: 'Manager Review', state: 'done', timestamp: '05 Jul 2026' },
      { step: 'HR Review', state: 'done', timestamp: '06 Jul 2026' },
      { step: 'Published', state: 'done', timestamp: '08 Jul 2026' },
    ],
    activityLog: [
      { id: 'l1', text: 'Vacancy created', timestamp: '03 Jul 2026' },
      { id: 'l2', text: 'Requisition approved', timestamp: '05 Jul 2026' },
      { id: 'l3', text: 'Vacancy published', timestamp: '08 Jul 2026' },
      { id: 'l4', text: '5 candidates shortlisted', timestamp: '14 Jul 2026' },
      { id: 'l5', text: '3 interviews scheduled for 04 Aug', timestamp: '30 Jul 2026' },
    ],
    timeToFill: null,
  },
  {
    id: 'VAC-003',
    title: 'Backend Engineer',
    department: 'Engineering',
    status: 'published',
    dateCreated: '01 Jul 2026',
    location: 'London, UK',
    employmentType: 'Hybrid',
    salaryRange: '£60,000 – £75,000',
    hiringManager: 'Emma Clarke',
    description:
      'We are looking for a Backend Engineer to design resilient APIs and data pipelines for the IntelliHire platform. You will work across Node.js services, PostgreSQL, and cloud infrastructure.',
    requirements: [
      '3+ years building backend services in Node.js or similar',
      'Experience with PostgreSQL and data modeling',
      'Understanding of REST API design and observability',
      'Comfortable with CI/CD and containerized deployments',
    ],
    candidates: [
      { id: 'c1', name: 'Ravi Menon', email: 'ravi.menon@example.com', score: 90, stage: 'shortlisted', appliedDate: '02 Jul 2026', resumeLink: '#resume-VAC-003-c1' },
      { id: 'c2', name: 'Alice Morgan', email: 'alice.morgan@example.com', score: 89, stage: 'shortlisted', appliedDate: '03 Jul 2026', resumeLink: '#resume-VAC-003-c2' },
      { id: 'c3', name: 'Jake Thompson', email: 'jake.thompson@example.com', score: 78, stage: 'applied', appliedDate: '04 Jul 2026', resumeLink: '#resume-VAC-003-c3' },
      { id: 'c4', name: 'Omar Haddad', email: 'omar.haddad@example.com', score: 77, stage: 'applied', appliedDate: '05 Jul 2026', resumeLink: '#resume-VAC-003-c4' },
      { id: 'c5', name: 'Chloe Bennett', email: 'chloe.bennett@example.com', score: 76, stage: 'applied', appliedDate: '06 Jul 2026', resumeLink: '#resume-VAC-003-c5' },
      { id: 'c6', name: 'Sam Okafor', email: 'sam.okafor@example.com', score: 68, stage: 'rejected', appliedDate: '05 Jul 2026', resumeLink: '#resume-VAC-003-c6' },
      { id: 'c7', name: 'Isabelle Moreau', email: 'isabelle.moreau@example.com', score: 61, stage: 'rejected', appliedDate: '07 Jul 2026', resumeLink: '#resume-VAC-003-c7' },
    ],
    interviews: [],
    attendees: [],
    adminReviews: [],
    approvalHistory: [
      { step: 'Submitted', state: 'done', timestamp: '25 Jun 2026' },
      { step: 'Manager Review', state: 'done', timestamp: '27 Jun 2026' },
      { step: 'HR Review', state: 'done', timestamp: '29 Jun 2026' },
      { step: 'Published', state: 'done', timestamp: '01 Jul 2026' },
    ],
    activityLog: [
      { id: 'l1', text: 'Vacancy created', timestamp: '25 Jun 2026' },
      { id: 'l2', text: 'Vacancy published', timestamp: '01 Jul 2026' },
      { id: 'l3', text: '2 candidates shortlisted', timestamp: '10 Jul 2026' },
    ],
    timeToFill: null,
  },
  {
    id: 'VAC-004',
    title: 'BA Intern',
    department: 'Business Analysis',
    status: 'published',
    dateCreated: '18 Jul 2026',
    location: 'London, UK',
    employmentType: 'On-site',
    salaryRange: '£22,000 – £26,000',
    hiringManager: 'Sarah Mahmood',
    description:
      'We are looking for a Business Analysis Intern to join ABC Company for a 6-month placement. You will support requirement gathering, process mapping, and stakeholder documentation across our recruitment platform squad.',
    requirements: [
      'Currently pursuing a degree in Business, IT, or a related field',
      'Strong written and verbal communication',
      'Interest in data analysis and process improvement',
      'Ability to work on-site in London for the internship period',
    ],
    candidates: [
      { id: 'c1', name: 'Emma Watson', email: 'emma.watson@example.com', score: 86, stage: 'shortlisted', appliedDate: '20 Jul 2026', resumeLink: '#resume-VAC-004-c1' },
      { id: 'c2', name: 'James Carter', email: 'james.carter@example.com', score: 84, stage: 'shortlisted', appliedDate: '20 Jul 2026', resumeLink: '#resume-VAC-004-c2' },
      { id: 'c3', name: 'Olivia Brown', email: 'olivia.brown@example.com', score: 79, stage: 'shortlisted', appliedDate: '21 Jul 2026', resumeLink: '#resume-VAC-004-c3' },
    ],
    interviews: [],
    attendees: [],
    adminReviews: [
      { id: 'r1', reviewerName: 'Sarah Mahmood', role: 'Hiring Manager', decision: 'approved', comment: 'Good entry-level pipeline for the intern role.', timestamp: '22 Jul 2026' },
      { id: 'r2', reviewerName: 'David Chen', role: 'HR Business Partner', decision: 'pending', comment: 'Verify university references before scheduling interviews.', timestamp: '24 Jul 2026' },
    ],
    approvalHistory: [
      { step: 'Submitted', state: 'done', timestamp: '14 Jul 2026' },
      { step: 'Manager Review', state: 'done', timestamp: '16 Jul 2026' },
      { step: 'HR Review', state: 'done', timestamp: '17 Jul 2026' },
      { step: 'Published', state: 'done', timestamp: '18 Jul 2026' },
    ],
    activityLog: [
      { id: 'l1', text: 'Vacancy created', timestamp: '14 Jul 2026' },
      { id: 'l2', text: 'Requisition approved', timestamp: '16 Jul 2026' },
      { id: 'l3', text: 'Vacancy published', timestamp: '18 Jul 2026' },
      { id: 'l4', text: '3 candidates shortlisted', timestamp: '22 Jul 2026' },
    ],
    timeToFill: null,
  },
  {
    id: 'VAC-005',
    title: 'Data Analyst',
    department: 'Analytics',
    status: 'draft',
    dateCreated: '20 Jun 2026',
    location: 'Remote',
    employmentType: 'Remote',
    salaryRange: '£38,000 – £48,000',
    hiringManager: 'Rohan Fernando',
    description:
      'We are hiring a Data Analyst to support product analytics, reporting, and experiment analysis. The role will partner with engineering and growth teams to turn raw data into decisions.',
    requirements: [
      'Strong SQL and experience with BI tooling',
      'Python/R for ad-hoc analysis',
      'Statistical grounding (A/B testing, dashboards)',
      'Clear communication of findings to non-technical stakeholders',
    ],
    candidates: [],
    interviews: [],
    attendees: [],
    adminReviews: [],
    approvalHistory: [
      { step: 'Submitted', state: 'done', timestamp: '15 Jun 2026' },
      { step: 'Manager Review', state: 'done', timestamp: '17 Jun 2026' },
      { step: 'HR Review', state: 'current', timestamp: '20 Jun 2026' },
      { step: 'Published', state: 'upcoming', timestamp: '—' },
    ],
    activityLog: [
      { id: 'l1', text: 'Vacancy created', timestamp: '15 Jun 2026' },
      { id: 'l2', text: 'Manager review completed', timestamp: '17 Jun 2026' },
      { id: 'l3', text: 'Awaiting HR approval', timestamp: '20 Jun 2026' },
    ],
    timeToFill: null,
  },
  {
    id: 'VAC-006',
    title: 'DevOps Engineer',
    department: 'Engineering',
    status: 'closed',
    dateCreated: '05 Jun 2026',
    location: 'Manchester, UK',
    employmentType: 'Hybrid',
    salaryRange: '£70,000 – £85,000',
    hiringManager: 'Emma Clarke',
    description:
      'We were hiring a DevOps Engineer to own CI/CD, cloud infrastructure, and site reliability across the platform. This vacancy is now closed following a successful hire.',
    requirements: [
      'Strong AWS/GCP infrastructure experience',
      'Terraform and Kubernetes in production',
      'Observability and incident response experience',
    ],
    candidates: [
      { id: 'c1', name: 'Ankit Sharma', email: 'ankit.sharma@example.com', score: 91, stage: 'hired', appliedDate: '07 Jun 2026', resumeLink: '#resume-VAC-006-c1' },
      { id: 'c2', name: 'Bethany Fox', email: 'bethany.fox@example.com', score: 84, stage: 'rejected', appliedDate: '08 Jun 2026', resumeLink: '#resume-VAC-006-c2' },
      { id: 'c3', name: 'Chris Nolan', email: 'chris.nolan@example.com', score: 79, stage: 'rejected', appliedDate: '09 Jun 2026', resumeLink: '#resume-VAC-006-c3' },
      { id: 'c4', name: 'Deepa Iyer', email: 'deepa.iyer@example.com', score: 74, stage: 'applied', appliedDate: '10 Jun 2026', resumeLink: '#resume-VAC-006-c4' },
    ],
    interviews: [
      { id: 'i1', candidateName: 'Ankit Sharma', date: '15 Jun 2026', time: '11:00 AM', round: 'Round 1', status: 'completed', interviewer: 'Jordan Patel', location: 'Google Meet' },
      { id: 'i2', candidateName: 'Ankit Sharma', date: '19 Jun 2026', time: '02:00 PM', round: 'Round 2', status: 'completed', interviewer: 'Amelia Stone', location: 'Office — Room 3B' },
      { id: 'i3', candidateName: 'Ankit Sharma', date: '23 Jun 2026', time: '10:00 AM', round: 'Panel', status: 'completed', interviewer: 'Emma Clarke', location: 'Office — Room 1A' },
      { id: 'i4', candidateName: 'Bethany Fox', date: '16 Jun 2026', time: '10:00 AM', round: 'Round 1', status: 'cancelled', interviewer: 'Jordan Patel', location: 'Google Meet' },
    ],
    attendees: [
      { id: 'a1', name: 'Jordan Patel', role: 'Senior DevOps Lead', confirmed: true, interviews: ['Round 1 — 15 Jun', 'Round 1 — 16 Jun'], availability: 'Mornings' },
      { id: 'a2', name: 'Amelia Stone', role: 'Engineering Manager', confirmed: true, interviews: ['Round 2 — 19 Jun'], availability: 'Afternoons' },
      { id: 'a3', name: 'Emma Clarke', role: 'Head of Engineering', confirmed: true, interviews: ['Panel — 23 Jun'], availability: 'Flexible' },
    ],
    adminReviews: [
      { id: 'r1', reviewerName: 'Jordan Patel', role: 'Interviewer', decision: 'approved', comment: 'Strong technical depth across infrastructure tooling.', timestamp: '23 Jun 2026' },
      { id: 'r2', reviewerName: 'Emma Clarke', role: 'Hiring Manager', decision: 'approved', comment: 'Offer extended after panel interview.', timestamp: '24 Jun 2026' },
    ],
    approvalHistory: [
      { step: 'Submitted', state: 'done', timestamp: '20 May 2026' },
      { step: 'Manager Review', state: 'done', timestamp: '22 May 2026' },
      { step: 'HR Review', state: 'done', timestamp: '28 May 2026' },
      { step: 'Published', state: 'done', timestamp: '02 Jun 2026' },
    ],
    activityLog: [
      { id: 'l1', text: 'Vacancy created', timestamp: '20 May 2026' },
      { id: 'l2', text: 'Vacancy published', timestamp: '02 Jun 2026' },
      { id: 'l3', text: 'Panel interview completed', timestamp: '23 Jun 2026' },
      { id: 'l4', text: 'Offer accepted by Ankit Sharma', timestamp: '27 Jun 2026' },
      { id: 'l5', text: 'Vacancy closed — position filled', timestamp: '28 Jun 2026' },
    ],
    timeToFill: 38,
  },
  {
    id: 'VAC-007',
    title: 'QA Automation Engineer',
    department: 'Engineering',
    status: 'closed',
    dateCreated: '15 May 2026',
    location: 'London, UK',
    employmentType: 'Hybrid',
    salaryRange: '£50,000 – £62,000',
    hiringManager: 'Jordan Patel',
    description:
      'We were hiring a QA Automation Engineer to build and maintain end-to-end test suites. The vacancy was closed without a hire after the requirements changed.',
    requirements: [
      'Experience with Playwright or Cypress',
      'API testing and CI integration',
      'Strong attention to detail',
    ],
    candidates: [],
    interviews: [],
    attendees: [],
    adminReviews: [],
    approvalHistory: [
      { step: 'Submitted', state: 'done', timestamp: '08 May 2026' },
      { step: 'Manager Review', state: 'done', timestamp: '10 May 2026' },
      { step: 'HR Review', state: 'done', timestamp: '12 May 2026' },
      { step: 'Published', state: 'done', timestamp: '14 May 2026' },
    ],
    activityLog: [
      { id: 'l1', text: 'Vacancy created', timestamp: '08 May 2026' },
      { id: 'l2', text: 'Vacancy published', timestamp: '14 May 2026' },
      { id: 'l3', text: 'Vacancy closed — requirements changed', timestamp: '30 Jun 2026' },
    ],
    timeToFill: null,
  },
];

/* ─────────────────────────────────────────────────────────────
   Derived helpers — used by both the list and the detail views.
   ───────────────────────────────────────────────────────────── */

export function getStageCounts(vacancy) {
  const counts = {
    applied: 0,
    shortlisted: 0,
    interviewed: 0,
    offer: 0,
    hired: 0,
    rejected: 0,
  };
  (vacancy.candidates || []).forEach((candidate) => {
    if (counts[candidate.stage] !== undefined) counts[candidate.stage] += 1;
  });
  return counts;
}

/**
 * Funnel: Applied → Shortlisted → Interviewed → Hired.
 * Shortlisted includes everyone past the applied stage; Interviewed
 * includes everyone who has been through an interview (incl. offer/hired).
 */
export function getFunnel(vacancy) {
  const counts = getStageCounts(vacancy);
  const total = (vacancy.candidates || []).length;
  return {
    total,
    applied: total,
    shortlisted: counts.shortlisted + counts.interviewed + counts.offer + counts.hired,
    interviewed: counts.interviewed + counts.offer + counts.hired,
    hired: counts.hired,
    rejected: counts.rejected,
  };
}

export function getShortlisted(vacancy) {
  return (vacancy.candidates || [])
    .filter((candidate) =>
      ['shortlisted', 'interviewed', 'offer', 'hired'].includes(candidate.stage),
    )
    .sort((a, b) => b.score - a.score);
}

export function getAvgMatchScore(vacancy) {
  const scores = (vacancy.candidates || [])
    .map((candidate) => candidate.score)
    .filter((score) => Number.isFinite(score));
  if (!scores.length) return null;
  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
}

/**
 * Current recruitment stage for the progress tracker.
 */
export function deriveStage(vacancy) {
  const counts = getStageCounts(vacancy);
  if (vacancy.status === 'closed') {
    return counts.hired > 0 ? 'hired' : 'closed';
  }
  if (!vacancy.candidates || vacancy.candidates.length === 0) {
    return vacancy.status === 'draft' ? 'requisition' : 'sourcing';
  }
  if (counts.hired > 0) return 'hired';
  if (counts.offer > 0) return 'offer';
  if (counts.interviewed > 0) return 'interviewing';
  if (counts.shortlisted > 0) return 'shortlisted';
  return 'screening';
}

/**
 * Next-step callout text — generated from real vacancy data and
 * never blank (falls back when the vacancy has no applicants).
 */
export function deriveNextStep(vacancy) {
  const counts = getStageCounts(vacancy);
  const total = (vacancy.candidates || []).length;

  if (vacancy.status === 'closed') {
    return counts.hired > 0
      ? 'Position filled — offer accepted'
      : 'Position closed — no candidate selected';
  }
  if (total === 0) {
    return 'No activity yet — share the vacancy to start sourcing';
  }
  if (counts.hired > 0) return 'Position filled — offer accepted';
  if (counts.offer > 0) {
    return `Awaiting offer decision for ${counts.offer} candidate${counts.offer > 1 ? 's' : ''}`;
  }
  const scheduled = (vacancy.interviews || []).filter(
    (interview) => interview.status === 'scheduled',
  );
  if (scheduled.length > 0) {
    return `${scheduled.length} interview${scheduled.length > 1 ? 's' : ''} scheduled for ${
      scheduled[0].date
    }`;
  }
  if (counts.shortlisted > 0) {
    return `${counts.shortlisted} candidate${counts.shortlisted > 1 ? 's' : ''} shortlisted — schedule interviews`;
  }
  return `Review ${counts.applied} applicant${counts.applied > 1 ? 's' : ''} and shortlist the strongest matches`;
}

/**
 * Tracker node states: done = success, current = warning, upcoming = neutral.
 */
export function getTrackerStates(vacancy) {
  const stage = deriveStage(vacancy);
  const currentIdx =
    stage === 'hired'
      ? TRACKER_STAGES.length - 1
      : TRACKER_STAGES.findIndex((node) => node.id === stage);

  return TRACKER_STAGES.map((node, index) => {
    let state;
    if (stage === 'hired') {
      state = 'done';
    } else if (index < currentIdx) {
      state = 'done';
    } else if (index === currentIdx) {
      state = 'current';
    } else {
      state = 'upcoming';
    }
    return { ...node, state };
  });
}

export function getOutcome(vacancy) {
  const counts = getStageCounts(vacancy);
  if (vacancy.status === 'closed') {
    return counts.hired > 0
      ? { key: 'filled', label: 'Filled' }
      : { key: 'closed unfilled', label: 'Closed unfilled' };
  }
  return { key: 'still open', label: 'Still open' };
}
