/**
 * tests/recruiter/tc-qb-004.spec.js
 *
 * Test Case ID: TC-QB-004
 * Test Scenario: Question Preview Modal & Edit Redirect
 *
 * Preconditions:
 *  - Application is running at http://localhost:8080
 *  - Seeded recruiter account exists (recruiter@intellihire.com / Recruiter@2026)
 *  - At least 1 question exists in Question Bank
 *
 * Test Steps:
 *  1. Log in as recruiter and navigate to /recruiter/question-bank (wait for /api/questions)
 *  2. Click the Eye ('Preview question') action button on the first question row
 *  3. Verify .am-modal opens with heading 'Question Preview'
 *  4. Verify question statement (.am-preview-question) and points badge (.am-preview-pts) render
 *  5. Click 'Edit Question' in modal footer
 *  6. Verify URL redirects to /recruiter/question-bank/edit/:id and heading displays 'Edit Question'
 */

const { test, expect } = require('@playwright/test');
const {
  BASE_URL,
  DEMO_RECRUITER_EMAIL,
  DEMO_RECRUITER_PASSWORD,
} = require('../../helpers/api');

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

test.describe('TC-QB-004: Question Preview Modal Suite', () => {

  test('TC-QB-04: Opens Question Preview modal, inspects content, and navigates to Edit Question page', async ({ page }) => {
    // Step 1: Login and open Question Bank
    await loginAndOpenQuestionBank(page);

    const firstRow = page.locator('.am-table tbody tr').first();
    await expect(firstRow).toBeVisible({ timeout: 10_000 });

    // Step 2: Click 'Preview question' button
    await firstRow.locator('button[title="Preview question"]').click();

    // Step 3 & 4: Verify modal opens with heading, statement, and points
    const modal = page.locator('.am-modal');
    await expect(modal).toBeVisible({ timeout: 5_000 });
    await expect(modal.locator('h2')).toHaveText('Question Preview');
    await expect(modal.locator('.am-preview-question')).toBeVisible();
    await expect(modal.locator('.am-preview-pts')).toContainText('points');

    // Step 5 & 6: Click 'Edit Question' and verify redirect
    await modal.locator('.am-modal__footer button:has-text("Edit Question")').click();
    await expect(page).toHaveURL(/\/recruiter\/question-bank\/edit\//, { timeout: 10_000 });
    await expect(page.locator('.aq-page__title')).toHaveText('Edit Question');
  });

});
