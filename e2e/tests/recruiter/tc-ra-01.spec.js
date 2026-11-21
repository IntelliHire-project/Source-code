/**
 * tests/recruiter/tc-ra-01.spec.js
 *
 * Test Case ID: TC-RA-01
 * Test Scenario: Recruiter Authentication & Navigation to Assessment Management
 *
 * Preconditions:
 *  - Application is running at http://localhost:8080
 *  - Seeded recruiter account exists (recruiter@intellihire.com / Recruiter@2026)
 *
 * Test Steps:
 *  1. Navigate to /signin
 *  2. Assert login form (#email, #password) is visible
 *  3. Fill recruiter credentials (email, password)
 *  4. Click Sign In submit button
 *  5. Wait for successful navigation to recruiter portal
 *  6. Navigate to /recruiter/assessments
 *  7. Assert header 'Assessment Management' is visible
 *  8. Assert assessment navigation tabs (Question Bank, Assessments, Candidate Results) are visible
 */

const { test, expect } = require('@playwright/test');
const {
  BASE_URL,
  DEMO_RECRUITER_EMAIL,
  DEMO_RECRUITER_PASSWORD,
} = require('../helpers/api');

test.describe('TC-RA-01: Recruiter Assessment Navigation Suite', () => {

  test('TC-RA-01: Recruiter logs in via UI and navigates to Assessment Management', async ({ page }) => {
    // Step 1: Navigate to Sign In page
    await page.goto('/signin', { waitUntil: 'domcontentloaded' });
    
    // Step 2: Verify email and password input fields are visible
    const emailInput = page.locator('#email');
    const passwordInput = page.locator('#password');
    await expect(emailInput).toBeVisible({ timeout: 10_000 });
    await expect(passwordInput).toBeVisible({ timeout: 10_000 });

    // Step 3: Fill credentials
    await emailInput.fill(DEMO_RECRUITER_EMAIL);
    await passwordInput.fill(DEMO_RECRUITER_PASSWORD);

    // Step 4: Click Sign In button
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // Step 5: Wait for redirection to recruiter portal
    await page.waitForURL('**/recruiter/**', { waitUntil: 'domcontentloaded', timeout: 12_000 });

    // Step 6: Navigate to Assessment Management page
    await page.goto('/recruiter/assessments', { waitUntil: 'domcontentloaded' });

    // Step 7: Verify page title is 'Assessment Management'
    const pageTitle = page.locator('.am-page__title');
    await expect(pageTitle).toBeVisible({ timeout: 10_000 });
    await expect(pageTitle).toHaveText('Assessment Management');

    // Step 8: Verify tab navigation container is present
    const tabNav = page.locator('.am-tab-nav');
    await expect(tabNav).toBeVisible();

    // Verify individual tabs are rendered
    const tabs = page.locator('.am-tab-btn');
    await expect(tabs).toHaveCount(3);
    await expect(tabs.nth(0)).toContainText('Question Bank');
    await expect(tabs.nth(1)).toContainText('Assessments');
    await expect(tabs.nth(2)).toContainText('Candidate Results');
  });

});
