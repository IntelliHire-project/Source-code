jest.mock('../../config/db', () => ({
  query: jest.fn(),
}));

const db = require('../../config/db');
const {
  formatAssessmentRow,
  generateNextAssessmentCode,
  createAssessment,
  findAssessmentByIdOrCode,
  findAllAssessments,
  updateAssessment,
  deleteAssessment,
  getAssessmentStats,
} = require('../../models/assessmentModel');

describe('assessmentModel Unit Tests', () => {
  let mockExecutor;

  beforeEach(() => {
    mockExecutor = {
      query: jest.fn(),
    };
    db.query.mockReset();
    jest.clearAllMocks();
  });

  describe('formatAssessmentRow', () => {
    test('formats DB row with snake_case to camelCase and frontend aliases', () => {
      const rawRow = {
        id: 1,
        assessment_code: 'A-1001',
        user_id: 10,
        recruiter_id: 5,
        vacancy_id: 2,
        title: 'React Senior Assessment',
        description: 'Comprehensive test for senior frontend roles',
        job_role: 'Senior Software Engineer — React',
        difficulty: 'Senior',
        duration: 90,
        passing_score: 75,
        total_points: 50,
        status: 'Active',
        questions: JSON.stringify([
          { id: 1, title: 'Explain React fiber', points: 20 },
          { id: 2, title: 'Implement custom hook', points: 30 },
        ]),
        settings: JSON.stringify({ shuffle: true }),
        author_name: 'John Recruiter',
        company_name: 'Acme Corp',
        vacancy_title: 'Lead Frontend Dev',
        invited_count: 12,
        created_at: '2026-11-12T00:00:00.000Z',
        updated_at: '2026-11-12T00:00:00.000Z',
      };

      const formatted = formatAssessmentRow(rawRow);

      expect(formatted).toEqual({
        id: 'A-1001',
        numericId: 1,
        assessmentCode: 'A-1001',
        title: 'React Senior Assessment',
        name: 'React Senior Assessment',
        description: 'Comprehensive test for senior frontend roles',
        jobRole: 'Senior Software Engineer — React',
        role: 'Senior Software Engineer — React',
        vacancy: 'Lead Frontend Dev',
        vacancyId: 2,
        userId: 10,
        recruiterId: 5,
        difficulty: 'Senior',
        duration: 90,
        passingScore: 75,
        passing: 75,
        totalPoints: 50,
        totalQ: 2,
        questionsCount: 2,
        status: 'Active',
        questions: [
          { id: 1, title: 'Explain React fiber', points: 20 },
          { id: 2, title: 'Implement custom hook', points: 30 },
        ],
        settings: { shuffle: true },
        author: 'John Recruiter',
        company: 'Acme Corp',
        invited: 12,
        createdAt: '2026-11-12T00:00:00.000Z',
        updatedAt: '2026-11-12T00:00:00.000Z',
      });
    });

    test('returns null for null or undefined input', () => {
      expect(formatAssessmentRow(null)).toBeNull();
      expect(formatAssessmentRow(undefined)).toBeNull();
    });

    test('handles empty questions and settings gracefully', () => {
      const rawRow = {
        id: 2,
        title: 'Draft Assessment',
        questions: null,
        settings: null,
      };

      const formatted = formatAssessmentRow(rawRow);
      expect(formatted.questions).toEqual([]);
      expect(formatted.settings).toEqual({});
      expect(formatted.totalPoints).toBe(0);
      expect(formatted.totalQ).toBe(0);
    });
  });

  describe('generateNextAssessmentCode', () => {
    test('increments the existing maximum code (e.g. A-1005 -> A-1006)', async () => {
      mockExecutor.query.mockResolvedValueOnce({
        rows: [{ assessment_code: 'A-1005' }],
      });

      const code = await generateNextAssessmentCode(mockExecutor);
      expect(code).toBe('A-1006');
    });

    test('starts at A-1001 when no codes exist', async () => {
      mockExecutor.query.mockResolvedValueOnce({
        rows: [],
      });

      const code = await generateNextAssessmentCode(mockExecutor);
      expect(code).toBe('A-1001');
    });

    test('falls back gracefully on DB error', async () => {
      mockExecutor.query.mockRejectedValueOnce(new Error('DB offline'));

      const code = await generateNextAssessmentCode(mockExecutor);
      expect(code).toMatch(/^A-\d+$/);
    });
  });

  describe('createAssessment', () => {
    test('throws 400 when title is missing or empty', async () => {
      await expect(createAssessment({ title: '   ' })).rejects.toThrow('Assessment title is required');
      await expect(createAssessment(null)).rejects.toThrow('Assessment title is required');
    });

    test('creates assessment and returns formatted record', async () => {
      mockExecutor.query
        .mockResolvedValueOnce({ rows: [{ assessment_code: 'A-1002' }] }) // generate code
        .mockResolvedValueOnce({
          rows: [
            {
              id: 10,
              assessment_code: 'A-1003',
              title: 'Full Stack Node Assessment',
              description: 'Backend & React test',
              job_role: 'Full Stack Developer',
              difficulty: 'Senior',
              duration: 75,
              passing_score: 80,
              total_points: 30,
              status: 'Draft',
              questions: JSON.stringify([{ id: 1, points: 30 }]),
              settings: JSON.stringify({}),
              created_at: '2026-11-12T00:00:00.000Z',
              updated_at: '2026-11-12T00:00:00.000Z',
            },
          ],
        });

      const result = await createAssessment(
        {
          title: 'Full Stack Node Assessment',
          description: 'Backend & React test',
          jobRole: 'Full Stack Developer',
          difficulty: 'Senior',
          duration: 75,
          passingScore: 80,
          questions: [{ id: 1, points: 30 }],
        },
        100, // userId
        20,  // recruiterId
        mockExecutor
      );

      expect(result.id).toBe('A-1003');
      expect(result.title).toBe('Full Stack Node Assessment');
      expect(result.totalPoints).toBe(30);
      expect(mockExecutor.query).toHaveBeenCalledTimes(2);
    });
  });

  describe('findAssessmentByIdOrCode', () => {
    test('finds assessment by numeric ID', async () => {
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: 5,
            assessment_code: 'A-1005',
            title: 'QA Automation Assessment',
          },
        ],
      });

      const result = await findAssessmentByIdOrCode(5);
      expect(result.title).toBe('QA Automation Assessment');
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('a.id = $1 OR a.assessment_code = $2'),
        [5, '5']
      );
    });

    test('finds assessment by assessment_code', async () => {
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: 8,
            assessment_code: 'A-2048',
            title: 'System Design Assessment',
          },
        ],
      });

      const result = await findAssessmentByIdOrCode('A-2048');
      expect(result.id).toBe('A-2048');
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('a.assessment_code = $1'),
        ['A-2048']
      );
    });

    test('returns null when assessment is not found', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });
      const result = await findAssessmentByIdOrCode(999);
      expect(result).toBeNull();
    });
  });

  describe('findAllAssessments', () => {
    test('lists assessments with filters, pagination, and total count', async () => {
      mockExecutor.query
        .mockResolvedValueOnce({ rows: [{ total: '2' }] }) // count query
        .mockResolvedValueOnce({
          rows: [
            { id: 1, assessment_code: 'A-1001', title: 'React 1', status: 'Active' },
            { id: 2, assessment_code: 'A-1002', title: 'React 2', status: 'Active' },
          ],
        });

      const result = await findAllAssessments(
        {
          search: 'React',
          status: 'Active',
          difficulty: 'Senior',
          recruiterId: 5,
          limit: 10,
          offset: 0,
        },
        mockExecutor
      );

      expect(result.total).toBe(2);
      expect(result.assessments).toHaveLength(2);
      expect(result.assessments[0].title).toBe('React 1');
      expect(mockExecutor.query).toHaveBeenCalledTimes(2);
    });
  });

  describe('updateAssessment', () => {
    test('throws 404 when assessment does not exist', async () => {
      mockExecutor.query.mockResolvedValueOnce({ rows: [] });

      await expect(
        updateAssessment(999, { title: 'New' }, null, null, mockExecutor)
      ).rejects.toThrow('Assessment not found');
    });

    test('throws 403 when recruiter is not the owner', async () => {
      mockExecutor.query.mockResolvedValueOnce({
        rows: [
          { id: 1, recruiter_id: 10, title: 'Old' },
        ],
      });

      await expect(
        updateAssessment(1, { title: 'New' }, null, 999, mockExecutor)
      ).rejects.toThrow('You do not have permission to edit this assessment');
    });

    test('throws 400 when updating title to empty string', async () => {
      mockExecutor.query.mockResolvedValueOnce({
        rows: [{ id: 1, recruiter_id: 10, title: 'Old' }],
      });

      await expect(
        updateAssessment(1, { title: '   ' }, null, 10, mockExecutor)
      ).rejects.toThrow('Assessment title cannot be empty');
    });

    test('updates assessment fields successfully and recalculates points', async () => {
      mockExecutor.query
        .mockResolvedValueOnce({
          rows: [{ id: 1, recruiter_id: 10, title: 'Old Assessment' }],
        }) // find
        .mockResolvedValueOnce({
          rows: [
            {
              id: 1,
              title: 'Updated Assessment',
              total_points: 40,
              questions: JSON.stringify([{ id: 1, points: 40 }]),
            },
          ],
        }); // update

      const result = await updateAssessment(
        1,
        {
          title: 'Updated Assessment',
          questions: [{ id: 1, points: 40 }],
        },
        null,
        10,
        mockExecutor
      );

      expect(result.title).toBe('Updated Assessment');
      expect(result.totalPoints).toBe(40);
    });
  });

  describe('deleteAssessment', () => {
    test('throws 404 when assessment not found', async () => {
      mockExecutor.query.mockResolvedValueOnce({ rows: [] });

      await expect(deleteAssessment(999, null, null, mockExecutor)).rejects.toThrow(
        'Assessment not found'
      );
    });

    test('throws 403 when recruiter is not the owner', async () => {
      mockExecutor.query.mockResolvedValueOnce({
        rows: [{ id: 1, recruiter_id: 5 }],
      });

      await expect(deleteAssessment(1, null, 99, mockExecutor)).rejects.toThrow(
        'You do not have permission to delete this assessment'
      );
    });

    test('deletes assessment successfully', async () => {
      mockExecutor.query
        .mockResolvedValueOnce({
          rows: [{ id: 1, assessment_code: 'A-1001', recruiter_id: 5 }],
        })
        .mockResolvedValueOnce({ rowCount: 1 });

      const result = await deleteAssessment(1, null, 5, mockExecutor);
      expect(result.success).toBe(true);
      expect(result.deletedAssessment.id).toBe('A-1001');
    });
  });

  describe('getAssessmentStats', () => {
    test('returns aggregate counts for recruiter assessments', async () => {
      mockExecutor.query.mockResolvedValueOnce({
        rows: [
          {
            total: '10',
            active: '6',
            draft: '3',
            archived: '1',
          },
        ],
      });

      const stats = await getAssessmentStats(5, mockExecutor);
      expect(stats).toEqual({
        total: 10,
        active: 6,
        draft: 3,
        archived: 1,
      });
    });
  });
});

