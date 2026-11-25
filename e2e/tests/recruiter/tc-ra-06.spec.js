/**
 * tests/recruiter/tc-ra-06.spec.js
 *
 * Test Case ID: TC-RA-06
 * Test Scenario: Custom Vacancy ("Other") Selection & Dynamic Title Auto-Generation
 *
 * Preconditions:
 *  - Application is running at http://localhost:8080
 *  - Recruiter account exists (recruiter@intellihire.com / Recruiter@2026)
 *
 * Test Steps:
 *  1. Authenticate and navigate to /recruiter/assessments/new
 *  2. Locate the Target Job Vacancy dropdown in the Configuration panel
 *  3. Select 'Other' from the dropdown
 *  4. Verify the 'Custom Vacancy / Role Name *' input field appears
 *  5. Fill the custom role input with 'AI Reliability Specialist'
 *  6. Click the 'Auto-Generate Title' button (.af-auto-gen-btn)
 *  7. Assert the Assessment Title input updates with 'AI Reliability Specialist Assessment'
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

test.describe('TC-RA-06: Custom Vacancy ("Other") Selection & Dynamic Title Suite', () => {

  test('TC-RA-06: Selects "Other" role, enters custom vacancy title, and auto-generates title', async ({ page }) => {
    // Step 1: Login and navigate directly to Assessment Builder
    await loginAsRecruiter(page);

    // Step 2: Locate the Target Job Vacancy dropdown
    const roleSelect = page.locator('.ca-config label:has-text("Target Job Vacancy") select');
    await expect(roleSelect).toBeVisible({ timeout: 10_000 });

    // Step 3: Select 'Other'
    await roleSelect.selectOption('Other');

    // Step 4: Verify Custom Vacancy input appears and fill it
    const customRoleInput = page.locator('input[placeholder*="Type custom role"]');
    await expect(customRoleInput).toBeVisible({ timeout: 5_000 });
    await customRoleInput.fill('AI Reliability Specialist');

    // Step 5: Click 'Auto-Generate Title' button
    const autoGenBtn = page.locator('button.af-auto-gen-btn');
    await expect(autoGenBtn).toBeVisible();
    await autoGenBtn.click();

    // Step 6: Verify Assessment Title updates dynamically using the custom role
    const titleInput = page.locator('.ca-config label:has-text("Assessment Title") input');
    await expect(titleInput).toBeVisible();

    const titleValue = await titleInput.inputValue();
    expect(titleValue).toContain('AI Reliability Specialist');
    expect(titleValue).toContain('Assessment');
  });

});
