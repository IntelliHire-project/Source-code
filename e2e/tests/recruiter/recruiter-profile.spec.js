/**
 * tests/recruiter/recruiter-profile.spec.js
 *
 * Comprehensive Playwright End-to-End and Integration test suite for the
 * IntelliHire Recruiter Profile page (/recruiter/profile).
 *
 * Covers:
 *  1.  Recruiter authentication and navigation to /recruiter/profile
 *  2.  Header section, avatar, recruiter badge, name, role, and completion bar verification
 *  3.  Personal, Company, and Professional form sections verification
 *  4.  Inline profile editing and saving via page-level "Save Changes" button
 *  5.  Cancel / Discard changes reversion to initial state
 *  6.  Notification preference toggle buttons interaction and state updates
 *  7.  Opening and closing the "Edit Profile" modal, tab navigation (Personal, Company, Professional)
 *  8.  Editing profile via the multi-tab Modal and confirming changes reflect on the page
 *  9.  Change Password modal: Empty fields validation error
 * 10.  Change Password modal: Mismatched new password and confirm password validation error
 * 11.  Change Password modal: Show/hide password visibility toggle buttons
 * 12.  Security settings card: Username, password mask, 2FA status, last login verification
 * 13.  Access control: Unauthenticated user accessing /recruiter/profile redirected to /signin
 * 14.  Role-based authorization: Candidate user accessing /recruiter/profile is blocked/redirected
 */

const { test, expect } = require('@playwright/test');
const {
  BASE_URL,
  DEMO_RECRUITER_EMAIL,
  DEMO_RECRUITER_PASSWORD,
  DEMO_CANDIDATE_EMAIL,
  DEMO_CANDIDATE_PASSWORD,
} = require('../helpers/api');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let cachedRecruiterAuth = null;

/**
 * Obtains recruiter credentials and JWT token directly via REST API.
 */
async function getRecruiterAuth() {
  if (!cachedRecruiterAuth) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: DEMO_RECRUITER_EMAIL,
        password: DEMO_RECRUITER_PASSWORD,
      }),
    });
    const data = await res.json();
    cachedRecruiterAuth = { token: data.token, user: data.user };
  }
  return cachedRecruiterAuth;
}

/**
 * Injects authenticated recruiter session into browser context and navigates to Recruiter Profile.
 */
async function loginAndNavigateToRecruiterProfile(page) {
  const auth = await getRecruiterAuth();
  await page.addInitScript(({ token, user }) => {
    localStorage.setItem('intellihire_token', token);
    localStorage.setItem('intellihire_user', JSON.stringify(user));
  }, auth);

  await page.goto('/recruiter/profile', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.recruiter-profile-page')).toBeVisible({ timeout: 10_000 });
}

// ---------------------------------------------------------------------------
// Test Suite: Recruiter Profile Page
// ---------------------------------------------------------------------------

test.describe('Recruiter Profile Page — End-to-End Test Suite', () => {

  // -------------------------------------------------------------------------
  // TC-RP-01: Authentication & Navigation (Full UI Flow)
  // -------------------------------------------------------------------------
  test('TC-RP-01: Recruiter logs in via UI and navigates to Recruiter Profile page', async ({ page }) => {
    await page.goto('/signin', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#email')).toBeVisible({ timeout: 10_000 });
    await page.locator('#email').fill(DEMO_RECRUITER_EMAIL);
    await page.locator('#password').fill(DEMO_RECRUITER_PASSWORD);
    await page.locator('button[type="submit"]').click();

    // Wait for redirect to recruiter dashboard area
    await page.waitForURL('**/recruiter/**', { waitUntil: 'domcontentloaded', timeout: 12_000 });

    // Navigate to Recruiter Profile
    await page.goto('/recruiter/profile', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.recruiter-profile-page')).toBeVisible({ timeout: 10_000 });

    // Verify header and badge
    await expect(page.locator('.profile-badge')).toHaveText('Active Recruiter');
    await expect(page.locator('.profile-name')).toBeVisible();
    await expect(page.locator('.edit-profile-btn')).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // TC-RP-02: Profile Header & Layout Verification
  // -------------------------------------------------------------------------
  test('TC-RP-02: Header displays avatar, recruiter info, metadata, and completion indicator', async ({ page }) => {
    await loginAndNavigateToRecruiterProfile(page);

    // Verify avatar and picture upload button
    await expect(page.locator('.profile-avatar')).toBeVisible();
    await expect(page.locator('.avatar-edit-btn')).toBeVisible();

    // Verify recruiter info
    await expect(page.locator('.profile-badge')).toHaveText('Active Recruiter');
    await expect(page.locator('.profile-name')).toBeVisible();
    await expect(page.locator('.edit-profile-btn')).toBeVisible();

    // Verify profile completion block
    await expect(page.locator('.completion-label')).toHaveText('Profile Completion');
    await expect(page.locator('.completion-percent')).toContainText('%');
    await expect(page.locator('.completion-bar')).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // TC-RP-03: Personal, Company & Professional Form Sections Render Properly
  // -------------------------------------------------------------------------
  test('TC-RP-03: Renders Personal, Company, and Professional Information form cards', async ({ page }) => {
    await loginAndNavigateToRecruiterProfile(page);

    // Personal Information Card
    await expect(page.locator('h2:has-text("Personal Information")')).toBeVisible();
    await expect(page.locator('#firstName')).toBeVisible();
    await expect(page.locator('#lastName')).toBeVisible();
    await expect(page.locator('#workEmail')).toBeVisible();
    await expect(page.locator('#contactNumber')).toBeVisible();
    await expect(page.locator('#jobTitle')).toBeVisible();
    await expect(page.locator('#department')).toBeVisible();
    await expect(page.locator('#employeeId')).toBeVisible();

    // Company Information Card
    await expect(page.locator('h2:has-text("Company Information")')).toBeVisible();
    await expect(page.locator('#companyName')).toBeVisible();
    await expect(page.locator('#industry')).toBeVisible();
    await expect(page.locator('#companyWebsite')).toBeVisible();
    await expect(page.locator('#companyAddress')).toBeVisible();
    await expect(page.locator('#companyDescription')).toBeVisible();

    // Professional Information Card
    await expect(page.locator('h2:has-text("Professional Information")')).toBeVisible();
    await expect(page.locator('#yearsExperience')).toBeVisible();
    await expect(page.locator('#hiringSpecializations')).toBeVisible();
    await expect(page.locator('#preferredLocations')).toBeVisible();
    await expect(page.locator('#employmentTypes')).toBeVisible();
    await expect(page.locator('#bio')).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // TC-RP-04: Direct Profile Field Editing & Save Changes
  // -------------------------------------------------------------------------
  test('TC-RP-04: Edits fields directly on the page and saves changes successfully', async ({ page }) => {
    await loginAndNavigateToRecruiterProfile(page);

    const timestamp = Date.now().toString().slice(-4);
    const updatedJobTitle = `Talent Acquisition Lead ${timestamp}`;
    const updatedDepartment = `Engineering Recruiting ${timestamp}`;
    const updatedPhone = `+1 555 987 ${timestamp}`;

    // Update inputs directly on the page
    await page.locator('#jobTitle').fill(updatedJobTitle);
    await page.locator('#department').fill(updatedDepartment);
    await page.locator('#contactNumber').fill(updatedPhone);

    // Set up dialog listener for save alert
    let alertText = '';
    page.once('dialog', async (dialog) => {
      alertText = dialog.message();
      await dialog.accept();
    });

    // Click "Save Changes" in the bottom actions bar
    await page.locator('.profile-actions button:has-text("Save Changes")').click();

    // Verify confirmation alert
    await expect.poll(() => alertText).toContain('Profile changes saved successfully');

    // Verify fields retain updated values
    await expect(page.locator('#jobTitle')).toHaveValue(updatedJobTitle);
    await expect(page.locator('#department')).toHaveValue(updatedDepartment);
    await expect(page.locator('#contactNumber')).toHaveValue(updatedPhone);
  });

  // -------------------------------------------------------------------------
  // TC-RP-05: Cancel / Discard Changes Reversion
  // -------------------------------------------------------------------------
  test('TC-RP-05: Modifying fields and clicking Cancel reverts values to previous state', async ({ page }) => {
    await loginAndNavigateToRecruiterProfile(page);

    const originalJobTitle = await page.locator('#jobTitle').inputValue();
    const temporaryJobTitle = `Temporary Role ${Date.now()}`;

    // Fill temporary role
    await page.locator('#jobTitle').fill(temporaryJobTitle);
    await expect(page.locator('#jobTitle')).toHaveValue(temporaryJobTitle);

    // Click "Cancel" in page-level actions
    await page.locator('.profile-actions button:has-text("Cancel")').click();

    // Verify value was reverted back to original
    await expect(page.locator('#jobTitle')).toHaveValue(originalJobTitle);
  });

  // -------------------------------------------------------------------------
  // TC-RP-06: Notification Preferences Toggles
  // -------------------------------------------------------------------------
  test('TC-RP-06: Notification toggle buttons change state on click', async ({ page }) => {
    await loginAndNavigateToRecruiterProfile(page);

    const notificationsCard = page.locator('.settings-card:has-text("Notifications")');
    await expect(notificationsCard).toBeVisible();

    // Target the first toggle (Email Notifications)
    const firstToggle = notificationsCard.locator('.toggle-btn').first();
    const initialPressed = await firstToggle.getAttribute('aria-pressed');

    // Click to toggle
    await firstToggle.click();
    const newPressed = await firstToggle.getAttribute('aria-pressed');
    expect(newPressed).not.toBe(initialPressed);

    // Click again to toggle back
    await firstToggle.click();
    const finalPressed = await firstToggle.getAttribute('aria-pressed');
    expect(finalPressed).toBe(initialPressed);
  });

  // -------------------------------------------------------------------------
  // TC-RP-07: Open and Close Edit Profile Modal with Tab Navigation
  // -------------------------------------------------------------------------
  test('TC-RP-07: Opens Edit Profile modal, navigates across tabs, and closes modal', async ({ page }) => {
    await loginAndNavigateToRecruiterProfile(page);

    // Click "Edit Profile" button
    await page.locator('.edit-profile-btn').click();

    const modal = page.locator('.modal-content:has-text("Edit Profile")');
    await expect(modal).toBeVisible();

    // Verify tabs exist
    const personalTab = modal.locator('.modal-tab:has-text("Personal")');
    const companyTab = modal.locator('.modal-tab:has-text("Company")');
    const professionalTab = modal.locator('.modal-tab:has-text("Professional")');

    await expect(personalTab).toBeVisible();
    await expect(companyTab).toBeVisible();
    await expect(professionalTab).toBeVisible();

    // Navigate to Company tab
    await companyTab.click();
    await expect(modal.locator('#editCompanyName')).toBeVisible();

    // Navigate to Professional tab
    await professionalTab.click();
    await expect(modal.locator('#editYearsExperience')).toBeVisible();

    // Navigate back to Personal tab
    await personalTab.click();
    await expect(modal.locator('#editFirstName')).toBeVisible();

    // Close modal via close button
    await modal.locator('.modal-close-btn').click();
    await expect(modal).toBeHidden();
  });

  // -------------------------------------------------------------------------
  // TC-RP-08: Edit Profile via Multi-Tab Modal and Save
  // -------------------------------------------------------------------------
  test('TC-RP-08: Modifies profile details across modal tabs and confirms updates', async ({ page }) => {
    await loginAndNavigateToRecruiterProfile(page);

    // Open Modal
    await page.locator('.edit-profile-btn').click();
    const modal = page.locator('.modal-content:has-text("Edit Profile")');

    const timestamp = Date.now().toString().slice(-4);
    const newCompany = `Acme Global ${timestamp}`;
    const newIndustry = `FinTech ${timestamp}`;
    const newBio = `Senior Recruiter specializing in tech placements #${timestamp}`;

    // Go to Company tab and fill
    await modal.locator('.modal-tab:has-text("Company")').click();
    await modal.locator('#editCompanyName').fill(newCompany);
    await modal.locator('#editIndustry').fill(newIndustry);

    // Go to Professional tab and fill bio
    await modal.locator('.modal-tab:has-text("Professional")').click();
    await modal.locator('#editBio').fill(newBio);

    // Click "Save Changes" inside modal
    await modal.locator('.modal-footer button:has-text("Save Changes")').click();
    await expect(modal).toBeHidden();

    // Verify updated values reflect on the main page
    await expect(page.locator('#companyName')).toHaveValue(newCompany);
    await expect(page.locator('#industry')).toHaveValue(newIndustry);
    await expect(page.locator('#bio')).toHaveValue(newBio);
  });

  // -------------------------------------------------------------------------
  // TC-RP-09: Change Password Modal — Empty Fields Validation
  // -------------------------------------------------------------------------
  test('TC-RP-09: Submitting empty form in Change Password modal displays validation error', async ({ page }) => {
    await loginAndNavigateToRecruiterProfile(page);

    // Click "Change" in Security card
    await page.locator('.security-item:has-text("Password") button:has-text("Change")').click();

    const pwdModal = page.locator('.modal-content:has-text("Change Password")');
    await expect(pwdModal).toBeVisible();

    // Click "Update Password" without filling inputs
    await pwdModal.locator('button[type="submit"]:has-text("Update Password")').click();

    // Verify error message
    await expect(pwdModal.locator('text=Please fill in all fields.')).toBeVisible();

    // Close modal
    await pwdModal.locator('button:has-text("Cancel")').click();
    await expect(pwdModal).toBeHidden();
  });

  // -------------------------------------------------------------------------
  // TC-RP-10: Change Password Modal — Password Mismatch Validation
  // -------------------------------------------------------------------------
  test('TC-RP-10: Submitting mismatched passwords displays error message', async ({ page }) => {
    await loginAndNavigateToRecruiterProfile(page);

    // Open Change Password modal
    await page.locator('.security-item:has-text("Password") button:has-text("Change")').click();
    const pwdModal = page.locator('.modal-content:has-text("Change Password")');

    // Fill current password and non-matching new passwords
    await pwdModal.locator('input[placeholder="Enter current password"]').fill('Recruiter@2026');
    await pwdModal.locator('input[placeholder="Enter new password"]').fill('NewPassword@123');
    await pwdModal.locator('input[placeholder="Confirm new password"]').fill('DifferentPassword@456');

    // Submit form
    await pwdModal.locator('button[type="submit"]:has-text("Update Password")').click();

    // Verify mismatch error message
    await expect(pwdModal.locator('text=New password and confirm password do not match.')).toBeVisible();

    // Close modal
    await pwdModal.locator('.modal-close-btn').click();
    await expect(pwdModal).toBeHidden();
  });

  // -------------------------------------------------------------------------
  // TC-RP-11: Password Visibility Toggles
  // -------------------------------------------------------------------------
  test('TC-RP-11: Toggling eye buttons switches password input between password and text type', async ({ page }) => {
    await loginAndNavigateToRecruiterProfile(page);

    // Open Change Password modal
    await page.locator('.security-item:has-text("Password") button:has-text("Change")').click();
    const pwdModal = page.locator('.modal-content:has-text("Change Password")');

    const currentPwdInput = pwdModal.locator('input[placeholder="Enter current password"]');
    const eyeButton = pwdModal.locator('.form-field:has-text("Current Password") button[type="button"]');

    // Initial type should be "password"
    await expect(currentPwdInput).toHaveAttribute('type', 'password');

    // Click eye button to show password
    await eyeButton.click();
    await expect(currentPwdInput).toHaveAttribute('type', 'text');

    // Click again to hide password
    await eyeButton.click();
    await expect(currentPwdInput).toHaveAttribute('type', 'password');

    // Close modal
    await pwdModal.locator('button:has-text("Cancel")').click();
  });

  // -------------------------------------------------------------------------
  // TC-RP-12: Security Settings Card Verification
  // -------------------------------------------------------------------------
  test('TC-RP-12: Displays Username, masked Password, 2FA Status, and Last Login', async ({ page }) => {
    await loginAndNavigateToRecruiterProfile(page);

    const securityCard = page.locator('.settings-card:has-text("Security")');
    await expect(securityCard).toBeVisible();

    // Check security items
    await expect(securityCard.locator('.security-item:has-text("Username")')).toBeVisible();
    await expect(securityCard.locator('.security-item:has-text("Password")')).toBeVisible();
    await expect(securityCard.locator('.security-item:has-text("2FA Status")')).toContainText('Enabled');
    await expect(securityCard.locator('.security-item:has-text("Last Login")')).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // TC-RP-13: Protected Route Access Control (Unauthenticated User)
  // -------------------------------------------------------------------------
  test('TC-RP-13: Unauthenticated user accessing /recruiter/profile is redirected to /signin', async ({ page }) => {
    await page.goto('/recruiter/profile', { waitUntil: 'domcontentloaded' });

    // Should be blocked and redirected to /signin
    await expect(page).toHaveURL(/\/signin/);
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // TC-RP-14: Role-Based Authorization Guard (Candidate User)
  // -------------------------------------------------------------------------
  test('TC-RP-14: Candidate role user is blocked from accessing /recruiter/profile', async ({ page }) => {
    // Log in as candidate
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: DEMO_CANDIDATE_EMAIL,
        password: DEMO_CANDIDATE_PASSWORD,
      }),
    });
    const candidateData = await res.json();

    await page.addInitScript(({ token, user }) => {
      localStorage.setItem('intellihire_token', token);
      localStorage.setItem('intellihire_user', JSON.stringify(user));
    }, { token: candidateData.token, user: candidateData.user });

    // Attempt to access recruiter-only route
    await page.goto('/recruiter/profile', { waitUntil: 'domcontentloaded' });

    // Should redirect away from /recruiter/profile (e.g. to /candidate/dashboard or /dashboard)
    await expect(page).not.toHaveURL(/\/recruiter\/profile/);
  });

});
