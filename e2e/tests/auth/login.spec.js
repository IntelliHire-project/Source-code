/**
 * tests/auth/login.spec.js
 *
 * Tests for the IntelliHire Sign In page (/signin).
 *
 * Covers:
 *  TC - AUTH - 011: Candidate Sign In with valid credentials
 *  TC - AUTH - 012: Sign In with Incorrect Password
 *  TC - AUTH - 013: Sign In with Non-Existent Email (Account Enumeration Prevention)
 *  TC - AUTH - 015: Sign In Form Empty Fields Validation
 *
 *
 * SELECTORS: All selectors are based on the real HTML `id` attributes and
 * CSS classes found in SignInPage.js. Nothing is invented.
 *
 *   #email                → email input
 *   #password             → password input
 *   button[type="submit"] → the "Sign In" button
 *   p.form-status         → the status/error message paragraph (role="status")
 */

const { test, expect } = require('@playwright/test');
const { DEMO_CANDIDATE_EMAIL, DEMO_CANDIDATE_PASSWORD } = require('../helpers/api');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Navigates to the sign-in page and waits for the form to be visible.
 */
async function goToSignIn(page) {
  await page.goto('/signin');
  // The form contains a heading — wait for it to confirm the page loaded
  await expect(page.getByRole('heading', { name: 'Sign In to Your Account' })).toBeVisible();
}

/**
 * Fills in the sign-in form and clicks "Sign In".
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} email
 * @param {string} password
 */
async function fillAndSubmitLogin(page, email, password) {
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);
  await page.locator('button[type="submit"]').click();
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe('Sign In Page', () => {

  // -------------------------------------------------------------------------
  // Test 1: The sign-in page loads
  // -------------------------------------------------------------------------
  test('should display the sign-in form', async ({ page }) => {
    await page.goto('/signin');

    // Heading
    await expect(
      page.getByRole('heading', { name: 'Sign In to Your Account' })
    ).toBeVisible();

    // Inputs are present
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();

    // Submit button shows correct label
    await expect(page.locator('button[type="submit"]')).toContainText('Sign In');

    // Links to signup pages exist
    await expect(page.getByRole('link', { name: 'Candidate Account' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Recruiter Account' })).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // TC - AUTH - 011: Valid candidate login → success message → redirect
  // -------------------------------------------------------------------------
  test('TC - AUTH - 011: Candidate Sign In with valid credentials', async ({ page }) => {
    await goToSignIn(page);

    await fillAndSubmitLogin(page, DEMO_CANDIDATE_EMAIL, DEMO_CANDIDATE_PASSWORD);

    // The frontend shows a success message before redirecting
    // Exact string from SignInPage.js line 70: 'Signed in successfully!'
    const statusMsg = page.locator('p.form-status');
    await expect(statusMsg).toBeVisible();
    await expect(statusMsg).toContainText('Signed in successfully!');

    // After ~1.2 s the app redirects candidates to /candidate/dashboard
    await page.waitForURL('**/candidate/**', { timeout: 5_000 });
    expect(page.url()).toContain('/candidate/');
  });

  // -------------------------------------------------------------------------
  // TC - AUTH - 012: Wrong password → error message
  // -------------------------------------------------------------------------
  test('TC - AUTH - 012: Sign In with Incorrect Password', async ({ page }) => {
    await goToSignIn(page);

    await fillAndSubmitLogin(page, DEMO_CANDIDATE_EMAIL, 'WrongPassword999!');

    // Exact error string from authController.js line 259:
    // "Invalid email or password."
    const statusMsg = page.locator('p.form-status');
    await expect(statusMsg).toBeVisible();
    await expect(statusMsg).toContainText('Invalid email or password.');

    // Make sure we did NOT navigate away
    expect(page.url()).toContain('/signin');
  });

  // -------------------------------------------------------------------------
  // TC - AUTH - 013: Non-existent email → same generic error (no user enumeration)
  // -------------------------------------------------------------------------
  test('TC - AUTH - 013: Sign In with Non-Existent Email (Account Enumeration Prevention)', async ({ page }) => {
    await goToSignIn(page);

    await fillAndSubmitLogin(page, 'nobody@test.invalid', 'SomePassword1!');

    // The backend intentionally returns the same message for both
    // "wrong password" and "user not found" to prevent user enumeration.
    const statusMsg = page.locator('p.form-status');
    await expect(statusMsg).toBeVisible();
    await expect(statusMsg).toContainText('Invalid email or password.');

    expect(page.url()).toContain('/signin');
  });

  // -------------------------------------------------------------------------
  // TC - AUTH - 015: Empty email field → browser reports "required"
  // -------------------------------------------------------------------------
  test('TC - AUTH - 015: Sign In Form Empty Fields Validation - Email required', async ({ page }) => {
    await goToSignIn(page);

    // Leave email blank, only fill password
    await page.locator('#password').fill('SomePassword1!');
    await page.locator('button[type="submit"]').click();

    // The browser's built-in validation fires because the input has `required`.
    // Playwright checks the validity state on the input element.
    const emailInput = page.locator('#email');
    const validity = await emailInput.evaluate((el) => el.validity.valueMissing);
    expect(validity).toBe(true);

    // We should still be on the signin page
    expect(page.url()).toContain('/signin');
  });

  // -------------------------------------------------------------------------
  // TC - AUTH - 015: Empty password field → browser reports "required"
  // -------------------------------------------------------------------------
  test('TC - AUTH - 015: Sign In Form Empty Fields Validation - Password required', async ({ page }) => {
    await goToSignIn(page);

    await page.locator('#email').fill(DEMO_CANDIDATE_EMAIL);
    // Leave password blank
    await page.locator('button[type="submit"]').click();

    const passwordInput = page.locator('#password');
    const validity = await passwordInput.evaluate((el) => el.validity.valueMissing);
    expect(validity).toBe(true);

    expect(page.url()).toContain('/signin');
  });

  // -------------------------------------------------------------------------
  // Test 7: Forgot Password link renders the reset form
  // -------------------------------------------------------------------------
  test('should switch to forgot-password form when link is clicked', async ({ page }) => {
    await goToSignIn(page);

    // "Forgot Password?" is a button (not a link) in the code
    await page.getByRole('button', { name: 'Forgot Password?' }).click();

    // The heading changes to "Reset Password"
    await expect(
      page.getByRole('heading', { name: 'Reset Password' })
    ).toBeVisible();

    // A "Send Reset Link" button appears
    await expect(
      page.locator('button[type="submit"]')
    ).toContainText('Send Reset Link');

    // And there is a "Back to Sign In" button to return
    await expect(
      page.getByRole('button', { name: 'Back to Sign In' })
    ).toBeVisible();
  });

});
