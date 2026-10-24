/**
 * tests/candidate/candidate-profile.spec.js
 *
 * Comprehensive Playwright End-to-End and Integration test suite for the
 * IntelliHire Candidate Profile page.
 *
 * Covers:
 *  1.  Candidate authentication and navigation to Candidate Profile page (/candidate/profile)
 *  2.  Candidate Profile layout and element verification in View mode
 *  3.  Navigation from View mode to Edit mode (/candidate/profile/edit)
 *  4.  Updating Personal Information fields and verifying persistence in View mode
 *  5.  Updating Professional Links (LinkedIn, GitHub) and verifying persistence
 *  6.  Adding a new skill via prompt dialog and removing an existing skill
 *  7.  Adding and removing dynamic Work Experience entries
 *  8.  Adding and removing dynamic Education entries
 *  9.  Cancelling / discarding edits without saving (revert to previous state)
 * 10.  File validation: Rejecting non-PDF files during CV auto-fill upload
 * 11.  Navigation from Active CV section to CV Management page
 * 12.  Route protection: Redirecting unauthenticated user accessing /candidate/profile to /signin
 * 13.  Backend API: Profile retrieval security (401 without auth) and valid payload structure
 * 14.  Backend API: Profile update endpoint validation and response
 */

const { test, expect } = require('@playwright/test');
const {
  BASE_URL,
  DEMO_CANDIDATE_EMAIL,
  DEMO_CANDIDATE_PASSWORD,
} = require('../helpers/api');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let cachedAuth = null;

/**
 * Obtains candidate credentials and JWT token directly via REST API.
 */
async function getCandidateAuth() {
  if (!cachedAuth) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: DEMO_CANDIDATE_EMAIL,
        password: DEMO_CANDIDATE_PASSWORD,
      }),
    });
    const data = await res.json();
    cachedAuth = { token: data.token, user: data.user };
  }
  return cachedAuth;
}

/**
 * Injects authenticated candidate session into browser context and navigates to Profile.
 * Fast, reliable, and eliminates redundant login redirects.
 */
async function loginAndNavigateToProfile(page) {
  const auth = await getCandidateAuth();
  await page.addInitScript(({ token, user }) => {
    localStorage.setItem('intellihire_token', token);
    localStorage.setItem('intellihire_user', JSON.stringify(user));
  }, auth);

  await page.goto('/candidate/profile', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.candidate-profile-content')).toBeVisible({ timeout: 10_000 });
}

/**
 * Navigates to Candidate Profile and opens Edit Mode.
 */
async function openProfileEditor(page) {
  await loginAndNavigateToProfile(page);
  await page.locator('.candidate-hero__actions button:has-text("Edit Profile")').click();
  await expect(page).toHaveURL(/\/candidate\/profile\/edit/);
  await expect(page.locator('.candidate-edit-header h1')).toBeVisible();
}

// ---------------------------------------------------------------------------
// Test Suite: Candidate Profile Page
// ---------------------------------------------------------------------------

test.describe('Candidate Profile Page — End-to-End Test Suite', () => {

  // -------------------------------------------------------------------------
  // TC-CP-01: Authentication & Navigation (Full UI Flow)
  // -------------------------------------------------------------------------
  test('TC-CP-01: Candidate logs in via UI and navigates to Candidate Profile page', async ({ page }) => {
    await page.goto('/signin', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#email')).toBeVisible({ timeout: 10_000 });
    await page.locator('#email').fill(DEMO_CANDIDATE_EMAIL);
    await page.locator('#password').fill(DEMO_CANDIDATE_PASSWORD);
    await page.locator('button[type="submit"]').click();

    // Wait for redirect into candidate dashboard area
    await page.waitForURL('**/candidate/**', { waitUntil: 'domcontentloaded', timeout: 12_000 });

    // Navigate directly to Profile page
    await page.goto('/candidate/profile', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.candidate-profile-content')).toBeVisible();

    // Verify hero banner and candidate name
    await expect(page.locator('.candidate-hero')).toBeVisible();
    await expect(page.locator('.candidate-hero__name')).toBeVisible();
    await expect(page.locator('.candidate-hero__actions button:has-text("Edit Profile")')).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // TC-CP-02: Profile View Mode Elements Verification
  // -------------------------------------------------------------------------
  test('TC-CP-02: View mode renders all core profile sections properly', async ({ page }) => {
    await loginAndNavigateToProfile(page);

    // Verify Sections in Left Column
    await expect(page.locator('h2:has-text("Work Experience")')).toBeVisible();
    await expect(page.locator('h2:has-text("Education")')).toBeVisible();

    // Verify Sections in Right Rail
    await expect(page.locator('h2:has-text("Personal Information")')).toBeVisible();
    await expect(page.locator('h2:has-text("Professional Links")')).toBeVisible();
    await expect(page.locator('h2:has-text("Active CV")')).toBeVisible();

    // Verify CV Management action button in Active CV panel
    await expect(page.locator('button:has-text("View CV Management")')).toBeVisible();

    // Verify Footer
    await expect(page.locator('.candidate-footer')).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // TC-CP-03: Navigation to Edit Mode
  // -------------------------------------------------------------------------
  test('TC-CP-03: Clicking "Edit Profile" navigates to Edit Mode and renders form', async ({ page }) => {
    await loginAndNavigateToProfile(page);

    // Click "Edit Profile" button
    await page.locator('.candidate-hero__actions button:has-text("Edit Profile")').click();

    // Verify URL transitions to /candidate/profile/edit
    await expect(page).toHaveURL(/\/candidate\/profile\/edit/);

    // Verify Edit header and action buttons
    await expect(page.locator('.candidate-edit-header h1')).toHaveText('Edit Profile');
    await expect(page.locator('.candidate-edit-header button:has-text("Cancel")')).toBeVisible();
    await expect(page.locator('.candidate-edit-header button:has-text("Save Changes")')).toBeVisible();

    // Verify edit form sections
    await expect(page.locator('.candidate-grid--edit')).toBeVisible();
    await expect(page.locator('h2:has-text("Skills Snapshot")')).toBeVisible();
    await expect(page.locator('.candidate-review-banner')).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // TC-CP-04: Update Personal Information Fields
  // -------------------------------------------------------------------------
  test('TC-CP-04: Edit and save Personal Information fields with persistent view verification', async ({ page }) => {
    await openProfileEditor(page);

    const timestamp = Date.now().toString().slice(-4);
    const testHeadline = `Lead Full Stack Engineer ${timestamp}`;
    const testLocation = `Austin, TX ${timestamp}`;
    const testPhone = `+1 555 019 ${timestamp}`;
    const testBio = `Experienced software engineer passionate about cloud architecture and automated testing. #${timestamp}`;

    // Fill form fields
    await page.locator('label:has-text("Professional Headline") input').fill(testHeadline);
    await page.locator('label:has-text("Phone Number") input').fill(testPhone);
    await page.locator('label:has-text("Location") input').fill(testLocation);
    await page.locator('label:has-text("Bio Summary") textarea').fill(testBio);

    // Set up dialog listener before saving
    let alertMessage = '';
    page.once('dialog', async (dialog) => {
      alertMessage = dialog.message();
      await dialog.accept();
    });

    // Click "Save Changes"
    await page.locator('.candidate-edit-header button:has-text("Save Changes")').click();

    // Verify transition back to view mode
    await expect(page).toHaveURL(/\/candidate\/profile$/);
    await expect.poll(() => alertMessage).toContain('Profile updated successfully');

    // Verify updated values in View mode
    await expect(page.locator('.candidate-hero__headline')).toContainText(testHeadline);
    await expect(page.locator('.candidate-hero__meta')).toContainText(testLocation);
    await expect(page.locator('.candidate-info-row:has-text("Phone Number") .candidate-info-row__value')).toHaveText(testPhone);
    await expect(page.locator('.candidate-info-row:has-text("Location") .candidate-info-row__value')).toHaveText(testLocation);
    await expect(page.locator('.candidate-info-row:has-text("Bio Summary") .candidate-info-row__value')).toHaveText(testBio);
  });

  // -------------------------------------------------------------------------
  // TC-CP-05: Update Professional Links
  // -------------------------------------------------------------------------
  test('TC-CP-05: Update LinkedIn and GitHub profile links and verify in View mode', async ({ page }) => {
    await openProfileEditor(page);

    const testLinkedIn = `linkedin.com/in/testcandidate-${Date.now().toString().slice(-4)}`;
    const testGitHub = `github.com/candidate-test-${Date.now().toString().slice(-4)}`;

    await page.locator('label:has-text("LinkedIn Profile") input').fill(testLinkedIn);
    await page.locator('label:has-text("GitHub Profile") input').fill(testGitHub);

    // Handle alert dialog on save
    page.once('dialog', async (dialog) => {
      await dialog.accept();
    });

    await page.locator('.candidate-edit-header button:has-text("Save Changes")').click();
    await expect(page).toHaveURL(/\/candidate\/profile$/);

    // Verify links in view mode
    await expect(page.locator('.candidate-link-row:has-text("LinkedIn Profile") .candidate-link-row__value')).toHaveText(testLinkedIn);
    await expect(page.locator('.candidate-link-row:has-text("GitHub") .candidate-link-row__value')).toHaveText(testGitHub);
  });

  // -------------------------------------------------------------------------
  // TC-CP-06: Add and Remove Skill
  // -------------------------------------------------------------------------
  test('TC-CP-06: Add a skill via prompt dialog and remove an existing skill', async ({ page }) => {
    await openProfileEditor(page);

    const uniqueSkill = `Skill${Date.now().toString().slice(-4)}`;

    // Set up prompt dialog handler before clicking "+ Add More"
    page.once('dialog', async (dialog) => {
      expect(dialog.type()).toBe('prompt');
      await dialog.accept(uniqueSkill);
    });

    await page.locator('.candidate-skills-grid button:has-text("+ Add More")').click();

    // Verify skill badge appears in the skills snapshot
    const addedSkillButton = page.locator(`.candidate-skills-grid button:has-text("${uniqueSkill}")`);
    await expect(addedSkillButton).toBeVisible();

    // Remove the added skill by clicking on it
    await addedSkillButton.click();

    // Verify skill is removed
    await expect(addedSkillButton).toBeHidden();
  });

  // -------------------------------------------------------------------------
  // TC-CP-07: Add and Remove Work Experience Entry
  // -------------------------------------------------------------------------
  test('TC-CP-07: Add a work experience entry and remove it dynamically', async ({ page }) => {
    await openProfileEditor(page);

    const workSection = page.locator('.candidate-panel:has-text("Work Experience")');
    const initialEntriesCount = await workSection.locator('.candidate-entry--edit').count();

    // Click "+ Add Experience"
    await workSection.locator('button:has-text("Add Experience")').click();

    // Verify entry count increased
    const newEntriesCount = await workSection.locator('.candidate-entry--edit').count();
    expect(newEntriesCount).toBe(initialEntriesCount + 1);

    // Fill in the new experience fields
    const latestEntry = workSection.locator('.candidate-entry--edit').last();
    await latestEntry.locator('label:has-text("Job Title") input').fill('Staff Test Architect');
    await latestEntry.locator('label:has-text("Company") input').fill('IntelliHire Global');
    await latestEntry.locator('label:has-text("Period") input').fill('2024 - Present');
    await latestEntry.locator('label:has-text("Description") textarea').fill('Leading end-to-end testing and quality engineering.');

    // Now remove the newly added entry using its delete button
    await latestEntry.locator('button[aria-label="Remove experience"]').click();

    // Verify entry count reverted
    const finalEntriesCount = await workSection.locator('.candidate-entry--edit').count();
    expect(finalEntriesCount).toBe(initialEntriesCount);
  });

  // -------------------------------------------------------------------------
  // TC-CP-08: Add and Remove Education Entry
  // -------------------------------------------------------------------------
  test('TC-CP-08: Add an education entry and remove it dynamically', async ({ page }) => {
    await openProfileEditor(page);

    const eduSection = page.locator('.candidate-panel:has-text("Education")');
    const initialEntriesCount = await eduSection.locator('.candidate-entry--education').count();

    // Click "+ Add Education"
    await eduSection.locator('button:has-text("Add Education")').click();

    // Verify count increased
    const newEntriesCount = await eduSection.locator('.candidate-entry--education').count();
    expect(newEntriesCount).toBe(initialEntriesCount + 1);

    // Fill education details
    const latestEntry = eduSection.locator('.candidate-entry--education').last();
    await latestEntry.locator('label:has-text("Degree / Title") input').fill('M.S. in Software Engineering');
    await latestEntry.locator('label:has-text("School") input').fill('University of Technology');
    await latestEntry.locator('label:has-text("Period") input').fill('2020 - 2022');

    // Remove the added entry
    await latestEntry.locator('button[aria-label="Remove education"]').click();

    // Verify count returned to original
    const finalEntriesCount = await eduSection.locator('.candidate-entry--education').count();
    expect(finalEntriesCount).toBe(initialEntriesCount);
  });

  // -------------------------------------------------------------------------
  // TC-CP-09: Discard / Cancel Edits Reversion
  // -------------------------------------------------------------------------
  test('TC-CP-09: Cancelling or discarding edits reverts draft and does not persist changes', async ({ page }) => {
    await loginAndNavigateToProfile(page);

    const discardedHeadline = `UNSAVED TEMPORARY HEADLINE ${Date.now()}`;

    // Open editor
    await page.locator('.candidate-hero__actions button:has-text("Edit Profile")').click();
    await expect(page).toHaveURL(/\/candidate\/profile\/edit/);

    // Modify the headline field with a discarded value
    await page.locator('label:has-text("Professional Headline") input').fill(discardedHeadline);

    // Click "Cancel" in header
    await page.locator('.candidate-edit-header button:has-text("Cancel")').click();

    // Verify navigation back to view mode
    await expect(page).toHaveURL(/\/candidate\/profile$/);

    // Verify that discarded headline was NOT saved or displayed
    await expect(page.locator('.candidate-hero__headline')).not.toContainText(discardedHeadline);
  });

  // -------------------------------------------------------------------------
  // TC-CP-10: File Validation — Reject Non-PDF Upload
  // -------------------------------------------------------------------------
  test('TC-CP-10: Uploading a non-PDF CV file triggers validation alert and is rejected', async ({ page }) => {
    await openProfileEditor(page);

    let alertMessage = '';
    page.once('dialog', async (dialog) => {
      alertMessage = dialog.message();
      await dialog.accept();
    });

    // Upload an invalid text file to the hidden file input
    await page.setInputFiles('input[type="file"][accept=".pdf"]', {
      name: 'resume.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('This is a plain text file, not a valid PDF resume.'),
    });

    // Verify validation alert was triggered
    await expect.poll(() => alertMessage).toContain('Only PDF files are supported');
  });

  // -------------------------------------------------------------------------
  // TC-CP-11: Navigation to CV Management Page
  // -------------------------------------------------------------------------
  test('TC-CP-11: Clicking "View CV Management" navigates to CV Management page', async ({ page }) => {
    await loginAndNavigateToProfile(page);

    // Click "View CV Management" button in Active CV panel
    await page.locator('button:has-text("View CV Management")').click();

    // Verify navigation to /candidate/cv-management
    await expect(page).toHaveURL(/\/candidate\/cv-management/);
  });

  // -------------------------------------------------------------------------
  // TC-CP-12: Access Control / Security Protection
  // -------------------------------------------------------------------------
  test('TC-CP-12: Unauthenticated user accessing /candidate/profile is redirected to /signin', async ({ page }) => {
    // Navigate directly without logging in
    await page.goto('/candidate/profile', { waitUntil: 'domcontentloaded' });

    // Verify redirect to /signin
    await expect(page).toHaveURL(/\/signin/);
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // TC-CP-13: Backend API Profile Security & Retrieval
  // -------------------------------------------------------------------------
  test('TC-CP-13: Backend API /api/candidate/profile requires auth and returns profile for authenticated candidate', async () => {
    // 1. Unauthenticated request should fail (401)
    const unauthRes = await fetch(`${BASE_URL}/candidate/profile`);
    expect(unauthRes.status).toBe(401);

    // 2. Authenticated request with candidate token
    const auth = await getCandidateAuth();
    const authRes = await fetch(`${BASE_URL}/candidate/profile`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    });
    expect(authRes.status).toBe(200);

    const data = await authRes.json();
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('user_id');
    expect(data).toHaveProperty('email', DEMO_CANDIDATE_EMAIL);
    expect(Array.isArray(data.skills)).toBe(true);
  });

  // -------------------------------------------------------------------------
  // TC-CP-14: Backend API Profile Update Endpoint
  // -------------------------------------------------------------------------
  test('TC-CP-14: Backend API PUT /api/candidate/profile successfully updates candidate record', async () => {
    const auth = await getCandidateAuth();

    const updatePayload = {
      headline: 'Principal Quality Engineer & Architect',
      location: 'San Francisco, CA',
      language: 'English (Fluent)',
      bio: 'Verified automation and end-to-end testing engineer.',
      phone: '+1 555 456 7890',
      linkedin: 'linkedin.com/in/api-test-candidate',
      github: 'github.com/api-test-candidate',
      skills: ['Playwright', 'JavaScript', 'PostgreSQL', 'Docker'],
      experience: [
        {
          id: 'exp-api-1',
          title: 'Senior QA Automation Engineer',
          company: 'IntelliHire Technologies',
          period: '2022 - Present',
          description: 'Designed comprehensive Playwright automation suites.'
        }
      ],
      education: [
        {
          id: 'edu-api-1',
          title: 'B.S. in Computer Science',
          school: 'State University',
          period: '2016 - 2020'
        }
      ]
    };

    const updateRes = await fetch(`${BASE_URL}/candidate/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.token}`,
      },
      body: JSON.stringify(updatePayload),
    });

    expect(updateRes.status).toBe(200);
    const updateResult = await updateRes.json();
    expect(updateResult.working).toBe(true);
    expect(updateResult.message).toContain('Profile updated successfully');
  });

});
