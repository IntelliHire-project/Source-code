/**
 * tests/recruiter/tc-qb-005.spec.js
 *
 * Test Case ID: TC-QB-005
 * Test Scenario: Add New Question Form Validation Errors
 *
 * Preconditions:
 *  - Application is running at http://localhost:8080
 *  - Seeded recruiter account exists (recruiter@intellihire.com / Recruiter@2026)
 *
 * Test Steps:
 *  1. Log in as recruiter and navigate to /recruiter/question-bank/add
 *  2. Leave Job Role, Skills, Question Statement, and MCQ Options empty
 *  3. Click 'Save Question' button in footer
 *  4. Verify inline validation errors (.aq-field__error) display for role, skills, question text, and options
 *  5. Confirm URL remains on /recruiter/question-bank/add (submission blocked)
 */

const { test, expect } = require('@playwright/test');
const {
  BASE_URL,
  DEMO_RECRUITER_EMAIL,
  DEMO_RECRUITER_PASSWORD,
} = require('../helpers/api');

async function loginAndOpenAddQuestion(page) {
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
      await page.goto('/recruiter/question-bank/add', { waitUntil: 'domcontentloaded' });
      return;
    }
  } catch (err) {
    // Fallback to UI login
  }

  await page.goto('/signin', { waitUntil: 'domcontentloaded' });
  await page.locator('#email').fill(DEMO_RECRUITER_EMAIL);
  await page.locator('#password').fill(DEMO_RECRUITER_PASSWORD);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL('**/recruiter/**', { waitUntil: 'domcontentloaded', timeout: 12_000 });
  await page.goto('/recruiter/question-bank/add', { waitUntil: 'domcontentloaded' });
}

test.describe('TC-QB-005: Add Question Form Validation Suite', () => {

  test('TC-QB-05: Displays inline validation errors when submitting empty required fields', async ({ page }) => {
    // Step 1: Login and open Add New Question page
    await loginAndOpenAddQuestion(page);

    await expect(page.locator('.aq-page__title')).toHaveText('Add New Question', { timeout: 10_000 });

    // Step 2 & 3: Click 'Save Question' with empty required fields
    const saveBtn = page.locator('.aq-footer button.aq-btn--primary');
    await expect(saveBtn).toBeVisible();
    await saveBtn.click();

    // Step 4: Verify all 4 inline validation messages appear
    await expect(page.locator('.aq-field__error:has-text("Please select a job role.")')).toBeVisible();
    await expect(page.locator('.aq-field__error:has-text("Add at least one skill tag.")')).toBeVisible();
    await expect(page.locator('.aq-field__error:has-text("Question text is required.")').first()).toBeVisible();
    await expect(page.locator('.aq-field__error:has-text("Add at least 2 answer options.")')).toBeVisible();

    // Step 5: Verify user stays on Add Question page
    await expect(page).toHaveURL(/\/recruiter\/question-bank\/add/);
  });

});
