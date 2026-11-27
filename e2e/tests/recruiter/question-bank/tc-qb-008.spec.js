/**
 * tests/recruiter/tc-qb-008.spec.js
 *
 * Test Case ID: TC-QB-008
 * Test Scenario: Edit Existing Question & Update Persistence
 *
 * Preconditions:
 *  - Application is running at http://localhost:8080
 *  - Seeded recruiter account exists (recruiter@intellihire.com / Recruiter@2026)
 *  - At least 1 question exists in Question Bank
 *
 * Test Steps:
 *  1. Log in as recruiter and navigate to /recruiter/question-bank (wait for /api/questions)
 *  2. Click 'Edit question' action button on the first question row
 *  3. Verify URL transitions to /recruiter/question-bank/edit/:id and title is 'Edit Question'
 *  4. Verify #aq-question-body is pre-populated with existing question text
 *  5. Append a unique [Edited-XXXX] marker at the start/end of the statement
 *  6. Click 'Update Question', verify .aq-success-banner, redirect to /recruiter/assessments, and updated text in table
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

test.describe('TC-QB-008: Edit Existing Question Suite', () => {

  test('TC-QB-08: Opens an existing question in edit mode, modifies statement, and persists update', async ({ page }) => {
    // Step 1: Login and open Question Bank
    await loginAndOpenQuestionBank(page);

    const firstRow = page.locator('.am-table tbody tr').first();
    await expect(firstRow).toBeVisible({ timeout: 10_000 });

    // Step 2 & 3: Click 'Edit question' button on first row and verify edit page opens
    await firstRow.locator('button[title="Edit question"]').click();
    await expect(page).toHaveURL(/\/recruiter\/question-bank\/edit\//, { timeout: 10_000 });
    await expect(page.locator('.aq-page__title')).toHaveText('Edit Question');

    // Step 4: Verify existing statement is pre-populated
    const statementArea = page.locator('#aq-question-body');
    await expect(statementArea).toBeVisible();
    const originalStatement = await statementArea.inputValue();
    expect(originalStatement.trim().length).toBeGreaterThan(0);

    // Ensure required metadata fields are valid
    const roleSelect = page.locator('.aq-two-col select').first();
    if (!(await roleSelect.inputValue())) {
      await roleSelect.selectOption('Software Engineer');
    }
    if ((await page.locator('.aq-tag').count()) === 0) {
      const skillInput = page.locator('input.aq-tag-input__field');
      await skillInput.fill('General');
      await skillInput.press('Enter');
    }

    // Step 5: Prefix unique edit marker so it stays visible in the 90-char table snippet
    const editTag = `[Edited-${Date.now().toString().slice(-4)}]`;
    const cleanBase = originalStatement.replace(/^\[Edited-\d+\]\s*/g, '').trim();
    await statementArea.fill(`${editTag} ${cleanBase}`);

    // Step 6: Click 'Update Question' and verify persistence
    const updateBtn = page.locator('.aq-footer button.aq-btn--primary');
    await expect(updateBtn).toContainText('Update Question');
    await updateBtn.click();

    await expect(page.locator('.aq-success-banner')).toBeVisible({ timeout: 8_000 });
    await expect(page).toHaveURL(/\/recruiter\/assessments/, { timeout: 10_000 });
    await expect(page.locator('.am-table')).toContainText(editTag, { timeout: 10_000 });
  });

});
