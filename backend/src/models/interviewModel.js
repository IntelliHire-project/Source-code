const db = require('../config/db');

// Default Panel Members with Availability Constraints
const DEFAULT_PANEL_MEMBERS = [
  {
    id: 'pm-1',
    name: 'Saman Tech',
    email: 'saman.tech@company.com',
    role: 'Technical Lead & Interviewer',
    department: 'Engineering',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    specialties: ['React', 'Node.js', 'System Architecture'],
    availableHours: '09:00 AM – 05:00 PM',
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    maxDailyInterviews: 4,
    status: 'AVAILABLE',
  },
  {
    id: 'pm-2',
    name: 'Nirosha HR',
    email: 'nirosha.hr@company.com',
    role: 'HR Manager & Culture Fit Interviewer',
    department: 'Human Resources',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    specialties: ['HR Screening', 'Culture Fit', 'Portfolio Review'],
    availableHours: '09:00 AM – 05:00 PM',
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    maxDailyInterviews: 5,
    status: 'AVAILABLE',
  },
  {
    id: 'pm-3',
    name: 'Dilhani Wickramasinghe',
    email: 'dilhani.w@company.com',
    role: 'Talent Acquisition Lead',
    department: 'Talent Acquisition',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    specialties: ['Talent Sourcing', 'Behavioral Interview', 'Leadership'],
    availableHours: '09:00 AM – 05:00 PM',
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    maxDailyInterviews: 4,
    status: 'AVAILABLE',
  },
  {
    id: 'pm-4',
    name: 'Ruwan Bandara',
    email: 'ruwan.b@company.com',
    role: 'Principal Engineer & System Architect',
    department: 'Platform Engineering',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    specialties: ['Distributed Systems', 'Cloud & DevOps', 'Database Architecture'],
    availableHours: '09:00 AM – 05:00 PM',
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    maxDailyInterviews: 4,
    status: 'AVAILABLE',
  },
];

/**
 * Format date to 'YYYY-MM-DD'
 */
const toIsoDateString = (d) => {
  if (!d) return '2026-11-05';
  if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d.trim())) return d.trim();
  const dateObj = new Date(d);
  if (isNaN(dateObj.getTime())) return '2026-11-05';
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Format date to 'DD Mon YYYY'
 */
const toDisplayDateString = (d) => {
  if (!d) return '';
  const dateObj = new Date(d);
  if (isNaN(dateObj.getTime())) return String(d);
  return dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

/**
 * Format raw interview_slots row for frontend consumption
 */
const formatSlotRow = (row) => {
  if (!row) return null;

  const isoDate = toIsoDateString(row.interview_date);
  const displayDate = toDisplayDateString(row.interview_date);

  // Derive panelMember object from panel_name or defaults
  let panelMember = DEFAULT_PANEL_MEMBERS[0];
  if (row.panel_name) {
    const pNameLower = row.panel_name.toLowerCase();
    const roundLower = (row.round || '').toLowerCase();
    const posLower = (row.job_position || '').toLowerCase();

    if (pNameLower.includes('dilhani') || pNameLower.includes('panel b') || roundLower.includes('design') || posLower.includes('design')) {
      panelMember = DEFAULT_PANEL_MEMBERS[2]; // Dilhani Wickramasinghe
    } else if (pNameLower.includes('ruwan') || pNameLower.includes('panel c') || roundLower.includes('architect') || posLower.includes('intern') || posLower.includes('ba')) {
      panelMember = DEFAULT_PANEL_MEMBERS[3]; // Ruwan Bandara
    } else if (pNameLower.includes('nirosha') || (pNameLower.includes('hr') && !pNameLower.includes('tech'))) {
      panelMember = DEFAULT_PANEL_MEMBERS[1]; // Nirosha HR
    } else {
      panelMember = DEFAULT_PANEL_MEMBERS[0]; // Saman Tech
    }
  }

  // Construct candidate object from joined interview_allocations columns (if allocated)
  let candidate = null;
  if (row.candidate_name || row.candidate_app_id) {
    candidate = {
      id: row.candidate_app_id || `APP-${row.allocation_id || row.id}`,
      name: row.candidate_name,
      email: row.candidate_email || '',
      avatar: row.candidate_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      matchScore: row.match_score ? parseFloat(row.match_score) : 80,
    };
  }

  // Construct evaluation object from joined interview_evaluations columns (if evaluated)
  let evaluation = null;
  if (row.eval_recommendation || row.eval_score) {
    evaluation = {
      id: row.eval_id,
      score: row.eval_score || 4,
      techSkills: row.tech_skills || 0,
      commSkills: row.comm_skills || 0,
      problemSolving: row.problem_solving || 0,
      teamwork: row.teamwork || 0,
      overallRating: row.overall_rating ? parseFloat(row.overall_rating) : (row.eval_score || 4.0),
      strengths: row.eval_strengths || '',
      improvements: row.eval_improvements || '',
      recommendation: row.eval_recommendation || 'HIRE',
      evaluatedBy: row.evaluated_by || panelMember.name || 'Saman Tech',
      submittedAt: row.eval_submitted_at ? toDisplayDateString(row.eval_submitted_at) : '22 Oct 2026',
    };
  }

  return {
    id: row.id,
    vacancyId: row.vacancy_id,
    jobPosition: row.job_position || 'Senior Software Engineer',
    round: row.round || 'Technical Interview',
    interviewDate: isoDate,
    displayDate,
    startTime: row.start_time || '09:30 AM',
    endTime: row.end_time || '10:30 AM',
    interviewType: row.interview_type || 'Online',
    status: row.status || 'AVAILABLE',
    meetingLocation: row.meeting_location || 'https://meet.google.com/new',
    capacity: row.capacity || 1,
    bookedCount: candidate ? 1 : (row.booked_count || 0),
    panelName: row.panel_name || panelMember.name,
    panelEmails: panelMember.email || '',
    panelMember,
    candidate,
    evaluation,
    additionalNotes: row.additional_notes || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

let isSeeding = false;

/**
 * Seed initial interview slots if database table is empty
 */
const seedInitialSlotsIfEmpty = async () => {
  if (isSeeding) return;
  isSeeding = true;
  try {
    const { rows } = await db.query('SELECT COUNT(*) AS count FROM interview_slots');
    if (parseInt(rows[0].count, 10) > 0) {
      isSeeding = false;
      return;
    }

    // Reset sequences to start cleanly from 1
    await db.query('ALTER SEQUENCE IF EXISTS interview_slots_id_seq RESTART WITH 1');
    await db.query('ALTER SEQUENCE IF EXISTS interview_allocations_id_seq RESTART WITH 1');
    await db.query('ALTER SEQUENCE IF EXISTS interview_reschedule_requests_id_seq RESTART WITH 1');
    await db.query('ALTER SEQUENCE IF EXISTS interview_evaluations_id_seq RESTART WITH 1');

    const initialSlots = [
      {
        job_position: 'Senior Software Engineer',
        round: 'Technical Interview',
        interview_date: '2026-10-22',
        start_time: '09:30 AM',
        end_time: '10:30 AM',
        interview_type: 'Online',
        status: 'COMPLETED',
        meeting_location: 'https://meet.google.com/new',
        capacity: 1,
        booked_count: 1,
        panel_name: 'Panel A (Technical Leads)',
        panel_emails: 'saman.tech@company.com',
        panel_member: JSON.stringify(DEFAULT_PANEL_MEMBERS[0]),
        candidate: JSON.stringify({
          id: 'APP-000',
          name: 'Danushka Silva',
          email: 'danushka.silva@example.com',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          matchScore: 92,
        }),
        evaluation: JSON.stringify({
          score: 4,
          strengths: 'Demonstrated exceptional understanding of React performance optimization, state management, and clean architecture principles.',
          improvements: 'Can further explore advanced Redis caching and automated end-to-end testing pipelines.',
          recommendation: 'HIRE',
          evaluatedBy: 'Saman Tech',
          submittedAt: '22 Oct 2026',
        }),
        additional_notes: 'Live coding session completed. Architecture evaluation and problem-solving interview.',
      },
      {
        job_position: 'Senior Software Engineer',
        round: 'HR Portfolio Review',
        interview_date: '2026-11-20',
        start_time: '02:00 PM',
        end_time: '03:00 PM',
        interview_type: 'Physical',
        status: 'RESCHEDULE_REQUESTED',
        meeting_location: 'Innovation Hub — Interview Suite 102',
        capacity: 1,
        booked_count: 1,
        panel_name: 'Panel A (Technical Leads)',
        panel_emails: 'nirosha.hr@company.com',
        panel_member: JSON.stringify(DEFAULT_PANEL_MEMBERS[1]),
        candidate: JSON.stringify({
          id: 'APP-002',
          name: 'Kamal Perera',
          email: 'kamal.perera@example.com',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          matchScore: 82,
        }),
        additional_notes: 'Review portfolio artifacts, team leadership experience, and cultural fit.',
      },
      {
        job_position: 'Senior Software Engineer',
        round: 'System Architecture',
        interview_date: '2026-11-21',
        start_time: '11:00 AM',
        end_time: '12:00 PM',
        interview_type: 'Online',
        status: 'SCHEDULED',
        meeting_location: 'https://meet.google.com/new',
        capacity: 1,
        booked_count: 1,
        panel_name: 'Panel A (Technical Leads)',
        panel_emails: 'ruwan.b@company.com',
        panel_member: JSON.stringify(DEFAULT_PANEL_MEMBERS[3]),
        candidate: JSON.stringify({
          id: 'APP-003',
          name: 'Nimal Silva',
          email: 'nimal.silva@example.com',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
          matchScore: 79,
        }),
        additional_notes: 'Upcoming technical round. Evaluation is locked until the interview date has arrived.',
      },
      {
        job_position: 'Senior Software Engineer',
        round: 'Technical Interview',
        interview_date: '2026-11-20',
        start_time: '09:30 AM',
        end_time: '10:30 AM',
        interview_type: 'Online',
        status: 'SCHEDULED',
        meeting_location: 'https://meet.google.com/new',
        capacity: 1,
        booked_count: 1,
        panel_name: 'Panel A (Technical Leads)',
        panel_emails: 'saman.tech@company.com',
        panel_member: JSON.stringify(DEFAULT_PANEL_MEMBERS[0]),
        candidate: JSON.stringify({
          id: 'APP-001',
          name: 'Alice Fernando',
          email: 'alice.fernando@example.com',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          matchScore: 88,
        }),
        additional_notes: 'Live coding session and React performance assessment round. Evaluation unlocks on the interview date.',
      },
      {
        job_position: 'Senior Software Engineer',
        round: 'Technical Interview',
        interview_date: '2026-11-05',
        start_time: '10:00 AM',
        end_time: '11:00 AM',
        interview_type: 'Online',
        status: 'AVAILABLE',
        meeting_location: 'https://meet.google.com/new',
        capacity: 2,
        booked_count: 0,
        panel_name: 'Panel A (Technical Leads)',
        panel_emails: 'techlead@company.com',
        panel_member: JSON.stringify(DEFAULT_PANEL_MEMBERS[0]),
        additional_notes: 'Available open slot for technical screening.',
      },
      {
        job_position: 'Backend Engineer',
        round: 'API Design & Database',
        interview_date: '2026-11-06',
        start_time: '01:30 PM',
        end_time: '02:30 PM',
        interview_type: 'Physical',
        status: 'AVAILABLE',
        meeting_location: 'Main Office Conference Room',
        capacity: 2,
        booked_count: 0,
        panel_name: 'Panel B (Backend Engineering)',
        panel_emails: 'techlead@company.com',
        panel_member: JSON.stringify(DEFAULT_PANEL_MEMBERS[3]),
        additional_notes: 'In-person architecture and database design interview.',
      },
      {
        job_position: 'UI/UX Designer',
        round: 'Design Portfolio Review',
        interview_date: '2026-11-10',
        start_time: '03:00 PM',
        end_time: '04:00 PM',
        interview_type: 'Online',
        status: 'AVAILABLE',
        meeting_location: 'https://meet.google.com/new',
        capacity: 2,
        booked_count: 0,
        panel_name: 'Panel C (Product & Design)',
        panel_emails: 'hr@company.com',
        panel_member: JSON.stringify(DEFAULT_PANEL_MEMBERS[1]),
        additional_notes: 'Figma portfolio walkthrough and design system critique.',
      },
    ];

    for (let i = 0; i < initialSlots.length; i++) {
      const slot = initialSlots[i];
      const targetId = i + 1;
      const res = await db.query(
        `INSERT INTO interview_slots (
          id, job_position, round, interview_date, start_time, end_time,
          interview_type, status, meeting_location, capacity, booked_count,
          panel_name, additional_notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING id`,
        [
          targetId,
          slot.job_position, slot.round, slot.interview_date, slot.start_time, slot.end_time,
          slot.interview_type, slot.status, slot.meeting_location, slot.capacity, slot.booked_count,
          slot.panel_name, slot.additional_notes,
        ]
      );

      const slotId = res.rows[0].id;
      if (slot.candidate) {
        const c = typeof slot.candidate === 'string' ? JSON.parse(slot.candidate) : slot.candidate;
        await db.query(
          `INSERT INTO interview_allocations (
            id, slot_id, candidate_app_id, candidate_name, candidate_email, candidate_avatar,
            match_score, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'ALLOCATED')`,
          [
            targetId, slotId, c.id, c.name, c.email, c.avatar || null,
            c.matchScore || 0,
          ]
        );
      }

      if (slot.status === 'RESCHEDULE_REQUESTED') {
        await db.query(
          `INSERT INTO interview_reschedule_requests (
            id, slot_id, requested_by, reason_category, detailed_reason, proposed_slots, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            1,
            slotId,
            'PANEL_MEMBER',
            'Schedule Conflict / Urgent Meeting',
            'Prior urgent leadership sync scheduled at this time. Requesting to reschedule to an alternative slot.',
            JSON.stringify([
              { id: 'prop-1', date: '2026-11-05', displayDate: '05 Nov 2026', startTime: '10:00 AM', endTime: '11:00 AM' },
              { id: 'prop-2', date: '2026-11-06', displayDate: '06 Nov 2026', startTime: '03:30 PM', endTime: '04:30 PM' },
            ]),
            'PENDING',
          ]
        );
      }

      if (slot.evaluation) {
        const ev = typeof slot.evaluation === 'string' ? JSON.parse(slot.evaluation) : slot.evaluation;
        await db.query(
          `INSERT INTO interview_evaluations (
            id, slot_id, score, strengths, improvements, recommendation, evaluated_by
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            1, slotId, ev.score || 4,
            ev.strengths || '', ev.improvements || '', ev.recommendation || 'HIRE', ev.evaluatedBy || 'Saman Tech',
          ]
        );
      }
    }

    // Set sequence values to max ID so subsequent inserts start cleanly at 7, 8, 9...
    await db.query(`SELECT setval('interview_slots_id_seq', (SELECT COALESCE(MAX(id), 1) FROM interview_slots))`);
    await db.query(`SELECT setval('interview_allocations_id_seq', (SELECT COALESCE(MAX(id), 1) FROM interview_allocations))`);
    await db.query(`SELECT setval('interview_reschedule_requests_id_seq', (SELECT COALESCE(MAX(id), 1) FROM interview_reschedule_requests))`);
    await db.query(`SELECT setval('interview_evaluations_id_seq', (SELECT COALESCE(MAX(id), 1) FROM interview_evaluations))`);
  } catch (err) {
    console.error('Error seeding initial interview slots:', err.message);
  } finally {
    isSeeding = false;
  }
};

/**
 * Fetch all interview slots with optional filters
 */
const getAllInterviewSlots = async (filters = {}) => {
  await seedInitialSlotsIfEmpty();

  let query = `
    SELECT 
      s.id, s.vacancy_id, s.job_position, s.round, s.interview_date, 
      s.start_time, s.end_time, s.interview_type, s.status, 
      s.meeting_location, s.capacity, s.booked_count, s.panel_name, 
      s.additional_notes, s.created_at, s.updated_at,
      a.id AS allocation_id, a.candidate_app_id, a.candidate_name, a.candidate_email, a.candidate_avatar, a.match_score,
      e.id AS eval_id, e.score AS eval_score, e.tech_skills, e.comm_skills, e.problem_solving, e.teamwork, 
      e.overall_rating, e.recommendation AS eval_recommendation, e.strengths AS eval_strengths, 
      e.improvements AS eval_improvements, e.evaluated_by, e.submitted_at AS eval_submitted_at
    FROM interview_slots s
    LEFT JOIN (
      SELECT DISTINCT ON (slot_id) *
      FROM interview_allocations
      ORDER BY slot_id, id DESC
    ) a ON a.slot_id = s.id
    LEFT JOIN (
      SELECT DISTINCT ON (slot_id) *
      FROM interview_evaluations
      ORDER BY slot_id, id DESC
    ) e ON e.slot_id = s.id
  `;
  const conditions = [];
  const values = [];

  if (filters.vacancyId) {
    values.push(filters.vacancyId);
    conditions.push(`s.vacancy_id = $${values.length}`);
  }

  if (filters.status) {
    values.push(filters.status);
    conditions.push(`s.status = $${values.length}`);
  }

  if (filters.round) {
    values.push(filters.round);
    conditions.push(`s.round = $${values.length}`);
  }

  if (filters.date) {
    values.push(filters.date);
    conditions.push(`s.interview_date = $${values.length}`);
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' AND ')}`;
  }

  query += ' ORDER BY s.interview_date ASC, s.start_time ASC';

  const { rows } = await db.query(query, values);
  return rows.map(formatSlotRow);
};

/**
 * Fetch single interview slot by ID
 */
const getInterviewSlotById = async (id) => {
  const query = `
    SELECT 
      s.id, s.vacancy_id, s.job_position, s.round, s.interview_date, 
      s.start_time, s.end_time, s.interview_type, s.status, 
      s.meeting_location, s.capacity, s.booked_count, s.panel_name, 
      s.additional_notes, s.created_at, s.updated_at,
      a.id AS allocation_id, a.candidate_app_id, a.candidate_name, a.candidate_email, a.candidate_avatar, a.match_score,
      e.id AS eval_id, e.score AS eval_score, e.tech_skills, e.comm_skills, e.problem_solving, e.teamwork, 
      e.overall_rating, e.recommendation AS eval_recommendation, e.strengths AS eval_strengths, 
      e.improvements AS eval_improvements, e.evaluated_by, e.submitted_at AS eval_submitted_at
    FROM interview_slots s
    LEFT JOIN (
      SELECT DISTINCT ON (slot_id) *
      FROM interview_allocations
      ORDER BY slot_id, id DESC
    ) a ON a.slot_id = s.id
    LEFT JOIN (
      SELECT DISTINCT ON (slot_id) *
      FROM interview_evaluations
      ORDER BY slot_id, id DESC
    ) e ON e.slot_id = s.id
    WHERE s.id = $1
  `;
  const { rows } = await db.query(query, [id]);
  if (rows.length === 0) return null;
  return formatSlotRow(rows[0]);
};

/**
 * Create a new interview slot
 */
const createInterviewSlot = async (slotData) => {
  const {
    vacancyId = null,
    jobPosition = 'Senior Software Engineer',
    round = 'Technical Interview',
    interviewDate,
    startTime = '09:30 AM',
    endTime = '10:30 AM',
    interviewType = 'Online',
    status = 'AVAILABLE',
    meetingLocation = 'https://meet.google.com/new',
    capacity = 1,
    panelName = 'Panel A (Technical Leads)',
    candidate = null,
    additionalNotes = '',
  } = slotData;

  const isoDate = toIsoDateString(interviewDate);
  const initialStatus = candidate ? 'SCHEDULED' : status;
  const bookedCount = candidate ? 1 : 0;

  const { rows } = await db.query(
    `INSERT INTO interview_slots (
      vacancy_id, job_position, round, interview_date, start_time, end_time,
      interview_type, status, meeting_location, capacity, booked_count,
      panel_name, additional_notes
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING id`,
    [
      vacancyId, jobPosition, round, isoDate, startTime, endTime,
      interviewType, initialStatus, meetingLocation, capacity, bookedCount,
      panelName, additionalNotes,
    ]
  );

  const slotId = rows[0].id;

  // If a candidate was assigned during slot creation (e.g. from Auto-Allocate or matching in Time Slot modal)
  if (candidate) {
    const candObj = typeof candidate === 'string' ? JSON.parse(candidate) : candidate;
    const candidateAppId = candObj.id || candObj.candidateId || `APP-${Date.now().toString().slice(-4)}`;
    const candidateName = candObj.name || candObj.candidateName;
    const candidateEmail = candObj.email || candObj.candidateEmail || '';
    const candidateAvatar = candObj.avatar || '';
    const matchScore = candObj.matchScore || candObj.score || 0;

    await db.query(
      'DELETE FROM interview_allocations WHERE candidate_app_id = $1 OR (candidate_name = $2 AND candidate_name IS NOT NULL)',
      [candidateAppId, candidateName]
    );

    await db.query(
      `INSERT INTO interview_allocations (
        slot_id, candidate_app_id, candidate_name, candidate_email, candidate_avatar,
        match_score, status
      ) VALUES ($1, $2, $3, $4, $5, $6, 'ALLOCATED')`,
      [
        slotId, candidateAppId, candidateName, candidateEmail, candidateAvatar,
        matchScore,
      ]
    );
  }

  return getInterviewSlotById(slotId);
};

/**
 * Bulk create interview slots
 */
const bulkCreateInterviewSlots = async (slotsArray) => {
  const created = [];
  for (const s of slotsArray) {
    const item = await createInterviewSlot(s);
    created.push(item);
  }
  return created;
};

/**
 * Update an existing interview slot
 */
const updateInterviewSlot = async (id, slotData) => {
  const existing = await getInterviewSlotById(id);
  if (!existing) return null;

  const jobPosition = slotData.jobPosition !== undefined ? slotData.jobPosition : existing.jobPosition;
  const round = slotData.round !== undefined ? slotData.round : existing.round;
  const interviewDate = slotData.interviewDate !== undefined ? toIsoDateString(slotData.interviewDate) : existing.interviewDate;
  const startTime = slotData.startTime !== undefined ? slotData.startTime : existing.startTime;
  const endTime = slotData.endTime !== undefined ? slotData.endTime : existing.endTime;
  const interviewType = slotData.interviewType !== undefined ? slotData.interviewType : existing.interviewType;
  const status = slotData.status !== undefined ? slotData.status : existing.status;
  const meetingLocation = slotData.meetingLocation !== undefined ? slotData.meetingLocation : existing.meetingLocation;
  const capacity = slotData.capacity !== undefined ? slotData.capacity : existing.capacity;
  const panelName = slotData.panelName !== undefined ? slotData.panelName : existing.panelName;
  const additionalNotes = slotData.additionalNotes !== undefined ? slotData.additionalNotes : existing.additionalNotes;

  await db.query(
    `UPDATE interview_slots SET
      job_position = $1, round = $2, interview_date = $3, start_time = $4, end_time = $5,
      interview_type = $6, status = $7, meeting_location = $8, capacity = $9,
      panel_name = $10, additional_notes = $11, updated_at = NOW()
    WHERE id = $12`,
    [
      jobPosition, round, interviewDate, startTime, endTime,
      interviewType, status, meetingLocation, capacity,
      panelName, additionalNotes, id,
    ]
  );

  if (slotData.candidate !== undefined) {
    if (slotData.candidate) {
      const candObj = typeof slotData.candidate === 'string' ? JSON.parse(slotData.candidate) : slotData.candidate;
      const candidateAppId = candObj.id || candObj.candidateId || `APP-${Date.now().toString().slice(-4)}`;
      const candidateName = candObj.name || candObj.candidateName;
      const candidateEmail = candObj.email || candObj.candidateEmail || '';
      const candidateAvatar = candObj.avatar || '';
      const matchScore = candObj.matchScore || candObj.score || 0;

      await db.query(
        'DELETE FROM interview_allocations WHERE candidate_app_id = $1 OR (candidate_name = $2 AND candidate_name IS NOT NULL)',
        [candidateAppId, candidateName]
      );

      await db.query(
        `INSERT INTO interview_allocations (
          slot_id, candidate_app_id, candidate_name, candidate_email, candidate_avatar,
          match_score, status
        ) VALUES ($1, $2, $3, $4, $5, $6, 'ALLOCATED')`,
        [id, candidateAppId, candidateName, candidateEmail, candidateAvatar, matchScore]
      );
      await db.query("UPDATE interview_slots SET booked_count = 1, status = 'SCHEDULED' WHERE id = $1", [id]);
    } else {
      await db.query('DELETE FROM interview_allocations WHERE slot_id = $1', [id]);
      await db.query("UPDATE interview_slots SET booked_count = 0, status = 'AVAILABLE' WHERE id = $1 AND status != 'COMPLETED'", [id]);
    }
  }

  return getInterviewSlotById(id);
};

/**
 * Delete an interview slot
 */
const deleteInterviewSlot = async (id) => {
  const { rowCount } = await db.query('DELETE FROM interview_slots WHERE id = $1', [id]);
  return rowCount > 0;
};

/**
 * Candidate Allocation logic: Allocate a candidate to a slot
 */
const allocateCandidateToSlot = async (slotId, candidateData) => {
  let slot = null;
  const cleanId = parseInt(String(slotId).replace(/\D/g, ''), 10);
  if (!isNaN(cleanId)) {
    slot = await getInterviewSlotById(cleanId);
  }

  // If slot not found by direct ID (e.g. from frontend mock slots or custom keys), find an available slot or create one
  if (!slot) {
    const available = await getAllInterviewSlots({ status: 'AVAILABLE' });
    if (available.length > 0) {
      slot = available[0];
    } else {
      slot = await createInterviewSlot({
        jobPosition: candidateData.jobPosition || candidateData.role || 'Senior Software Engineer',
        round: candidateData.interviewRound || candidateData.round || 'Technical Interview',
        interviewDate: candidateData.interviewDate || '2026-11-20',
        startTime: candidateData.startTime || '09:30 AM',
        endTime: candidateData.endTime || '10:30 AM',
        interviewType: candidateData.interviewType || 'Online',
        status: 'AVAILABLE',
        meetingLocation: candidateData.meetingLocation || 'https://meet.google.com/new',
        panelName: candidateData.panelName || 'Panel A (Technical Leads)',
      });
    }
  }

  if (!slot) throw new Error('Interview slot not found.');

  const targetSlotId = slot.id;

  const candidateAppId = candidateData.id || candidateData.candidateId || `APP-${Date.now().toString().slice(-4)}`;
  const candidateName = candidateData.name || candidateData.candidateName;
  const candidateEmail = candidateData.email || candidateData.candidateEmail || '';
  const candidateAvatar = candidateData.avatar || '';
  const matchScore = candidateData.matchScore || candidateData.score || 0;

  // Remove existing allocation for this candidate if they were previously allocated elsewhere
  await db.query(
    'DELETE FROM interview_allocations WHERE candidate_app_id = $1 OR (candidate_name = $2 AND candidate_name IS NOT NULL)',
    [candidateAppId, candidateName]
  );

  // Insert into interview_allocations (Clean 3NF: candidate info + slot_id)
  const allocRes = await db.query(
    `INSERT INTO interview_allocations (
      slot_id, candidate_app_id, candidate_name, candidate_email, candidate_avatar,
      match_score, status
    ) VALUES ($1, $2, $3, $4, $5, $6, 'ALLOCATED')
    RETURNING *`,
    [
      targetSlotId, candidateAppId, candidateName, candidateEmail, candidateAvatar,
      matchScore,
    ]
  );

  // Update interview slot
  await db.query(
    "UPDATE interview_slots SET booked_count = booked_count + 1, status = 'SCHEDULED', updated_at = NOW() WHERE id = $1",
    [targetSlotId]
  );

  const updatedSlot = await getInterviewSlotById(targetSlotId);

  return {
    allocation: allocRes.rows[0],
    slot: updatedSlot,
  };
};

/**
 * Get all allocations (excludes completed past sessions)
 */
const getAllAllocations = async () => {
  await seedInitialSlotsIfEmpty();
  const { rows } = await db.query(`
    SELECT a.*, s.job_position, s.round, s.interview_date, s.start_time, s.end_time, s.interview_type, s.panel_name, s.meeting_location
    FROM interview_allocations a
    JOIN interview_slots s ON a.slot_id = s.id
    WHERE a.status != 'COMPLETED' AND s.status != 'COMPLETED'
    ORDER BY s.interview_date ASC, s.start_time ASC
  `);

  return rows.map((r) => ({
    id: r.id,
    slotId: r.slot_id,
    candidateId: r.candidate_app_id,
    candidateName: r.candidate_name,
    candidateEmail: r.candidate_email,
    candidateAvatar: r.candidate_avatar,
    matchScore: parseFloat(r.match_score) || 0,
    jobPosition: r.job_position,
    round: r.round,
    interviewRound: r.round,
    interviewDate: toDisplayDateString(r.interview_date),
    assignedTime: `${r.start_time} – ${r.end_time}`,
    interviewType: r.interview_type,
    panelName: r.panel_name,
    meetingLocation: r.meeting_location,
    status: r.status,
    allocatedAt: r.allocated_at,
  }));
};

/**
 * Delete / unassign a candidate allocation
 */
const deleteAllocation = async (identifier) => {
  const { rows } = await db.query(
    `DELETE FROM interview_allocations
     WHERE id::text = $1 OR candidate_app_id = $1 OR candidate_name ILIKE $1
     RETURNING slot_id`,
    [String(identifier)]
  );
  if (rows.length > 0 && rows[0].slot_id) {
    const allocCount = await db.query(
      'SELECT COUNT(*) FROM interview_allocations WHERE slot_id = $1',
      [rows[0].slot_id]
    );
    const count = parseInt(allocCount.rows[0].count, 10);
    if (count === 0) {
      await db.query(
        `UPDATE interview_slots
         SET booked_count = 0, status = 'AVAILABLE', updated_at = NOW()
         WHERE id = $1 AND status != 'COMPLETED'`,
        [rows[0].slot_id]
      );
    }
  }
  return rows[0] || null;
};

/**
 * Reset all allocations
 */
const resetAllAllocations = async () => {
  await db.query('DELETE FROM interview_allocations');
  await db.query('ALTER SEQUENCE IF EXISTS interview_allocations_id_seq RESTART WITH 1');
  await db.query(`
    UPDATE interview_slots
    SET booked_count = 0, status = 'AVAILABLE', updated_at = NOW()
    WHERE status != 'COMPLETED'
  `);
  return { success: true };
};

/**
 * Auto-allocate shortlisted candidates to available slots
 */
const autoAllocateCandidates = async (candidatesList) => {
  const slots = await getAllInterviewSlots({ status: 'AVAILABLE' });
  const allocated = [];

  for (let i = 0; i < candidatesList.length && i < slots.length; i++) {
    const candidate = candidatesList[i];
    const slot = slots[i];
    const result = await allocateCandidateToSlot(slot.id, candidate);
    allocated.push(result);
  }

  return allocated;
};

/**
 * Reschedule Requests: Get all
 */
const getAllRescheduleRequests = async () => {
  await seedInitialSlotsIfEmpty();
  const { rows } = await db.query(`
    SELECT 
      r.id, r.slot_id, r.requested_by, r.reason_category, r.detailed_reason, 
      r.proposed_slots, r.status, r.resolution_notes, r.created_at, r.resolved_at,
      s.job_position, s.round, s.interview_date AS current_interview_date, 
      s.start_time || ' - ' || s.end_time AS current_interview_time,
      s.meeting_location, s.panel_name,
      a.candidate_name, a.candidate_email
    FROM interview_reschedule_requests r
    LEFT JOIN interview_slots s ON r.slot_id = s.id
    LEFT JOIN interview_allocations a ON a.slot_id = s.id
    ORDER BY r.created_at DESC
  `);

  return rows.map((r) => {
    let pm = DEFAULT_PANEL_MEMBERS[0];
    if (r.panel_name) {
      const match = DEFAULT_PANEL_MEMBERS.find((p) => r.panel_name.toLowerCase().includes(p.name.toLowerCase()));
      if (match) pm = match;
    }
    return {
      id: r.id,
      slotId: r.slot_id,
      requestedBy: r.requested_by,
      panelMember: pm,
      candidateName: r.candidate_name || '',
      candidateEmail: r.candidate_email || '',
      jobPosition: r.job_position || 'Senior Software Engineer',
      round: r.round || 'Technical Interview',
      currentDate: toIsoDateString(r.current_interview_date),
      currentDisplayDate: toDisplayDateString(r.current_interview_date),
      currentTime: r.current_interview_time || '',
      reasonCategory: r.reason_category,
      detailedReason: r.detailed_reason,
      proposedSlots: r.proposed_slots || [],
      status: r.status,
      resolutionNotes: r.resolution_notes || '',
      createdAt: r.created_at,
      resolvedAt: r.resolved_at,
      meetingLocation: r.meeting_location,
    };
  });
};

/**
 * Create a new Reschedule Request
 */
const createRescheduleRequest = async (reqData) => {
  const {
    slotId,
    requestedBy = 'PANEL_MEMBER',
    reasonCategory,
    detailedReason = '',
    proposedSlots = [],
  } = reqData;

  const { rows } = await db.query(
    `INSERT INTO interview_reschedule_requests (
      slot_id, requested_by, reason_category, detailed_reason, proposed_slots, status
    ) VALUES ($1, $2, $3, $4, $5, 'PENDING')
    RETURNING *`,
    [slotId, requestedBy, reasonCategory, detailedReason, JSON.stringify(proposedSlots)]
  );

  // Update interview slot status
  if (slotId) {
    await db.query(
      "UPDATE interview_slots SET status = 'RESCHEDULE_REQUESTED', updated_at = NOW() WHERE id = $1",
      [slotId]
    );
  }

  return rows[0];
};

/**
 * Approve Reschedule Request
 */
const approveRescheduleRequest = async (requestId, selectedProposedSlot, resolutionNotes = '') => {
  let cleanReqId = parseInt(String(requestId).replace(/\D/g, ''), 10);
  if (isNaN(cleanReqId) || cleanReqId > 2147483647) {
    cleanReqId = null;
  }

  let request = null;
  if (cleanReqId) {
    const { rows } = await db.query('SELECT * FROM interview_reschedule_requests WHERE id = $1', [cleanReqId]);
    if (rows.length > 0) request = rows[0];
  }

  if (!request) {
    // Fallback: find the latest pending request
    const { rows } = await db.query("SELECT * FROM interview_reschedule_requests WHERE status = 'PENDING' ORDER BY id DESC LIMIT 1");
    if (rows.length > 0) request = rows[0];
  }

  if (!request) throw new Error('Reschedule request not found.');

  const targetReqId = request.id;
  const slotId = request.slot_id;

  // Update request
  await db.query(
    `UPDATE interview_reschedule_requests SET
      status = 'APPROVED', resolution_notes = $1, resolved_at = NOW()
    WHERE id = $2`,
    [resolutionNotes, targetReqId]
  );

  // Update slot if proposed slot was provided
  if (selectedProposedSlot && slotId) {
    const newDate = toIsoDateString(selectedProposedSlot.date);
    const newStart = selectedProposedSlot.startTime;
    const newEnd = selectedProposedSlot.endTime;

    await db.query(
      `UPDATE interview_slots SET
        interview_date = $1, start_time = $2, end_time = $3, status = 'SCHEDULED', updated_at = NOW()
      WHERE id = $4`,
      [newDate, newStart, newEnd, slotId]
    );
  }

  return { success: true, message: 'Reschedule request approved.' };
};

/**
 * Reject Reschedule Request
 */
const rejectRescheduleRequest = async (requestId, rejectionReason = '') => {
  let cleanReqId = parseInt(String(requestId).replace(/\D/g, ''), 10);
  if (isNaN(cleanReqId) || cleanReqId > 2147483647) {
    cleanReqId = null;
  }

  let request = null;
  if (cleanReqId) {
    const { rows } = await db.query('SELECT * FROM interview_reschedule_requests WHERE id = $1', [cleanReqId]);
    if (rows.length > 0) request = rows[0];
  }

  if (!request) {
    // Fallback: find the latest pending request
    const { rows } = await db.query("SELECT * FROM interview_reschedule_requests WHERE status = 'PENDING' ORDER BY id DESC LIMIT 1");
    if (rows.length > 0) request = rows[0];
  }

  if (!request) throw new Error('Reschedule request not found.');

  const targetReqId = request.id;
  const slotId = request.slot_id;

  await db.query(
    `UPDATE interview_reschedule_requests SET
      status = 'REJECTED', resolution_notes = $1, resolved_at = NOW()
    WHERE id = $2`,
    [rejectionReason, targetReqId]
  );

  // Revert slot status back to SCHEDULED
  if (slotId) {
    await db.query(
      "UPDATE interview_slots SET status = 'SCHEDULED', updated_at = NOW() WHERE id = $1",
      [slotId]
    );
  }

  return { success: true, message: 'Reschedule request rejected.' };
};

/**
 * Custom Reschedule Slot
 */
const customRescheduleSlot = async (requestId, customSlotData, notes = '') => {
  const { rows } = await db.query('SELECT * FROM interview_reschedule_requests WHERE id = $1', [requestId]);
  if (rows.length === 0) throw new Error('Reschedule request not found.');

  const request = rows[0];
  const slotId = request.slot_id;

  await db.query(
    `UPDATE interview_reschedule_requests SET
      status = 'APPROVED', resolution_notes = $1, resolved_at = NOW()
    WHERE id = $2`,
    [notes, requestId]
  );

  if (customSlotData && slotId) {
    const newDate = toIsoDateString(customSlotData.interviewDate || customSlotData.date);
    const newStart = customSlotData.startTime;
    const newEnd = customSlotData.endTime;

    await db.query(
      `UPDATE interview_slots SET
        interview_date = $1, start_time = $2, end_time = $3, status = 'SCHEDULED', updated_at = NOW()
      WHERE id = $4`,
      [newDate, newStart, newEnd, slotId]
    );
  }

  return { success: true, message: 'Slot rescheduled successfully with custom timing.' };
};

/**
 * Submit Interview Evaluation
 */
const submitInterviewEvaluation = async (evalData) => {
  const {
    slotId,
    score = 4,
    techSkills = 4,
    commSkills = 4,
    problemSolving = 4,
    teamwork = 4,
    overallRating = 4.0,
    strengths = '',
    improvements = '',
    recommendation = 'HIRE',
    feedbackNotes = '',
    evaluatedBy = 'Interview Panel',
  } = evalData;

  const { rows } = await db.query(
    `INSERT INTO interview_evaluations (
      slot_id, score, tech_skills, comm_skills, problem_solving, teamwork,
      overall_rating, strengths, improvements, recommendation, feedback_notes, evaluated_by
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *`,
    [
      slotId, score, techSkills, commSkills, problemSolving, teamwork,
      overallRating, strengths, improvements, recommendation, feedbackNotes, evaluatedBy,
    ]
  );

  // Mark status as COMPLETED in interview_slots
  await db.query(
    "UPDATE interview_slots SET status = 'COMPLETED', updated_at = NOW() WHERE id = $1",
    [slotId]
  );

  return rows[0];
};

/**
 * Get all evaluations
 */
const getAllEvaluations = async () => {
  const { rows } = await db.query(`
    SELECT 
      e.*, s.round, s.job_position, s.interview_date,
      a.candidate_app_id, a.candidate_name, a.candidate_email
    FROM interview_evaluations e
    JOIN interview_slots s ON e.slot_id = s.id
    LEFT JOIN interview_allocations a ON a.slot_id = s.id
    ORDER BY e.submitted_at DESC
  `);

  return rows.map((r) => ({
    id: r.id,
    slotId: r.slot_id,
    candidateId: r.candidate_app_id,
    candidateName: r.candidate_name || 'Candidate',
    candidateEmail: r.candidate_email || '',
    score: r.score,
    techSkills: r.tech_skills,
    commSkills: r.comm_skills,
    problemSolving: r.problem_solving,
    teamwork: r.teamwork,
    overallRating: parseFloat(r.overall_rating) || 4.0,
    strengths: r.strengths,
    improvements: r.improvements,
    recommendation: r.recommendation,
    feedbackNotes: r.feedback_notes,
    evaluatedBy: r.evaluated_by,
    submittedAt: toDisplayDateString(r.submitted_at),
    round: r.round,
    jobPosition: r.job_position,
    interviewDate: toDisplayDateString(r.interview_date),
  }));
};

/**
 * Return default panel members
 */
const getPanelMemberList = async () => {
  return DEFAULT_PANEL_MEMBERS;
};

/**
 * Truncate / clean all interview tables
 */
const clearAllInterviewData = async () => {
  await db.query('TRUNCATE TABLE interview_slots, interview_allocations, interview_evaluations, interview_reschedule_requests RESTART IDENTITY CASCADE');
  return { success: true, message: 'All interview data cleared successfully.' };
};

module.exports = {
  DEFAULT_PANEL_MEMBERS,
  getAllInterviewSlots,
  getInterviewSlotById,
  createInterviewSlot,
  bulkCreateInterviewSlots,
  updateInterviewSlot,
  deleteInterviewSlot,
  allocateCandidateToSlot,
  getAllAllocations,
  deleteAllocation,
  resetAllAllocations,
  autoAllocateCandidates,
  getAllRescheduleRequests,
  createRescheduleRequest,
  approveRescheduleRequest,
  rejectRescheduleRequest,
  customRescheduleSlot,
  submitInterviewEvaluation,
  getAllEvaluations,
  getPanelMemberList,
  clearAllInterviewData,
};

