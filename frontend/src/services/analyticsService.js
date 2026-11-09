import * as analyticsApi from '../api/analyticsApi';

/**
 * Service to retrieve Applicant Analytics
 */
export const getApplicantAnalytics = async (filters = {}) => {
  try {
    const data = await analyticsApi.fetchApplicantAnalytics(filters);
    return data;
  } catch (error) {
    console.warn('[AnalyticsService] Falling back on applicant analytics:', error.message);
    return null;
  }
};

/**
 * Service to retrieve Assessment Analytics
 */
export const getAssessmentAnalytics = async () => {
  try {
    const data = await analyticsApi.fetchAssessmentAnalytics();
    return data;
  } catch (error) {
    console.warn('[AnalyticsService] Falling back on assessment analytics:', error.message);
    return null;
  }
};

/**
 * Service to retrieve Shortlisting Analytics
 */
export const getShortlistingAnalytics = async (filters = {}) => {
  try {
    const data = await analyticsApi.fetchShortlistingAnalytics(filters);
    return data;
  } catch (error) {
    console.warn('[AnalyticsService] Falling back on shortlisting analytics:', error.message);
    return null;
  }
};

/**
 * Service to retrieve Recruitment Progress Analytics
 */
export const getRecruitmentProgress = async () => {
  try {
    const data = await analyticsApi.fetchRecruitmentProgress();
    return data;
  } catch (error) {
    console.warn('[AnalyticsService] Falling back on recruitment progress:', error.message);
    return null;
  }
};

/**
 * Service to retrieve Overview Dashboard Analytics
 */
export const getOverviewAnalytics = async () => {
  try {
    const data = await analyticsApi.fetchOverviewAnalytics();
    return data;
  } catch (error) {
    console.warn('[AnalyticsService] Falling back on overview analytics:', error.message);
    return null;
  }
};

