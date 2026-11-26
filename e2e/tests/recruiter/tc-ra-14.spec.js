/**
 * tests/recruiter/tc-ra-14.spec.js
 *
 * Test Case ID: TC-RA-14
 * Test Scenario: Role-Based Authorization Guard (Candidate User Blocked)
 *
 * Preconditions:
 *  - Application is running at http://localhost:8080
 *  - Seeded candidate account exists (candidate@intellihire.com / Candidate@2026)
 *
 * Test Steps:
 *  1. Authenticate as a Candidate user (via API token injection or UI login fallback)
 *  2. Attempt direct navigation to /recruiter/assessments
 *  3. Verify the candidate role guard blocks access and redirects away from /recruiter/assessments
 *  4. Verify 'Assessment Management' recruiter heading is not accessible
 *  5. Attempt direct navigation to /recruiter/assessments/new and verify candidate is also blocked
 */

const { test, expect } = require('@playwright/test');
const {
  BASE_URL,
  DEMO_CANDIDATE_EMAIL,
  DEMO_CANDIDATE_PASSWORD,
} = require('../helpers/api');

async function loginAsCandidate(page) {
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: DEMO_CANDIDATE_EMAIL,
        password: DEMO_CANDIDATE_PASSWORD,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      await page.addInitScript(({ token, user }) => {
        localStorage.setItem('intellihire_token', token);
        localStorage.setItem('intellihire_user', JSON.stringify(user));
      }, { token: data.token, user: data.user });
      return;
    }
  } catch (err) {
    // Fall back to UI login
  }

  await page.goto('/signin', { waitUntil: 'domcontentloaded' });
  await page.locator('#email').fill(DEMO_CANDIDATE_EMAIL);
  await page.locator('#password').fill(DEMO_CANDIDATE_PASSWORD);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL('**/candidate/**', { waitUntil: 'domcontentloaded', timeout: 12_000 });
}

test.describe('TC-RA-14: Role-Based Authorization Guard Suite', () => {

  test('TC-RA-14: Candidate user attempting to access recruiter assessment routes is blocked', async ({ page }) => {
    // Step 1: Authenticate as Candidate
    await loginAsCandidate(page);

    // Step 2: Attempt direct navigation to /recruiter/assessments
    await page.goto('/recruiter/assessments', { waitUntil: 'domcontentloaded' });

    // Step 3: Verify candidate is redirected away from recruiter assessments
    await expect(page).not.toHaveURL(/\/recruiter\/assessments$/, { timeout: 10_000 });
    await expect(page.locator('.am-page__title')).toBeHidden();

    // Step 4: Attempt direct navigation to /recruiter/assessments/new
    await page.goto('/recruiter/assessments/new', { waitUntil: 'domcontentloaded' });
    await expect(page).not.toHaveURL(/\/recruiter\/assessments\/new/, { timeout: 10_000 });
  });

});
