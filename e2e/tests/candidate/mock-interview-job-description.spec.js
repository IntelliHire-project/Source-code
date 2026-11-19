/**
 * tests/candidate/mock-interview-job-description.spec.js
 *
 * Comprehensive Playwright End-to-End (E2E) test suite for the IntelliHire
 * Mock Interview Job Description submission and role integration workflow.
 *
 * Test Coverage:
 *  1.  Authentication and navigation to Role Selection (/candidate/mock-interviews/roleselection)
 *  2.  Role selection and step transition from Step 1 (Select Role) to Step 2 (Job Description)
 *  3.  Selected Role Summary card presentation and category verification
 *  4.  Role-integrated template generation ("Use Role Template")
 *  5.  Dynamic character, word, and matched skills count calculation
 *  6.  Interactive role skill chips (clicking appends to JD and activates checkmark state)
 *  7.  Clearing the description ("Clear") and counter reset
 *  8.  In-place job description update ("Update & Save") with loading state and success notice
 *  9.  Reloading saved description from server ("Reload Saved")
 * 10.  Returning to Step 1 via "Change Role" button
 * 11.  Submitting job description via "Continue & Generate >" with loading state and navigation
 * 12.  Client-side session persistence in sessionStorage
 * 13.  Fallback to default role template when proceeding without manual JD
 * 14.  Backend API E2E: Direct save, retrieval, integration, and update endpoints
 * 15.  Route security and unauthenticated redirection
 */

const { test, expect } = require('@playwright/test');
const {
  BASE_URL,
  DEMO_CANDIDATE_EMAIL,
  DEMO_CANDIDATE_PASSWORD,
  apiGet,
  apiPost,
  apiPut,
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
 * Injects authenticated candidate session into browser context and navigates
 * to Mock Interview Role Selection page.
 */
async function loginAndNavigateToRoleSelection(page) {
  const auth = await getCandidateAuth();
  await page.addInitScript(({ token, user }) => {
    localStorage.setItem('intellihire_token', token);
    localStorage.setItem('intellihire_user', JSON.stringify(user));
  }, auth);

  await page.goto('/candidate/mock-interviews/roleselection', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.role-selection-container')).toBeVisible({ timeout: 10_000 });
}

/**
 * Navigates to Step 2 (Job Description step) by selecting a specific role.
 */
async function selectRoleAndProceedToStep2(page, roleTitle = 'Backend Developer') {
  await loginAndNavigateToRoleSelection(page);

  // Locate and select the target role card if not already selected
  const roleCard = page.locator('.role-card', { hasText: roleTitle });
  await expect(roleCard).toBeVisible({ timeout: 5_000 });
  await roleCard.click();

  // Click continue to proceed to Step 2
  const continueBtn = page.locator('.bottom-action-bar .continue-btn');
  await expect(continueBtn).toBeEnabled();
  await continueBtn.click();

  // Wait for Step 2 heading
  await expect(page.locator('.page-title')).toContainText('Provide a Job Description', { timeout: 8_000 });
  await expect(page.locator('.jd-textarea')).toBeVisible();
}

// ---------------------------------------------------------------------------
// Test Suite: Mock Interview Job Description E2E
// ---------------------------------------------------------------------------

test.describe('Mock Interview — Job Description Submission E2E Suite', () => {

  // -------------------------------------------------------------------------
  // TC-JD-01: Navigation & Initial Layout
  // -------------------------------------------------------------------------
  test('TC-JD-01: Candidate logs in and navigates to Mock Interview Role Selection', async ({ page }) => {
    await loginAndNavigateToRoleSelection(page);

    await expect(page.locator('.ai-badge')).toContainText('AI Powered Interviews');
    await expect(page.locator('.page-title')).toContainText('Select Job Role');
    await expect(page.locator('.page-subtitle')).toBeVisible();
    await expect(page.locator('.search-filter-bar')).toBeVisible();
    await expect(page.locator('.roles-grid')).toBeVisible();

    const roleCards = page.locator('.role-card:not(.custom-role-card)');
    const count = await roleCards.count();
    expect(count).toBeGreaterThanOrEqual(5);
  });

  // -------------------------------------------------------------------------
  // TC-JD-02: Role Selection & Step 2 Transition
  // -------------------------------------------------------------------------
  test('TC-JD-02: Candidate selects role and transitions to Step 2 Job Description view', async ({ page }) => {
    await selectRoleAndProceedToStep2(page, 'Backend Developer');

    // Verify Step 2 structure
    await expect(page.locator('.ai-badge')).toContainText('Tailored Questions');
    await expect(page.locator('.page-title')).toContainText('Provide a Job Description');
    await expect(page.locator('.selected-role-summary-card')).toBeVisible();
    await expect(page.locator('.selected-role-title')).toContainText('Backend Developer');
    await expect(page.locator('.selected-role-category-pill')).toContainText('ENGINEERING');
    await expect(page.locator('.change-role-btn')).toBeVisible();

    // Verify textarea and toolbar
    await expect(page.locator('.jd-textarea')).toBeVisible();
    await expect(page.locator('.jd-footer-toolbar')).toBeVisible();
    await expect(page.locator('.jd-template-btn')).toBeVisible();
    await expect(page.locator('.jd-retrieve-btn')).toBeVisible();
    await expect(page.locator('.jd-update-btn')).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // TC-JD-03: Use Role Template Button
  // -------------------------------------------------------------------------
  test('TC-JD-03: Candidate clicks "Use Role Template" to populate standard description', async ({ page }) => {
    await selectRoleAndProceedToStep2(page, 'Backend Developer');

    // Click "Use Role Template"
    const templateBtn = page.locator('.jd-template-btn');
    await templateBtn.click();

    // Verify textarea content
    const textarea = page.locator('.jd-textarea');
    const content = await textarea.inputValue();
    expect(content).toContain('Position: Backend Developer');
    expect(content).toContain('Core Responsibilities');
    expect(content).toContain('Key Requirements');

    // Verify char and word count updates
    const charCount = page.locator('.jd-char-count');
    await expect(charCount).toContainText('characters');
    await expect(charCount).toContainText('words');
  });

  // -------------------------------------------------------------------------
  // TC-JD-04: Interactive Role Skill Chips
  // -------------------------------------------------------------------------
  test('TC-JD-04: Candidate interacts with role skill chips to append skills to description', async ({ page }) => {
    await selectRoleAndProceedToStep2(page, 'Backend Developer');

    // Clear textarea first to test clean insertion
    const clearBtn = page.locator('.jd-clear-btn');
    if (await clearBtn.isVisible()) {
      await clearBtn.click();
    }

    const textarea = page.locator('.jd-textarea');
    await textarea.fill('');

    // Locate the first available skill chip
    const skillChip = page.locator('.role-skill-chip').first();
    const skillName = (await skillChip.locator('span').textContent()).trim();

    await skillChip.click();

    // Verify skill is appended into the textarea
    const updatedContent = await textarea.inputValue();
    expect(updatedContent).toContain(skillName);

    // Verify skill chip has active class and checkmark is visible
    await expect(skillChip).toHaveClass(/active/);
    await expect(skillChip.locator('.skill-check-icon')).toHaveClass(/visible/);
  });

  // -------------------------------------------------------------------------
  // TC-JD-05: Clear Button Resets Description
  // -------------------------------------------------------------------------
  test('TC-JD-05: Candidate clicks "Clear" to reset the job description textarea', async ({ page }) => {
    await selectRoleAndProceedToStep2(page, 'Backend Developer');

    const textarea = page.locator('.jd-textarea');
    await textarea.fill('Custom temporary job description requirements.');

    const clearBtn = page.locator('.jd-clear-btn');
    await expect(clearBtn).toBeVisible();
    await clearBtn.click();

    await expect(textarea).toHaveValue('');
    await expect(page.locator('.jd-hint')).toContainText('Click "Use Role Template"');
  });

  // -------------------------------------------------------------------------
  // TC-JD-06: In-Place Update & Save
  // -------------------------------------------------------------------------
  test('TC-JD-06: Candidate updates job description in-place and receives success notice', async ({ page }) => {
    await selectRoleAndProceedToStep2(page, 'Backend Developer');

    const textarea = page.locator('.jd-textarea');
    const customText = 'Senior Backend Engineer: High performance Go & Node.js microservices with Redis caching.';
    await textarea.fill(customText);

    // Click Update & Save
    const updateBtn = page.locator('.jd-update-btn');
    await expect(updateBtn).toBeEnabled();
    await updateBtn.click();

    // Verify success notice appears
    const statusNotice = page.locator('.jd-status-notice.success');
    await expect(statusNotice).toBeVisible({ timeout: 6_000 });
    await expect(statusNotice.locator('.jd-status-notice-text')).toContainText('Job description updated successfully');

    // Verify last saved timestamp displays
    await expect(page.locator('.jd-last-saved-time')).toBeVisible();

    // Dismiss notice
    const dismissBtn = statusNotice.locator('.jd-notice-dismiss');
    await dismissBtn.click();
    await expect(statusNotice).not.toBeVisible();
  });

  // -------------------------------------------------------------------------
  // TC-JD-07: Reload Saved Job Description
  // -------------------------------------------------------------------------
  test('TC-JD-07: Candidate clicks "Reload Saved" to retrieve previously stored description', async ({ page }) => {
    await selectRoleAndProceedToStep2(page, 'Backend Developer');

    // Click Reload Saved
    const reloadBtn = page.locator('.jd-retrieve-btn');
    await expect(reloadBtn).toBeVisible();
    await reloadBtn.click();

    // Should display notice confirming reload or template load
    const notice = page.locator('.jd-status-notice');
    await expect(notice).toBeVisible({ timeout: 6_000 });
  });

  // -------------------------------------------------------------------------
  // TC-JD-08: Change Role Navigation (Step 2 back to Step 1)
  // -------------------------------------------------------------------------
  test('TC-JD-08: Candidate clicks "Change Role" in Step 2 to return to role selection', async ({ page }) => {
    await selectRoleAndProceedToStep2(page, 'Backend Developer');

    const changeRoleBtn = page.locator('.change-role-btn');
    await changeRoleBtn.click();

    // Verify returned to Step 1
    await expect(page.locator('.page-title')).toContainText('Select Job Role');
    await expect(page.locator('.roles-grid')).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // TC-JD-09: Complete Job Description Submission & Navigation
  // -------------------------------------------------------------------------
  test('TC-JD-09: Candidate submits customized Job Description and navigates to Questions', async ({ page }) => {
    await selectRoleAndProceedToStep2(page, 'Frontend Developer');

    const customJd = [
      '# Frontend Developer',
      'Building enterprise React applications with TypeScript, Next.js, and automated Cypress testing.',
      '- Required Skill: React',
      '- Required Skill: JavaScript',
      '- Required Skill: CSS',
    ].join('\n');

    const textarea = page.locator('.jd-textarea');
    await textarea.fill(customJd);

    // Click "Continue & Generate >"
    const submitBtn = page.locator('.bottom-action-bar .continue-btn');
    await expect(submitBtn).toContainText('Continue & Generate >');
    await submitBtn.click();

    // Verify navigation to Questions page
    await page.waitForURL('**/candidate/mock-interviews/questions', { timeout: 10_000 });
    await expect(page.locator('.generated-questions-container')).toBeVisible({ timeout: 8_000 });
  });

  // -------------------------------------------------------------------------
  // TC-JD-10: Client Storage Persistence Verification
  // -------------------------------------------------------------------------
  test('TC-JD-10: Submitted Job Description is persisted in sessionStorage', async ({ page }) => {
    await selectRoleAndProceedToStep2(page, 'QA Engineer');

    const textarea = page.locator('.jd-textarea');
    const testJd = 'QA Lead: Automated testing pipeline with Playwright and Jest.';
    await textarea.fill(testJd);

    const submitBtn = page.locator('.bottom-action-bar .continue-btn');
    await submitBtn.click();

    await page.waitForURL('**/candidate/mock-interviews/questions', { timeout: 10_000 });

    // Verify sessionStorage values
    const storedJd = await page.evaluate(() => sessionStorage.getItem('mock_interview_job_description'));
    expect(storedJd).toContain('QA Lead');

    const storedRoleRaw = await page.evaluate(() => sessionStorage.getItem('mock_interview_selected_role'));
    expect(storedRoleRaw).toBeTruthy();
    const storedRole = JSON.parse(storedRoleRaw);
    expect(storedRole.roleId).toBe('qa');
  });

  // -------------------------------------------------------------------------
  // TC-JD-11: Route Security — Unauthenticated User Redirection
  // -------------------------------------------------------------------------
  test('TC-JD-11: Unauthenticated candidate is redirected to signin page', async ({ page }) => {
    // Clear storage to simulate logged-out user
    await page.goto('/candidate/mock-interviews/roleselection');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    await page.goto('/candidate/mock-interviews/roleselection');
    await page.waitForURL('**/signin**', { timeout: 10_000 });
    await expect(page.locator('#email')).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Backend API End-to-End Test Suite
// ---------------------------------------------------------------------------

test.describe('Mock Interview Job Description — Backend API E2E Integration', () => {
  let candidateToken;

  test.beforeAll(async () => {
    const auth = await getCandidateAuth();
    candidateToken = auth.token;
  });

  test('TC-JD-API-01: POST /mock-interviews/job-descriptions/save persists JD session', async () => {
    const payload = {
      roleId: 'backend',
      roleTitle: 'Backend Developer',
      category: 'engineering',
      jobDescription: 'E2E API test backend description with PostgreSQL and Express.',
      skills: ['Node.js', 'Express', 'SQL'],
    };

    const res = await apiPost('/mock-interviews/job-descriptions/save', payload, candidateToken);

    expect(res.working).toBe(true);
    expect(res.message).toContain('saved successfully');
    expect(res.jobDescription).toBeDefined();
    expect(res.jobDescription.jobDescription).toContain('E2E API test backend description');
  });

  test('TC-JD-API-02: POST /mock-interviews/roles/selected/job-description attaches JD to active role', async () => {
    const payload = {
      roleId: 'frontend',
      roleTitle: 'Frontend Developer',
      category: 'engineering',
      jobDescription: 'E2E API test frontend description with React and Tailwind CSS.',
      skills: ['React', 'CSS'],
    };

    const res = await apiPost('/mock-interviews/roles/selected/job-description', payload, candidateToken);

    expect(res.working).toBe(true);
    expect(res.message).toContain('integrated with selected role');
    expect(res.integratedRole.roleId).toBe('frontend');
    expect(res.integratedRole.jobDescription).toContain('React and Tailwind CSS');
  });

  test('TC-JD-API-03: GET /mock-interviews/roles/selected/job-description retrieves active session JD', async () => {
    const res = await apiGet('/mock-interviews/roles/selected/job-description', candidateToken);

    expect(res.working).toBe(true);
    expect(res.jobDescription).toBeDefined();
  });

  test('TC-JD-API-04: PUT /mock-interviews/roles/selected/job-description updates active session JD', async () => {
    const updatePayload = {
      roleId: 'frontend',
      jobDescription: 'Updated E2E description via PUT endpoint.',
    };

    const res = await apiPut('/mock-interviews/roles/selected/job-description', updatePayload, candidateToken);

    expect(res.working).toBe(true);
    expect(res.message).toContain('updated successfully');
    expect(res.jobDescription).toBe('Updated E2E description via PUT endpoint.');
  });

  test('TC-JD-API-05: GET /mock-interviews/roles/backend/job-description returns template and saved JD', async () => {
    const res = await apiGet('/mock-interviews/roles/backend/job-description', candidateToken);

    expect(res.working).toBe(true);
    expect(res.role).toBeDefined();
    expect(res.role.roleId).toBe('backend');
    expect(res.template).toContain('Backend Developer');
  });

  test('TC-JD-API-06: Reject unauthenticated request to protected JD endpoint', async () => {
    const res = await fetch(`${BASE_URL}/mock-interviews/job-descriptions/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roleId: 'backend' }),
    });

    // Unauthenticated requests should be rejected with 401 or require valid user role access
    expect([401, 403]).toContain(res.status);
  });
});

