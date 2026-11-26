/**
 * tests/recruiter/tc-ra-08.spec.js
 *
 * Test Case ID: TC-RA-08
 * Test Scenario: Empty Title Validation Error on Save
 *
 * Preconditions:
 *  - Application is running at http://localhost:8080
 *  - Recruiter account exists (recruiter@intellihire.com / Recruiter@2026)
 *
 * Test Steps:
 *  1. Authenticate and navigate to /recruiter/assessments/new
 *  2. Locate the Assessment Title input field and ensure it is empty
 *  3. Click the 'Save as Draft' button
 *  4. Verify validation error alert (.af-error) is displayed with:
 *     'Please provide an assessment title before saving.'
 *  5. Verify navigation remains on /recruiter/assessments/new (submission blocked)
 */

const { test, expect } = require('@playwright/test');
const {
  BASE_URL,
  DEMO_RECRUITER_EMAIL,
  DEMO_RECRUITER_PASSWORD,
} = require('../helpers/api');

async function loginAsRecruiter(page) {
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: DEMO_RECRUITER_EMAIL,
        password: DEMO_RECRUITER_PASSWORD,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      await page.addInitScript(({ token, user }) => {
        localStorage.setItem('intellihire_token', token);
        localStorage.setItem('intellihire_user', JSON.stringify(user));
      }, { token: data.token, user: data.user });
      await page.goto('/recruiter/assessments/new', { waitUntil: 'domcontentloaded' });
      return;
    }
  } catch (err) {
    // Fall back to UI login
  }

  await page.goto('/signin', { waitUntil: 'domcontentloaded' });
  await page.locator('#email').fill(DEMO_RECRUITER_EMAIL);
  await page.locator('#password').fill(DEMO_RECRUITER_PASSWORD);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL('**/recruiter/**', { waitUntil: 'domcontentloaded', timeout: 12_000 });
  await page.goto('/recruiter/assessments/new', { waitUntil: 'domcontentloaded' });
}

test.describe('TC-RA-08: Empty Title Validation Error Suite', () => {

  test('TC-RA-08: Displays validation error when attempting to save without an assessment title', async ({ page }) => {
    // Step 1: Login and navigate to Assessment Builder
    await loginAsRecruiter(page);

    // Step 2: Locate Assessment Title input and clear it
    const titleInput = page.locator('.ca-config label:has-text("Assessment Title") input');
    await expect(titleInput).toBeVisible({ timeout: 10_000 });
    await titleInput.fill('');

    // Step 3: Click 'Save as Draft'
    const saveDraftBtn = page.locator('.af-title-actions button:has-text("Save as Draft")');
    await expect(saveDraftBtn).toBeVisible();
    await saveDraftBtn.click();

    // Step 4: Verify validation error alert is shown
    const errorAlert = page.locator('.af-error');
    await expect(errorAlert).toBeVisible({ timeout: 5_000 });
    await expect(errorAlert).toContainText('Please provide an assessment title before saving.');

    // Step 5: Verify user stays on the builder page
    await expect(page).toHaveURL(/\/recruiter\/assessments\/new/);
  });

});
