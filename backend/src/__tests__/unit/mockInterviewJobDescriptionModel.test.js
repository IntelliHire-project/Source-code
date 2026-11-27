jest.mock('../../config/db', () => ({
  query: jest.fn(),
}));

const db = require('../../config/db');
const {
  formatJobDescriptionRow,
  createJobDescription,
  findAllJobDescriptions,
  findJobDescriptionById,
  findLatestJobDescription,
  updateJobDescription,
  deleteJobDescription,
  saveSelectedJobDescription,
} = require('../../models/mockInterviewJobDescriptionModel');

describe('mockInterviewJobDescriptionModel Unit Tests', () => {
  let mockExecutor;

  beforeEach(() => {
    mockExecutor = {
      query: jest.fn(),
    };
    db.query.mockReset();
    jest.clearAllMocks();
  });

  // =========================================================================
  // 1. formatJobDescriptionRow
  // =========================================================================
  describe('formatJobDescriptionRow', () => {
    test('formats DB row with snake_case to camelCase properly', () => {
      const rawRow = {
        id: 1,
        user_id: '10',
        role_id: 'backend',
        title: 'Backend Developer',
        job_description: 'Build backend APIs with Express and PostgreSQL.',
        skills: '["Node.js", "Express", "PostgreSQL"]',
        experience_level: 'senior',
        company: 'TechCorp',
        source: 'candidate_submission',
        created_at: '2026-11-18T10:00:00.000Z',
        updated_at: '2026-11-18T10:00:00.000Z',
      };

      const formatted = formatJobDescriptionRow(rawRow);

      expect(formatted).toEqual({
        id: 1,
        userId: 10,
        roleId: 'backend',
        title: 'Backend Developer',
        jobDescription: 'Build backend APIs with Express and PostgreSQL.',
        skills: ['Node.js', 'Express', 'PostgreSQL'],
        experienceLevel: 'senior',
        company: 'TechCorp',
        source: 'candidate_submission',
        createdAt: '2026-11-18T10:00:00.000Z',
        updatedAt: '2026-11-18T10:00:00.000Z',
      });
    });

    test('returns null for empty or null row', () => {
      expect(formatJobDescriptionRow(null)).toBeNull();
      expect(formatJobDescriptionRow(undefined)).toBeNull();
    });

    test('handles skills as native array and invalid JSON strings gracefully', () => {
      const nativeArrayRow = {
        id: 2,
        user_id: null,
        job_description: 'Native array skills test',
        skills: ['React', 'CSS'],
      };
      expect(formatJobDescriptionRow(nativeArrayRow).skills).toEqual(['React', 'CSS']);

      const invalidJsonRow = {
        id: 3,
        job_description: 'Corrupted skills test',
        skills: '{invalid:json}',
      };
      expect(formatJobDescriptionRow(invalidJsonRow).skills).toEqual([]);
    });
  });

  // =========================================================================
  // 2. createJobDescription
  // =========================================================================
  describe('createJobDescription', () => {
    test('throws 400 error when job description is empty or missing', async () => {
      await expect(createJobDescription({ jobDescription: '   ' }, null, mockExecutor)).rejects.toThrow(
        'Job description is required.'
      );
      expect(mockExecutor.query).not.toHaveBeenCalled();
    });

    test('inserts record into database and returns formatted row on success', async () => {
      const dbRow = {
        id: 5,
        user_id: 1,
        role_id: 'frontend',
        title: 'Frontend Developer',
        job_description: 'Build React UI components and state logic.',
        skills: ['React', 'Redux'],
        experience_level: 'mid',
        company: 'Acme Inc',
        source: 'custom',
        created_at: '2026-11-18T12:00:00.000Z',
        updated_at: '2026-11-18T12:00:00.000Z',
      };
      mockExecutor.query.mockResolvedValueOnce({ rows: [dbRow] });

      const result = await createJobDescription(
        {
          roleId: 'frontend',
          title: 'Frontend Developer',
          jobDescription: 'Build React UI components and state logic.',
          skills: ['React', 'Redux'],
          experienceLevel: 'mid',
          company: 'Acme Inc',
        },
        { id: 1 },
        mockExecutor
      );

      expect(mockExecutor.query).toHaveBeenCalledTimes(1);
      expect(result.id).toBe(5);
      expect(result.userId).toBe(1);
      expect(result.roleId).toBe('frontend');
      expect(result.jobDescription).toBe('Build React UI components and state logic.');
    });

    test('falls back gracefully to in-memory object on database error', async () => {
      mockExecutor.query.mockRejectedValueOnce(new Error('Connection lost'));

      const result = await createJobDescription(
        {
          roleId: 'backend',
          title: 'Backend Dev',
          jobDescription: 'Node.js backend role description.',
          skills: 'Node.js, Postgres',
        },
        { id: 2 },
        mockExecutor
      );

      expect(result).toHaveProperty('id');
      expect(result.userId).toBe(2);
      expect(result.roleId).toBe('backend');
      expect(result.jobDescription).toBe('Node.js backend role description.');
      expect(result.skills).toEqual(['Node.js', 'Postgres']);
    });
  });

  // =========================================================================
  // 3. findAllJobDescriptions
  // =========================================================================
  describe('findAllJobDescriptions', () => {
    test('constructs parameterized queries with filters and pagination', async () => {
      const mockRows = [
        { id: 1, user_id: 3, role_id: 'data', title: 'Data Analyst', job_description: 'SQL queries' },
      ];
      mockExecutor.query.mockResolvedValueOnce({ rows: mockRows });

      const result = await findAllJobDescriptions(
        {
          userId: 3,
          roleId: 'data',
          search: 'SQL',
          page: 2,
          limit: 10,
        },
        mockExecutor
      );

      expect(mockExecutor.query).toHaveBeenCalledTimes(1);
      const [sql, params] = mockExecutor.query.mock.calls[0];
      expect(sql).toContain('WHERE 1=1');
      expect(sql).toContain('user_id = $1');
      expect(sql).toContain('role_id = $2');
      expect(sql).toContain('LOWER(title) LIKE $3 OR LOWER(job_description) LIKE $3');
      expect(sql).toContain('LIMIT $4');
      expect(sql).toContain('OFFSET $5');
      expect(params).toEqual([3, 'data', '%sql%', 10, 10]);
      expect(result.length).toBe(1);
    });

    test('returns empty array when database query fails', async () => {
      mockExecutor.query.mockRejectedValueOnce(new Error('Query execution failed'));

      const result = await findAllJobDescriptions({}, mockExecutor);
      expect(result).toEqual([]);
    });
  });

  // =========================================================================
  // 4. findJobDescriptionById
  // =========================================================================
  describe('findJobDescriptionById', () => {
    test('returns null when id is missing or falsy', async () => {
      const result = await findJobDescriptionById(null, mockExecutor);
      expect(result).toBeNull();
      expect(mockExecutor.query).not.toHaveBeenCalled();
    });

    test('retrieves and formats single job description by ID', async () => {
      const mockRow = {
        id: 7,
        user_id: 1,
        title: 'Security Analyst',
        job_description: 'Penetration testing and security auditing.',
      };
      mockExecutor.query.mockResolvedValueOnce({ rows: [mockRow] });

      const result = await findJobDescriptionById(7, mockExecutor);
      expect(result.id).toBe(7);
      expect(result.title).toBe('Security Analyst');
    });

    test('returns null when no matching row is returned', async () => {
      mockExecutor.query.mockResolvedValueOnce({ rows: [] });

      const result = await findJobDescriptionById(999, mockExecutor);
      expect(result).toBeNull();
    });

    test('returns null when query throws an error', async () => {
      mockExecutor.query.mockRejectedValueOnce(new Error('DB failure'));

      const result = await findJobDescriptionById(1, mockExecutor);
      expect(result).toBeNull();
    });
  });

  // =========================================================================
  // 5. findLatestJobDescription
  // =========================================================================
  describe('findLatestJobDescription', () => {
    test('queries latest job description ordered by updated_at and id DESC', async () => {
      const mockRow = {
        id: 42,
        user_id: 5,
        title: 'Lead Architect',
        job_description: 'Architecting distributed cloud solutions.',
      };
      mockExecutor.query.mockResolvedValueOnce({ rows: [mockRow] });

      const result = await findLatestJobDescription(5, mockExecutor);

      expect(mockExecutor.query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY updated_at DESC, id DESC LIMIT 1;'),
        [5]
      );
      expect(result.id).toBe(42);
      expect(result.title).toBe('Lead Architect');
    });

    test('handles query without userId', async () => {
      mockExecutor.query.mockResolvedValueOnce({ rows: [] });

      const result = await findLatestJobDescription(null, mockExecutor);
      expect(mockExecutor.query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY updated_at DESC, id DESC LIMIT 1;'),
        []
      );
      expect(result).toBeNull();
    });
  });

  // =========================================================================
  // 6. updateJobDescription
  // =========================================================================
  describe('updateJobDescription', () => {
    test('throws 404 when target job description does not exist', async () => {
      mockExecutor.query.mockResolvedValueOnce({ rows: [] });

      await expect(
        updateJobDescription(404, { title: 'Updated' }, { id: 1 }, mockExecutor)
      ).rejects.toThrow('Job description not found.');
    });

    test('throws 403 when non-admin user attempts to update another user record', async () => {
      const existingRow = { id: 10, user_id: 99, job_description: 'Original text' };
      mockExecutor.query.mockResolvedValueOnce({ rows: [existingRow] });

      await expect(
        updateJobDescription(10, { title: 'Hacked' }, { id: 1, role: 'candidate' }, mockExecutor)
      ).rejects.toThrow('Access denied. You do not have permission to update this job description.');
    });

    test('allows administrator to update any job description', async () => {
      const existingRow = { id: 10, user_id: 99, job_description: 'Original text', title: 'Old' };
      const updatedRow = { id: 10, user_id: 99, job_description: 'Admin updated text', title: 'New' };
      mockExecutor.query
        .mockResolvedValueOnce({ rows: [existingRow] })
        .mockResolvedValueOnce({ rows: [updatedRow] });

      const result = await updateJobDescription(
        10,
        { jobDescription: 'Admin updated text', title: 'New' },
        { id: 999, role: 'admin' },
        mockExecutor
      );

      expect(result.title).toBe('New');
      expect(result.jobDescription).toBe('Admin updated text');
    });

    test('updates fields and falls back to merged object if database query fails', async () => {
      const existingRow = { id: 15, user_id: 5, job_description: 'Original text', title: 'Original' };
      mockExecutor.query
        .mockResolvedValueOnce({ rows: [existingRow] })
        .mockRejectedValueOnce(new Error('Update failed'));

      const result = await updateJobDescription(
        15,
        { title: 'New Title', jobDescription: 'New Description' },
        { id: 5, role: 'candidate' },
        mockExecutor
      );

      expect(result.id).toBe(15);
      expect(result.title).toBe('New Title');
      expect(result.jobDescription).toBe('New Description');
    });
  });

  // =========================================================================
  // 7. deleteJobDescription
  // =========================================================================
  describe('deleteJobDescription', () => {
    test('throws 400 when id is missing', async () => {
      await expect(deleteJobDescription(null, null, mockExecutor)).rejects.toThrow(
        'Job description identifier is required.'
      );
    });

    test('throws 404 when target job description does not exist', async () => {
      mockExecutor.query.mockResolvedValueOnce({ rows: [] });

      await expect(deleteJobDescription(999, { id: 1 }, mockExecutor)).rejects.toThrow(
        'Job description not found.'
      );
    });

    test('throws 403 when non-admin user attempts to delete another user record', async () => {
      const existingRow = { id: 20, user_id: 50, job_description: 'Delete test' };
      mockExecutor.query.mockResolvedValueOnce({ rows: [existingRow] });

      await expect(
        deleteJobDescription(20, { id: 1, role: 'candidate' }, mockExecutor)
      ).rejects.toThrow('Access denied. You do not have permission to delete this job description.');
    });

    test('deletes job description when user is creator and returns true', async () => {
      const existingRow = { id: 25, user_id: 5, job_description: 'Delete test' };
      mockExecutor.query
        .mockResolvedValueOnce({ rows: [existingRow] })
        .mockResolvedValueOnce({ rowCount: 1 });

      const result = await deleteJobDescription(25, { id: 5, role: 'candidate' }, mockExecutor);
      expect(result).toBe(true);
      expect(mockExecutor.query).toHaveBeenLastCalledWith(
        expect.stringContaining('DELETE FROM mock_interview_job_descriptions WHERE id = $1;'),
        [25]
      );
    });
  });

  // =========================================================================
  // 8. saveSelectedJobDescription
  // =========================================================================
  describe('saveSelectedJobDescription', () => {
    test('creates JD and syncs with mock_interview_selected_roles', async () => {
      const createdDbRow = {
        id: 100,
        user_id: 1,
        role_id: 'backend',
        title: 'Backend Developer',
        job_description: 'Full stack and backend engineering.',
      };
      // 1. createJobDescription insert
      // 2. update mock_interview_selected_roles
      mockExecutor.query
        .mockResolvedValueOnce({ rows: [createdDbRow] })
        .mockResolvedValueOnce({ rows: [{ id: 1, job_description: 'Full stack and backend engineering.' }] });

      const result = await saveSelectedJobDescription(
        {
          roleId: 'backend',
          roleTitle: 'Backend Developer',
          jobDescription: 'Full stack and backend engineering.',
        },
        { id: 1 },
        mockExecutor
      );

      expect(result.id).toBe(100);
      expect(result.jobDescription).toBe('Full stack and backend engineering.');
      expect(mockExecutor.query).toHaveBeenCalledTimes(2);
    });

    test('inserts into mock_interview_selected_roles when existing row is not found', async () => {
      const createdDbRow = {
        id: 101,
        user_id: 2,
        role_id: 'qa',
        title: 'QA Engineer',
        job_description: 'Test automation role description.',
      };
      // 1. createJobDescription insert
      // 2. update with role_id returns []
      // 3. update with user_id returns []
      // 4. insert new mock_interview_selected_roles
      mockExecutor.query
        .mockResolvedValueOnce({ rows: [createdDbRow] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ id: 1 }] });

      const result = await saveSelectedJobDescription(
        {
          roleId: 'qa',
          roleTitle: 'QA Engineer',
          jobDescription: 'Test automation role description.',
        },
        { id: 2 },
        mockExecutor
      );

      expect(result.id).toBe(101);
      expect(mockExecutor.query).toHaveBeenCalledTimes(4);
      expect(mockExecutor.query.mock.calls[3][0]).toContain(
        'INSERT INTO mock_interview_selected_roles'
      );
    });

    test('handles empty / omitted description without failing session save', async () => {
      // 1. update mock_interview_selected_roles
      mockExecutor.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

      const result = await saveSelectedJobDescription(
        {
          roleId: 'frontend',
          roleTitle: 'Frontend Developer',
          jobDescription: '',
        },
        { id: 3 },
        mockExecutor
      );

      expect(result.jobDescription).toBe('');
      expect(result.roleId).toBe('frontend');
    });
  });
});
