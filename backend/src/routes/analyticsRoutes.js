const express = require('express');
const router = express.Router();
const {
  getApplicantAnalyticsHandler,
  getAssessmentAnalyticsHandler,
  getShortlistingAnalyticsHandler,
  getRecruitmentProgressHandler,
  getOverviewAnalyticsHandler,
} = require('../controllers/analyticsController');

// Recruiter Analytics Endpoints
router.get('/applicants', getApplicantAnalyticsHandler);
router.get('/assessments', getAssessmentAnalyticsHandler);
router.get('/shortlisting', getShortlistingAnalyticsHandler);
router.get('/progress', getRecruitmentProgressHandler);
router.get('/overview', getOverviewAnalyticsHandler);
router.get('/', getOverviewAnalyticsHandler);

module.exports = router;

