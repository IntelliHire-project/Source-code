const {
  getApplicantAnalytics,
  getAssessmentAnalytics,
  getShortlistingAnalytics,
  getRecruitmentProgress,
  getOverviewAnalytics,
} = require('../models/analyticsModel');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * GET /api/analytics/applicants
 */
const getApplicantAnalyticsHandler = async (req, res) => {
  try {
    const filters = {
      position: req.query.position || 'all',
      department: req.query.department || 'all',
      search: req.query.search || '',
    };
    const data = await getApplicantAnalytics(filters);
    return successResponse(res, 'Applicant analytics retrieved successfully.', data);
  } catch (error) {
    console.error('[AnalyticsController] getApplicantAnalyticsHandler error:', error);
    return errorResponse(res, 'Failed to retrieve applicant analytics: ' + error.message, 500);
  }
};

/**
 * GET /api/analytics/assessments
 */
const getAssessmentAnalyticsHandler = async (req, res) => {
  try {
    const data = await getAssessmentAnalytics();
    return successResponse(res, 'Assessment analytics retrieved successfully.', data);
  } catch (error) {
    console.error('[AnalyticsController] getAssessmentAnalyticsHandler error:', error);
    return errorResponse(res, 'Failed to retrieve assessment analytics: ' + error.message, 500);
  }
};

/**
 * GET /api/analytics/shortlisting
 */
const getShortlistingAnalyticsHandler = async (req, res) => {
  try {
    const filters = {
      role: req.query.role || 'all',
      status: req.query.status || 'all',
      search: req.query.search || '',
    };
    const data = await getShortlistingAnalytics(filters);
    return successResponse(res, 'Shortlisting analytics retrieved successfully.', data);
  } catch (error) {
    console.error('[AnalyticsController] getShortlistingAnalyticsHandler error:', error);
    return errorResponse(res, 'Failed to retrieve shortlisting analytics: ' + error.message, 500);
  }
};

/**
 * GET /api/analytics/progress
 */
const getRecruitmentProgressHandler = async (req, res) => {
  try {
    const data = await getRecruitmentProgress();
    return successResponse(res, 'Recruitment progress analytics retrieved successfully.', data);
  } catch (error) {
    console.error('[AnalyticsController] getRecruitmentProgressHandler error:', error);
    return errorResponse(res, 'Failed to retrieve recruitment progress: ' + error.message, 500);
  }
};

/**
 * GET /api/analytics/overview
 */
const getOverviewAnalyticsHandler = async (req, res) => {
  try {
    const data = await getOverviewAnalytics();
    return successResponse(res, 'Overview analytics retrieved successfully.', data);
  } catch (error) {
    console.error('[AnalyticsController] getOverviewAnalyticsHandler error:', error);
    return errorResponse(res, 'Failed to retrieve overview analytics: ' + error.message, 500);
  }
};

module.exports = {
  getApplicantAnalyticsHandler,
  getAssessmentAnalyticsHandler,
  getShortlistingAnalyticsHandler,
  getRecruitmentProgressHandler,
  getOverviewAnalyticsHandler,
};

