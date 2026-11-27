/**
 * tests/recruiter/tc-qb-006.spec.js
 *
 * Test Case ID: TC-QB-006
 * Test Scenario: Create & Save New MCQ Question with Live Preview Sync
 *
 * Preconditions:
 *  - Application is running at http://localhost:8080
 *  - Seeded recruiter account exists (recruiter@intellihire.com / Recruiter@2026)
 *
 * Test Steps:
 *  1. Log in as recruiter and navigate to /recruiter/question-bank/add
 *  2. Select Job Role = 'Software Engineer' and add skill tag 'React'
 *  3. Fill #aq-question-body with a unique MCQ question prompt
 *  4. Verify Live Preview (.aq-preview__card) updates immediately with the prompt
 *  5. Fill Options A–D and click radio button on Option B to mark it as correct
 *  6. Verify correct answer hint (.aq-mcq__correct-hint) and preview option highlight
 *  7. Click 'Save Question', verify .aq-success-banner, and confirm saved question in Question Bank table
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

test.describe('TC-QB-006: Create MCQ Question with Live Preview Suite', () => {

  test('TC-QB-06: Creates an MCQ question, verifies Live Preview sync, and persists to Question Bank', async ({ page }) => {
    // Step 1: Login and open Add New Question page
    await loginAndOpenAddQuestion(page);

    await expect(page.locator('.aq-page__title')).toHaveText('Add New Question', { timeout: 10_000 });

    const uniqueId = Date.now().toString().slice(-5);
    const uniquePrompt = `[E2E-${uniqueId}] Which React hook runs side effects after render?`;

    // Step 2: Select Job Role and add Skill tag
    await page.locator('.aq-two-col select').first().selectOption('Software Engineer');
    const skillInput = page.locator('input.aq-tag-input__field');
    await skillInput.fill('React');
    await skillInput.press('Enter');
    await expect(page.locator('.aq-tag:has-text("React")')).toBeVisible();

    // Step 3 & 4: Fill Question Statement and verify Live Preview updates
    await page.locator('#aq-question-body').fill(uniquePrompt);
    const livePreview = page.locator('.aq-preview__card');
    await expect(livePreview).toContainText(uniquePrompt);

    // Step 5 & 6: Fill Options A-D and mark Option B as correct
    const optInputs = page.locator('.aq-mcq__row input.aq-input');
    await optInputs.nth(0).fill('useMemo');
    await optInputs.nth(1).fill('useEffect');
    await optInputs.nth(2).fill('useRef');
    await optInputs.nth(3).fill('useContext');

    await page.locator('.aq-mcq__row button.aq-radio').nth(1).click();
    await expect(page.locator('.aq-mcq__correct-hint')).toContainText('B. useEffect');
    await expect(livePreview.locator('.aq-preview__option.correct')).toContainText('useEffect');

    // Step 7: Save Question and verify redirect & table persistence
    await page.locator('.aq-footer button.aq-btn--primary').click();
    await expect(page.locator('.aq-success-banner')).toBeVisible({ timeout: 8_000 });
    await expect(page).toHaveURL(/\/recruiter\/assessments/, { timeout: 10_000 });
    await expect(page.locator('.am-table')).toContainText(`[E2E-${uniqueId}]`, { timeout: 10_000 });
  });

});
