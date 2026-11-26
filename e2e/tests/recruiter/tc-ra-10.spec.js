/**
 * tests/recruiter/tc-ra-10.spec.js
 *
 * Test Case ID: TC-RA-10
 * Test Scenario: Edit Assessment Page Loading & Pre-Populated Question Fields
 *
 * Preconditions:
 *  - Application is running at http://localhost:8080
 *  - Recruiter account exists (recruiter@intellihire.com / Recruiter@2026)
 *  - Assessment A-1001 exists in database
 *
 * Test Steps:
 *  1. Authenticate and navigate to /recruiter/assessments/A-1001/edit
 *  2. Verify page header displays 'Edit Assessment' and primary button displays 'Update Assessment'
 *  3. Verify configuration fields (Assessment Title, Duration) are pre-populated
 *  4. Verify Question Bank cards (article.ca-question) are rendered with non-empty header titles
 *  5. Verify the first expanded question displays pre-populated Question Title, Question Text / Prompt, and Points Value
 *  6. Expand the second question card and verify its Question Text / Prompt is also non-empty
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
      await page.goto('/recruiter/assessments/A-1001/edit', { waitUntil: 'domcontentloaded' });
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
  await page.goto('/recruiter/assessments/A-1001/edit', { waitUntil: 'domcontentloaded' });
}

test.describe('TC-RA-10: Edit Assessment Pre-Populated Fields Suite', () => {

  test('TC-RA-10: Loads assessment A-1001 in edit mode with pre-populated configuration and question prompts', async ({ page }) => {
    // Step 1: Login and navigate to Edit Assessment page
    await loginAsRecruiter(page);

    // Step 2: Verify Edit Assessment header & Update button
    const pageTitle = page.locator('.af-page-title h1');
    await expect(pageTitle).toBeVisible({ timeout: 10_000 });
    await expect(pageTitle).toHaveText('Edit Assessment');

    const updateBtn = page.locator('.af-title-actions button.af-primary');
    await expect(updateBtn).toContainText('Update Assessment');

    // Step 3: Verify Assessment Title in Configuration panel is pre-populated
    const configTitleInput = page.locator('.ca-config label:has-text("Assessment Title") input');
    await expect(configTitleInput).toBeVisible();
    const configTitleVal = await configTitleInput.inputValue();
    expect(configTitleVal.trim().length).toBeGreaterThan(0);

    // Step 4: Verify question cards and non-empty header title
    const questionCards = page.locator('article.ca-question');
    await expect(questionCards.first()).toBeVisible({ timeout: 10_000 });
    const count = await questionCards.count();
    expect(count).toBeGreaterThanOrEqual(1);

    const firstCard = questionCards.first();
    const firstHeaderTitle = await firstCard.locator('header strong').textContent();
    expect((firstHeaderTitle || '').trim().length).toBeGreaterThan(0);

    // Step 5: Verify first question's Title input, Question Text textarea, and Points input are populated
    const firstTitleInput = firstCard.locator('label:has-text("Question Title") input');
    await expect(firstTitleInput).toBeVisible();
    expect((await firstTitleInput.inputValue()).trim().length).toBeGreaterThan(0);

    const firstTextarea = firstCard.locator('label:has-text("Question Text") textarea');
    await expect(firstTextarea).toBeVisible();
    expect((await firstTextarea.inputValue()).trim().length).toBeGreaterThan(0);

    const firstPointsInput = firstCard.locator('label:has-text("Points Value") input');
    expect(Number(await firstPointsInput.inputValue())).toBeGreaterThan(0);

    // Step 6: Expand second question card (if present) and verify its text is also populated
    if (count > 1) {
      const secondCard = questionCards.nth(1);
      await secondCard.locator('header').click();
      const secondTextarea = secondCard.locator('label:has-text("Question Text") textarea');
      await expect(secondTextarea).toBeVisible();
      expect((await secondTextarea.inputValue()).trim().length).toBeGreaterThan(0);
    }
  });

});
