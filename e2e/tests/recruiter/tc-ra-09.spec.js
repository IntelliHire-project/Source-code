/**
 * tests/recruiter/tc-ra-09.spec.js
 *
 * Test Case ID: TC-RA-09
 * Test Scenario: Assessment Preview Page & Questions Accordion Verification
 *
 * Preconditions:
 *  - Application is running at http://localhost:8080
 *  - Recruiter account exists (recruiter@intellihire.com / Recruiter@2026)
 *  - Assessment A-1001 exists in database (or preview fallback renders)
 *
 * Test Steps:
 *  1. Authenticate and navigate to /recruiter/assessments/A-1001
 *  2. Verify preview header (.ap-header), assessment ID eyebrow, and title
 *  3. Verify action buttons ('Share', 'Edit Assessment', 'View Candidates')
 *  4. Verify all 4 summary KPI cards (.ap-summary article) are rendered
 *  5. Verify question cards (.ap-question-card) are visible and expanded by default
 *  6. Click first question header (.ap-question-header) to collapse it and verify .ap-question-body hides
 *  7. Click header again to expand it and verify .ap-question-body reappears
 *  8. Test 'Collapse All' / 'Expand All' toggle button
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
      await page.goto('/recruiter/assessments/A-1001', { waitUntil: 'domcontentloaded' });
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
  await page.goto('/recruiter/assessments/A-1001', { waitUntil: 'domcontentloaded' });
}

test.describe('TC-RA-09: Assessment Preview Page & Accordion Suite', () => {

  test('TC-RA-09: Verifies Assessment Preview layout, KPI summary cards, and interactive question accordions', async ({ page }) => {
    // Step 1: Login and navigate to Assessment A-1001 Preview
    await loginAsRecruiter(page);

    // Step 2: Verify preview header and assessment ID
    const header = page.locator('.ap-header');
    await expect(header).toBeVisible({ timeout: 10_000 });
    await expect(header.locator('.af-eyebrow')).toContainText('A-1001');
    await expect(header.locator('h1')).toBeVisible();

    // Step 3: Verify action buttons
    await expect(page.locator('.af-title-actions button:has-text("Edit Assessment")')).toBeVisible();
    await expect(page.locator('.af-title-actions button:has-text("View Candidates")')).toBeVisible();

    // Step 4: Verify summary KPI cards (Duration, Questions, Total Points, Candidates)
    const summaryCards = page.locator('.ap-summary article');
    await expect(summaryCards).toHaveCount(4);

    // Step 5: Verify question cards are rendered and initially expanded
    const questionCards = page.locator('.ap-question-card');
    await expect(questionCards.first()).toBeVisible({ timeout: 10_000 });
    const firstCard = questionCards.first();
    const firstBody = firstCard.locator('.ap-question-body');
    await expect(firstBody).toBeVisible();

    // Step 6: Click first question header to collapse it
    await firstCard.locator('.ap-question-header').click();
    await expect(firstBody).toBeHidden();

    // Step 7: Click header again to expand it
    await firstCard.locator('.ap-question-header').click();
    await expect(firstBody).toBeVisible();

    // Step 8: Test 'Collapse All' and 'Expand All' button
    const toggleAllBtn = page.locator('.ap-title-buttons button:has-text("Collapse All")');
    await expect(toggleAllBtn).toBeVisible();
    await toggleAllBtn.click();
    await expect(firstBody).toBeHidden();

    const expandAllBtn = page.locator('.ap-title-buttons button:has-text("Expand All")');
    await expect(expandAllBtn).toBeVisible();
    await expandAllBtn.click();
    await expect(firstBody).toBeVisible();
  });

});
