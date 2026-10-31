// @ts-nocheck
/**
 * tests/admin/user-status-management.spec.js
 *
 * Playwright E2E tests for SCRUM-709: User Status Management
 * (User Management / Admin Dashboard — "User Management / Admin Dashboard" tab)
 *
 * Covers:
 *  TC-USM-001: GET /users — Admin fetches all users (200 OK, password_hash omitted)
 *  TC-USM-002: GET /users — No auth token (401 Unauthorized)
 *  TC-USM-003: GET /users — Non-admin role (403 Forbidden)
 *  TC-USM-004: PUT /users/:id — Update user details (200 OK, DB updated)
 *  TC-USM-005: PUT /users/:id — No fields provided (400 Bad Request)
 *  TC-USM-006: PUT /users/:id — User not found (404 Not Found)
 *  TC-USM-007: PATCH /users/:id/status — Set status to inactive (200 OK)
 *  TC-USM-008: PATCH /users/:id/status — Set status to active (200 OK)
 *  TC-USM-009: PATCH /users/:id/status — Invalid status value (400 Bad Request)
 *  TC-USM-010: POST /auth/login — Inactive user login blocked (403 Forbidden)
 *  TC-USM-011: POST /auth/login — Active user login succeeds (200 OK)
 *  TC-USM-012: DB Schema — status column defaults to 'active' for new users
 */

const { test, expect } = require('@playwright/test');
const {
  BASE_URL,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  DEMO_CANDIDATE_EMAIL,
  DEMO_CANDIDATE_PASSWORD,
  generateTestEmail,
  apiPost,
  apiPut,
} = require('../helpers/api');

// ---------------------------------------------------------------------------
// Helper: Log in as admin and return the JWT token
// ---------------------------------------------------------------------------
async function getAdminToken(request) {
  const res = await request.post(`${BASE_URL}/auth/login`, {
    data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  // API returns { working: true, token: '...', user: {...} }
  return body.token;
}

// ---------------------------------------------------------------------------
// Helper: Register a fresh candidate account, return { userId, email, password }
// ---------------------------------------------------------------------------
async function registerTestCandidate(request) {
  const email = generateTestEmail('usm-candidate');
  const password = 'TestPass1!';
  const res = await request.post(`${BASE_URL}/auth/create-account`, {
    data: {
      fullName: 'USM Test Candidate',
      email,
      password,
      confirmPassword: password,
      role: 'candidate',
    },
  });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  // API returns { working: true, user: { id, ... } }
  const userId = body.user?.id;
  return { userId, email, password };
}

// ---------------------------------------------------------------------------
// Helper: Restore a test user back to 'active' after a deactivation test
// ---------------------------------------------------------------------------
async function restoreUserToActive(request, targetUserId, adminToken) {
  await request.patch(`${BASE_URL}/users/${targetUserId}/status`, {
    headers: { Authorization: `Bearer ${adminToken}` },
    data: { status: 'active' },
  });
}

// ===========================================================================
// Test Suite
// ===========================================================================
test.describe('TC-USM: User Status Management Suite [SCRUM-709]', () => {

  // -------------------------------------------------------------------------
  // TC-USM-001: GET /users — Admin fetches all users
  // Expected: 200 OK, array of user objects, password_hash NOT present
  // -------------------------------------------------------------------------
  test('TC-USM-001: GET /users — Admin receives full user list without password_hash', async ({ request }) => {
    const adminToken = await getAdminToken(request);

    const res = await request.get(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    // Status
    expect(res.status()).toBe(200);

    const body = await res.json();
    // API uses { working: true, message, users: [...] }
    expect(body.working).toBe(true);

    const users = body.users;
    expect(Array.isArray(users)).toBe(true);
    expect(users.length).toBeGreaterThan(0);

    // Shape: required fields present
    const first = users[0];
    expect(first).toHaveProperty('id');
    expect(first).toHaveProperty('full_name');
    expect(first).toHaveProperty('email');
    expect(first).toHaveProperty('role');
    expect(first).toHaveProperty('status');

    // Security: sensitive field must NOT be present
    expect(first.password_hash).toBeUndefined();

    // ── Print actual result to terminal so you can fill the spreadsheet ──
    console.log('\n========== TC-USM-001 ACTUAL RESULT ==========');
    console.log(`HTTP Status  : ${res.status()} OK`);
    console.log(`Total Users  : ${users.length}`);
    console.log(`Fields returned: ${Object.keys(first).join(', ')}`);
    console.log(`password_hash present: ${first.password_hash !== undefined}`);
    console.log('Sample user  :', JSON.stringify({ id: first.id, full_name: first.full_name, email: first.email, role: first.role, status: first.status }, null, 2));
    console.log('==============================================\n');
  });

  // -------------------------------------------------------------------------
  // TC-USM-002: GET /users — No authentication token → 401
  // -------------------------------------------------------------------------
  test('TC-USM-002: GET /users — No auth token returns 401 Unauthorized', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/users`);

    expect(res.status()).toBe(401);

    const body = await res.json();
    expect(body.working).toBe(false);
    expect(body.message).toMatch(/no authentication token/i);
  });

  // -------------------------------------------------------------------------
  // TC-USM-003: GET /users — Non-admin role (candidate) → 403
  // -------------------------------------------------------------------------
  test('TC-USM-003: GET /users — Candidate role returns 403 Forbidden', async ({ request }) => {
    // Log in as candidate
    const loginRes = await request.post(`${BASE_URL}/auth/login`, {
      data: {
        email: DEMO_CANDIDATE_EMAIL,
        password: DEMO_CANDIDATE_PASSWORD,
      },
    });
    expect(loginRes.ok()).toBeTruthy();
    const loginBody = await loginRes.json();
    const candidateToken = loginBody.data?.token || loginBody.token;

    // Attempt to hit admin-only endpoint
    const res = await request.get(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${candidateToken}` },
    });

    expect(res.status()).toBe(403);

    const body = await res.json();
    expect(body.working).toBe(false);
    expect(body.message).toMatch(/insufficient role permissions/i);
  });

  // -------------------------------------------------------------------------
  // TC-USM-004: PUT /users/:id — Update user full_name and email → 200 OK
  // -------------------------------------------------------------------------
  test('TC-USM-004: PUT /users/:id — Admin updates user details successfully', async ({ request }) => {
    const adminToken = await getAdminToken(request);

    // Create a fresh test user to edit
    const { userId } = await registerTestCandidate(request);

    const res = await request.put(`${BASE_URL}/users/${userId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        name: 'USM Updated Name',
        email: generateTestEmail('usm-updated'),
        role: 'candidate',
      },
    });

    expect(res.status()).toBe(200);

    const body = await res.json();
    // API uses { working: true, message, user: {...} }
    expect(body.working).toBe(true);
    expect(body.user?.full_name).toBe('USM Updated Name');
    expect(body.user?.role).toBe('candidate');
  });

  // -------------------------------------------------------------------------
  // TC-USM-005: PUT /users/:id — No fields provided → 400 Bad Request
  // -------------------------------------------------------------------------
  test('TC-USM-005: PUT /users/:id — Empty body returns 400 Bad Request', async ({ request }) => {
    const adminToken = await getAdminToken(request);

    // Use any real user id
    const usersRes = await request.get(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const usersBody = await usersRes.json();
    const targetId = usersBody.users[0].id;

    const res = await request.put(`${BASE_URL}/users/${targetId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {},
    });

    expect(res.status()).toBe(400);

    const body = await res.json();
    expect(body.working).toBe(false);
    expect(body.message).toMatch(/at least one field/i);
  });

  // -------------------------------------------------------------------------
  // TC-USM-006: PUT /users/:id — Non-existent user ID → 404 Not Found
  // -------------------------------------------------------------------------
  test('TC-USM-006: PUT /users/:id — Non-existent user returns 404 Not Found', async ({ request }) => {
    const adminToken = await getAdminToken(request);

    const res = await request.put(`${BASE_URL}/users/999999`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { name: 'Ghost User' },
    });

    expect(res.status()).toBe(404);

    const body = await res.json();
    expect(body.working).toBe(false);
    expect(body.message).toMatch(/user not found/i);
  });

  // -------------------------------------------------------------------------
  // TC-USM-007: PATCH /users/:id/status — Set to 'inactive' → 200 OK
  // -------------------------------------------------------------------------
  test('TC-USM-007: PATCH /users/:id/status — Deactivate user, DB updates to inactive', async ({ request }) => {
    const adminToken = await getAdminToken(request);
    const { userId } = await registerTestCandidate(request);

    const res = await request.patch(`${BASE_URL}/users/${userId}/status`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { status: 'inactive' },
    });

    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.working).toBe(true);
    expect(body.message).toMatch(/user status updated to inactive/i);
    expect(body.user?.status).toBe('inactive');

    // Cleanup: restore to active
    await restoreUserToActive(request, userId, adminToken);
  });

  // -------------------------------------------------------------------------
  // TC-USM-008: PATCH /users/:id/status — Set to 'active' → 200 OK
  // -------------------------------------------------------------------------
  test('TC-USM-008: PATCH /users/:id/status — Activate user, DB updates to active', async ({ request }) => {
    const adminToken = await getAdminToken(request);
    const { userId } = await registerTestCandidate(request);

    // First deactivate
    await request.patch(`${BASE_URL}/users/${userId}/status`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { status: 'inactive' },
    });

    // Then re-activate
    const res = await request.patch(`${BASE_URL}/users/${userId}/status`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { status: 'active' },
    });

    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.working).toBe(true);
    expect(body.message).toMatch(/user status updated to active/i);
    expect(body.user?.status).toBe('active');
  });

  // -------------------------------------------------------------------------
  // TC-USM-009: PATCH /users/:id/status — Invalid status value → 400
  // -------------------------------------------------------------------------
  test('TC-USM-009: PATCH /users/:id/status — Invalid status returns 400 Bad Request', async ({ request }) => {
    const adminToken = await getAdminToken(request);

    // Get any real user id
    const usersRes = await request.get(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const usersBody = await usersRes.json();
    const targetId = usersBody.users[0].id;

    const res = await request.patch(`${BASE_URL}/users/${targetId}/status`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { status: 'banned' },
    });

    expect(res.status()).toBe(400);

    const body = await res.json();
    expect(body.working).toBe(false);
    expect(body.message).toMatch(/invalid status/i);
    expect(body.message).toMatch(/active.*inactive.*pending/i);
  });

  // -------------------------------------------------------------------------
  // TC-USM-010: POST /auth/login — Inactive user blocked → 403 Forbidden
  // -------------------------------------------------------------------------
  test('TC-USM-010: POST /auth/login — Inactive user login is blocked with 403', async ({ request }) => {
    const adminToken = await getAdminToken(request);
    const { userId, email, password } = await registerTestCandidate(request);

    // Deactivate the test user
    await request.patch(`${BASE_URL}/users/${userId}/status`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { status: 'inactive' },
    });

    // Attempt login with deactivated account
    const loginRes = await request.post(`${BASE_URL}/auth/login`, {
      data: { email, password },
    });

    expect(loginRes.status()).toBe(403);

    const loginBody = await loginRes.json();
    expect(loginBody.working).toBe(false);
    expect(loginBody.message).toMatch(/account has been deactivated/i);

    // Cleanup
    await restoreUserToActive(request, userId, adminToken);
  });

  // -------------------------------------------------------------------------
  // TC-USM-011: POST /auth/login — Active user login succeeds → 200 OK
  // -------------------------------------------------------------------------
  test('TC-USM-011: POST /auth/login — Active user login succeeds and JWT is issued', async ({ request }) => {
    const loginRes = await request.post(`${BASE_URL}/auth/login`, {
      data: {
        email: DEMO_CANDIDATE_EMAIL,
        password: DEMO_CANDIDATE_PASSWORD,
      },
    });

    expect(loginRes.status()).toBe(200);

    const body = await loginRes.json();
    expect(body.working).toBe(true);

    const token = body.token;
    expect(token).toBeTruthy();
    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3); // Valid JWT has 3 parts
  });

  // -------------------------------------------------------------------------
  // TC-USM-012: DB Schema — New user defaults to status = 'active'
  // -------------------------------------------------------------------------
  test('TC-USM-012: DB Schema — Newly registered user defaults to status active', async ({ request }) => {
    const adminToken = await getAdminToken(request);
    const { userId } = await registerTestCandidate(request);

    // Fetch all users via admin endpoint and find the new one
    const usersRes = await request.get(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    expect(usersRes.status()).toBe(200);

    const usersBody = await usersRes.json();
    const newUser = usersBody.users.find(u => u.id === userId);

    expect(newUser).toBeDefined();
    expect(newUser.status).toBe('active');
  });

});

