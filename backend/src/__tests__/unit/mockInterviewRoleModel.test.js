jest.mock('../../config/db', () => ({
  query: jest.fn(),
}));

const db = require('../../config/db');
const {
  DEFAULT_ROLES,
  DEFAULT_CATEGORIES,
  isSystemDefaultRole,
  formatRoleRow,
  generateRoleId,
  findJobRoleByTitle,
  createJobRole,
  findAllJobRoles,
  findJobRoleById,
  updateJobRole,
  deleteJobRole,
  getJobRoleCategories,
} = require('../../models/mockInterviewRoleModel');

describe('mockInterviewRoleModel Unit Tests', () => {
  let mockExecutor;

  beforeEach(() => {
    mockExecutor = {
      query: jest.fn(),
    };
    db.query.mockReset();
    jest.clearAllMocks();
  });

  describe('isSystemDefaultRole', () => {
    test('identifies default core roles', () => {
      expect(isSystemDefaultRole({ roleId: 'backend' })).toBe(true);
      expect(isSystemDefaultRole({ id: 'frontend' })).toBe(true);
      expect(isSystemDefaultRole({ isCustom: false })).toBe(true);
      expect(isSystemDefaultRole({ is_custom: false })).toBe(true);
    });

    test('returns false for custom roles', () => {
      expect(isSystemDefaultRole({ roleId: 'custom-ml-123', isCustom: true })).toBe(false);
      expect(isSystemDefaultRole(null)).toBe(false);
    });
  });

  describe('formatRoleRow', () => {
    test('formats DB row with snake_case to camelCase', () => {
      const rawRow = {
        id: 1,
        role_id: 'custom-dev',
        title: 'Custom Dev',
        description: 'Test description',
        category: 'engineering',
        icon: 'Sparkles',
        is_custom: true,
        user_id: 10,
        skills: '["Node.js", "Docker"]',
        created_at: '2026-11-12T00:00:00.000Z',
        updated_at: '2026-11-12T00:00:00.000Z',
      };

      const formatted = formatRoleRow(rawRow);

      expect(formatted).toEqual({
        id: 'custom-dev',
        numericId: 1,
        roleId: 'custom-dev',
        title: 'Custom Dev',
        description: 'Test description',
        category: 'engineering',
        icon: 'Sparkles',
        isCustom: true,
        userId: 10,
        skills: ['Node.js', 'Docker'],
        createdAt: '2026-11-12T00:00:00.000Z',
        updatedAt: '2026-11-12T00:00:00.000Z',
      });
    });

    test('returns null for empty input', () => {
      expect(formatRoleRow(null)).toBeNull();
    });
  });

  describe('generateRoleId', () => {
    test('generates slug with custom prefix when isCustom is true', () => {
      const slug = generateRoleId('Cloud Solutions Architect', true);
      expect(slug).toMatch(/^custom-cloud-solutions-architect-\d{4}$/);
    });

    test('generates clean slug when isCustom is false', () => {
      const slug = generateRoleId('Cloud Solutions Architect', false);
      expect(slug).toBe('cloud-solutions-architect');
    });

    test('handles fallback when title is empty', () => {
      const slug = generateRoleId('', true);
      expect(slug).toMatch(/^custom-\d+$/);
    });
  });

  describe('findJobRoleByTitle', () => {
    test('returns role when matching title is found in database', async () => {
      mockExecutor.query.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            role_id: 'backend',
            title: 'Backend Developer',
            category: 'engineering',
            skills: [],
          },
        ],
      });

      const role = await findJobRoleByTitle('Backend Developer', null, mockExecutor);

      expect(role).not.toBeNull();
      expect(role.title).toBe('Backend Developer');
      expect(mockExecutor.query).toHaveBeenCalledWith(
        expect.stringContaining('LOWER(TRIM(title)) = $1'),
        ['backend developer']
      );
    });

    test('falls back to default roles when DB has no rows or fails', async () => {
      mockExecutor.query.mockRejectedValueOnce(new Error('DB offline'));

      const role = await findJobRoleByTitle('Frontend Developer', null, mockExecutor);

      expect(role).not.toBeNull();
      expect(role.roleId).toBe('frontend');
    });

    test('returns null if role title is not found', async () => {
      mockExecutor.query.mockResolvedValueOnce({ rows: [] });

      const role = await findJobRoleByTitle('Nonexistent Role Title', null, mockExecutor);

      expect(role).toBeNull();
    });
  });

  describe('createJobRole', () => {
    test('throws 400 error when title is missing', async () => {
      await expect(createJobRole({ title: '' }, null, mockExecutor)).rejects.toMatchObject({
        message: 'Role title is required.',
        statusCode: 400,
      });
    });

    test('throws 409 conflict when duplicate title exists', async () => {
      mockExecutor.query.mockResolvedValueOnce({
        rows: [{ id: 1, role_id: 'backend', title: 'Backend Developer' }],
      });

      await expect(
        createJobRole({ title: 'Backend Developer' }, null, mockExecutor)
      ).rejects.toMatchObject({
        message: 'A job role with the title "Backend Developer" already exists.',
        statusCode: 409,
      });
    });

    test('creates role successfully in database', async () => {
      // 1. findJobRoleByTitle check -> no duplicate
      mockExecutor.query.mockResolvedValueOnce({ rows: [] });
      // 2. INSERT query -> returns inserted role
      mockExecutor.query.mockResolvedValueOnce({
        rows: [
          {
            id: 10,
            role_id: 'custom-ai-dev',
            title: 'AI Developer',
            description: 'Building AI tools.',
            category: 'engineering',
            icon: 'Sparkles',
            is_custom: true,
            user_id: 3,
            skills: ['Python', 'PyTorch'],
          },
        ],
      });

      const user = { id: 3, role: 'candidate' };
      const role = await createJobRole(
        {
          title: 'AI Developer',
          category: 'engineering',
          skills: ['Python', 'PyTorch'],
        },
        user,
        mockExecutor
      );

      expect(role).not.toBeNull();
      expect(role.title).toBe('AI Developer');
      expect(role.isCustom).toBe(true);
      expect(role.userId).toBe(3);
    });

    test('gracefully falls back to in-memory role when DB is unavailable', async () => {
      // 1. Duplicate check DB fails
      mockExecutor.query.mockRejectedValueOnce(new Error('DB offline'));
      // 2. INSERT query fails
      mockExecutor.query.mockRejectedValueOnce(new Error('DB offline'));

      const role = await createJobRole(
        { title: 'Offline Custom Role' },
        { id: 1 },
        mockExecutor
      );

      expect(role).not.toBeNull();
      expect(role.title).toBe('Offline Custom Role');
      expect(role.isCustom).toBe(true);
    });
  });

  describe('findAllJobRoles', () => {
    test('returns roles from database', async () => {
      mockExecutor.query.mockResolvedValueOnce({
        rows: [
          { id: 1, role_id: 'backend', title: 'Backend Developer', is_custom: false },
          { id: 2, role_id: 'frontend', title: 'Frontend Developer', is_custom: false },
        ],
      });

      const roles = await findAllJobRoles({}, mockExecutor);

      expect(roles).toHaveLength(2);
      expect(roles[0].title).toBe('Backend Developer');
    });

    test('returns empty array when filter matches no rows', async () => {
      mockExecutor.query.mockResolvedValueOnce({ rows: [] });

      const roles = await findAllJobRoles({ search: 'NonExistentXYZ' }, mockExecutor);

      expect(roles).toEqual([]);
    });

    test('falls back to DEFAULT_ROLES when DB fails', async () => {
      mockExecutor.query.mockRejectedValueOnce(new Error('Connection error'));

      const roles = await findAllJobRoles({ category: 'engineering' }, mockExecutor);

      expect(roles.length).toBeGreaterThan(0);
      expect(roles.every((r) => r.category === 'engineering')).toBe(true);
    });
  });

  describe('findJobRoleById', () => {
    test('finds role from database', async () => {
      mockExecutor.query.mockResolvedValueOnce({
        rows: [{ id: 1, role_id: 'backend', title: 'Backend Developer' }],
      });

      const role = await findJobRoleById('backend', mockExecutor);

      expect(role).not.toBeNull();
      expect(role.roleId).toBe('backend');
    });

    test('falls back to default roles when not found in DB or DB fails', async () => {
      mockExecutor.query.mockRejectedValueOnce(new Error('DB offline'));

      const role = await findJobRoleById('frontend', mockExecutor);

      expect(role).not.toBeNull();
      expect(role.title).toBe('Frontend Developer');
    });

    test('returns null if role does not exist', async () => {
      mockExecutor.query.mockResolvedValueOnce({ rows: [] });

      const role = await findJobRoleById('totally-unknown-id', mockExecutor);

      expect(role).toBeNull();
    });
  });

  describe('updateJobRole', () => {
    test('throws 404 when role does not exist', async () => {
      mockExecutor.query.mockResolvedValueOnce({ rows: [] });

      await expect(
        updateJobRole('missing-role', { title: 'New Title' }, null, mockExecutor)
      ).rejects.toMatchObject({
        message: 'Job role not found.',
        statusCode: 404,
      });
    });

    test('throws 403 when non-admin attempts to update system default role', async () => {
      // Find role -> returns system default role
      mockExecutor.query.mockResolvedValueOnce({
        rows: [{ id: 1, role_id: 'backend', title: 'Backend Developer', is_custom: false }],
      });

      const user = { id: 5, role: 'candidate' };
      await expect(
        updateJobRole('backend', { title: 'Modified Backend' }, user, mockExecutor)
      ).rejects.toMatchObject({
        message: 'System default job roles can only be modified by an administrator.',
        statusCode: 403,
      });
    });

    test('throws 403 when user does not own custom role', async () => {
      // Find role -> returns custom role created by user 99
      mockExecutor.query.mockResolvedValueOnce({
        rows: [
          {
            id: 20,
            role_id: 'custom-ml',
            title: 'ML Lead',
            is_custom: true,
            user_id: 99,
          },
        ],
      });

      const user = { id: 5, role: 'candidate' };
      await expect(
        updateJobRole('custom-ml', { title: 'New ML' }, user, mockExecutor)
      ).rejects.toMatchObject({
        message: 'Access denied. You do not have permission to update this job role.',
        statusCode: 403,
      });
    });

    test('throws 409 when renaming causes duplicate title', async () => {
      // 1. Find existing custom role
      mockExecutor.query.mockResolvedValueOnce({
        rows: [
          {
            id: 20,
            role_id: 'custom-ml',
            title: 'ML Lead',
            is_custom: true,
            user_id: 5,
          },
        ],
      });
      // 2. Duplicate title check -> conflicts with existing
      mockExecutor.query.mockResolvedValueOnce({
        rows: [{ id: 2, role_id: 'frontend', title: 'Frontend Developer' }],
      });

      const user = { id: 5, role: 'candidate' };
      await expect(
        updateJobRole('custom-ml', { title: 'Frontend Developer' }, user, mockExecutor)
      ).rejects.toMatchObject({
        message: 'A job role with the title "Frontend Developer" already exists.',
        statusCode: 409,
      });
    });

    test('updates custom role successfully', async () => {
      // 1. Find existing role
      mockExecutor.query.mockResolvedValueOnce({
        rows: [
          {
            id: 20,
            role_id: 'custom-ml',
            title: 'ML Lead',
            is_custom: true,
            user_id: 5,
            skills: ['Python'],
          },
        ],
      });
      // 2. UPDATE query
      mockExecutor.query.mockResolvedValueOnce({
        rows: [
          {
            id: 20,
            role_id: 'custom-ml',
            title: 'ML Lead',
            description: 'Updated description',
            category: 'engineering',
            icon: 'Sparkles',
            is_custom: true,
            user_id: 5,
            skills: ['Python', 'TensorFlow'],
          },
        ],
      });

      const user = { id: 5, role: 'candidate' };
      const updated = await updateJobRole(
        'custom-ml',
        { description: 'Updated description', skills: ['Python', 'TensorFlow'] },
        user,
        mockExecutor
      );

      expect(updated.description).toBe('Updated description');
      expect(updated.skills).toEqual(['Python', 'TensorFlow']);
    });
  });

  describe('deleteJobRole', () => {
    test('throws 400 when identifier is missing', async () => {
      await expect(deleteJobRole('', null, mockExecutor)).rejects.toMatchObject({
        message: 'Job role identifier is required.',
        statusCode: 400,
      });
    });

    test('throws 404 when role does not exist', async () => {
      mockExecutor.query.mockResolvedValueOnce({ rows: [] });

      await expect(deleteJobRole('missing-id', null, mockExecutor)).rejects.toMatchObject({
        message: 'Job role not found.',
        statusCode: 404,
      });
    });

    test('throws 403 when attempting to delete system default role', async () => {
      mockExecutor.query.mockResolvedValueOnce({
        rows: [{ id: 1, role_id: 'backend', is_custom: false }],
      });

      await expect(deleteJobRole('backend', null, mockExecutor)).rejects.toMatchObject({
        message: 'System default job roles cannot be deleted.',
        statusCode: 403,
      });
    });

    test('throws 403 when user is not the owner of custom role', async () => {
      mockExecutor.query.mockResolvedValueOnce({
        rows: [{ id: 10, role_id: 'custom-user-1', is_custom: true, user_id: 99 }],
      });

      const user = { id: 10, role: 'candidate' };
      await expect(deleteJobRole('custom-user-1', user, mockExecutor)).rejects.toMatchObject({
        message: 'Access denied. You do not have permission to delete this job role.',
        statusCode: 403,
      });
    });

    test('deletes custom role successfully', async () => {
      mockExecutor.query.mockResolvedValueOnce({
        rows: [{ id: 10, role_id: 'custom-my-role', is_custom: true, user_id: 10 }],
      });
      mockExecutor.query.mockResolvedValueOnce({ rowCount: 1 });

      const user = { id: 10, role: 'candidate' };
      const result = await deleteJobRole('custom-my-role', user, mockExecutor);

      expect(result).toBe(true);
    });
  });

  describe('getJobRoleCategories', () => {
    test('computes counts dynamically when DB is available', async () => {
      mockExecutor.query.mockResolvedValueOnce({
        rows: [
          { category: 'engineering', count: '4' },
          { category: 'design', count: '1' },
        ],
      });
      mockExecutor.query.mockResolvedValueOnce({
        rows: [{ total: '5' }],
      });

      const categories = await getJobRoleCategories(mockExecutor);

      expect(categories).toHaveLength(DEFAULT_CATEGORIES.length);
      const engineering = categories.find((c) => c.id === 'engineering');
      expect(engineering.count).toBe(4);
    });

    test('falls back to default counts if query fails', async () => {
      mockExecutor.query.mockRejectedValueOnce(new Error('Counts failed'));
      mockExecutor.query.mockRejectedValueOnce(new Error('Total failed'));

      const categories = await getJobRoleCategories(mockExecutor);

      expect(categories).toHaveLength(DEFAULT_CATEGORIES.length);
      const allCat = categories.find((c) => c.id === 'all');
      expect(allCat.count).toBe(DEFAULT_ROLES.length);
    });
  });
});

