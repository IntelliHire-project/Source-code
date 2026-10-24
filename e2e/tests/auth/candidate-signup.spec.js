/**
 * tests/auth/candidate-signup.spec.js
 *
 * Automated Playwright tests for Candidate Sign-up flows.
 *
 * Covers:
 *  TC - AUTH - 001: Candidate Sign-up with valid details & CV upload
 *  TC - AUTH - 002: Candidate Sign-up without CV (Optional CV field)
 *  TC - AUTH - 003: Candidate Sign-up with duplicate email
 *  TC - AUTH - 004: Candidate Sign-up Password Mismatch
 *  TC - AUTH - 005: Candidate Sign-up Password Length Validation (< 8 chars)
 *  Additional: Terms & Conditions agreement validation
 *
 * SELECTORS (from frontend/src/pages/candidate/Signup/SignupPage.js):
 *  #fullName                → Full Name text input
 *  #email                   → Email text input
 *  #password                → Password input
 *  #confirmPassword         → Confirm password input
 *  #phone                   → Phone number input
 *  #cv-upload-input         → Hidden file input for CV PDF
 *  input[name="agreeTerms"] → Terms & Conditions checkbox
 *  button.auth-submit-btn   → "Create Account" submit button
 *  p.form-status            → Status message paragraph (role="status")
 */

const { test, expect } = require('@playwright/test');
const {
  generateTestEmail,
  DEMO_CANDIDATE_EMAIL,
} = require('../helpers/api');

const VALID_PASSWORD = 'Password123!';

// A minimal valid PDF buffer for testing CV upload without needing an external file on disk
const SAMPLE_PDF_BUFFER = Buffer.from(
  '%PDF-1.4\n1 0 obj\n<< /Title (Sample Resume) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF'
);

/**
 * Navigates to candidate signup page and waits for form to load.
 */
async function goToCandidateSignup(page) {
  await page.goto('/signup');
  await expect(page.getByRole('heading', { name: 'Create Your Account' })).toBeVisible();
}

/**
 * Helper to fill the candidate registration form.
 */
async function fillCandidateForm(page, overrides = {}) {
  const defaults = {
    fullName: 'Test Candidate',
    email: generateTestEmail('candidate'),
    phone: '+1234567890',
    password: VALID_PASSWORD,
    confirmPassword: VALID_PASSWORD,
    agreeTerms: true,
  };

  const values = { ...defaults, ...overrides };

  if (values.fullName !== null) {
    await page.locator('#fullName').fill(values.fullName);
  }
  if (values.email !== null) {
    await page.locator('#email').fill(values.email);
  }
  if (values.phone !== null) {
    await page.locator('#phone').fill(values.phone);
  }
  if (values.password !== null) {
    await page.locator('#password').fill(values.password);
  }
  if (values.confirmPassword !== null) {
    await page.locator('#confirmPassword').fill(values.confirmPassword);
  }

  const termsCheckbox = page.locator('input[name="agreeTerms"]');
  if (values.agreeTerms) {
    if (!(await termsCheckbox.isChecked())) {
      await termsCheckbox.check();
    }
  } else {
    if (await termsCheckbox.isChecked()) {
      await termsCheckbox.uncheck();
    }
  }
}

test.describe('Candidate Sign-up Suite', () => {

  test.beforeEach(async ({ page }) => {
    await goToCandidateSignup(page);
  });

  // TC - AUTH - 001: Candidate Sign-up with valid details & CV upload
  test('TC - AUTH - 001: Candidate Sign-up with valid details & CV upload', async ({ page }) => {
    const testEmail = generateTestEmail('cand-cv');
    await fillCandidateForm(page, {
      fullName: 'John Doe',
      email: testEmail,
      phone: '+1234567890',
      password: VALID_PASSWORD,
      confirmPassword: VALID_PASSWORD,
    });

    // Upload sample CV PDF via file input
    await page.locator('#cv-upload-input').setInputFiles({
      name: 'sample-resume.pdf',
      mimeType: 'application/pdf',
      buffer: SAMPLE_PDF_BUFFER,
    });

    // Verify CV file preview is visible
    await expect(page.locator('.auth-file-name')).toHaveText('sample-resume.pdf');

    // Submit form
    await page.locator('button.auth-submit-btn').click();

    // Verify success status and redirect to /signin
    const status = page.locator('p.form-status');
    await expect(status).toBeVisible({ timeout: 10_000 });
    await expect(status).toHaveText(/Account created successfully/i);

    // Expect redirection to sign-in page
    await expect(page).toHaveURL(/\/signin/, { timeout: 10_000 });
  });

  // TC - AUTH - 002: Candidate Sign-up without CV (Optional CV field)
  test('TC - AUTH - 002: Candidate Sign-up without CV (Optional CV field)', async ({ page }) => {
    const testEmail = generateTestEmail('cand-nocv');
    await fillCandidateForm(page, {
      fullName: 'Jane Doe',
      email: testEmail,
      phone: '+1234567890',
      password: VALID_PASSWORD,
      confirmPassword: VALID_PASSWORD,
    });

    // Leave CV empty, click Create Account
    await page.locator('button.auth-submit-btn').click();

    // Verify account creation success
    const status = page.locator('p.form-status');
    await expect(status).toBeVisible({ timeout: 10_000 });
    await expect(status).toHaveText(/Account created successfully/i);
    await expect(page).toHaveURL(/\/signin/, { timeout: 10_000 });
  });

  // TC - AUTH - 003: Candidate Sign-up with duplicate email
  test('TC - AUTH - 003: Candidate Sign-up with duplicate email', async ({ page }) => {
    await fillCandidateForm(page, {
      fullName: 'Duplicate User',
      email: DEMO_CANDIDATE_EMAIL, // Already registered seeded user
      phone: '+1234567890',
      password: VALID_PASSWORD,
      confirmPassword: VALID_PASSWORD,
    });

    await page.locator('button.auth-submit-btn').click();

    // Verify error message for duplicate email (HTTP 409)
    const status = page.locator('p.form-status.error');
    await expect(status).toBeVisible({ timeout: 8_000 });
    await expect(status).toContainText(/already exists/i);

    // User should remain on signup page
    await expect(page).toHaveURL(/\/signup/);
  });

  // TC - AUTH - 004: Candidate Sign-up Password Mismatch
  test('TC - AUTH - 004: Candidate Sign-up Password Mismatch', async ({ page }) => {
    await fillCandidateForm(page, {
      fullName: 'Mismatch Tester',
      email: generateTestEmail('mismatch'),
      password: 'Password123!',
      confirmPassword: 'Mismatch999!',
    });

    await page.locator('button.auth-submit-btn').click();

    const status = page.locator('p.form-status.error');
    await expect(status).toBeVisible();
    await expect(status).toContainText(/Passwords do not match/i);
  });

  // TC - AUTH - 005: Candidate Sign-up Password Length Validation (< 8 chars)
  test('TC - AUTH - 005: Candidate Sign-up Password Length Validation (< 8 chars)', async ({ page }) => {
    await fillCandidateForm(page, {
      fullName: 'Short Password Tester',
      email: generateTestEmail('shortpwd'),
      password: 'Pass1!',
      confirmPassword: 'Pass1!',
    });

    await page.locator('button.auth-submit-btn').click();

    const status = page.locator('p.form-status.error');
    await expect(status).toBeVisible();
    await expect(status).toContainText(/at least 8 characters/i);
  });

  // Additional: Terms of service agreement validation
  test('Candidate Sign-up Terms & Conditions Validation', async ({ page }) => {
    await fillCandidateForm(page, {
      fullName: 'Terms Tester',
      email: generateTestEmail('terms'),
      password: VALID_PASSWORD,
      confirmPassword: VALID_PASSWORD,
      agreeTerms: false,
    });

    await page.locator('button.auth-submit-btn').click();

    const status = page.locator('p.form-status.error');
    await expect(status).toBeVisible();
    await expect(status).toContainText(/agree to the terms/i);
  });

});
