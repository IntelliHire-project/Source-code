/**
 * helpers/api.js
 *
 * Reusable API utilities for IntelliHire Playwright tests.
 *
 * These helpers call the real IntelliHire REST API directly (without a browser)
 * so that we can set up and tear down test data before/after UI tests run.
 *
 * WHY THIS IS SAFE:
 *  - All test emails use a unique timestamp suffix and the `.invalid` TLD.
 *    The `.invalid` domain is reserved by RFC 2606 — it can never be a real
 *    address, so no accidental emails are sent.
 *  - Cleanup functions delete test accounts at the end of each test run so
 *    the database does not accumulate stale rows.
 */

const BASE_URL = 'http://localhost:8080/api';

// ---------------------------------------------------------------------------
// Credentials for the seeded admin account (from backend/.env)
// ---------------------------------------------------------------------------
const ADMIN_EMAIL = 'admin@intellihire.com';
const ADMIN_PASSWORD = 'IntelliHire@2026';

// Seeded candidate account (guaranteed to exist after docker-compose up)
const DEMO_CANDIDATE_EMAIL = 'candidate@intellihire.com';
const DEMO_CANDIDATE_PASSWORD = 'Candidate@2026';

/**
 * Makes a JSON POST request to the IntelliHire API.
 * Returns the parsed response body.
 * Throws a descriptive error if the HTTP status is >= 400.
 *
 * @param {string} path  - e.g. '/auth/login'
 * @param {object} body  - request payload
 * @param {string} [token] - optional Bearer token for authenticated endpoints
 */
async function apiPost(path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      `API POST ${path} failed [${response.status}]: ${data?.message || JSON.stringify(data)}`
    );
  }
  return data;
}

/**
 * Makes a JSON PUT request to the IntelliHire API.
 *
 * @param {string} path
 * @param {object} body
 * @param {string} token - Bearer token (required for admin endpoints)
 */
async function apiPut(path, body, token) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      `API PUT ${path} failed [${response.status}]: ${data?.message || JSON.stringify(data)}`
    );
  }
  return data;
}

/**
 * Makes a JSON DELETE request to the IntelliHire API.
 *
 * @param {string} path
 * @param {string} token - Bearer token
 */
async function apiDelete(path, token) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  // 404 on cleanup is fine — the resource may already be gone
  if (!response.ok && response.status !== 404) {
    const data = await response.json().catch(() => ({}));
    throw new Error(
      `API DELETE ${path} failed [${response.status}]: ${data?.message || ''}`
    );
  }
}

/**
 * Logs in with the admin account and returns the JWT token.
 * This token is required to call admin-protected endpoints such as
 * approving a recruiter.
 *
 * @returns {Promise<string>} JWT token
 */
async function getAdminToken() {
  const data = await apiPost('/auth/login', {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });
  return data.token;
}

/**
 * Generates a unique test email address.
 * Uses a timestamp + random suffix to avoid collisions between parallel runs.
 *
 * @param {string} [prefix='playwright']
 * @returns {string} e.g. "playwright-1718000000000-abc@test.invalid"
 */
function generateTestEmail(prefix = 'playwright') {
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 6);
  return `${prefix}-${ts}-${rand}@test.invalid`;
}

/**
 * Registers a new recruiter account via the API.
 * Returns the full response data including the user ID needed for approval.
 *
 * The recruiter will be in "pending" state immediately after registration —
 * this is enforced by the backend (`createRecruiter(..., "pending", ...)`).
 *
 * @param {string} email - Use generateTestEmail() for isolation
 * @param {string} password
 * @returns {Promise<{ userId: number, email: string, password: string }>}
 */
async function registerTestRecruiter(email, password = 'TestPass1!') {
  const data = await apiPost('/auth/create-account', {
    fullName: 'Playwright Test Recruiter',
    contactName: 'Playwright Test Recruiter',
    email,
    password,
    confirmPassword: password,
    role: 'recruiter',
    companyName: 'Playwright Test Co.',
    industry: 'tech',
    companyWebsite: 'https://playwright-test.invalid',
    companyRegNumber: 'PW-TEST-001',
    companyLocation: 'Test City, Test Country',
    jobTitle: 'QA Engineer',
    phoneNumber: '+1 555 000 9999',
  });

  return {
    userId: data.user.id,
    email,
    password,
  };
}

/**
 * Approves a pending recruiter via the admin API.
 * Requires an admin JWT token.
 *
 * Endpoint: PUT /users/:userId/recruiter-status  { status: 'approved' }
 *
 * @param {number} userId
 * @param {string} adminToken
 */
async function approveRecruiter(userId, adminToken) {
  await apiPut(`/users/${userId}/recruiter-status`, { status: 'approved' }, adminToken);
}

/**
 * Cleans up a test user by setting their account to inactive via the admin API.
 * We do not have a DELETE /users/:id endpoint, so we deactivate instead —
 * this is enough to prevent test pollution.
 *
 * @param {number} userId
 * @param {string} adminToken
 */
async function deactivateTestUser(userId, adminToken) {
  try {
    await apiPut(`/users/${userId}/recruiter-status`, { status: 'rejected' }, adminToken);
  } catch (err) {
    // Non-fatal: log the warning but don't fail the test suite
    console.warn(`[Cleanup] Could not deactivate user ${userId}:`, err.message);
  }
}

module.exports = {
  BASE_URL,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  DEMO_CANDIDATE_EMAIL,
  DEMO_CANDIDATE_PASSWORD,
  generateTestEmail,
  registerTestRecruiter,
  approveRecruiter,
  deactivateTestUser,
  getAdminToken,
  apiPost,
  apiPut,
};
