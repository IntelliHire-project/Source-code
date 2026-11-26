/**
 * tests/recruiter/tc-ra-07.spec.js
 *
 * Test Case ID: TC-RA-07
 * Test Scenario: Dynamic Question Addition & Removal in Assessment Builder
 *
 * Preconditions:
 *  - Application is running at http://localhost:8080
 *  - Recruiter account exists (recruiter@intellihire.com / Recruiter@2026)
 *
 * Test Steps:
 *  1. Authenticate and navigate to /recruiter/assessments/new
 *  2. Record the initial question card count (article.ca-question)
 *  3. Click '+ Add Question' button in Question Bank section
 *  4. Verify question card count increases by 1 and the Question Bank badge updates
 *  5. Verify the newly added question card is expanded with its inputs visible
 *  6. Click 'Remove Question' (.ca-remove) on the newly added question card
 *  7. Verify question card count reverts back to the initial count
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

test.describe('TC-RA-07: Dynamic Question Addition & Removal Suite', () => {

  test('TC-RA-07: Dynamically adds and removes questions in the assessment builder', async ({ page }) => {
    // Step 1: Login and navigate to Assessment Builder
    await loginAsRecruiter(page);

    const questionCards = page.locator('article.ca-question');
    await expect(questionCards.first()).toBeVisible({ timeout: 10_000 });

    // Step 2: Record initial question count
    const initialCount = await questionCards.count();
    expect(initialCount).toBeGreaterThanOrEqual(1);

    const countBadge = page.locator('.ca-bank-title h2 small');
    await expect(countBadge).toHaveText(`${initialCount} Questions`);

    // Step 3: Click '+ Add Question'
    const addBtn = page.locator('.ca-bank-title button:has-text("Add Question")');
    await expect(addBtn).toBeVisible();
    await addBtn.click();

    // Step 4: Verify count increases by 1 and counter badge updates
    await expect(questionCards).toHaveCount(initialCount + 1);
    await expect(countBadge).toHaveText(`${initialCount + 1} Questions`);

    // Step 5: Verify the newly added question card is expanded with its remove button
    const lastQuestionCard = questionCards.last();
    const removeBtn = lastQuestionCard.locator('button.ca-remove');
    await expect(removeBtn).toBeVisible();

    // Step 6: Remove the newly added question
    await removeBtn.click();

    // Step 7: Verify count reverts to initial state
    await expect(questionCards).toHaveCount(initialCount);
    await expect(countBadge).toHaveText(`${initialCount} Questions`);
  });

});
