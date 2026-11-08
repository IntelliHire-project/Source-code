const db = require('../config/db');

// Default Panel Members
const DEFAULT_PANEL_MEMBERS = [
  {
    id: 'pm-1',
    name: 'Saman Tech',
    email: 'saman.tech@company.com',
    role: 'Technical Lead & Interviewer',
    department: 'Engineering',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    specialties: ['React', 'Node.js', 'System Architecture'],
  },
  {
    id: 'pm-2',
    name: 'Nirosha HR',
    email: 'nirosha.hr@company.com',
    role: 'HR Manager & Culture Fit Interviewer',
    department: 'Human Resources',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    specialties: ['HR Screening', 'Culture Fit', 'Portfolio Review'],
  },
  {
    id: 'pm-3',
    name: 'Dilhani Wickramasinghe',
    email: 'dilhani.w@company.com',
    role: 'Talent Acquisition Lead',
    department: 'Talent Acquisition',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    specialties: ['Talent Sourcing', 'Behavioral Interview', 'Leadership'],
  },
  {
    id: 'pm-4',
    name: 'Ruwan Bandara',
    email: 'ruwan.b@company.com',
    role: 'Principal Engineer & System Architect',
    department: 'Platform Engineering',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    specialties: ['Distributed Systems', 'Cloud & DevOps', 'Database Architecture'],
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

  let panelMember = row.panel_member;
  if (!panelMember || Object.keys(panelMember).length === 0) {
    if (row.panel_name) {
      panelMember = {
        name: row.panel_name,
        email: row.panel_emails || '',
        role: 'Panel Interviewer',
        department: 'Hiring Team',
      };
    }
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
    meetingLocation: row.meeting_location || 'https://meet.google.com/intelli-tech-round',
    capacity: row.capacity || 1,
    bookedCount: row.booked_count || 0,
    panelName: row.panel_name || (panelMember ? panelMember.name : 'Panel A'),
    panelEmails: row.panel_emails || (panelMember ? panelMember.email : ''),
    panelMember: panelMember || DEFAULT_PANEL_MEMBERS[0],
    candidate: row.candidate || null,
    evaluation: row.evaluation || null,
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
        meeting_location: 'https://meet.google.com/intelli-tech-round',
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
        interview_date: '2026-11-02',
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
        interview_date: '2026-11-04',
        start_time: '11:00 AM',
        end_time: '12:00 PM',
        interview_type: 'Online',
        status: 'SCHEDULED',
        meeting_location: 'https://meet.google.com/intelli-architecture-eval',
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
        interview_date: '2026-11-05',
        start_time: '10:00 AM',
        end_time: '11:00 AM',
        interview_type: 'Online',
        status: 'AVAILABLE',
        meeting_location: 'https://meet.google.com/intelli-tech-round',
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
        meeting_location: 'https://meet.google.com/intelli-design-round',
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
          panel_name, panel_emails, panel_member, candidate, evaluation, additional_notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING id`,
        [
          targetId,
          slot.job_position, slot.round, slot.interview_date, slot.start_time, slot.end_time,
          slot.interview_type, slot.status, slot.meeting_location, slot.capacity, slot.booked_count,
          slot.panel_name, slot.panel_emails, slot.panel_member, slot.candidate || null,
          slot.evaluation || null, slot.additional_notes,
        ]
      );

      const slotId = res.rows[0].id;
      if (slot.candidate) {
        const c = JSON.parse(slot.candidate);
        await db.query(
          `INSERT INTO interview_allocations (
            id, slot_id, candidate_app_id, candidate_name, candidate_email, candidate_avatar,
            match_score, job_position, round, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            targetId, slotId, c.id, c.name, c.email, c.avatar || null,
            c.matchScore || 0, slot.job_position, slot.round, 'ALLOCATED',
          ]
        );
      }

      if (slot.status === 'RESCHEDULE_REQUESTED') {
        const c = JSON.parse(slot.candidate);
        await db.query(
          `INSERT INTO interview_reschedule_requests (
            id, slot_id, requested_by, panel_member, candidate_name, candidate_email,
            job_position, round, current_interview_date, current_interview_time, reason_category,
            detailed_reason, proposed_slots, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
          [
            1,
            slotId,
            'PANEL_MEMBER',
            slot.panel_member,
            c.name,
            c.email,
            slot.job_position,
            slot.round,
            slot.interview_date,
            `${slot.start_time} - ${slot.end_time}`,
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
        const ev = JSON.parse(slot.evaluation);
        const c = slot.candidate ? JSON.parse(slot.candidate) : {};
        await db.query(
          `INSERT INTO interview_evaluations (
            id, slot_id, candidate_name, candidate_email, score,
            strengths, improvements, recommendation, evaluated_by
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            1, slotId, c.name || 'Alice Fernando', c.email || 'alice.fernando@example.com', ev.score || 4,
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

  let query = 'SELECT * FROM interview_slots';
  const conditions = [];
  const values = [];

  if (filters.vacancyId) {
    values.push(filters.vacancyId);
    conditions.push(`vacancy_id = $${values.length}`);
  }

  if (filters.status) {
    values.push(filters.status);
    conditions.push(`status = $${values.length}`);
  }

  if (filters.round) {
    values.push(filters.round);
    conditions.push(`round = $${values.length}`);
  }

  if (filters.date) {
    values.push(filters.date);
    conditions.push(`interview_date = $${values.length}`);
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' AND ')}`;
  }

  query += ' ORDER BY interview_date ASC, start_time ASC';

  const { rows } = await db.query(query, values);
  return rows.map(formatSlotRow);
};

/**
 * Fetch single interview slot by ID
 */
const getInterviewSlotById = async (id) => {
  const { rows } = await db.query('SELECT * FROM interview_slots WHERE id = $1', [id]);
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
    meetingLocation = 'https://meet.google.com/intelli-tech-round',
    capacity = 1,
    panelName = 'Panel A (Technical Leads)',
    panelEmails = 'techlead@company.com',
    panelMember = null,
    candidate = null,
    additionalNotes = '',
  } = slotData;

  const isoDate = toIsoDateString(interviewDate);
  const panelMemberJson = JSON.stringify(panelMember || DEFAULT_PANEL_MEMBERS[0]);
  const candidateJson = candidate ? JSON.stringify(candidate) : null;
  const bookedCount = candidate ? 1 : 0;

  const { rows } = await db.query(
    `INSERT INTO interview_slots (
      vacancy_id, job_position, round, interview_date, start_time, end_time,
      interview_type, status, meeting_location, capacity, booked_count,
      panel_name, panel_emails, panel_member, candidate, additional_notes
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
    RETURNING *`,
    [
      vacancyId, jobPosition, round, isoDate, startTime, endTime,
      interviewType, status, meetingLocation, capacity, bookedCount,
      panelName, panelEmails, panelMemberJson, candidateJson, additionalNotes,
    ]
  );

  const createdSlot = formatSlotRow(rows[0]);

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
        match_score, job_position, round, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'ALLOCATED')`,
      [
        createdSlot.id, candidateAppId, candidateName, candidateEmail, candidateAvatar,
        matchScore, createdSlot.jobPosition, createdSlot.round,
      ]
    );
  }

  return createdSlot;
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
  const bookedCount = slotData.bookedCount !== undefined ? slotData.bookedCount : existing.bookedCount;
  const panelName = slotData.panelName !== undefined ? slotData.panelName : existing.panelName;
  const panelEmails = slotData.panelEmails !== undefined ? slotData.panelEmails : existing.panelEmails;
  const panelMember = slotData.panelMember !== undefined ? JSON.stringify(slotData.panelMember) : JSON.stringify(existing.panelMember);
  const candidate = slotData.candidate !== undefined ? (slotData.candidate ? JSON.stringify(slotData.candidate) : null) : (existing.candidate ? JSON.stringify(existing.candidate) : null);
  const evaluation = slotData.evaluation !== undefined ? (slotData.evaluation ? JSON.stringify(slotData.evaluation) : null) : (existing.evaluation ? JSON.stringify(existing.evaluation) : null);
  const additionalNotes = slotData.additionalNotes !== undefined ? slotData.additionalNotes : existing.additionalNotes;

  const { rows } = await db.query(
    `UPDATE interview_slots SET
      job_position = $1, round = $2, interview_date = $3, start_time = $4, end_time = $5,
      interview_type = $6, status = $7, meeting_location = $8, capacity = $9, booked_count = $10,
      panel_name = $11, panel_emails = $12, panel_member = $13, candidate = $14,
      evaluation = $15, additional_notes = $16, updated_at = NOW()
    WHERE id = $17
    RETURNING *`,
    [
      jobPosition, round, interviewDate, startTime, endTime,
      interviewType, status, meetingLocation, capacity, bookedCount,
      panelName, panelEmails, panelMember, candidate,
      evaluation, additionalNotes, id,
    ]
  );

  const updatedSlot = formatSlotRow(rows[0]);

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
          match_score, job_position, round, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'ALLOCATED')`,
        [
          id, candidateAppId, candidateName, candidateEmail, candidateAvatar,
          matchScore, updatedSlot.jobPosition, updatedSlot.round,
        ]
      );
    } else {
      await db.query('DELETE FROM interview_allocations WHERE slot_id = $1', [id]);
    }
  }

  return updatedSlot;
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
  const slot = await getInterviewSlotById(slotId);
  if (!slot) throw new Error('Interview slot not found.');

  const candidateAppId = candidateData.id || candidateData.candidateId || `APP-${Date.now().toString().slice(-4)}`;
  const candidateName = candidateData.name || candidateData.candidateName;
  const candidateEmail = candidateData.email || candidateData.candidateEmail || '';
  const candidateAvatar = candidateData.avatar || '';
  const matchScore = candidateData.matchScore || candidateData.score || 0;

  const candidatePayload = {
    id: candidateAppId,
    name: candidateName,
    email: candidateEmail,
    avatar: candidateAvatar,
    matchScore,
  };

  // Remove existing allocation for this candidate if they were previously allocated elsewhere
  await db.query(
    'DELETE FROM interview_allocations WHERE candidate_app_id = $1 OR (candidate_name = $2 AND candidate_name IS NOT NULL)',
    [candidateAppId, candidateName]
  );

  // Insert into interview_allocations
  const allocRes = await db.query(
    `INSERT INTO interview_allocations (
      slot_id, candidate_app_id, candidate_name, candidate_email, candidate_avatar,
      match_score, job_position, round, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'ALLOCATED')
    RETURNING *`,
    [
      slotId, candidateAppId, candidateName, candidateEmail, candidateAvatar,
      matchScore, slot.jobPosition, slot.round,
    ]
  );

  // Update interview slot
  const updatedSlot = await updateInterviewSlot(slotId, {
    candidate: candidatePayload,
    bookedCount: (slot.bookedCount || 0) + 1,
    status: 'SCHEDULED',
  });

  return {
    allocation: allocRes.rows[0],
    slot: updatedSlot,
  };
};

/**
 * Get all allocations
 */
const getAllAllocations = async () => {
  await seedInitialSlotsIfEmpty();
  const { rows } = await db.query(`
    SELECT a.*, s.interview_date, s.start_time, s.end_time, s.interview_type, s.panel_name, s.meeting_location
    FROM interview_allocations a
    JOIN interview_slots s ON a.slot_id = s.id
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
         SET candidate = NULL, booked_count = 0, status = 'AVAILABLE', updated_at = NOW()
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
    SET candidate = NULL, booked_count = 0, status = 'AVAILABLE', updated_at = NOW()
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
    SELECT r.*, s.meeting_location
    FROM interview_reschedule_requests r
    LEFT JOIN interview_slots s ON r.slot_id = s.id
    ORDER BY r.created_at DESC
  `);

  return rows.map((r) => ({
    id: r.id,
    slotId: r.slot_id,
    requestedBy: r.requested_by,
    panelMember: r.panel_member,
    candidateName: r.candidate_name,
    candidateEmail: r.candidate_email,
    jobPosition: r.job_position,
    round: r.round,
    currentDate: toIsoDateString(r.current_interview_date || r.current_date),
    currentDisplayDate: toDisplayDateString(r.current_interview_date || r.current_date),
    currentTime: r.current_interview_time || r.current_time,
    reasonCategory: r.reason_category,
    detailedReason: r.detailed_reason,
    proposedSlots: r.proposed_slots || [],
    status: r.status,
    resolutionNotes: r.resolution_notes || '',
    createdAt: r.created_at,
    resolvedAt: r.resolved_at,
    meetingLocation: r.meeting_location,
  }));
};

/**
 * Create a new Reschedule Request
 */
const createRescheduleRequest = async (reqData) => {
  const {
    slotId,
    requestedBy = 'PANEL_MEMBER',
    panelMember = null,
    candidateName = '',
    candidateEmail = '',
    jobPosition = '',
    round = '',
    currentDate = null,
    currentTime = '',
    reasonCategory,
    detailedReason = '',
    proposedSlots = [],
  } = reqData;

  const slot = await getInterviewSlotById(slotId);
  const curDate = currentDate ? toIsoDateString(currentDate) : (slot ? slot.interviewDate : toIsoDateString(new Date()));
  const curTime = currentTime || (slot ? `${slot.startTime} - ${slot.endTime}` : '');
  const jobPos = jobPosition || (slot ? slot.jobPosition : 'Senior Software Engineer');
  const rnd = round || (slot ? slot.round : 'Technical Interview');
  const candName = candidateName || (slot && slot.candidate ? slot.candidate.name : '');
  const candEmail = candidateEmail || (slot && slot.candidate ? slot.candidate.email : '');
  const pMember = panelMember || (slot ? slot.panelMember : DEFAULT_PANEL_MEMBERS[0]);

  const { rows } = await db.query(
    `INSERT INTO interview_reschedule_requests (
      slot_id, requested_by, panel_member, candidate_name, candidate_email,
      job_position, round, current_interview_date, current_interview_time, reason_category,
      detailed_reason, proposed_slots, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'PENDING')
    RETURNING *`,
    [
      slotId, requestedBy, JSON.stringify(pMember), candName, candEmail,
      jobPos, rnd, curDate, curTime, reasonCategory,
      detailedReason, JSON.stringify(proposedSlots),
    ]
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
  const { rows } = await db.query('SELECT * FROM interview_reschedule_requests WHERE id = $1', [requestId]);
  if (rows.length === 0) throw new Error('Reschedule request not found.');

  const request = rows[0];
  const slotId = request.slot_id;

  // Update request
  await db.query(
    `UPDATE interview_reschedule_requests SET
      status = 'APPROVED', resolution_notes = $1, resolved_at = NOW()
    WHERE id = $2`,
    [resolutionNotes, requestId]
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
  const { rows } = await db.query('SELECT * FROM interview_reschedule_requests WHERE id = $1', [requestId]);
  if (rows.length === 0) throw new Error('Reschedule request not found.');

  const request = rows[0];
  const slotId = request.slot_id;

  await db.query(
    `UPDATE interview_reschedule_requests SET
      status = 'REJECTED', resolution_notes = $1, resolved_at = NOW()
    WHERE id = $2`,
    [rejectionReason, requestId]
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
    candidateId = null,
    candidateName = '',
    candidateEmail = '',
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
      slot_id, candidate_id, candidate_name, candidate_email, score,
      tech_skills, comm_skills, problem_solving, teamwork, overall_rating,
      strengths, improvements, recommendation, feedback_notes, evaluated_by
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    RETURNING *`,
    [
      slotId, candidateId, candidateName, candidateEmail, score,
      techSkills, commSkills, problemSolving, teamwork, overallRating,
      strengths, improvements, recommendation, feedbackNotes, evaluatedBy,
    ]
  );

  // Also update slot with evaluation JSON and mark status as COMPLETED
  const evalPayload = {
    score,
    strengths,
    improvements,
    recommendation,
    evaluatedBy,
    submittedAt: toDisplayDateString(new Date()),
  };

  await db.query(
    `UPDATE interview_slots SET
      evaluation = $1, status = 'COMPLETED', updated_at = NOW()
    WHERE id = $2`,
    [JSON.stringify(evalPayload), slotId]
  );

  return rows[0];
};

/**
 * Get all evaluations
 */
const getAllEvaluations = async () => {
  const { rows } = await db.query(`
    SELECT e.*, s.round, s.job_position, s.interview_date
    FROM interview_evaluations e
    JOIN interview_slots s ON e.slot_id = s.id
    ORDER BY e.submitted_at DESC
  `);

  return rows.map((r) => ({
    id: r.id,
    slotId: r.slot_id,
    candidateId: r.candidate_id,
    candidateName: r.candidate_name,
    candidateEmail: r.candidate_email,
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

