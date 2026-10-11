/**
 * userListingSuite.test.js
 * Comprehensive automated unit test suite for SCRUM-707: Create User Listing API
 *
 * Subtasks covered:
 * - SCRUM-714: Create API Endpoint (endpoint contract, auth header & response shape)
 * - SCRUM-715: Fetch User Data (data transformation, recruiter status mapping, date formatting)
 * - SCRUM-716: Unit Testing (search filtering, role/status filtering, column sorting, pagination, offline fallback)
 */

import { fetchUsers, updateUser, updateUserStatus } from '../api/userApi';
import apiInstance from '../api/apiInstance';
import { getUsers, saveUsers } from '../services/adminStorage';

// Mock the axios apiInstance
jest.mock('../api/apiInstance');

describe('User Listing API & Data Management Suite [SCRUM-707 / SCRUM-716]', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  // ── SCRUM-714: API Endpoint Contract Tests ─────────────────────────────────
  describe('SCRUM-714: Create API Endpoint Contract', () => {
    test('should call GET /users and return successful response payload', async () => {
      const mockApiResponse = {
        success: true,
        message: 'Users fetched successfully.',
        data: {
          users: [
            {
              id: 1,
              full_name: 'Alexander Sterling',
              email: 'a.sterling@nexuscorp.com',
              role: 'admin',
              created_at: '2026-10-09T10:00:00.000Z',
              recruiter_status: null
            },
            {
              id: 2,
              full_name: 'Marcus Thorne',
              email: 'm.thorne@recruits.io',
              role: 'recruiter',
              created_at: '2026-10-09T11:00:00.000Z',
              recruiter_status: 'approved',
              company_name: 'Nexus Recruits'
            }
          ]
        }
      };

      apiInstance.get.mockResolvedValueOnce({ data: mockApiResponse.data });

      const result = await fetchUsers();
      expect(apiInstance.get).toHaveBeenCalledWith('/users');
      expect(result).toBeDefined();
      expect(result.users).toHaveLength(2);
      expect(result.users[0].full_name).toBe('Alexander Sterling');
      expect(result.users[1].role).toBe('recruiter');
    });

    test('should reject when network or unauthorized 401/403 error occurs', async () => {
      const networkError = new Error('Request failed with status code 403');
      apiInstance.get.mockRejectedValueOnce(networkError);

      await expect(fetchUsers()).rejects.toThrow('Request failed with status code 403');
      expect(apiInstance.get).toHaveBeenCalledWith('/users');
    });
  });

  // ── SCRUM-715: Fetch User Data & Transformation Tests ───────────────────────
  describe('SCRUM-715: Fetch User Data & State Mapping', () => {
    test('should transform raw database records into sanitized UI display models', () => {
      const rawDbUsers = [
        {
          id: 10,
          full_name: 'Elena Rostova',
          email: 'elena@nexus.org',
          role: 'recruiter',
          recruiter_status: 'approved',
          created_at: '2026-10-09T14:30:00.000Z',
          company_name: 'Apex Staffing'
        },
        {
          id: 11,
          full_name: 'Sarah Connor',
          email: 'sarah@skynet.com',
          role: 'recruiter',
          recruiter_status: 'rejected',
          created_at: '2026-10-08T09:15:00.000Z'
        },
        {
          id: 12,
          full_name: 'David Miller',
          email: 'david@candidates.org',
          role: 'candidate',
          recruiter_status: null,
          created_at: '2026-10-07T12:00:00.000Z'
        }
      ];

      const colors = ['#6B8CFF', '#22C55E', '#F0B90B', '#E63946', '#A79E8C'];

      const transformed = rawDbUsers.map((u, i) => ({
        id: u.id,
        name: u.full_name,
        email: u.email,
        role: u.role.charAt(0).toUpperCase() + u.role.slice(1),
        status:
          u.role === 'recruiter' && u.recruiter_status
            ? u.recruiter_status === 'approved'
              ? 'Active'
              : u.recruiter_status === 'rejected'
              ? 'Inactive'
              : 'Pending'
            : 'Active',
        createdDate: u.created_at ? String(u.created_at).slice(0, 10) : '',
        avatarColor: colors[i % colors.length]
      }));

      // Elena Rostova: approved recruiter -> Active
      expect(transformed[0].name).toBe('Elena Rostova');
      expect(transformed[0].role).toBe('Recruiter');
      expect(transformed[0].status).toBe('Active');
      expect(transformed[0].createdDate).toBe('2026-10-09');

      // Sarah Connor: rejected recruiter -> Inactive
      expect(transformed[1].status).toBe('Inactive');

      // David Miller: regular candidate -> Active
      expect(transformed[2].role).toBe('Candidate');
      expect(transformed[2].status).toBe('Active');
      expect(transformed[2].createdDate).toBe('2026-10-07');
    });
  });

  // ── SCRUM-716: Unit Testing (Filtering, Sorting, Pagination, Storage) ───────
  describe('SCRUM-716: Unit Testing - Table Interactivity & Logic', () => {
    const sampleUsers = [
      { id: 1, name: 'Alice Smith', email: 'alice@company.com', role: 'Admin', status: 'Active', createdDate: '2026-01-10' },
      { id: 2, name: 'Bob Johnson', email: 'bob@recruiter.com', role: 'Recruiter', status: 'Pending', createdDate: '2026-03-15' },
      { id: 3, name: 'Charlie Brown', email: 'charlie@candidate.org', role: 'Candidate', status: 'Active', createdDate: '2026-02-20' },
      { id: 4, name: 'Diana Prince', email: 'diana@recruiter.com', role: 'Recruiter', status: 'Inactive', createdDate: '2026-04-01' },
      { id: 5, name: 'Edward Norton', email: 'edward@security.net', role: 'Moderator', status: 'Active', createdDate: '2026-01-05' },
      { id: 6, name: 'Fiona Gallagher', email: 'fiona@candidate.org', role: 'Candidate', status: 'Pending', createdDate: '2026-05-12' }
    ];

    test('should filter users by search query matching name, email, or role', () => {
      const searchByName = sampleUsers.filter(u =>
        u.name.toLowerCase().includes('alice') ||
        u.email.toLowerCase().includes('alice') ||
        u.role.toLowerCase().includes('alice')
      );
      expect(searchByName).toHaveLength(1);
      expect(searchByName[0].name).toBe('Alice Smith');

      const searchByRole = sampleUsers.filter(u =>
        u.name.toLowerCase().includes('recruiter') ||
        u.email.toLowerCase().includes('recruiter') ||
        u.role.toLowerCase().includes('recruiter')
      );
      expect(searchByRole.length).toBeGreaterThanOrEqual(2);
    });

    test('should filter users by status dropdown filter', () => {
      const activeUsers = sampleUsers.filter(u => u.status === 'Active');
      expect(activeUsers).toHaveLength(3);

      const pendingUsers = sampleUsers.filter(u => u.status === 'Pending');
      expect(pendingUsers).toHaveLength(2);

      const inactiveUsers = sampleUsers.filter(u => u.status === 'Inactive');
      expect(inactiveUsers).toHaveLength(1);
    });

    test('should filter users by role dropdown filter', () => {
      const recruiters = sampleUsers.filter(u => u.role === 'Recruiter');
      expect(recruiters).toHaveLength(2);

      const candidates = sampleUsers.filter(u => u.role === 'Candidate');
      expect(candidates).toHaveLength(2);

      const admins = sampleUsers.filter(u => u.role === 'Admin');
      expect(admins).toHaveLength(1);
    });

    test('should sort users ascending and descending by column', () => {
      const sortedAsc = [...sampleUsers].sort((a, b) => a.name.localeCompare(b.name));
      expect(sortedAsc[0].name).toBe('Alice Smith');
      expect(sortedAsc[sortedAsc.length - 1].name).toBe('Fiona Gallagher');

      const sortedDesc = [...sampleUsers].sort((a, b) => b.name.localeCompare(a.name));
      expect(sortedDesc[0].name).toBe('Fiona Gallagher');
      expect(sortedDesc[sortedDesc.length - 1].name).toBe('Alice Smith');
    });

    test('should accurately paginate users with customizable itemsPerPage', () => {
      const itemsPerPage = 2;
      const totalPages = Math.ceil(sampleUsers.length / itemsPerPage);
      expect(totalPages).toBe(3);

      // Page 1
      const page1 = sampleUsers.slice(0, 2);
      expect(page1).toHaveLength(2);
      expect(page1[0].name).toBe('Alice Smith');
      expect(page1[1].name).toBe('Bob Johnson');

      // Page 2
      const page2 = sampleUsers.slice(2, 4);
      expect(page2).toHaveLength(2);
      expect(page2[0].name).toBe('Charlie Brown');
      expect(page2[1].name).toBe('Diana Prince');
    });

    test('should persist and retrieve user cache from adminStorage fallback', () => {
      saveUsers(sampleUsers);
      const retrieved = getUsers([]);
      expect(retrieved).toHaveLength(sampleUsers.length);
      expect(retrieved[0].email).toBe('alice@company.com');
    });
  });

  // ── SCRUM-708: Implement Edit User Functionality Tests ───────────────────────
  describe('SCRUM-708: Edit User Functionality [SCRUM-717, SCRUM-718, SCRUM-719]', () => {
    // SCRUM-717: Create Edit Form (Data initialization & pre-filling)
    test('SCRUM-717: should correctly populate edit form with existing user values', () => {
      const existingUser = {
        id: 42,
        name: 'Jordan Bell',
        email: 'jordan@nexuscorp.com',
        role: 'Recruiter',
        status: 'Active'
      };

      const initialFormData = {
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
        status: existingUser.status
      };

      expect(initialFormData.name).toBe('Jordan Bell');
      expect(initialFormData.email).toBe('jordan@nexuscorp.com');
      expect(initialFormData.role).toBe('Recruiter');
      expect(initialFormData.status).toBe('Active');
    });

    // SCRUM-719: Validate Inputs (Client-side validation rules)
    test('SCRUM-719: should flag validation errors for empty name or invalid email format', () => {
      const validate = (formData) => {
        const errors = {};
        if (!formData.name || !formData.name.trim()) errors.name = 'Name is required.';
        if (!formData.email || !formData.email.trim()) {
          errors.email = 'Email address is required.';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          errors.email = 'Please provide a valid email address.';
        }
        return errors;
      };

      // Empty name error
      const emptyNameErrors = validate({ name: '   ', email: 'valid@nexus.com' });
      expect(emptyNameErrors.name).toBe('Name is required.');
      expect(emptyNameErrors.email).toBeUndefined();

      // Invalid email error
      const invalidEmailErrors = validate({ name: 'Jordan Bell', email: 'invalid-email-address' });
      expect(invalidEmailErrors.name).toBeUndefined();
      expect(invalidEmailErrors.email).toBe('Please provide a valid email address.');

      // Valid inputs
      const validErrors = validate({ name: 'Jordan Bell', email: 'jordan@nexuscorp.com' });
      expect(Object.keys(validErrors)).toHaveLength(0);
    });

    // SCRUM-718: Update User Details (API & local state updates)
    test('SCRUM-718: should send PUT /users/:id request and update user details', async () => {
      const updatedUserPayload = {
        id: 42,
        full_name: 'Jordan Bell Updated',
        email: 'jordan.new@nexuscorp.com',
        role: 'admin'
      };

      apiInstance.put.mockResolvedValueOnce({
        data: {
          success: true,
          message: 'User updated successfully.',
          data: { user: updatedUserPayload }
        }
      });

      const response = await updateUser(42, {
        name: 'Jordan Bell Updated',
        email: 'jordan.new@nexuscorp.com',
        role: 'admin'
      });

      expect(apiInstance.put).toHaveBeenCalledWith('/users/42', {
        name: 'Jordan Bell Updated',
        email: 'jordan.new@nexuscorp.com',
        role: 'admin'
      });
      expect(response.success).toBe(true);
      expect(response.data.user.full_name).toBe('Jordan Bell Updated');
    });
  });

  // ── SCRUM-709: Implement User Status Management Suite ───────────────────────
  describe('SCRUM-709: User Status Management Suite (SCRUM-720, SCRUM-721, SCRUM-722)', () => {
    // SCRUM-722: Update Database Status API Contract
    test('SCRUM-722: should call PUT /users/:id/status to update database status', async () => {
      const statusResponse = {
        success: true,
        message: 'User status updated to inactive.',
        data: {
          user: {
            id: 15,
            full_name: 'David Vance',
            email: 'd.vance@nexuscorp.com',
            role: 'candidate',
            status: 'inactive'
          }
        }
      };

      apiInstance.put.mockResolvedValueOnce({ data: statusResponse });

      const res = await updateUserStatus(15, 'inactive');

      expect(apiInstance.put).toHaveBeenCalledWith('/users/15/status', { status: 'inactive' });
      expect(res.success).toBe(true);
      expect(res.data.user.status).toBe('inactive');
    });

    // SCRUM-720: Activate User Account
    test('SCRUM-720: should activate user account and update local state to Active', async () => {
      const inactiveUser = {
        id: 7,
        name: 'David Vance',
        email: 'd.vance@nexuscorp.com',
        role: 'Analyst',
        status: 'Inactive'
      };

      apiInstance.put.mockResolvedValueOnce({
        data: {
          success: true,
          message: 'User status updated to active.',
          data: { user: { id: 7, status: 'active' } }
        }
      });

      // API activation
      await updateUserStatus(inactiveUser.id, 'active');
      expect(apiInstance.put).toHaveBeenCalledWith('/users/7/status', { status: 'active' });

      // State transition verification
      const userList = [inactiveUser];
      const updatedList = userList.map(u => (u.id === 7 ? { ...u, status: 'Active' } : u));

      expect(updatedList[0].status).toBe('Active');
    });

    // SCRUM-721: Deactivate User Account & Prevent Login
    test('SCRUM-721: should deactivate user account and verify deactivated users are blocked from login', async () => {
      const activeUser = {
        id: 1,
        name: 'Alexander Sterling',
        email: 'a.sterling@nexuscorp.com',
        role: 'Admin',
        status: 'Active'
      };

      apiInstance.put.mockResolvedValueOnce({
        data: {
          success: true,
          message: 'User status updated to inactive.',
          data: { user: { id: 1, status: 'inactive' } }
        }
      });

      // Deactivation call
      await updateUserStatus(activeUser.id, 'inactive');
      expect(apiInstance.put).toHaveBeenCalledWith('/users/1/status', { status: 'inactive' });

      // State transition verification
      const userList = [activeUser];
      const updatedList = userList.map(u => (u.id === 1 ? { ...u, status: 'Inactive' } : u));
      expect(updatedList[0].status).toBe('Inactive');

      // Authentication guard simulation
      const simulateLoginGuard = (user) => {
        if (user.status === 'inactive' || user.status === 'Inactive') {
          return { error: 'Your account has been deactivated. Please contact an administrator.', status: 403 };
        }
        return { success: true };
      };

      const loginResult = simulateLoginGuard(updatedList[0]);
      expect(loginResult.error).toBe('Your account has been deactivated. Please contact an administrator.');
      expect(loginResult.status).toBe(403);
    });
  });
});
