/**
 * tests/recruiter/tc-ra-13.spec.js
 *
 * Test Case ID: TC-RA-13
 * Test Scenario: Protected Route Access Control (Unauthenticated Guest)
 *
 * Preconditions:
 *  - Application is running at http://localhost:8080
 *  - User has no active session (unauthenticated guest)
 *
 * Test Steps:
 *  1. Clear browser localStorage and sessionStorage to ensure guest state
 *  2. Attempt direct navigation to /recruiter/assessments
 *  3. Verify route protection redirects the user to /signin
 *  4. Verify Sign In form fields (#email, #password) are visible
 *  5. Attempt direct navigation to /recruiter/assessments/new and verify redirect to /signin
 */

const { test, expect } = require('@playwright/test');

test.describe('TC-RA-13: Protected Route Access Control Suite', () => {

  test('TC-RA-13: Unauthenticated user accessing recruiter assessment routes is redirected to /signin', async ({ page }) => {
    // Step 1: Ensure unauthenticated guest state
    await page.goto('/signin', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Step 2: Attempt direct navigation to /recruiter/assessments
    await page.goto('/recruiter/assessments', { waitUntil: 'domcontentloaded' });

    // Step 3: Verify redirect to /signin
    await expect(page).toHaveURL(/\/signin/, { timeout: 10_000 });

    // Step 4: Verify login inputs are visible
    await expect(page.locator('#email')).toBeVisible({ timeout: 5_000 });
    await expect(page.locator('#password')).toBeVisible();

    // Step 5: Attempt direct navigation to /recruiter/assessments/new
    await page.goto('/recruiter/assessments/new', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/signin/, { timeout: 10_000 });
  });

});
