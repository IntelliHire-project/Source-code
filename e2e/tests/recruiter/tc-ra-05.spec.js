/**
 * tests/recruiter/tc-ra-05.spec.js
 *
 * Test Case ID: TC-RA-05
 * Test Scenario: Target Job Vacancy Selection & Auto-Generate Title Feature
 *
 * Preconditions:
 *  - Application is running at http://localhost:8080
 *  - Recruiter account exists (recruiter@intellihire.com / Recruiter@2026)
 *
 * Test Steps:
 *  1. Authenticate and navigate to /recruiter/assessments/new
 *  2. Locate the Target Job Vacancy dropdown in the Configuration panel
 *  3. Select 'Senior Software Engineer — React'
 *  4. Click the 'Auto-Generate Title' button (.af-auto-gen-btn)
 *  5. Assert the Assessment Title input value updates automatically
 *  6. Confirm the generated title contains 'Senior Software Engineer — React Assessment'
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

test.describe('TC-RA-05: Target Job Vacancy Selection & Title Auto-Generation Suite', () => {

  test('TC-RA-05: Selects vacancy from dropdown and auto-generates matching assessment title', async ({ page }) => {
    // Step 1: Login and navigate directly to Assessment Builder
    await loginAsRecruiter(page);

    // Step 2: Locate the Target Job Vacancy dropdown
    const roleSelect = page.locator('.ca-config label:has-text("Target Job Vacancy") select');
    await expect(roleSelect).toBeVisible({ timeout: 10_000 });

    // Step 3: Select 'Senior Software Engineer — React'
    await roleSelect.selectOption('Senior Software Engineer — React');

    // Step 4: Click 'Auto-Generate Title' button
    const autoGenBtn = page.locator('button.af-auto-gen-btn');
    await expect(autoGenBtn).toBeVisible();
    await autoGenBtn.click();

    // Step 5: Verify the Assessment Title input automatically updates
    const titleInput = page.locator('.ca-config label:has-text("Assessment Title") input');
    await expect(titleInput).toBeVisible();

    const titleValue = await titleInput.inputValue();
    expect(titleValue).toContain('Senior Software Engineer — React');
    expect(titleValue).toContain('Assessment');
  });

});
