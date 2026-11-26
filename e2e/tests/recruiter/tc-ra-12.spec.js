/**
 * tests/recruiter/tc-ra-12.spec.js
 *
 * Test Case ID: TC-RA-12
 * Test Scenario: Coding Challenge Starter Code Boilerplate Editing
 *
 * Preconditions:
 *  - Application is running at http://localhost:8080
 *  - Recruiter account exists (recruiter@intellihire.com / Recruiter@2026)
 *  - Assessment A-1001 exists in database
 *
 * Test Steps:
 *  1. Authenticate and navigate to /recruiter/assessments/A-1001/edit
 *  2. Wait for question cards (article.ca-question) to load
 *  3. Click '+ Add Question' and select Type = 'Coding' (or locate existing Coding card)
 *  4. Verify 'Candidate Starter Code Boilerplate' section and code textarea appear
 *  5. Enter starter code boilerplate into the editor textarea
 *  6. Verify the entered starter code is retained in the editor input value
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

test.describe('TC-RA-12: Coding Challenge Boilerplate Editing Suite', () => {

  test('TC-RA-12: Switches question type to Coding and edits starter code boilerplate', async ({ page }) => {
    // Step 1: Login and navigate to Edit Assessment page
    await loginAsRecruiter(page);

    const questionCards = page.locator('article.ca-question');
    await expect(questionCards.first()).toBeVisible({ timeout: 10_000 });

    // Step 2: Add a new question and switch its Type to 'Coding'
    await page.locator('.ca-bank-title button:has-text("Add Question")').click();
    const codingCard = questionCards.last();

    const typeSelect = codingCard.locator('label:has-text("Type") select');
    await expect(typeSelect).toBeVisible();
    await typeSelect.selectOption('Coding');

    // Step 3: Verify Coding Boilerplate label and editor appear
    await expect(codingCard).toContainText('Candidate Starter Code Boilerplate');
    const codeEditor = codingCard.locator('textarea[placeholder*="Starter code boilerplate"]');
    await expect(codeEditor).toBeVisible({ timeout: 5_000 });

    // Step 4: Fill starter code boilerplate and verify retained value
    const sampleCode = 'function testSolution(input) {\n  return input * 2;\n}';
    await codeEditor.fill(sampleCode);
    await expect(codeEditor).toHaveValue(sampleCode);
  });

});
