/**
 * tests/recruiter/tc-ra-04.spec.js
 *
 * Test Case ID: TC-RA-04
 * Test Scenario: Standalone Assessment Builder Navigation & Form Layout Verification
 *
 * Preconditions:
 *  - Application is running at http://localhost:8080
 *  - Recruiter account exists (recruiter@intellihire.com / Recruiter@2026)
 *
 * Test Steps:
 *  1. Authenticate as recruiter and navigate to /recruiter/assessments
 *  2. Switch to 'Assessments' tab and click '+ Create New Assessment' button (or navigate to /recruiter/assessments/new)
 *  3. Verify page title displays 'Create New Assessment'
 *  4. Verify the Configuration aside (.ca-config) is visible
 *  5. Verify the Question Bank section (.ca-bank) is visible with question cards
 *  6. Verify action buttons ('Save as Draft' and 'Publish Assessment') are visible and enabled
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

test.describe('TC-RA-04: Standalone Assessment Builder Navigation Suite', () => {

  test('TC-RA-04: Navigates to /recruiter/assessments/new and renders configuration panel, question bank, and save buttons', async ({ page }) => {
    // Step 1: Login and navigate directly to Assessment Builder
    await loginAsRecruiter(page);

    // Step 2: Verify page header title
    const pageHeader = page.locator('.af-page-title h1');
    await expect(pageHeader).toBeVisible({ timeout: 10_000 });
    await expect(pageHeader).toHaveText('Create New Assessment');

    // Step 3: Verify Configuration aside panel
    const configPanel = page.locator('.ca-config');
    await expect(configPanel).toBeVisible();
    await expect(configPanel.locator('h2')).toContainText('Configuration');

    // Step 4: Verify Question Bank section
    const bankSection = page.locator('.ca-bank');
    await expect(bankSection).toBeVisible();
    await expect(bankSection.locator('h2')).toContainText('Question Bank');

    // Step 5: Verify initial question cards are rendered
    const questionCards = page.locator('article.ca-question');
    const questionCount = await questionCards.count();
    expect(questionCount).toBeGreaterThanOrEqual(1);

    // Step 6: Verify top action buttons
    const saveDraftBtn = page.locator('.af-title-actions button.af-secondary');
    const publishBtn = page.locator('.af-title-actions button.af-primary');
    await expect(saveDraftBtn).toBeVisible();
    await expect(saveDraftBtn).toHaveText('Save as Draft');
    await expect(publishBtn).toBeVisible();
    await expect(publishBtn).toContainText('Publish Assessment');
  });

});
