/**
 * tests/recruiter/tc-qb-010.spec.js
 *
 * Test Case ID: TC-QB-010
 * Test Scenario: Delete Question Confirmation Modal & Removal
 *
 * Preconditions:
 *  - Application is running at http://localhost:8080
 *  - Seeded recruiter account exists (recruiter@intellihire.com / Recruiter@2026)
 *  - At least 1 question exists in Question Bank
 *
 * Test Steps:
 *  1. Log in as recruiter and navigate to /recruiter/question-bank (wait for /api/questions)
 *  2. Record initial row count and target a test/copied question row (or last row)
 *  3. Click Trash ('Delete question') icon and verify .am-modal--confirm opens with 'Delete Question'
 *  4. Click 'Cancel' and verify modal closes while row count remains unchanged
 *  5. Re-open Delete modal, click 'Delete' (.am-btn--danger), verify modal closes, notice shows, and row count decreases by 1
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

test.describe('TC-QB-010: Delete Question Confirmation Modal Suite', () => {

  test('TC-QB-10: Opens confirmation modal, cancels safely, then confirms permanent deletion', async ({ page }) => {
    // Step 1: Login and open Question Bank
    await loginAndOpenQuestionBank(page);

    const rows = page.locator('.am-table tbody tr');
    await expect(rows.first()).toBeVisible({ timeout: 10_000 });

    // Step 2: Record initial count & prefer targeting a test/copied question row
    const initialCount = await rows.count();
    expect(initialCount).toBeGreaterThanOrEqual(1);

    const testRow = page.locator('.am-table tbody tr:has-text("(Copy)"), .am-table tbody tr:has-text("[E2E")').first();
    const targetRow = (await testRow.count()) > 0 ? testRow : rows.last();

    // Step 3: Click Trash button -> open ConfirmDeleteModal
    await targetRow.locator('button[title="Delete question"]').click();
    const confirmModal = page.locator('.am-modal--confirm');
    await expect(confirmModal).toBeVisible({ timeout: 5_000 });
    await expect(confirmModal.locator('.am-confirm-title')).toHaveText('Delete Question');

    // Step 4: Click Cancel -> modal closes and row count remains unchanged
    await confirmModal.locator('button:has-text("Cancel")').click();
    await expect(confirmModal).toBeHidden();
    await expect(rows).toHaveCount(initialCount);

    // Step 5: Re-open modal and click Delete -> question is removed
    await targetRow.locator('button[title="Delete question"]').click();
    await expect(confirmModal).toBeVisible();
    await confirmModal.locator('button.am-btn--danger').click();

    await expect(confirmModal).toBeHidden({ timeout: 8_000 });
    await expect(page.locator('.am-notice')).toContainText('Question deleted');
    await expect(rows).toHaveCount(initialCount - 1);
  });

});
