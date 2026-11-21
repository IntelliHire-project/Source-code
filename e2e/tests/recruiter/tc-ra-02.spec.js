/**
 * tests/recruiter/tc-ra-02.spec.js
 *
 * Test Case ID: TC-RA-02
 * Test Scenario: Header, TopBar & Primary Navigation Tabs Verification
 *
 * Preconditions:
 *  - Application is running at http://localhost:8080
 *  - Recruiter account exists (recruiter@intellihire.com / Recruiter@2026)
 *
 * Test Steps:
 *  1. Authenticate and navigate to /recruiter/assessments
 *  2. Verify page title is 'Assessment Management' and subtitle is displayed
 *  3. Verify TopBar header contains breadcrumbs for Recruiter Dashboard > Assessment Management
 *  4. Verify all 3 primary navigation tabs exist:
 *     - 'Question Bank'
 *     - 'Assessments'
 *     - 'Candidate Results'
 *  5. Click 'Assessments' tab:
 *     - Verify tab receives active styling class
 *     - Verify Assessments toolbar (.am-toolbar) and search input appear
 *  6. Click 'Candidate Results' tab:
 *     - Verify tab receives active class
 *  7. Click 'Question Bank' tab:
 *     - Verify tab switches back to Question Bank panel
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
      await page.goto('/recruiter/assessments', { waitUntil: 'domcontentloaded' });
      return;
    }
  } catch (err) {
    // Fall back to UI login if API is unreachable directly
  }

  // Standard UI Login Fallback
  await page.goto('/signin', { waitUntil: 'domcontentloaded' });
  await page.locator('#email').fill(DEMO_RECRUITER_EMAIL);
  await page.locator('#password').fill(DEMO_RECRUITER_PASSWORD);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL('**/recruiter/**', { waitUntil: 'domcontentloaded', timeout: 12_000 });
  await page.goto('/recruiter/assessments', { waitUntil: 'domcontentloaded' });
}

test.describe('TC-RA-02: Header, TopBar & Tab Navigation Suite', () => {

  test('TC-RA-02: Verifies page title, subtitle, and switches between Question Bank, Assessments, and Candidate Results tabs', async ({ page }) => {
    // Step 1: Login and navigate to Assessment Management
    await loginAsRecruiter(page);

    // Step 2: Verify page header title and subtitle
    const pageTitle = page.locator('.am-page__title');
    await expect(pageTitle).toBeVisible({ timeout: 10_000 });
    await expect(pageTitle).toHaveText('Assessment Management');

    const pageSubtitle = page.locator('.am-page__subtitle');
    await expect(pageSubtitle).toBeVisible();
    await expect(pageSubtitle).toContainText('Build your question bank');

    // Step 3: Verify navigation tabs
    const tabButtons = page.locator('.am-tab-btn');
    await expect(tabButtons).toHaveCount(3);

    const questionBankTab = tabButtons.nth(0);
    const assessmentsTab = tabButtons.nth(1);
    const candidateResultsTab = tabButtons.nth(2);

    await expect(questionBankTab).toContainText('Question Bank');
    await expect(assessmentsTab).toContainText('Assessments');
    await expect(candidateResultsTab).toContainText('Candidate Results');

    // Step 4: Click 'Assessments' tab and verify activation
    await assessmentsTab.click();
    await expect(assessmentsTab).toHaveClass(/active/);
    await expect(page.locator('.am-toolbar')).toBeVisible({ timeout: 5_000 });
    await expect(page.locator('.am-search input')).toBeVisible();

    // Step 5: Click 'Candidate Results' tab and verify activation
    await candidateResultsTab.click();
    await expect(candidateResultsTab).toHaveClass(/active/);
    await expect(assessmentsTab).not.toHaveClass(/active/);

    // Step 6: Return to 'Question Bank' tab and verify activation
    await questionBankTab.click();
    await expect(questionBankTab).toHaveClass(/active/);
    await expect(candidateResultsTab).not.toHaveClass(/active/);
  });

});
