/**
 * vacancies.js — shared vacancy dataset + process definitions.
 *
 * Owns the vacancy records (id, title, department, status, job details,
 * panel attendees, admin reviews, approval history, activity log) that
 * the Active Vacancies list (VacancyManagementPage) and the Vacancy
 * Detail Dashboard (VacancyDetailPage) both read from, so the detail
 * view always shows the same id / title / department / status as the
 * list row.
 *
 * Applicant-stage records live in data/applicants.js and interview
 * records live in data/interviews.js — both keyed by `vacancyId` — so
 * the dashboard aggregates those shared sources instead of owning a
 * separate copy. The derived funnel/tracker/next-step helpers are also
 * in data/applicants.js.
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
    attendees: [
      { id: 'a1', name: 'Jordan Patel', role: 'Senior Frontend Lead', confirmed: true, interviews: ['Round 1 — 24 Jul', 'Round 1 — 28 Jul', 'Round 1 — 29 Jul'], availability: 'Mornings' },
      { id: 'a2', name: 'Amelia Stone', role: 'Engineering Manager', confirmed: true, interviews: ['Round 2 — 31 Jul', 'Panel — 02 Aug'], availability: 'Afternoons' },
      { id: 'a3', name: 'Rohan Fernando', role: 'Product Manager', confirmed: false, interviews: ['Panel — 02 Aug'], availability: 'Flexible' },
    ],
    panels: [
      {
        id: 'panel-a',
        name: 'Panel A (Technical Leads)',
        meetingType: 'Google Meet',
        meetingLink: 'https://meet.google.com/sde-conf-mtg',
        roundLabel: 'Round 1 · Technical / Live Coding',
        members: [
          { id: 'm1', name: 'Saman Tech', role: 'Technical Lead', email: 'saman.tech@company.com' },
          { id: 'm2', name: 'Jordan Patel', role: 'Senior Frontend Lead', email: 'jordan.patel@company.com' },
        ],
      },
      {
        id: 'panel-b',
        name: 'Panel B (HR Screening)',
        meetingType: 'In-Person',
        meetingLink: 'Innovation Hub — Interview Suite 102',
        roundLabel: 'Round 1 · HR Screening',
        members: [
          { id: 'm3', name: 'Nirosha HR', role: 'HR Manager', email: 'nirosha.hr@company.com' },
          { id: 'm4', name: 'Dilhani Wickramasinghe', role: 'Talent Acquisition Lead', email: 'dilhani.w@company.com' },
        ],
      },
      {
        id: 'panel-c',
        name: 'Panel C (System Design)',
        meetingType: 'MS Teams',
        meetingLink: 'https://teams.microsoft.com/l/meetup-join/intelli-frontend-c',
        roundLabel: 'Round 2 · System Design Architecture',
        members: [
          { id: 'm5', name: 'Ruwan Bandara', role: 'Principal Engineer', email: 'ruwan.b@company.com' },
          { id: 'm6', name: 'Ishara Gunasekara', role: 'Engineering Manager', email: 'ishara.g@company.com' },
          { id: 'm7', name: 'Tharindu Jayawardena', role: 'Staff Architect', email: 'tharindu.j@company.com' },
        ],
      },
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
    attendees: [
      { id: 'a1', name: 'Amelia Stone', role: 'Design Director', confirmed: true, interviews: ['Round 1 — 04 Aug', 'Round 2 — 06 Aug'], availability: 'Flexible' },
      { id: 'a2', name: 'Rohan Fernando', role: 'Product Manager', confirmed: true, interviews: ['Round 1 — 04 Aug'], availability: 'Mornings' },
      { id: 'a3', name: 'Lucy Grant', role: 'UX Researcher', confirmed: false, interviews: ['Round 2 — 06 Aug'], availability: 'Afternoons' },
    ],
    panels: [],
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
    attendees: [],
    panels: [
      {
        id: 'panel-a',
        name: 'Panel A (Technical Leads)',
        meetingType: 'MS Teams',
        meetingLink: 'https://teams.microsoft.com/l/meetup-join/intelli-backend-a',
        roundLabel: 'Round 1 · Technical / Live Coding',
        members: [
          { id: 'm1', name: 'Saman Tech', role: 'Technical Lead', email: 'saman.tech@company.com' },
          { id: 'm2', name: 'Malith Senanayake', role: 'QA Automation Engineer', email: 'malith.s@company.com' },
        ],
      },
    ],
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
    attendees: [],
    panels: [
      {
        id: 'panel-a',
        name: 'Panel A (Technical Assessment)',
        meetingType: 'Google Meet',
        meetingLink: 'https://meet.google.com/fst-arch-rev',
        roundLabel: 'Round 1 · Technical / Live Coding',
        members: [
          { id: 'm1', name: 'Saman Tech', role: 'Technical Lead', email: 'saman.tech@company.com' },
          { id: 'm2', name: 'Kasun Silva', role: 'Business Systems Analyst', email: 'kasun.silva@company.com' },
        ],
      },
      {
        id: 'panel-b',
        name: 'Panel B (HR Screening)',
        meetingType: 'Phone Screening',
        meetingLink: '+44 20 1234 5678',
        roundLabel: 'Round 1 · HR Screening',
        members: [
          { id: 'm3', name: 'Nirosha HR', role: 'HR Manager', email: 'nirosha.hr@company.com' },
          { id: 'm4', name: 'Sarah Mahmood', role: 'Hiring Manager', email: 'sarah.mahmood@company.com' },
        ],
      },
      {
        id: 'panel-c',
        name: 'Panel C (System Design)',
        meetingType: 'In-Person',
        meetingLink: 'Innovation Hub — Executive Boardroom A',
        roundLabel: 'Round 2 · System Design Architecture',
        members: [
          { id: 'm5', name: 'Ruwan Bandara', role: 'Principal Engineer', email: 'ruwan.b@company.com' },
          { id: 'm6', name: 'Ishara Gunasekara', role: 'Engineering Manager', email: 'ishara.g@company.com' },
          { id: 'm7', name: 'Tharindu Jayawardena', role: 'Staff Architect', email: 'tharindu.j@company.com' },
        ],
      },
      {
        id: 'panel-d',
        name: 'Panel D (Final Cultural Fit)',
        meetingType: 'Google Meet',
        meetingLink: 'https://meet.google.com/pdr-dsgn-rev',
        roundLabel: 'Round 3 · Final Cultural Fit',
        members: [
          { id: 'm8', name: 'Amelia Stone', role: 'Design Director', email: 'amelia.stone@company.com' },
          { id: 'm9', name: 'Emma Clarke', role: 'Hiring Manager', email: 'emma.clarke@company.com' },
          { id: 'm10', name: 'Rohan Fernando', role: 'Product Manager', email: 'rohan.f@company.com' },
          { id: 'm11', name: 'Lucy Grant', role: 'UX Researcher', email: 'lucy.grant@company.com' },
          { id: 'm12', name: 'David Chen', role: 'HR Business Partner', email: 'david.chen@company.com' },
        ],
      },
    ],
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
