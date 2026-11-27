/**
 * tests/recruiter/tc-qb-003.spec.js
 *
 * Test Case ID: TC-QB-003
 * Test Scenario: Advanced Filter Panel & Clear All in Question Bank
 *
 * Preconditions:
 *  - Application is running at http://localhost:8080
 *  - Seeded recruiter account exists (recruiter@intellihire.com / Recruiter@2026)
 *
 * Test Steps:
 *  1. Log in as recruiter and navigate to /recruiter/question-bank (wait for /api/questions)
 *  2. Click the 'Filters' button (.am-filter-wrap > button)
 *  3. Verify .am-filter-panel opens with Section, Job Role, Skill Tag, Difficulty, Question Type, and Evaluation Mode dropdowns
 *  4. Select Difficulty = 'Medium' and verify active filter dot (.am-filter-dot) appears
 *  5. Select Question Type = 'Coding'
 *  6. Click 'Clear all' and verify dropdowns reset to 'All' and indicator dot disappears
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

test.describe('TC-QB-003: Question Bank Advanced Filters Suite', () => {

  test('TC-QB-03: Opens filter panel, applies Difficulty & Question Type filters, verifies dot indicator, and clears all', async ({ page }) => {
    // Step 1: Login and open Question Bank
    await loginAndOpenQuestionBank(page);

    await expect(page.locator('.am-table tbody tr').first()).toBeVisible({ timeout: 10_000 });

    // Step 2: Click Filters toggle button
    const filterToggleBtn = page.locator('.am-filter-wrap > button');
    await expect(filterToggleBtn).toBeVisible();
    await filterToggleBtn.click();

    // Step 3: Verify filter panel and all dropdowns are visible
    const filterPanel = page.locator('.am-filter-panel');
    await expect(filterPanel).toBeVisible();
    await expect(filterPanel.locator('select')).toHaveCount(6);

    // Step 4: Select Difficulty = 'Medium' and verify active dot indicator
    const diffSelect = filterPanel.locator('label:has-text("Difficulty") select');
    await diffSelect.selectOption('Medium');
    await expect(filterToggleBtn.locator('.am-filter-dot')).toBeVisible();

    // Step 5: Select Question Type = 'Coding'
    const typeSelect = filterPanel.locator('label:has-text("Question Type") select');
    await typeSelect.selectOption('Coding');

    // Step 6: Click 'Clear all' and verify reset
    await filterPanel.locator('button:has-text("Clear all")').click();
    await expect(diffSelect).toHaveValue('All');
    await expect(typeSelect).toHaveValue('All');
    await expect(filterToggleBtn.locator('.am-filter-dot')).toBeHidden();
  });

});
