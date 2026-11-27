/**
 * tests/recruiter/tc-qb-009.spec.js
 *
 * Test Case ID: TC-QB-009
 * Test Scenario: Duplicate Question as Draft
 *
 * Preconditions:
 *  - Application is running at http://localhost:8080
 *  - Seeded recruiter account exists (recruiter@intellihire.com / Recruiter@2026)
 *  - At least 1 question exists in Question Bank
 *
 * Test Steps:
 *  1. Log in as recruiter and navigate to /recruiter/question-bank (wait for /api/questions)
 *  2. Record the initial live Question Bank row count (.am-table tbody tr)
 *  3. Click the Copy ('Duplicate question') button on the first question row
 *  4. Verify notice banner (.am-notice) displays 'Question duplicated as draft.'
 *  5. Verify Question Bank table row count increases by 1
 */

const { test, expect } = require('@playwright/test');
const {
  BASE_URL,
  DEMO_RECRUITER_EMAIL,
  DEMO_RECRUITER_PASSWORD,
} = require('../helpers/api');

async function loginAndOpenQuestionBank(page) {
  const waitQuestions = () =>
    page.waitForResponse(
      (res) => res.url().includes('/api/questions') && res.request().method() === 'GET',
      { timeout: 10_000 }
    ).catch(() => null);

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
      const apiPromise = waitQuestions();
      await page.goto('/recruiter/question-bank', { waitUntil: 'domcontentloaded' });
      await apiPromise;
      await page.waitForTimeout(200);
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
  const apiPromise = waitQuestions();
  await page.goto('/recruiter/question-bank', { waitUntil: 'domcontentloaded' });
  await apiPromise;
  await page.waitForTimeout(200);
}

test.describe('TC-QB-009: Duplicate Question as Draft Suite', () => {

  test('TC-QB-09: Duplicates a question as draft and prepends copy to Question Bank table', async ({ page }) => {
    // Step 1: Login and open Question Bank
    await loginAndOpenQuestionBank(page);

    const rows = page.locator('.am-table tbody tr');
    await expect(rows.first()).toBeVisible({ timeout: 10_000 });

    // Step 2: Record initial live row count
    const initialCount = await rows.count();
    expect(initialCount).toBeGreaterThanOrEqual(1);

    // Step 3: Click 'Duplicate question' on the first row
    await rows.first().locator('button[title="Duplicate question"]').click();

    // Step 4 & 5: Verify notice banner and incremented row count
    const notice = page.locator('.am-notice');
    await expect(notice).toBeVisible({ timeout: 8_000 });
    await expect(notice).toContainText('Question duplicated as draft.');
    await expect(rows).toHaveCount(initialCount + 1);
  });

});
