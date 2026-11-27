/**
 * tests/recruiter/tc-qb-001.spec.js
 *
 * Test Case ID: TC-QB-001
 * Test Scenario: Question Bank Navigation, Section Pills & Table Rendering
 *
 * Preconditions:
 *  - Application is running at http://localhost:8080
 *  - Seeded recruiter account exists (recruiter@intellihire.com / Recruiter@2026)
 *
 * Test Steps:
 *  1. Log in as recruiter and navigate to /recruiter/question-bank
 *  2. Verify Assessment Management heading and Question Bank tab active state
 *  3. Verify 4 section filter pills (All Sections, Section 1: Aptitude, Section 2: Technical, Section 3: Coding)
 *  4. Verify search input and 'Add New Question' button are visible
 *  5. Verify Question Bank table renders rows and pagination footer
 */

const { test, expect } = require('@playwright/test');
const {
  BASE_URL,
  DEMO_RECRUITER_EMAIL,
  DEMO_RECRUITER_PASSWORD,
} = require('../../helpers/api');

async function loginAndOpenQuestionBank(page) {
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
      await page.goto('/recruiter/question-bank', { waitUntil: 'domcontentloaded' });
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
  await page.goto('/recruiter/question-bank', { waitUntil: 'domcontentloaded' });
}

test.describe('TC-QB-001: Question Bank Navigation & Rendering Suite', () => {

  test('TC-QB-001: Opens Question Bank and verifies section pills, toolbar, and table rows', async ({ page }) => {
    // Step 1: Authenticate and open Question Bank
    await loginAndOpenQuestionBank(page);

    // Step 2: Verify Assessment Management heading & active Question Bank tab
    await expect(page.locator('.am-page__title')).toHaveText('Assessment Management', { timeout: 10_000 });
    const qbTab = page.locator('.am-tab-btn').first();
    await expect(qbTab).toHaveClass(/active/);
    await expect(qbTab).toContainText('Question Bank');

    // Step 3: Verify 4 section filter pills
    const sectionPills = page.locator('.am-section-pill-btn');
    await expect(sectionPills).toHaveCount(4);
    await expect(sectionPills.nth(0)).toContainText('All Sections');
    await expect(sectionPills.nth(1)).toContainText('Section 1: Aptitude');
    await expect(sectionPills.nth(2)).toContainText('Section 2: Technical');
    await expect(sectionPills.nth(3)).toContainText('Section 3: Coding');

    // Step 4: Verify toolbar search and Add New Question button
    await expect(page.locator('.am-search input')).toBeVisible();
    await expect(page.locator('button:has-text("Add New Question")')).toBeVisible();

    // Step 5: Verify table rows and footer render
    const rows = page.locator('.am-table tbody tr');
    await expect(rows.first()).toBeVisible({ timeout: 10_000 });
    expect(await rows.count()).toBeGreaterThanOrEqual(1);
    await expect(page.locator('.am-table-footer')).toContainText('questions');
  });

});
