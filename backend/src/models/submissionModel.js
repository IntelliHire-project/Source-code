const db = require('../config/db');
const { findAssessmentByIdOrCode } = require('./assessmentModel');

/**
 * Generates the next sequential submission code (e.g., SUB-1001, SUB-1002...).
 */
const generateNextSubmissionCode = async (executor = db) => {
  try {
    const result = await executor.query(
      `SELECT submission_code FROM assessment_submissions WHERE submission_code LIKE 'SUB-%' ORDER BY id DESC LIMIT 1`
    );

    let nextNum = 1001;
    if (result.rows && result.rows.length > 0 && result.rows[0].submission_code) {
      const parts = result.rows[0].submission_code.split('-');
      const parsed = parseInt(parts[1], 10);
      if (!Number.isNaN(parsed) && parsed >= 1001) {
        nextNum = parsed + 1;
      }
    }

    return `SUB-${nextNum}`;
  } catch (err) {
    return `SUB-${Date.now().toString().slice(-4)}`;
  }
};

/**
 * Normalizes a JSON/JSONB value safely.
 */
const parseJson = (val, fallback) => {
  if (val == null) return fallback;
  if (typeof val === 'object') return val;
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch {
      return fallback;
    }
  }
  return fallback;
};

/**
 * Builds initials from a full name.
 */
const getInitials = (fullName = 'Candidate') => {
  const parts = String(fullName).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'CA';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

/**
 * Auto-grades MCQ questions and builds the structured question-by-question audit array.
 */
const gradeAssessmentSubmission = (assessment, answers = {}) => {
  const questions = Array.isArray(assessment.questions) ? assessment.questions : [];
  let totalPoints = 0;
  let autoMaxPoints = 0;
  let autoEarnedPoints = 0;
  let hasManualQuestions = false;

  const questionResults = questions.map((q, idx) => {
    const qId = q.id != null ? String(q.id) : `Q-${idx + 1}`;
    const maxPoints = Number(q.points) || 10;
    totalPoints += maxPoints;

    const rawType = String(q.type || 'Long Answer').toLowerCase();
    const isMcq = rawType === 'mcq' || rawType === 'multiple choice' || rawType === 'multi';
    const isCoding = rawType === 'coding';

    const rawAnswer = answers[qId] !== undefined ? answers[qId] : answers[q.questionCode];
    const options = Array.isArray(q.options) ? q.options : [];
    const correctIndex = q.correct != null ? Number(q.correct) : (q.correctIndex != null ? Number(q.correctIndex) : null);

    if (isMcq && correctIndex != null && !Number.isNaN(correctIndex)) {
      autoMaxPoints += maxPoints;
      const selectedIdx = typeof rawAnswer === 'number' ? rawAnswer : parseInt(rawAnswer, 10);
      const isCorrect = !Number.isNaN(selectedIdx) && selectedIdx === correctIndex;
      const earned = isCorrect ? maxPoints : 0;
      autoEarnedPoints += earned;

      const candidateLabel = !Number.isNaN(selectedIdx) && options[selectedIdx] != null
        ? `Option ${String.fromCharCode(65 + selectedIdx)}: ${options[selectedIdx]}`
        : (rawAnswer != null && rawAnswer !== '' ? String(rawAnswer) : 'No answer provided');

      const correctLabel = options[correctIndex] != null
        ? `Option ${String.fromCharCode(65 + correctIndex)}: ${options[correctIndex]}`
        : `Option ${String.fromCharCode(65 + correctIndex)}`;

      return {
        id: qId,
        title: q.title || `Question ${idx + 1}`,
        category: q.category || 'Technical',
        type: 'Multiple Choice (MCQ)',
        rawType: 'MCQ',
        prompt: q.prompt || q.text || '',
        points: earned,
        maxPoints,
        candidateAnswer: candidateLabel,
        correctAnswer: correctLabel,
        selectedOptionIndex: Number.isNaN(selectedIdx) ? null : selectedIdx,
        isCorrect,
        status: isCorrect ? 'Passed' : 'Incorrect',
        manualScore: null,
        evaluatorComment: '',
      };
    }

    hasManualQuestions = true;
    const textVal = rawAnswer != null ? String(rawAnswer) : '';

    return {
      id: qId,
      title: q.title || `Question ${idx + 1}`,
      category: q.category || (isCoding ? 'Algorithms & Coding' : 'Technical Concepts'),
      type: isCoding ? 'Coding' : 'Short Answer',
      rawType: isCoding ? 'Coding' : 'Short Answer',
      language: q.language || 'JavaScript',
      prompt: q.prompt || q.text || '',
      points: 0,
      maxPoints,
      candidateAnswer: isCoding ? null : (textVal || 'No answer provided'),
      submittedCode: isCoding ? (textVal || q.boilerplate || '// No code submitted') : null,
      benchmarkCode: isCoding ? (q.boilerplate || null) : null,
      rubric: q.rubric || q.modelAnswer || 'Evaluate technical accuracy, clarity, and edge case coverage.',
      isCorrect: null,
      status: 'Needs Review',
      manualScore: null,
      evaluatorComment: '',
    };
  });

  const autoScore = autoMaxPoints > 0
    ? Math.round((autoEarnedPoints / autoMaxPoints) * 100)
    : (hasManualQuestions ? 0 : 100);

  const status = hasManualQuestions ? 'Needs Grading' : 'Graded';
  const finalScore = hasManualQuestions ? null : autoScore;
  const manualScore = hasManualQuestions ? null : 0;

  return {
    questionResults,
    totalPoints,
    earnedPoints: autoEarnedPoints,
    autoScore,
    manualScore,
    finalScore,
    status,
  };
};

/**
 * Formats a database submission row into camelCase API output.
 */
const formatSubmissionRow = (row) => {
  if (!row) return null;

  const answers = parseJson(row.answers, {});
  const questionResults = parseJson(row.question_results, []);
  const recruiterScorecard = parseJson(row.recruiter_scorecard, {});
  const candidateName = row.candidate_name || row.full_name || 'Candidate';

  return {
    id: row.submission_code || String(row.id),
    numericId: row.id,
    submissionCode: row.submission_code,
    assessmentId: row.assessment_id,
    assessmentCode: row.assessment_code || null,
    assessmentTitle: row.assessment_title || 'Technical Assessment',
    jobRole: row.job_role || row.candidate_headline || 'Software Engineer',
    passingScore: row.passing_score != null ? Number(row.passing_score) : 70,
    duration: row.assessment_duration != null ? Number(row.assessment_duration) : 60,
    candidateUserId: row.candidate_user_id,
    candidateId: row.candidate_id || null,
    name: candidateName,
    candidateName,
    email: row.candidate_email || '',
    initials: getInitials(candidateName),
    answers,
    responses: questionResults,
    questionResults,
    autoScore: row.auto_score != null ? Number(row.auto_score) : 0,
    manualScore: row.manual_score != null ? Number(row.manual_score) : null,
    finalScore: row.final_score != null ? Number(row.final_score) : null,
    totalPoints: row.total_points != null ? Number(row.total_points) : 0,
    earnedPoints: row.earned_points != null ? Number(row.earned_points) : 0,
    timeSpentSeconds: row.time_spent_seconds != null ? Number(row.time_spent_seconds) : 0,
    status: row.status || 'Needs Grading',
    manualStatus: row.status === 'Graded' ? 'Graded' : 'Needs Grading',
    recommendation: row.recommendation || 'Pending',
    evaluatorNotes: row.evaluator_notes || '',
    recruiterScorecard,
    submittedAt: row.submitted_at,
    evaluatedAt: row.evaluated_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

/**
 * Saves or updates a candidate's assessment submission and runs MCQ auto-grading.
 */
const upsertAssessmentSubmission = async (
  { assessmentIdentifier, candidateUserId, candidateId = null, answers = {}, timeSpentSeconds = 0 },
  executor = db
) => {
  const assessment = await findAssessmentByIdOrCode(assessmentIdentifier, executor);
  if (!assessment) {
    const error = new Error('Assessment not found.');
    error.statusCode = 404;
    throw error;
  }

  const graded = gradeAssessmentSubmission(assessment, answers);
  const code = await generateNextSubmissionCode(executor);

  const query = `
    INSERT INTO assessment_submissions (
      submission_code,
      assessment_id,
      candidate_user_id,
      candidate_id,
      answers,
      question_results,
      auto_score,
      manual_score,
      final_score,
      total_points,
      earned_points,
      time_spent_seconds,
      status,
      recommendation,
      submitted_at,
      evaluated_at,
      created_at,
      updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
      NOW(),
      ${graded.status === 'Graded' ? 'NOW()' : 'NULL'},
      NOW(),
      NOW()
    )
    ON CONFLICT (assessment_id, candidate_user_id) DO UPDATE SET
      answers = EXCLUDED.answers,
      question_results = EXCLUDED.question_results,
      auto_score = EXCLUDED.auto_score,
      manual_score = EXCLUDED.manual_score,
      final_score = EXCLUDED.final_score,
      total_points = EXCLUDED.total_points,
      earned_points = EXCLUDED.earned_points,
      time_spent_seconds = EXCLUDED.time_spent_seconds,
      status = EXCLUDED.status,
      recommendation = EXCLUDED.recommendation,
      submitted_at = NOW(),
      evaluated_at = ${graded.status === 'Graded' ? 'NOW()' : 'NULL'},
      updated_at = NOW()
    RETURNING *;
  `;

  const recommendation = graded.finalScore != null
    ? (graded.finalScore >= (assessment.passingScore || 70) ? 'Shortlist' : 'Reject')
    : 'Pending';

  const values = [
    code,
    assessment.numericId,
    candidateUserId,
    candidateId,
    JSON.stringify(answers),
    JSON.stringify(graded.questionResults),
    graded.autoScore,
    graded.manualScore,
    graded.finalScore,
    graded.totalPoints,
    graded.earnedPoints,
    Math.max(0, parseInt(timeSpentSeconds, 10) || 0),
    graded.status,
    recommendation,
  ];

  const result = await executor.query(query, values);
  return findSubmissionByIdOrCode(result.rows[0].id, executor);
};

/**
 * Fetches all submissions belonging to a specific candidate user.
 */
const findSubmissionsByCandidateUserId = async (candidateUserId, executor = db) => {
  const query = `
    SELECT
      s.*,
      a.assessment_code,
      a.title AS assessment_title,
      a.job_role,
      a.passing_score,
      a.duration AS assessment_duration,
      u.full_name AS candidate_name,
      u.email AS candidate_email,
      c.headline AS candidate_headline
    FROM assessment_submissions s
    JOIN assessments a ON s.assessment_id = a.id
    JOIN users u ON s.candidate_user_id = u.id
    LEFT JOIN candidates c ON s.candidate_id = c.id
    WHERE s.candidate_user_id = $1
    ORDER BY s.submitted_at DESC;
  `;

  const result = await executor.query(query, [candidateUserId]);
  return (result.rows || []).map(formatSubmissionRow);
};

/**
 * Fetches submissions for a specific assessment or across a recruiter's assessments.
 */
const findSubmissionsList = async ({ assessmentIdentifier = null, recruiterId = null, userId = null } = {}, executor = db) => {
  const conditions = [];
  const values = [];
  let paramIndex = 1;

  if (assessmentIdentifier) {
    const assessment = await findAssessmentByIdOrCode(assessmentIdentifier, executor);
    if (!assessment) return [];
    conditions.push(`s.assessment_id = $${paramIndex}`);
    values.push(assessment.numericId);
    paramIndex += 1;
  }

  if (recruiterId != null) {
    conditions.push(`(a.recruiter_id = $${paramIndex} OR a.recruiter_id IS NULL)`);
    values.push(recruiterId);
    paramIndex += 1;
  } else if (userId != null) {
    conditions.push(`(a.user_id = $${paramIndex} OR a.user_id IS NULL)`);
    values.push(userId);
    paramIndex += 1;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const query = `
    SELECT
      s.*,
      a.assessment_code,
      a.title AS assessment_title,
      a.job_role,
      a.passing_score,
      a.duration AS assessment_duration,
      u.full_name AS candidate_name,
      u.email AS candidate_email,
      c.headline AS candidate_headline
    FROM assessment_submissions s
    JOIN assessments a ON s.assessment_id = a.id
    JOIN users u ON s.candidate_user_id = u.id
    LEFT JOIN candidates c ON s.candidate_id = c.id
    ${whereClause}
    ORDER BY s.submitted_at DESC;
  `;

  const result = await executor.query(query, values);
  return (result.rows || []).map(formatSubmissionRow);
};

/**
 * Retrieves a single detailed submission report by numeric ID or submission_code (e.g., SUB-1001).
 */
const findSubmissionByIdOrCode = async (identifier, executor = db) => {
  if (!identifier) return null;
  const strId = String(identifier).trim();
  const isNumeric = /^\d+$/.test(strId);

  const query = `
    SELECT
      s.*,
      a.assessment_code,
      a.title AS assessment_title,
      a.job_role,
      a.passing_score,
      a.duration AS assessment_duration,
      u.full_name AS candidate_name,
      u.email AS candidate_email,
      c.headline AS candidate_headline
    FROM assessment_submissions s
    JOIN assessments a ON s.assessment_id = a.id
    JOIN users u ON s.candidate_user_id = u.id
    LEFT JOIN candidates c ON s.candidate_id = c.id
    WHERE ${isNumeric ? 's.id = $1 OR s.submission_code = $2' : 's.submission_code = $1'}
  `;

  const values = isNumeric ? [parseInt(strId, 10), strId] : [strId];
  const result = await executor.query(query, values);
  if (!result.rows || result.rows.length === 0) return null;
  return formatSubmissionRow(result.rows[0]);
};

/**
 * Updates manual scores, evaluator comments, and final recommendation for a submission.
 */
const evaluateAssessmentSubmission = async (
  identifier,
  { manualScores = {}, comments = {}, recommendation = null, evaluatorNotes = null, recruiterScorecard = null },
  executor = db
) => {
  const existing = await findSubmissionByIdOrCode(identifier, executor);
  if (!existing) {
    const error = new Error('Submission not found.');
    error.statusCode = 404;
    throw error;
  }

  let totalPossible = 0;
  let totalEarned = 0;
  let manualEarned = 0;

  const updatedResults = (existing.questionResults || []).map((q) => {
    const maxPts = Number(q.maxPoints) || 10;
    totalPossible += maxPts;

    if (q.rawType === 'MCQ') {
      const earned = Number(q.points) || 0;
      totalEarned += earned;
      return q;
    }

    const rawManual = manualScores[q.id];
    const scored = rawManual !== undefined && rawManual !== '' && rawManual !== null
      ? Math.max(0, Math.min(maxPts, Number(rawManual) || 0))
      : (q.manualScore != null ? Number(q.manualScore) : 0);

    manualEarned += scored;
    totalEarned += scored;

    return {
      ...q,
      points: scored,
      manualScore: scored,
      evaluatorComment: comments[q.id] !== undefined ? String(comments[q.id]) : (q.evaluatorComment || ''),
      status: scored >= maxPts * 0.5 ? 'Passed' : 'Reviewed',
      isCorrect: scored >= maxPts * 0.5,
    };
  });

  const finalScore = totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : existing.autoScore;
  const resolvedRec = recommendation && recommendation !== 'Pending'
    ? recommendation
    : (finalScore >= (existing.passingScore || 70) ? 'Shortlist' : 'Reject');

  const query = `
    UPDATE assessment_submissions
    SET
      question_results = $1,
      manual_score = $2,
      final_score = $3,
      earned_points = $4,
      status = 'Graded',
      recommendation = $5,
      evaluator_notes = COALESCE($6, evaluator_notes),
      recruiter_scorecard = COALESCE($7, recruiter_scorecard),
      evaluated_at = NOW(),
      updated_at = NOW()
    WHERE id = $8
    RETURNING id;
  `;

  await executor.query(query, [
    JSON.stringify(updatedResults),
    manualEarned,
    finalScore,
    totalEarned,
    resolvedRec,
    evaluatorNotes != null ? String(evaluatorNotes) : null,
    recruiterScorecard != null ? JSON.stringify(recruiterScorecard) : null,
    existing.numericId,
  ]);

  return findSubmissionByIdOrCode(existing.numericId, executor);
};

module.exports = {
  gradeAssessmentSubmission,
  upsertAssessmentSubmission,
  findSubmissionsByCandidateUserId,
  findSubmissionsList,
  findSubmissionByIdOrCode,
  evaluateAssessmentSubmission,
};
