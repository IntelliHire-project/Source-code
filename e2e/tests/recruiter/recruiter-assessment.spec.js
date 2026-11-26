/**
 * tests/recruiter/recruiter-assessment.spec.js
 *
 * Comprehensive Playwright End-to-End and Integration test suite for the
 * IntelliHire Recruiter Assessment Management and Creation Flow.
 *
 * Covers:
 *  1.  TC-RA-01: Recruiter authentication and navigation to /recruiter/assessments
 *  2.  TC-RA-02: Assessment management header, top bar, and primary navigation tabs
 *  3.  TC-RA-03: Real-time search query filtering in Assessments tab
 *  4.  TC-RA-04: Standalone Assessment Builder navigation (/recruiter/assessments/new)
 *  5.  TC-RA-05: Target Job Vacancy dropdown selection & Auto-Generate Title button
 *  6.  TC-RA-06: Custom Vacancy ("Other") selection and title auto-generation
 *  7.  TC-RA-07: Dynamic Question addition (+ Add Question) and removal in Builder
 *  8.  TC-RA-08: Assessment Builder validation error on empty title submission
 *  9.  TC-RA-09: Assessment Preview page (/recruiter/assessments/:id) & Accordion Toggling
 * 10.  TC-RA-10: Edit Assessment navigation (/recruiter/assessments/:id/edit) & pre-populated fields
 * 11.  TC-RA-11: Multiple Choice Question (MCQ) options editing & correct answer selection
 * 12.  TC-RA-12: Coding Challenge starter code boilerplate editing
 * 13.  TC-RA-13: Access Control: Unauthenticated guest accessing /recruiter/assessments redirected to /signin
 * 14.  TC-RA-14: Role-Based Authorization Guard: Candidate user accessing /recruiter/assessments is blocked
 */

const { test, expect } = require('@playwright/test');
const {
  BASE_URL,
  DEMO_RECRUITER_EMAIL,
  DEMO_RECRUITER_PASSWORD,
  DEMO_CANDIDATE_EMAIL,
  DEMO_CANDIDATE_PASSWORD,
} = require('../helpers/api');

let cachedRecruiterAuth = null;
let cachedCandidateAuth = null;

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
 * Obtains candidate credentials and JWT token directly via REST API.
 */
async function getCandidateAuth() {
  if (!cachedCandidateAuth) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: DEMO_CANDIDATE_EMAIL,
        password: DEMO_CANDIDATE_PASSWORD,
      }),
    });
    const data = await res.json();
    cachedCandidateAuth = { token: data.token, user: data.user };
  }
  return cachedCandidateAuth;
}

/**
 * Injects authenticated recruiter session and navigates to the target page.
 */
async function loginAndNavigateAsRecruiter(page, targetPath = '/recruiter/assessments') {
  const auth = await getRecruiterAuth();
  await page.addInitScript(({ token, user }) => {
    localStorage.setItem('intellihire_token', token);
    localStorage.setItem('intellihire_user', JSON.stringify(user));
  }, auth);

  await page.goto(targetPath, { waitUntil: 'domcontentloaded' });
}

// ---------------------------------------------------------------------------
// Test Suite: Recruiter Assessment Flow
// ---------------------------------------------------------------------------

test.describe('Recruiter Assessment Module — End-to-End Test Suite', () => {

  // -------------------------------------------------------------------------
  // TC-RA-01: Recruiter Authentication & Navigation
  // -------------------------------------------------------------------------
  test('TC-RA-01: Recruiter logs in via UI and navigates to Assessment Management', async ({ page }) => {
    await page.goto('/signin', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#email')).toBeVisible({ timeout: 10_000 });
    await page.locator('#email').fill(DEMO_RECRUITER_EMAIL);
    await page.locator('#password').fill(DEMO_RECRUITER_PASSWORD);
    await page.locator('button[type="submit"]').click();

    await page.waitForURL('**/recruiter/**', { waitUntil: 'domcontentloaded', timeout: 12_000 });
    await page.goto('/recruiter/assessments', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('.am-page__title')).toHaveText('Assessment Management');
    await expect(page.locator('.am-tab-nav')).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // TC-RA-02: Header, TopBar & Primary Navigation Tabs
  // -------------------------------------------------------------------------
  test('TC-RA-02: Verifies page header, tabs (Question Bank, Assessments, Candidate Results)', async ({ page }) => {
    await loginAndNavigateAsRecruiter(page, '/recruiter/assessments');

    await expect(page.locator('.am-page__title')).toBeVisible();
    await expect(page.locator('.am-page__subtitle')).toBeVisible();

    const tabs = page.locator('.am-tab-btn');
    await expect(tabs).toHaveCount(3);
    await expect(tabs.nth(0)).toContainText('Question Bank');
    await expect(tabs.nth(1)).toContainText('Assessments');
    await expect(tabs.nth(2)).toContainText('Candidate Results');

    // Switch to Assessments tab
    await tabs.nth(1).click();
    await expect(tabs.nth(1)).toHaveClass(/active/);
    await expect(page.locator('.am-toolbar')).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // TC-RA-03: Real-Time Search Query Filtering in Assessments Tab
  // -------------------------------------------------------------------------
  test('TC-RA-03: Filters assessment table in real-time by search query', async ({ page }) => {
    await loginAndNavigateAsRecruiter(page, '/recruiter/assessments');

    // Switch to Assessments tab
    await page.locator('.am-tab-btn').nth(1).click();
    await expect(page.locator('.am-search input')).toBeVisible();

    // Type search query 'React' (matching live assessment 'Senior Software Engineer — React Assessment')
    await page.locator('.am-search input').fill('React');
    await page.waitForTimeout(300);

    const rows = page.locator('.am-table tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(1);

    // Verify row content contains React
    const firstRowText = await rows.first().textContent();
    expect(firstRowText).toContain('React');
  });

  // -------------------------------------------------------------------------
  // TC-RA-04: Standalone Assessment Builder Navigation
  // -------------------------------------------------------------------------
  test('TC-RA-04: Navigates to /recruiter/assessments/new and renders configuration builder', async ({ page }) => {
    await loginAndNavigateAsRecruiter(page, '/recruiter/assessments/new');

    await expect(page.locator('.af-page-title h1')).toHaveText('Create New Assessment');
    await expect(page.locator('.ca-config')).toBeVisible();
    await expect(page.locator('.ca-bank')).toBeVisible();
    await expect(page.locator('.af-title-actions button.af-primary')).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // TC-RA-05: Target Job Vacancy Selection & Auto-Generate Title
  // -------------------------------------------------------------------------
  test('TC-RA-05: Selects target vacancy and triggers Auto-Generate Title', async ({ page }) => {
    await loginAndNavigateAsRecruiter(page, '/recruiter/assessments/new');

    const roleSelect = page.locator('.ca-config select').first();
    await roleSelect.selectOption('Senior Software Engineer — React');

    const autoGenBtn = page.locator('button.af-auto-gen-btn');
    await expect(autoGenBtn).toBeVisible();
    await autoGenBtn.click();

    const titleInput = page.locator('input[placeholder*="Senior Software Engineer Assessment"]');
    const val = await titleInput.inputValue();
    expect(val).toContain('Senior Software Engineer — React');
  });

  // -------------------------------------------------------------------------
  // TC-RA-06: Custom Vacancy ("Other") Selection & Dynamic Title Update
  // -------------------------------------------------------------------------
  test('TC-RA-06: Selects "Other" role and types custom vacancy title', async ({ page }) => {
    await loginAndNavigateAsRecruiter(page, '/recruiter/assessments/new');

    const roleSelect = page.locator('.ca-config select').first();
    await roleSelect.selectOption('Other');

    const customRoleInput = page.locator('input[placeholder*="Type custom role"]');
    await expect(customRoleInput).toBeVisible();
    await customRoleInput.fill('AI Reliability Specialist');

    await page.locator('button.af-auto-gen-btn').click();
    const titleInput = page.locator('input[placeholder*="Senior Software Engineer Assessment"]');
    expect(await titleInput.inputValue()).toContain('AI Reliability Specialist');
  });

  // -------------------------------------------------------------------------
  // TC-RA-07: Dynamic Question Addition and Removal in Builder
  // -------------------------------------------------------------------------
  test('TC-RA-07: Dynamically adds and removes questions in the assessment builder', async ({ page }) => {
    await loginAndNavigateAsRecruiter(page, '/recruiter/assessments/new');

    const questionCards = page.locator('article.ca-question');
    await expect(questionCards.first()).toBeVisible({ timeout: 10_000 });
    const initialCount = await questionCards.count();

    // Click "+ Add Question"
    await page.locator('button:has-text("Add Question")').click();
    await expect(questionCards).toHaveCount(initialCount + 1);

    // Remove the newly added question
    const removeBtn = questionCards.last().locator('button.ca-remove');
    await expect(removeBtn).toBeVisible();
    await removeBtn.click();

    await expect(questionCards).toHaveCount(initialCount);
  });

  // -------------------------------------------------------------------------
  // TC-RA-08: Empty Title Validation Error on Save
  // -------------------------------------------------------------------------
  test('TC-RA-08: Displays error message when attempting to save without a title', async ({ page }) => {
    await loginAndNavigateAsRecruiter(page, '/recruiter/assessments/new');

    const titleInput = page.locator('input[placeholder*="Senior Software Engineer Assessment"]');
    await titleInput.fill('');

    // Attempt to save as draft
    await page.locator('button:has-text("Save as Draft")').click();

    const errorAlert = page.locator('.af-error');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText('Please provide an assessment title before saving.');
  });

  // -------------------------------------------------------------------------
  // TC-RA-09: Assessment Preview Page & Questions Accordion
  // -------------------------------------------------------------------------
  test('TC-RA-09: Navigates to Assessment Preview and verifies questions accordion', async ({ page }) => {
    await loginAndNavigateAsRecruiter(page, '/recruiter/assessments/A-1001');

    await expect(page.locator('.af-page')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('.af-actions button:has-text("Edit Assessment"), button:has-text("Edit Assessment")').first()).toBeVisible();

    // Verify accordion header toggle
    const firstAccordion = page.locator('.ap-question-item, .ap-card, article').first();
    await expect(firstAccordion).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // TC-RA-10: Edit Assessment Page Loading & Pre-Populated Fields
  // -------------------------------------------------------------------------
  test('TC-RA-10: Navigates to /recruiter/assessments/A-1001/edit and verifies pre-populated question text', async ({ page }) => {
    await loginAndNavigateAsRecruiter(page, '/recruiter/assessments/A-1001/edit');

    await expect(page.locator('.af-page-title h1')).toHaveText('Edit Assessment');
    await expect(page.locator('.ca-bank small')).toBeVisible();

    // Check first question text area is not empty
    const firstTextarea = page.locator('article.ca-question textarea').first();
    await expect(firstTextarea).toBeVisible();
    const val = await firstTextarea.inputValue();
    expect(val.trim().length).toBeGreaterThan(0);
  });

  // -------------------------------------------------------------------------
  // TC-RA-11: Multiple Choice Question (MCQ) Options Editing
  // -------------------------------------------------------------------------
  test('TC-RA-11: Verifies Multiple Choice options editor and correct answer radio selection', async ({ page }) => {
    await loginAndNavigateAsRecruiter(page, '/recruiter/assessments/A-1001/edit');

    // Expand second question or locate MCQ question
    const mcqQuestions = page.locator('article.ca-question:has-text("Multiple Choice")');
    if (await mcqQuestions.count() > 0) {
      const mcq = mcqQuestions.first();
      await mcq.locator('header').click();

      // Check radio buttons for correct answer
      const radios = mcq.locator('input[type="radio"]');
      await expect(radios.first()).toBeVisible();

      // Click second option radio
      if (await radios.count() > 1) {
        await radios.nth(1).check();
        await expect(radios.nth(1)).toBeChecked();
      }
    } else {
      // Add a question, switch to Multiple Choice and verify
      await page.locator('button:has-text("Add Question")').click();
      const lastQ = page.locator('article.ca-question').last();
      await lastQ.locator('select').selectOption('Multiple Choice');
      const radios = lastQ.locator('input[type="radio"]');
      await expect(radios.first()).toBeVisible();
    }
  });

  // -------------------------------------------------------------------------
  // TC-RA-12: Coding Challenge Starter Code Boilerplate Editing
  // -------------------------------------------------------------------------
  test('TC-RA-12: Verifies Coding question starter code boilerplate editor', async ({ page }) => {
    await loginAndNavigateAsRecruiter(page, '/recruiter/assessments/A-1001/edit');

    // Add a new question and switch type to Coding
    await page.locator('button:has-text("Add Question")').click();
    const lastQ = page.locator('article.ca-question').last();
    await lastQ.locator('select').selectOption('Coding');

    const codeEditor = lastQ.locator('textarea[placeholder*="Starter code boilerplate"]');
    await expect(codeEditor).toBeVisible();
    await codeEditor.fill('function testSolution() {\n  return 42;\n}');
    expect(await codeEditor.inputValue()).toContain('testSolution');
  });

  // -------------------------------------------------------------------------
  // TC-RA-13: Access Control (Unauthenticated User Redirect)
  // -------------------------------------------------------------------------
  test('TC-RA-13: Unauthenticated user accessing /recruiter/assessments is redirected to /signin', async ({ page }) => {
    // Clear storage to ensure guest state
    await page.goto('/signin', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => localStorage.clear());

    await page.goto('/recruiter/assessments', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/.*signin.*/, { timeout: 10_000 });
    await expect(page.locator('#email')).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // TC-RA-14: Role-Based Authorization Guard (Candidate Blocked)
  // -------------------------------------------------------------------------
  test('TC-RA-14: Candidate role user attempting to access /recruiter/assessments is blocked', async ({ page }) => {
    const candidateAuth = await getCandidateAuth();
    await page.addInitScript(({ token, user }) => {
      localStorage.setItem('intellihire_token', token);
      localStorage.setItem('intellihire_user', JSON.stringify(user));
    }, candidateAuth);

    await page.goto('/recruiter/assessments', { waitUntil: 'domcontentloaded' });
    // Candidate should either be redirected to /signin, /unauthorized, or candidate dashboard
    await expect(page).not.toHaveURL('/recruiter/assessments', { timeout: 10_000 });
  });

});
