import apiInstance from '../api/apiInstance';
import {
  createAssessment,
  fetchAssessments,
  getAssessmentById,
  updateAssessment,
  deleteAssessment,
  fetchAssessmentStats,
  submitAssessment,
  fetchMySubmissions,
  fetchAssessmentSubmissions,
  fetchSubmissionReport,
  evaluateSubmission,
} from '../api/assessmentApi';

jest.mock('../api/apiInstance', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('assessmentApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('createAssessment sends POST to /assessments with data', async () => {
    const mockData = { title: 'React Test', duration: 60 };
    apiInstance.post.mockResolvedValueOnce({
      data: { working: true, assessment: { id: 'A-1001' } },
    });

    const result = await createAssessment(mockData);

    expect(apiInstance.post).toHaveBeenCalledWith('/assessments', mockData);
    expect(result).toEqual({ working: true, assessment: { id: 'A-1001' } });
  });

  test('fetchAssessments sends GET to /assessments with params', async () => {
    const params = { search: 'React', page: 1, limit: 10 };
    apiInstance.get.mockResolvedValueOnce({
      data: { working: true, assessments: [] },
    });

    const result = await fetchAssessments(params);

    expect(apiInstance.get).toHaveBeenCalledWith('/assessments', { params });
    expect(result).toEqual({ working: true, assessments: [] });
  });

  test('getAssessmentById sends GET to /assessments/:id', async () => {
    apiInstance.get.mockResolvedValueOnce({
      data: { working: true, assessment: { id: 'A-1001' } },
    });

    const result = await getAssessmentById('A-1001');

    expect(apiInstance.get).toHaveBeenCalledWith('/assessments/A-1001');
    expect(result).toEqual({ working: true, assessment: { id: 'A-1001' } });
  });

  test('updateAssessment sends PUT to /assessments/:id with data', async () => {
    const updates = { title: 'Updated' };
    apiInstance.put.mockResolvedValueOnce({
      data: { working: true, assessment: { id: 'A-1001', title: 'Updated' } },
    });

    const result = await updateAssessment('A-1001', updates);

    expect(apiInstance.put).toHaveBeenCalledWith('/assessments/A-1001', updates);
    expect(result).toEqual({ working: true, assessment: { id: 'A-1001', title: 'Updated' } });
  });

  test('deleteAssessment sends DELETE to /assessments/:id', async () => {
    apiInstance.delete.mockResolvedValueOnce({
      data: { working: true, message: 'Deleted' },
    });

    const result = await deleteAssessment('A-1001');

    expect(apiInstance.delete).toHaveBeenCalledWith('/assessments/A-1001');
    expect(result).toEqual({ working: true, message: 'Deleted' });
  });

  test('fetchAssessmentStats sends GET to /assessments/meta/stats', async () => {
    apiInstance.get.mockResolvedValueOnce({
      data: { working: true, stats: { total: 5 } },
    });

    const result = await fetchAssessmentStats();

    expect(apiInstance.get).toHaveBeenCalledWith('/assessments/meta/stats');
    expect(result).toEqual({ working: true, stats: { total: 5 } });
  });

  test('submitAssessment sends POST to /assessments/:id/submit with payload', async () => {
    const payload = { answers: { Q1: 1 }, timeSpentSeconds: 320 };
    apiInstance.post.mockResolvedValueOnce({
      data: { working: true, submission: { id: 'SUB-1001' } },
    });

    const result = await submitAssessment('A-1001', payload);

    expect(apiInstance.post).toHaveBeenCalledWith('/assessments/A-1001/submit', payload);
    expect(result).toEqual({ working: true, submission: { id: 'SUB-1001' } });
  });

  test('fetchMySubmissions sends GET to /assessments/my-submissions', async () => {
    apiInstance.get.mockResolvedValueOnce({
      data: { working: true, submissions: [] },
    });

    const result = await fetchMySubmissions();

    expect(apiInstance.get).toHaveBeenCalledWith('/assessments/my-submissions');
    expect(result).toEqual({ working: true, submissions: [] });
  });

  test('fetchAssessmentSubmissions sends GET to /assessments/:id/submissions or /assessments/submissions', async () => {
    apiInstance.get.mockResolvedValueOnce({
      data: { working: true, submissions: [{ id: 'SUB-1001' }] },
    });
    const byAssessment = await fetchAssessmentSubmissions('A-1001');
    expect(apiInstance.get).toHaveBeenCalledWith('/assessments/A-1001/submissions');
    expect(byAssessment).toEqual({ working: true, submissions: [{ id: 'SUB-1001' }] });

    apiInstance.get.mockResolvedValueOnce({
      data: { working: true, submissions: [] },
    });
    const allSubs = await fetchAssessmentSubmissions();
    expect(apiInstance.get).toHaveBeenCalledWith('/assessments/submissions');
    expect(allSubs).toEqual({ working: true, submissions: [] });
  });

  test('fetchSubmissionReport sends GET to /assessments/submissions/:submissionId', async () => {
    apiInstance.get.mockResolvedValueOnce({
      data: { working: true, submission: { id: 'SUB-1001' } },
    });

    const result = await fetchSubmissionReport('SUB-1001');

    expect(apiInstance.get).toHaveBeenCalledWith('/assessments/submissions/SUB-1001');
    expect(result).toEqual({ working: true, submission: { id: 'SUB-1001' } });
  });

  test('evaluateSubmission sends PUT to /assessments/submissions/:submissionId/evaluate', async () => {
    const evalPayload = { manualScores: { Q2: 18 }, recommendation: 'Shortlist' };
    apiInstance.put.mockResolvedValueOnce({
      data: { working: true, submission: { id: 'SUB-1001', finalScore: 90 } },
    });

    const result = await evaluateSubmission('SUB-1001', evalPayload);

    expect(apiInstance.put).toHaveBeenCalledWith('/assessments/submissions/SUB-1001/evaluate', evalPayload);
    expect(result).toEqual({ working: true, submission: { id: 'SUB-1001', finalScore: 90 } });
  });
});

