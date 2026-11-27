const {
  upsertAssessmentSubmission,
  findSubmissionsByCandidateUserId,
  findSubmissionsList,
  findSubmissionByIdOrCode,
  evaluateAssessmentSubmission,
} = require('../models/submissionModel');
const { findCandidateByUserId } = require('../models/candidateModel');
const { findRecruiterByUserId } = require('../models/recruiterModel');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * POST /api/assessments/:id/submit
 * Submits candidate answers for an assessment and triggers MCQ auto-grading.
 */
const submitAssessmentHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { answers = {}, timeSpentSeconds = 0 } = req.body || {};

    if (!id) {
      return errorResponse(res, 'Assessment ID or code is required.', 400);
    }

    const candidateUserId = req.user.id;
    let candidateId = null;
    try {
      const candidate = await findCandidateByUserId(candidateUserId);
      if (candidate) candidateId = candidate.id;
    } catch {
      candidateId = null;
    }

    const submission = await upsertAssessmentSubmission({
      assessmentIdentifier: id,
      candidateUserId,
      candidateId,
      answers,
      timeSpentSeconds,
    });

    return successResponse(res, 'Assessment submitted successfully.', { submission }, 201);
  } catch (error) {
    console.error('Error submitting assessment:', error);
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message || 'Failed to submit assessment.', statusCode);
  }
};

/**
 * GET /api/assessments/my-submissions
 * Returns all assessment submissions for the authenticated candidate.
 */
const getMySubmissionsHandler = async (req, res) => {
  try {
    const submissions = await findSubmissionsByCandidateUserId(req.user.id);
    return successResponse(res, 'Candidate submissions retrieved successfully.', { submissions });
  } catch (error) {
    console.error('Error fetching candidate submissions:', error);
    return errorResponse(res, error.message || 'Failed to retrieve submissions.', 500);
  }
};

/**
 * GET /api/assessments/submissions  AND  GET /api/assessments/:id/submissions
 * Lists candidate submissions for a specific assessment or across the recruiter's assessments.
 */
const getAssessmentSubmissionsHandler = async (req, res) => {
  try {
    const assessmentIdentifier = req.params.id || req.query.assessmentId || null;
    let recruiterId = null;
    let userId = null;

    if (req.user && req.user.role === 'recruiter') {
      userId = req.user.id;
      try {
        const recruiter = await findRecruiterByUserId(userId);
        if (recruiter) recruiterId = recruiter.id;
      } catch {
        recruiterId = null;
      }
    }

    const submissions = await findSubmissionsList({
      assessmentIdentifier,
      recruiterId,
      userId,
    });

    return successResponse(res, 'Assessment submissions retrieved successfully.', { submissions });
  } catch (error) {
    console.error('Error fetching assessment submissions:', error);
    return errorResponse(res, error.message || 'Failed to retrieve assessment submissions.', 500);
  }
};

/**
 * GET /api/assessments/submissions/:submissionId
 * Returns the full detailed evaluation report for a candidate submission.
 */
const getSubmissionReportHandler = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const submission = await findSubmissionByIdOrCode(submissionId);

    if (!submission) {
      return errorResponse(res, 'Submission report not found.', 404);
    }

    // Candidates may only view their own submission report
    if (req.user.role === 'candidate' && submission.candidateUserId !== req.user.id) {
      return errorResponse(res, 'You do not have permission to view this report.', 403);
    }

    return successResponse(res, 'Submission report retrieved successfully.', { submission });
  } catch (error) {
    console.error('Error fetching submission report:', error);
    return errorResponse(res, error.message || 'Failed to retrieve submission report.', 500);
  }
};

/**
 * PUT /api/assessments/submissions/:submissionId/evaluate
 * Saves recruiter manual scores, feedback comments, scorecard, and Shortlist/Reject decision.
 */
const evaluateSubmissionHandler = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const submission = await evaluateAssessmentSubmission(submissionId, req.body || {});
    return successResponse(res, 'Candidate evaluation saved successfully.', { submission });
  } catch (error) {
    console.error('Error evaluating submission:', error);
    const statusCode = error.statusCode || 500;
    return errorResponse(res, error.message || 'Failed to evaluate submission.', statusCode);
  }
};

module.exports = {
  submitAssessmentHandler,
  getMySubmissionsHandler,
  getAssessmentSubmissionsHandler,
  getSubmissionReportHandler,
  evaluateSubmissionHandler,
};
