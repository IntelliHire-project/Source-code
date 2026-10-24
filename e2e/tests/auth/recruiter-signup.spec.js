/**
 * tests/auth/recruiter-signup.spec.js
 *
 * Tests for recruiter registration and the admin-verification flow.
 *
 * Covers:
 *  TC - AUTH - 006: Recruiter Registration with complete valid details
 *  TC - AUTH - 007: Recruiter Registration Missing Required Fields
 *  TC - AUTH - 008: Recruiter Login Attempt while in Pending Approval status
 *  TC - AUTH - 009: Recruiter Login after Admin Approval
 *  TC - AUTH - 010: Terms of Service agreement validation on Recruiter Registration
 *
 * SELECTORS: All `id` attributes are taken from the real
 * frontend/src/pages/recruiter/Signup/SignupPage.js source code.
 * All error strings are taken from the real source / backend controller.
 *
 * TEST DATA SAFETY:
 *  - Every test run generates unique email addresses with the `.invalid` TLD.
 *  - `.invalid` is a reserved domain (RFC 2606) — real emails can never exist
 *    under it, so no risk of accidentally contacting a real person.
 *  - After each test group the test account is deactivated via the admin API
 *    so the database stays clean.
 */

const { test, expect } = require('@playwright/test');
const {
  generateTestEmail,
  registerTestRecruiter,
  approveRecruiter,
  deactivateTestUser,
  getAdminToken,
} = require('../helpers/api');

// ---------------------------------------------------------------------------
// Default valid password that passes all recruiter signup validations:
//   • ≥ 8 characters
//   • Contains at least one number
//   • Contains at least one symbol
// ---------------------------------------------------------------------------
const VALID_PASSWORD = 'TestPass1!';

// ---------------------------------------------------------------------------
// Helper: fill all required recruiter signup fields with valid data.
// Accepts overrides so individual tests can blank out specific fields.
// ---------------------------------------------------------------------------
async function fillRecruiterForm(page, overrides = {}) {
  const defaults = {
    companyName: 'Playwright Test Co.',
    industry: 'tech',                       // option value from the <select>
    companyWebsite: 'https://playwright-test.invalid',
    companyRegNumber: 'PW-TEST-001',
    companyLocation: 'Test City, Test Country',
    contactName: 'Playwright Tester',
    jobTitle: 'QA Engineer',
    email: generateTestEmail('recruiter'),
    phone: '+1 555 000 9999',
    password: VALID_PASSWORD,
    confirmPassword: VALID_PASSWORD,
  };

  const values = { ...defaults, ...overrides };

  // Company Information section
  if (values.companyName !== null)
    await page.locator('#companyName').fill(values.companyName);

  if (values.industry !== null)
    await page.locator('#industry').selectOption(values.industry);

  if (values.companyWebsite !== null)
    await page.locator('#companyWebsite').fill(values.companyWebsite);

  if (values.companyRegNumber !== null)
    await page.locator('#companyRegNumber').fill(values.companyRegNumber);

  if (values.companyLocation !== null)
    await page.locator('#companyLocation').fill(values.companyLocation);

  // Recruiter Information section
  if (values.contactName !== null)
    await page.locator('#contactName').fill(values.contactName);

  if (values.jobTitle !== null)
    await page.locator('#jobTitle').fill(values.jobTitle);

  if (values.email !== null)
    await page.locator('#email').fill(values.email);

  if (values.phone !== null)
    await page.locator('#phone').fill(values.phone);

  // Account section
  if (values.password !== null)
    await page.locator('#password').fill(values.password);

  if (values.confirmPassword !== null)
    await page.locator('#confirmPassword').fill(values.confirmPassword);

  if (values.agreeTerms !== false) {
    const termsCheckbox = page.locator('input[name="agreeTerms"]');
    if (!(await termsCheckbox.isChecked())) {
      await termsCheckbox.check();
    }
  }
}

/**
 * Navigates to the recruiter signup page and waits for the form heading.
 */
async function goToRecruiterSignup(page) {
  await page.goto('/recruiter/signup');
  await expect(
    page.getByRole('heading', { name: 'Register Your Company' })
  ).toBeVisible();
}

/**
 * Returns the status message paragraph (the element that shows
 * validation errors and success messages in the signup form).
 */
function getStatusMessage(page) {
  return page.locator('p.form-status[role="status"]');
}

// ===========================================================================
// Group 1 — Page Load
// ===========================================================================
test.describe('Recruiter Signup — Page Load', () => {

  test('should display the recruiter signup form', async ({ page }) => {
    await goToRecruiterSignup(page);

    await expect(page.locator('#companyName')).toBeVisible();
    await expect(page.locator('#industry')).toBeVisible();
    await expect(page.locator('#companyWebsite')).toBeVisible();
    await expect(page.locator('#companyRegNumber')).toBeVisible();
    await expect(page.locator('#companyLocation')).toBeVisible();
    await expect(page.locator('#contactName')).toBeVisible();
    await expect(page.locator('#jobTitle')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#phone')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#confirmPassword')).toBeVisible();

    // The submit button shows "Register Company"
    await expect(
      page.locator('button[type="submit"]')
    ).toContainText('Register Company');
  });

});

// ===========================================================================
// Group 2 — Frontend Validation (no network call is made)
// ===========================================================================
test.describe('Recruiter Signup — Form Validation', () => {

  /**
   * Helper: fill everything except one field, check the error message.
   * Terms are intentionally NOT checked — validation runs before it.
   */
  async function expectValidationError(page, incompleteOverrides, expectedMessage) {
    await goToRecruiterSignup(page);
    await fillRecruiterForm(page, incompleteOverrides);
    // Allow custom React handleSubmit validation to trigger by disabling native browser HTML5 constraint validation in the test
    await page.evaluate(() => document.querySelector('form')?.setAttribute('novalidate', 'true'));
    await page.locator('button[type="submit"]').click();

    const status = getStatusMessage(page);
    await expect(status).toBeVisible();
    await expect(status).toContainText(expectedMessage);

    // Must stay on signup page
    expect(page.url()).toContain('/recruiter/signup');
  }

  // -----------------------------------------------------------------------
  // Exact error strings come from SignupPage.js handleSubmit() validation
  // -----------------------------------------------------------------------

  // -------------------------------------------------------------------------
  // TC - AUTH - 007: Recruiter Registration Missing Required Fields
  // -------------------------------------------------------------------------
  test('TC - AUTH - 007: Recruiter Registration Missing Required Fields (Company Name)', async ({ page }) => {
    await expectValidationError(
      page,
      { companyName: '' },          // blank out companyName
      'Company Name is required.'   // exact string from SignupPage.js line 56
    );
  });

  test('TC - AUTH - 007: Recruiter Registration Missing Required Fields (Industry)', async ({ page }) => {
    await expectValidationError(
      page,
      { industry: null },                    // skip selecting industry
      'Please select your industry.'         // exact string from SignupPage.js line 62
    );
  });

  test('should require Company Website', async ({ page }) => {
    await expectValidationError(
      page,
      { companyWebsite: '' },
      'Company Website is required.'
    );
  });

  test('should require Company Registration Number', async ({ page }) => {
    await expectValidationError(
      page,
      { companyRegNumber: '' },
      'Company Registration Number is required.'
    );
  });

  test('should require Company Location', async ({ page }) => {
    await expectValidationError(
      page,
      { companyLocation: '' },
      'Company Location is required.'
    );
  });

  test('should require Full Name', async ({ page }) => {
    await expectValidationError(
      page,
      { contactName: '' },
      'Full Name is required.'
    );
  });

  test('should require Job Title', async ({ page }) => {
    await expectValidationError(
      page,
      { jobTitle: '' },
      'Job Title is required.'
    );
  });

  test('should require Phone Number', async ({ page }) => {
    await expectValidationError(
      page,
      { phone: '' },
      'Phone Number is required.'
    );
  });

  test('should reject a weak password (short, no number, no symbol)', async ({ page }) => {
    await expectValidationError(
      page,
      { password: 'weakpass', confirmPassword: 'weakpass' },
      // Exact string from SignupPage.js line 114
      'Password must be at least 8 characters and contain at least one number and one symbol.'
    );
  });

  test('should reject mismatched passwords', async ({ page }) => {
    await expectValidationError(
      page,
      { password: 'TestPass1!', confirmPassword: 'DifferentPass1!' },
      'Passwords do not match.'   // exact string from SignupPage.js line 120
    );
  });

  // -------------------------------------------------------------------------
  // TC - AUTH - 010: Terms of Service agreement validation on Recruiter Registration
  // -------------------------------------------------------------------------
  test('TC - AUTH - 010: Terms of Service agreement validation on Recruiter Registration', async ({ page }) => {
    await goToRecruiterSignup(page);
    // Fill everything validly but do NOT check the terms box
    await fillRecruiterForm(page, { agreeTerms: false });
    await page.evaluate(() => document.querySelector('form')?.setAttribute('novalidate', 'true'));
    await page.locator('button[type="submit"]').click();

    const status = getStatusMessage(page);
    await expect(status).toBeVisible();
    await expect(status).toContainText(
      'You must agree to the Terms of Service and Privacy Policy.'
    );
  });

});

// ===========================================================================
// Group 3 — Successful Registration & Pending Status
//
// This group uses one shared test recruiter account that is created once
// (beforeAll) and cleaned up once (afterAll).
// ===========================================================================
test.describe('Recruiter Signup — Registration & Pending Flow', () => {

  // State shared across tests in this describe block
  let testEmail;
  let testPassword = VALID_PASSWORD;
  let testUserId;
  let adminToken;

  test.beforeAll(async () => {
    // Obtain an admin token (needed for approval & cleanup)
    adminToken = await getAdminToken();
  });

  test.afterAll(async () => {
    // Clean up: deactivate the test account so DB stays clean
    if (testUserId) {
      await deactivateTestUser(testUserId, adminToken);
    }
  });

  // -------------------------------------------------------------------------
  // TC - AUTH - 006: Recruiter Registration with complete valid details
  // -------------------------------------------------------------------------
  test('TC - AUTH - 006: Recruiter Registration with complete valid details', async ({ page }) => {
    testEmail = generateTestEmail('recruiter-reg');

    await goToRecruiterSignup(page);
    await fillRecruiterForm(page, { email: testEmail, password: testPassword, confirmPassword: testPassword });

    // Check the terms checkbox (required)
    await page.locator('input[name="agreeTerms"]').check();

    await page.locator('button[type="submit"]').click();

    // Success message before redirect — exact string from SignupPage.js line 152
    const status = getStatusMessage(page);
    await expect(status).toBeVisible();
    await expect(status).toContainText('Registration submitted successfully! Redirecting...');

    // Should redirect to /recruiter/pending-approval within ~1.5 s
    await page.waitForURL('**/recruiter/pending-approval', { timeout: 5_000 });
    expect(page.url()).toContain('/recruiter/pending-approval');
  });

  // -------------------------------------------------------------------------
  // TC - AUTH - 008: Recruiter Login Attempt while in Pending Approval status
  // -------------------------------------------------------------------------
  test('TC - AUTH - 008: Recruiter Login Attempt while in Pending Approval status', async ({ page }) => {
    // Register a fresh pending recruiter via API so we know it's definitely pending
    const pendingEmail = generateTestEmail('recruiter-pending');
    const { userId } = await registerTestRecruiter(pendingEmail);
    testUserId = userId; // store for afterAll cleanup

    // Navigate to sign in page
    await page.goto('/signin');
    await expect(
      page.getByRole('heading', { name: 'Sign In to Your Account' })
    ).toBeVisible();

    // Fill credentials
    await page.locator('#email').fill(pendingEmail);
    await page.locator('#password').fill(VALID_PASSWORD);
    await page.locator('button[type="submit"]').click();

    // Backend returns HTTP 403 with this exact message (authController.js line 274):
    // "Your recruiter account is pending verification by an admin. You cannot log in yet."
    const status = page.locator('p.form-status');
    await expect(status).toBeVisible();
    await expect(status).toContainText(
      'Your recruiter account is pending verification by an admin. You cannot log in yet.'
    );

    // Must not have navigated to the dashboard
    expect(page.url()).toContain('/signin');
  });

  // -------------------------------------------------------------------------
  // TC - AUTH - 009: Recruiter Login after Admin Approval
  // -------------------------------------------------------------------------
  test('TC - AUTH - 009: Recruiter Login after Admin Approval', async ({ page }) => {
    // Register a new pending recruiter via API
    const approvedEmail = generateTestEmail('recruiter-approved');
    const { userId } = await registerTestRecruiter(approvedEmail);
    testUserId = userId; // update for cleanup

    // Admin approves the recruiter via API (no UI needed for this step)
    await approveRecruiter(userId, adminToken);

    // Now try to log in via the UI
    await page.goto('/signin');
    await expect(
      page.getByRole('heading', { name: 'Sign In to Your Account' })
    ).toBeVisible();

    await page.locator('#email').fill(approvedEmail);
    await page.locator('#password').fill(VALID_PASSWORD);
    await page.locator('button[type="submit"]').click();

    // Should see success message
    const status = page.locator('p.form-status');
    await expect(status).toBeVisible();
    await expect(status).toContainText('Signed in successfully!');

    // Should redirect to recruiter dashboard
    await page.waitForURL('**/recruiter/**', { timeout: 5_000 });
    expect(page.url()).toContain('/recruiter/');
  });

  // -------------------------------------------------------------------------
  // Bonus Test: Duplicate email registration should be rejected
  // -------------------------------------------------------------------------
  test('should reject registration with an already-used email', async ({ page }) => {
    // Try to register again with the same email used in the first test of this group
    // (testEmail was set during the UI-based registration test above)
    if (!testEmail) {
      test.skip(true, 'Skipped: testEmail was not set by the prior registration test');
    }

    await goToRecruiterSignup(page);
    await fillRecruiterForm(page, { email: testEmail, password: testPassword, confirmPassword: testPassword });
    await page.locator('input[name="agreeTerms"]').check();
    await page.locator('button[type="submit"]').click();

    // Backend returns HTTP 409 with message from authController.js line 74:
    // "An account with that email already exists."
    const status = getStatusMessage(page);
    await expect(status).toBeVisible();
    await expect(status).toContainText('An account with that email already exists.');
  });

});
