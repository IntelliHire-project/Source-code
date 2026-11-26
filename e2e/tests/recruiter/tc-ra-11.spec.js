/**
 * tests/recruiter/tc-ra-11.spec.js
 *
 * Test Case ID: TC-RA-11
 * Test Scenario: Multiple Choice Question (MCQ) Options Editing & Correct Answer Selection
 *
 * Preconditions:
 *  - Application is running at http://localhost:8080
 *  - Recruiter account exists (recruiter@intellihire.com / Recruiter@2026)
 *  - Assessment A-1001 exists in database
 *
 * Test Steps:
 *  1. Authenticate and navigate to /recruiter/assessments/A-1001/edit
 *  2. Locate a Multiple Choice question card (or create one by clicking '+ Add Question' and selecting 'Multiple Choice')
 *  3. Expand the question card if collapsed
 *  4. Verify option text inputs and correct-answer radio buttons are rendered
 *  5. Edit Option B text input and verify updated value
 *  6. Select Option B radio button as the correct answer and verify checked state & '✓ Correct' badge
 *  7. Click '+ Add Option' and verify the total number of option rows increases by 1
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

test.describe('TC-RA-11: Multiple Choice Question Options Editing Suite', () => {

  test('TC-RA-11: Edits MCQ options, selects correct answer radio, and adds a new option', async ({ page }) => {
    // Step 1: Login and navigate to Edit Assessment page
    await loginAsRecruiter(page);

    const questionCards = page.locator('article.ca-question');
    await expect(questionCards.first()).toBeVisible({ timeout: 10_000 });

    // Step 2: Locate an existing Multiple Choice question or add one
    let mcqCard = page.locator('article.ca-question:has-text("Multiple Choice")').first();
    if ((await page.locator('article.ca-question:has-text("Multiple Choice")').count()) > 0) {
      const bodyVisible = await mcqCard.locator('.ca-question-body').isVisible();
      if (!bodyVisible) {
        await mcqCard.locator('header').click();
      }
    } else {
      await page.locator('.ca-bank-title button:has-text("Add Question")').click();
      mcqCard = questionCards.last();
      await mcqCard.locator('label:has-text("Type") select').selectOption('Multiple Choice');
    }

    // Step 3: Verify option inputs and radio buttons are visible
    const radios = mcqCard.locator('input[type="radio"]');
    const optionInputs = mcqCard.locator('input[type="text"][placeholder*="Option "]');
    await expect(radios.first()).toBeVisible({ timeout: 5_000 });
    const initialOptionCount = await optionInputs.count();
    expect(initialOptionCount).toBeGreaterThanOrEqual(2);

    // Step 4: Edit Option B text
    const optionBInput = optionInputs.nth(1);
    await optionBInput.fill('Updated Option B Answer');
    await expect(optionBInput).toHaveValue('Updated Option B Answer');

    // Step 5: Select Option B radio button as correct answer
    const optionBRadio = radios.nth(1);
    await optionBRadio.check();
    await expect(optionBRadio).toBeChecked();
    await expect(mcqCard).toContainText('✓ Correct');

    // Step 6: Click '+ Add Option' and verify new option appears
    const addOptionBtn = mcqCard.locator('button:has-text("Add Option")');
    await expect(addOptionBtn).toBeVisible();
    await addOptionBtn.click();

    await expect(optionInputs).toHaveCount(initialOptionCount + 1);
  });

});
