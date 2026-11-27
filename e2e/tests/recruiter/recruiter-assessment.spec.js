/**
 * tests/recruiter/recruiter-assessment.spec.js
 *
 * Comprehensive Playwright End-to-End and Integration test suite for the
 * IntelliHire Recruiter Assessment Management and Creation Flow.
 *
 * Covers:
 *  1.  TC-RA-01: Recruiter authentication and navigation to /recruiter/assessments
 *  2.  TC-RA-02: Assessment management header, top bar, and primary navigation tabs
 *  3.  TC-RA-03: Real-time search query filtering, empty state, and reset in Assessments tab
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
 * Obtains recruiter credentials and JWT token directly via REST API (cached per worker).
 */
async function getRecruiterAuth() {
  if (!cachedRecruiterAuth) {
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
        cachedRecruiterAuth = { token: data.token, user: data.user };
      }
    } catch {
      // Fall back to UI login in helper
    }
  }
  return cachedRecruiterAuth;
}

/**
 * Obtains candidate credentials and JWT token directly via REST API (cached per worker).
 */
async function getCandidateAuth() {
  if (!cachedCandidateAuth) {
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: DEMO_CANDIDATE_EMAIL,
          password: DEMO_CANDIDATE_PASSWORD,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        cachedCandidateAuth = { token: data.token, user: data.user };
      }
    } catch {
      // Fall back to UI login in helper
    }
  }
  return cachedCandidateAuth;
}

/**
 * Injects authenticated recruiter session (falling back to UI login) and navigates to targetPath.
 */
async function loginAndNavigateAsRecruiter(page, targetPath = '/recruiter/assessments') {
  const auth = await getRecruiterAuth();
  if (auth) {
    await page.addInitScript(({ token, user }) => {
      localStorage.setItem('intellihire_token', token);
      localStorage.setItem('intellihire_user', JSON.stringify(user));
    }, auth);

    await page.goto(targetPath, { waitUntil: 'domcontentloaded' });
    return;
  }

  await page.goto('/signin', { waitUntil: 'domcontentloaded' });
  await page.locator('#email').fill(DEMO_RECRUITER_EMAIL);
  await page.locator('#password').fill(DEMO_RECRUITER_PASSWORD);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL('**/recruiter/**', { waitUntil: 'domcontentloaded', timeout: 12_000 });
  await page.goto(targetPath, { waitUntil: 'domcontentloaded' });
}

/**
 * Injects authenticated candidate session (falling back to UI login).
 */
async function loginAsCandidate(page) {
  const candidateAuth = await getCandidateAuth();
  if (candidateAuth) {
    await page.addInitScript(({ token, user }) => {
      localStorage.setItem('intellihire_token', token);
      localStorage.setItem('intellihire_user', JSON.stringify(user));
    }, candidateAuth);
    return;
  }

  await page.goto('/signin', { waitUntil: 'domcontentloaded' });
  await page.locator('#email').fill(DEMO_CANDIDATE_EMAIL);
  await page.locator('#password').fill(DEMO_CANDIDATE_PASSWORD);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL('**/candidate/**', { waitUntil: 'domcontentloaded', timeout: 12_000 });
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

    const emailInput = page.locator('#email');
    const passwordInput = page.locator('#password');
    await expect(emailInput).toBeVisible({ timeout: 10_000 });
    await expect(passwordInput).toBeVisible({ timeout: 10_000 });

    await emailInput.fill(DEMO_RECRUITER_EMAIL);
    await passwordInput.fill(DEMO_RECRUITER_PASSWORD);

    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    await page.waitForURL('**/recruiter/**', { waitUntil: 'domcontentloaded', timeout: 12_000 });
    await page.goto('/recruiter/assessments', { waitUntil: 'domcontentloaded' });

    const pageTitle = page.locator('.am-page__title');
    await expect(pageTitle).toBeVisible({ timeout: 10_000 });
    await expect(pageTitle).toHaveText('Assessment Management');
    await expect(page.locator('.am-tab-nav')).toBeVisible();

    const tabs = page.locator('.am-tab-btn');
    await expect(tabs).toHaveCount(3);
    await expect(tabs.nth(0)).toContainText('Question Bank');
    await expect(tabs.nth(1)).toContainText('Assessments');
    await expect(tabs.nth(2)).toContainText('Candidate Results');
  });

  // -------------------------------------------------------------------------
  // TC-RA-02: Header, TopBar & Primary Navigation Tabs
  // -------------------------------------------------------------------------
  test('TC-RA-02: Verifies page header, tabs (Question Bank, Assessments, Candidate Results)', async ({ page }) => {
    await loginAndNavigateAsRecruiter(page, '/recruiter/assessments');

    const pageTitle = page.locator('.am-page__title');
    await expect(pageTitle).toBeVisible({ timeout: 10_000 });
    await expect(pageTitle).toHaveText('Assessment Management');

    const pageSubtitle = page.locator('.am-page__subtitle');
    await expect(pageSubtitle).toBeVisible();
    await expect(pageSubtitle).toContainText('Build your question bank');

    const tabButtons = page.locator('.am-tab-btn');
    await expect(tabButtons).toHaveCount(3);

    const questionBankTab = tabButtons.nth(0);
    const assessmentsTab = tabButtons.nth(1);
    const candidateResultsTab = tabButtons.nth(2);

    await expect(questionBankTab).toContainText('Question Bank');
    await expect(assessmentsTab).toContainText('Assessments');
    await expect(candidateResultsTab).toContainText('Candidate Results');

    // Switch to Assessments tab
    await assessmentsTab.click();
    await expect(assessmentsTab).toHaveClass(/active/);
    await expect(page.locator('.am-toolbar')).toBeVisible({ timeout: 5_000 });
    await expect(page.locator('.am-search input')).toBeVisible();

    // Switch to Candidate Results tab
    await candidateResultsTab.click();
    await expect(candidateResultsTab).toHaveClass(/active/);
    await expect(assessmentsTab).not.toHaveClass(/active/);

    // Return to Question Bank tab
    await questionBankTab.click();
    await expect(questionBankTab).toHaveClass(/active/);
    await expect(candidateResultsTab).not.toHaveClass(/active/);
  });

  // -------------------------------------------------------------------------
  // TC-RA-03: Real-Time Search Query Filtering in Assessments Tab
  // -------------------------------------------------------------------------
  test('TC-RA-03: Filters assessment table in real-time by keyword, checks empty state and reset', async ({ page }) => {
    await loginAndNavigateAsRecruiter(page, '/recruiter/assessments');

    // Switch to Assessments tab
    const assessmentsTab = page.locator('.am-tab-btn').nth(1);
    await assessmentsTab.click();
    await expect(assessmentsTab).toHaveClass(/active/);

    const searchInput = page.locator('.am-search input');
    await expect(searchInput).toBeVisible({ timeout: 10_000 });

    const tableRows = page.locator('.am-table tbody tr');
    await expect(tableRows.first()).toBeVisible({ timeout: 10_000 });
    const initialCount = await tableRows.count();
    expect(initialCount).toBeGreaterThanOrEqual(1);

    // Search for matching keyword ('React' or first row term)
    const firstRowText = await tableRows.first().textContent();
    const searchTerm = (firstRowText || '').includes('React') ? 'React' : 'Assessment';

    await searchInput.fill(searchTerm);
    await page.waitForTimeout(300);

    const filteredRows = page.locator('.am-table tbody tr');
    const filteredCount = await filteredRows.count();
    expect(filteredCount).toBeGreaterThanOrEqual(1);
    expect(filteredCount).toBeLessThanOrEqual(initialCount);

    const visibleRowText = await filteredRows.first().textContent();
    expect(visibleRowText).toContain(searchTerm);

    // Search for non-existent keyword to verify empty state
    await searchInput.fill('NonExistentQueryXYZ999');
    await page.waitForTimeout(300);

    const emptyState = page.locator('.am-table-empty');
    await expect(emptyState).toBeVisible();
    await expect(emptyState).toContainText('No assessments found');

    // Clear search input and verify restoration
    await searchInput.fill('');
    await page.waitForTimeout(300);

    const restoredCount = await page.locator('.am-table tbody tr').count();
    expect(restoredCount).toBe(initialCount);
  });

  // -------------------------------------------------------------------------
  // TC-RA-04: Standalone Assessment Builder Navigation
  // -------------------------------------------------------------------------
  test('TC-RA-04: Navigates to /recruiter/assessments/new and renders configuration builder', async ({ page }) => {
    await loginAndNavigateAsRecruiter(page, '/recruiter/assessments/new');

    const pageHeader = page.locator('.af-page-title h1');
    await expect(pageHeader).toBeVisible({ timeout: 10_000 });
    await expect(pageHeader).toHaveText('Create New Assessment');

    const configPanel = page.locator('.ca-config');
    await expect(configPanel).toBeVisible();
    await expect(configPanel.locator('h2')).toContainText('Configuration');

    const bankSection = page.locator('.ca-bank');
    await expect(bankSection).toBeVisible();
    await expect(bankSection.locator('h2')).toContainText('Question Bank');

    const questionCards = page.locator('article.ca-question');
    const questionCount = await questionCards.count();
    expect(questionCount).toBeGreaterThanOrEqual(1);

    const saveDraftBtn = page.locator('.af-title-actions button.af-secondary');
    const publishBtn = page.locator('.af-title-actions button.af-primary');
    await expect(saveDraftBtn).toBeVisible();
    await expect(saveDraftBtn).toHaveText('Save as Draft');
    await expect(publishBtn).toBeVisible();
    await expect(publishBtn).toContainText('Publish Assessment');
  });

  // -------------------------------------------------------------------------
  // TC-RA-05: Target Job Vacancy Selection & Auto-Generate Title
  // -------------------------------------------------------------------------
  test('TC-RA-05: Selects target vacancy and triggers Auto-Generate Title', async ({ page }) => {
    await loginAndNavigateAsRecruiter(page, '/recruiter/assessments/new');

    const roleSelect = page.locator('.ca-config label:has-text("Target Job Vacancy") select');
    await expect(roleSelect).toBeVisible({ timeout: 10_000 });
    await roleSelect.selectOption('Senior Software Engineer — React');

    const autoGenBtn = page.locator('button.af-auto-gen-btn');
    await expect(autoGenBtn).toBeVisible();
    await autoGenBtn.click();

    const titleInput = page.locator('.ca-config label:has-text("Assessment Title") input');
    await expect(titleInput).toBeVisible();

    const titleValue = await titleInput.inputValue();
    expect(titleValue).toContain('Senior Software Engineer — React');
    expect(titleValue).toContain('Assessment');
  });

  // -------------------------------------------------------------------------
  // TC-RA-06: Custom Vacancy ("Other") Selection & Dynamic Title Update
  // -------------------------------------------------------------------------
  test('TC-RA-06: Selects "Other" role and types custom vacancy title', async ({ page }) => {
    await loginAndNavigateAsRecruiter(page, '/recruiter/assessments/new');

    const roleSelect = page.locator('.ca-config label:has-text("Target Job Vacancy") select');
    await expect(roleSelect).toBeVisible({ timeout: 10_000 });
    await roleSelect.selectOption('Other');

    const customRoleInput = page.locator('input[placeholder*="Type custom role"]');
    await expect(customRoleInput).toBeVisible({ timeout: 5_000 });
    await customRoleInput.fill('AI Reliability Specialist');

    const autoGenBtn = page.locator('button.af-auto-gen-btn');
    await expect(autoGenBtn).toBeVisible();
    await autoGenBtn.click();

    const titleInput = page.locator('.ca-config label:has-text("Assessment Title") input');
    await expect(titleInput).toBeVisible();

    const titleValue = await titleInput.inputValue();
    expect(titleValue).toContain('AI Reliability Specialist');
    expect(titleValue).toContain('Assessment');
  });

  // -------------------------------------------------------------------------
  // TC-RA-07: Dynamic Question Addition and Removal in Builder
  // -------------------------------------------------------------------------
  test('TC-RA-07: Dynamically adds and removes questions in the assessment builder', async ({ page }) => {
    await loginAndNavigateAsRecruiter(page, '/recruiter/assessments/new');

    const questionCards = page.locator('article.ca-question');
    await expect(questionCards.first()).toBeVisible({ timeout: 10_000 });

    const initialCount = await questionCards.count();
    expect(initialCount).toBeGreaterThanOrEqual(1);

    const countBadge = page.locator('.ca-bank-title h2 small');
    await expect(countBadge).toHaveText(`${initialCount} Questions`);

    // Click '+ Add Question'
    const addBtn = page.locator('.ca-bank-title button:has-text("Add Question")');
    await expect(addBtn).toBeVisible();
    await addBtn.click();

    await expect(questionCards).toHaveCount(initialCount + 1);
    await expect(countBadge).toHaveText(`${initialCount + 1} Questions`);

    // Remove the newly added question
    const removeBtn = questionCards.last().locator('button.ca-remove');
    await expect(removeBtn).toBeVisible();
    await removeBtn.click();

    await expect(questionCards).toHaveCount(initialCount);
    await expect(countBadge).toHaveText(`${initialCount} Questions`);
  });

  // -------------------------------------------------------------------------
  // TC-RA-08: Empty Title Validation Error on Save
  // -------------------------------------------------------------------------
  test('TC-RA-08: Displays error message when attempting to save without a title', async ({ page }) => {
    await loginAndNavigateAsRecruiter(page, '/recruiter/assessments/new');

    const titleInput = page.locator('.ca-config label:has-text("Assessment Title") input');
    await expect(titleInput).toBeVisible({ timeout: 10_000 });
    await titleInput.fill('');

    // Attempt to save as draft
    const saveDraftBtn = page.locator('.af-title-actions button:has-text("Save as Draft")');
    await expect(saveDraftBtn).toBeVisible();
    await saveDraftBtn.click();

    const errorAlert = page.locator('.af-error');
    await expect(errorAlert).toBeVisible({ timeout: 5_000 });
    await expect(errorAlert).toContainText('Please provide an assessment title before saving.');
    await expect(page).toHaveURL(/\/recruiter\/assessments\/new/);
  });

  // -------------------------------------------------------------------------
  // TC-RA-09: Assessment Preview Page & Questions Accordion
  // -------------------------------------------------------------------------
  test('TC-RA-09: Navigates to Assessment Preview and verifies questions accordion', async ({ page }) => {
    await loginAndNavigateAsRecruiter(page, '/recruiter/assessments/A-1001');

    const header = page.locator('.ap-header');
    await expect(header).toBeVisible({ timeout: 10_000 });
    await expect(header.locator('.af-eyebrow')).toContainText('A-1001');
    await expect(header.locator('h1')).toBeVisible();

    await expect(page.locator('.af-title-actions button:has-text("Edit Assessment")')).toBeVisible();
    await expect(page.locator('.af-title-actions button:has-text("View Candidates")')).toBeVisible();

    // Summary KPI cards (Duration, Questions, Total Points, Candidates)
    await expect(page.locator('.ap-summary article')).toHaveCount(4);

    // Question cards rendered and initially expanded
    const questionCards = page.locator('.ap-question-card');
    await expect(questionCards.first()).toBeVisible({ timeout: 10_000 });
    const firstCard = questionCards.first();
    const firstBody = firstCard.locator('.ap-question-body');
    await expect(firstBody).toBeVisible();

    // Collapse and re-expand first question accordion
    await firstCard.locator('.ap-question-header').click();
    await expect(firstBody).toBeHidden();

    await firstCard.locator('.ap-question-header').click();
    await expect(firstBody).toBeVisible();

    // Collapse All / Expand All toggle buttons
    const toggleAllBtn = page.locator('.ap-title-buttons button:has-text("Collapse All")');
    await expect(toggleAllBtn).toBeVisible();
    await toggleAllBtn.click();
    await expect(firstBody).toBeHidden();

    const expandAllBtn = page.locator('.ap-title-buttons button:has-text("Expand All")');
    await expect(expandAllBtn).toBeVisible();
    await expandAllBtn.click();
    await expect(firstBody).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // TC-RA-10: Edit Assessment Page Loading & Pre-Populated Fields
  // -------------------------------------------------------------------------
  test('TC-RA-10: Navigates to /recruiter/assessments/A-1001/edit and verifies pre-populated question text', async ({ page }) => {
    await loginAndNavigateAsRecruiter(page, '/recruiter/assessments/A-1001/edit');

    const pageTitle = page.locator('.af-page-title h1');
    await expect(pageTitle).toBeVisible({ timeout: 10_000 });
    await expect(pageTitle).toHaveText('Edit Assessment');

    await expect(page.locator('.af-title-actions button.af-primary')).toContainText('Update Assessment');
    await expect(page.locator('.ca-bank small')).toBeVisible();

    const configTitleInput = page.locator('.ca-config label:has-text("Assessment Title") input');
    await expect(configTitleInput).toBeVisible();
    expect((await configTitleInput.inputValue()).trim().length).toBeGreaterThan(0);

    const questionCards = page.locator('article.ca-question');
    await expect(questionCards.first()).toBeVisible({ timeout: 10_000 });
    const count = await questionCards.count();
    expect(count).toBeGreaterThanOrEqual(1);

    const firstCard = questionCards.first();
    const firstHeaderTitle = await firstCard.locator('header strong').textContent();
    expect((firstHeaderTitle || '').trim().length).toBeGreaterThan(0);

    const firstTitleInput = firstCard.locator('label:has-text("Question Title") input');
    await expect(firstTitleInput).toBeVisible();
    expect((await firstTitleInput.inputValue()).trim().length).toBeGreaterThan(0);

    const firstTextarea = firstCard.locator('label:has-text("Question Text") textarea');
    await expect(firstTextarea).toBeVisible();
    expect((await firstTextarea.inputValue()).trim().length).toBeGreaterThan(0);

    const firstPointsInput = firstCard.locator('label:has-text("Points Value") input');
    expect(Number(await firstPointsInput.inputValue())).toBeGreaterThan(0);

    if (count > 1) {
      const secondCard = questionCards.nth(1);
      await secondCard.locator('header').click();
      const secondTextarea = secondCard.locator('label:has-text("Question Text") textarea');
      await expect(secondTextarea).toBeVisible();
      expect((await secondTextarea.inputValue()).trim().length).toBeGreaterThan(0);
    }
  });

  // -------------------------------------------------------------------------
  // TC-RA-11: Multiple Choice Question (MCQ) Options Editing
  // -------------------------------------------------------------------------
  test('TC-RA-11: Verifies Multiple Choice options editor, correct answer radio, and Add Option', async ({ page }) => {
    await loginAndNavigateAsRecruiter(page, '/recruiter/assessments/A-1001/edit');

    const questionCards = page.locator('article.ca-question');
    await expect(questionCards.first()).toBeVisible({ timeout: 10_000 });

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

    const radios = mcqCard.locator('input[type="radio"]');
    const optionInputs = mcqCard.locator('input[type="text"][placeholder*="Option "]');
    await expect(radios.first()).toBeVisible({ timeout: 5_000 });
    const initialOptionCount = await optionInputs.count();
    expect(initialOptionCount).toBeGreaterThanOrEqual(2);

    // Edit Option B text
    const optionBInput = optionInputs.nth(1);
    await optionBInput.fill('Updated Option B Answer');
    await expect(optionBInput).toHaveValue('Updated Option B Answer');

    // Select Option B radio button as correct answer
    const optionBRadio = radios.nth(1);
    await optionBRadio.check();
    await expect(optionBRadio).toBeChecked();
    await expect(mcqCard).toContainText('✓ Correct');

    // Click '+ Add Option' and verify new option appears
    const addOptionBtn = mcqCard.locator('button:has-text("Add Option")');
    await expect(addOptionBtn).toBeVisible();
    await addOptionBtn.click();

    await expect(optionInputs).toHaveCount(initialOptionCount + 1);
  });

  // -------------------------------------------------------------------------
  // TC-RA-12: Coding Challenge Starter Code Boilerplate Editing
  // -------------------------------------------------------------------------
  test('TC-RA-12: Verifies Coding question starter code boilerplate editor', async ({ page }) => {
    await loginAndNavigateAsRecruiter(page, '/recruiter/assessments/A-1001/edit');

    const questionCards = page.locator('article.ca-question');
    await expect(questionCards.first()).toBeVisible({ timeout: 10_000 });

    // Add a new question and switch type to Coding
    await page.locator('.ca-bank-title button:has-text("Add Question")').click();
    const codingCard = questionCards.last();

    const typeSelect = codingCard.locator('label:has-text("Type") select');
    await expect(typeSelect).toBeVisible();
    await typeSelect.selectOption('Coding');

    await expect(codingCard).toContainText('Candidate Starter Code Boilerplate');
    const codeEditor = codingCard.locator('textarea[placeholder*="Starter code boilerplate"]');
    await expect(codeEditor).toBeVisible({ timeout: 5_000 });

    const sampleCode = 'function testSolution(input) {\n  return input * 2;\n}';
    await codeEditor.fill(sampleCode);
    await expect(codeEditor).toHaveValue(sampleCode);
  });

  // -------------------------------------------------------------------------
  // TC-RA-13: Access Control (Unauthenticated User Redirect)
  // -------------------------------------------------------------------------
  test('TC-RA-13: Unauthenticated user accessing recruiter assessment routes is redirected to /signin', async ({ page }) => {
    await page.goto('/signin', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    await page.goto('/recruiter/assessments', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/signin/, { timeout: 10_000 });
    await expect(page.locator('#email')).toBeVisible({ timeout: 5_000 });
    await expect(page.locator('#password')).toBeVisible();

    await page.goto('/recruiter/assessments/new', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/signin/, { timeout: 10_000 });
  });

  // -------------------------------------------------------------------------
  // TC-RA-14: Role-Based Authorization Guard (Candidate Blocked)
  // -------------------------------------------------------------------------
  test('TC-RA-14: Candidate role user attempting to access recruiter assessment routes is blocked', async ({ page }) => {
    await loginAsCandidate(page);

    await page.goto('/recruiter/assessments', { waitUntil: 'domcontentloaded' });
    await expect(page).not.toHaveURL(/\/recruiter\/assessments$/, { timeout: 10_000 });
    await expect(page.locator('.am-page__title')).toBeHidden();

    await page.goto('/recruiter/assessments/new', { waitUntil: 'domcontentloaded' });
    await expect(page).not.toHaveURL(/\/recruiter\/assessments\/new/, { timeout: 10_000 });
  });

});
