/**
 * tests/recruiter/tc-qb-007.spec.js
 *
 * Test Case ID: TC-QB-007
 * Test Scenario: Create Coding Challenge Question (Language, Boilerplate & Test Cases)
 *
 * Preconditions:
 *  - Application is running at http://localhost:8080
 *  - Seeded recruiter account exists (recruiter@intellihire.com / Recruiter@2026)
 *
 * Test Steps:
 *  1. Log in as recruiter and navigate to /recruiter/question-bank/add
 *  2. Select Job Role = 'Software Engineer', add skill tag 'Python', and select 'Hard' difficulty
 *  3. Click 'Coding Challenge' question type tab (.aq-type-tab) and enter a unique prompt
 *  4. Click 'Python' language pill (.aq-lang-pill) and verify starter code switches to Python ('def solution')
 *  5. Fill Test Case #1 Input and Expected Output
 *  6. Verify Live Preview shows 'Coding Challenge' and '1 test case defined'
 *  7. Click 'Save Question', verify .aq-success-banner, redirect to /recruiter/assessments, and table persistence
 */

const { test, expect } = require('@playwright/test');
const {
  BASE_URL,
  DEMO_RECRUITER_EMAIL,
  DEMO_RECRUITER_PASSWORD,
} = require('../../helpers/api');

async function loginAndOpenAddQuestion(page) {
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
      await page.goto('/recruiter/question-bank/add', { waitUntil: 'domcontentloaded' });
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
  await page.goto('/recruiter/question-bank/add', { waitUntil: 'domcontentloaded' });
}

test.describe('TC-QB-007: Create Coding Challenge Question Suite', () => {

  test('TC-QB-07: Configures Python coding challenge with boilerplate and test case, then saves', async ({ page }) => {
    // Step 1: Login and open Add New Question page
    await loginAndOpenAddQuestion(page);

    await expect(page.locator('.aq-page__title')).toHaveText('Add New Question', { timeout: 10_000 });

    const uniqueId = Date.now().toString().slice(-5);
    const uniquePrompt = `[E2E-Code-${uniqueId}] Return the sum of two integers in Python.`;

    // Step 2: Select Job Role, Skill tag, and Hard difficulty
    await page.locator('.aq-two-col select').first().selectOption('Software Engineer');
    const skillInput = page.locator('input.aq-tag-input__field');
    await skillInput.fill('Python');
    await skillInput.press('Enter');
    await expect(page.locator('.aq-tag:has-text("Python")')).toBeVisible();
    await page.locator('.aq-diff-pill:has-text("Hard")').click();

    // Step 3: Switch Question Type to Coding Challenge and enter statement
    await page.locator('.aq-type-tab:has-text("Coding Challenge")').click();
    await page.locator('#aq-question-body').fill(uniquePrompt);

    // Step 4: Select Python language pill & verify editor updates
    await page.locator('.aq-lang-pill:has-text("Python")').click();
    await expect(page.locator('.aq-code-editor .aq-code-editor__lang')).toHaveText('Python');
    await expect(page.locator('textarea.aq-code-editor__area')).toContainText('def solution');

    // Step 5: Fill Test Case #1 Input & Expected Output
    const firstTestCase = page.locator('.aq-testcase').first();
    await firstTestCase.locator('textarea').nth(0).fill('a = 2, b = 3');
    await firstTestCase.locator('textarea').nth(1).fill('5');

    // Step 6: Verify Live Preview shows Coding Challenge & 1 test case defined
    await expect(page.locator('.aq-preview__card')).toContainText('Coding Challenge');
    await expect(page.locator('.aq-preview__testcount')).toContainText('1 test case defined');

    // Step 7: Save Question and verify redirect & table persistence
    await page.locator('.aq-footer button.aq-btn--primary').click();
    await expect(page.locator('.aq-success-banner')).toBeVisible({ timeout: 8_000 });
    await expect(page).toHaveURL(/\/recruiter\/assessments/, { timeout: 10_000 });
    await expect(page.locator('.am-table')).toContainText(`[E2E-Code-${uniqueId}]`, { timeout: 10_000 });
  });

});
