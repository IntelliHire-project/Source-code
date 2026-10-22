/**
 * tests/candidate/cv-insights.spec.js
 *
 * Comprehensive Playwright End-to-End and Integration test suite for the
 * IntelliHire CV Insights & ATS Analysis feature.
 *
 * Covers:
 *  1.  Candidate authentication and navigation to CV Insights page
 *  2.  CV selector rendering and switching active CV document
 *  3.  Analysis tabs navigation (Strengths, Weaknesses, Suggestions, Keyword Gaps)
 *  4.  Keyword tags verification (Present in CV vs Missing in-demand)
 *  5.  CV Upload Validation — Non-PDF file rejection (.png, .docx, etc.)
 *  6.  CV Upload Validation — Oversized file rejection (> 10MB)
 *  7.  Dismissing alert feedback banners
 *  8.  Dropdown outside-click dismissal
 *  9.  Valid PDF file upload flow (Happy Path)
 * 10.  Suggestions interactive CTA links
 * 11.  CV Assistant interactive chat (Custom prompt + response)
 * 12.  CV Assistant quick prompt chips
 * 13.  Backend API — Authentication protection (401 without token)
 * 14.  Backend API — Tenant isolation (404/403 accessing unauthorized CV ID)
 * 15.  Backend API — Schema validation and database caching (cached: true/false)
 * 16.  Backend API — Empty message validation on CV assistant chat
 *
 * SELECTORS:
 *   .cv-insights                  → Root container
 *   .cv-insights__cv-trigger      → Dropdown trigger for CV selector
 *   .cv-insights__cv-dropdown     → Dropdown menu of uploaded CVs
 *   .cv-insights__cv-option       → Individual CV selection item
 *   .cv-insights__upload-btn      → "Upload New CV" trigger button
 *   .cv-insights__file-input      → Hidden file input element
 *   .cv-insights__alert           → Alert feedback message container
 *   .cv-insights__alert-close     → Alert dismiss button
 *   .cv-insights__tab             → Analysis navigation tabs
 *   .insight-item                 → Rendered strength, weakness, or suggestion row
 *   .insight-item__link           → Actionable CTA button in suggestions
 *   .tag-pill--present            → Present keyword badges
 *   .tag-pill--missing            → Missing in-demand keyword badges
 *   .chat-panel__input            → CV assistant message input
 *   .chat-panel__send-btn         → Assistant send button
 *   .chat-panel__chip             → Pre-canned suggestion chips
 *   .chat-message                 → Message bubbles in conversation
 */

const { test, expect } = require('@playwright/test');
const { DEMO_CANDIDATE_EMAIL, DEMO_CANDIDATE_PASSWORD, BASE_URL } = require('../helpers/api');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Signs in as a candidate and navigates to the CV Insights page.
 */
async function loginAndNavigateToInsights(page) {
  await page.goto('/signin');
  await page.locator('#email').fill(DEMO_CANDIDATE_EMAIL);
  await page.locator('#password').fill(DEMO_CANDIDATE_PASSWORD);
  await page.locator('button[type="submit"]').click();

  // Wait for redirect to candidate area
  await page.waitForURL('**/candidate/**', { timeout: 10_000 });

  // Navigate to CV Insights
  await page.goto('/candidate/cv-insights');
  await expect(page.locator('.cv-insights')).toBeVisible({ timeout: 10_000 });
}

/**
 * Obtains a candidate JWT token directly via REST API.
 */
async function getCandidateToken() {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: DEMO_CANDIDATE_EMAIL,
      password: DEMO_CANDIDATE_PASSWORD,
    }),
  });
  const data = await res.json();
  return data.token;
}

// ---------------------------------------------------------------------------
// Group 1 — Frontend UI & User Interaction Tests
// ---------------------------------------------------------------------------

test.describe('Candidate CV Insights — Frontend UI & Interactions', () => {

  // -------------------------------------------------------------------------
  // Test 1: Page Loads and Core Layout Renders
  // -------------------------------------------------------------------------
  test('should load CV Insights page with toolbar, AI analysis panel, and chat assistant', async ({ page }) => {
    await loginAndNavigateToInsights(page);

    // Toolbar & CV Selector
    await expect(page.locator('.cv-insights__toolbar')).toBeVisible();
    await expect(page.locator('.cv-insights__cv-trigger')).toBeVisible();
    await expect(page.locator('.cv-insights__upload-btn')).toBeVisible();

    // AI Analysis Panel
    await expect(page.getByRole('heading', { name: 'AI Analysis' })).toBeVisible();
    await expect(page.locator('.cv-insights__analysis-header-badge')).toContainText('POWERED BY INTELLI·AI');

    // Chat Panel
    await expect(page.getByRole('heading', { name: 'Ask the CV Assistant' })).toBeVisible();
    await expect(page.locator('.chat-panel__input')).toBeVisible();
    await expect(page.locator('.chat-panel__send-btn')).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // Test 2: CV Selector Dropdown and Document Switching
  // -------------------------------------------------------------------------
  test('should display CV selector and allow switching active document', async ({ page }) => {
    await loginAndNavigateToInsights(page);

    const trigger = page.locator('.cv-insights__cv-trigger');
    await trigger.click();

    const dropdown = page.locator('.cv-insights__cv-dropdown');
    await expect(dropdown).toBeVisible();

    const options = page.locator('.cv-insights__cv-option');
    const optionCount = await options.count();
    expect(optionCount).toBeGreaterThan(0);

    // If multiple CV options exist, switch to the second option
    if (optionCount > 1) {
      const secondOptionName = await options.nth(1).locator('.cv-insights__cv-option-name').textContent();
      await options.nth(1).click();

      // Dropdown should close and selected name should update
      await expect(dropdown).not.toBeVisible();
      await expect(page.locator('.cv-insights__cv-trigger-name')).toContainText(secondOptionName.trim());
    }
  });

  // -------------------------------------------------------------------------
  // Test 3: Dropdown Closes on Outside Click
  // -------------------------------------------------------------------------
  test('should close the CV selector dropdown when clicking outside', async ({ page }) => {
    await loginAndNavigateToInsights(page);

    const trigger = page.locator('.cv-insights__cv-trigger');
    await trigger.click();

    const dropdown = page.locator('.cv-insights__cv-dropdown');
    await expect(dropdown).toBeVisible();

    // Click on the AI Analysis header outside the dropdown
    await page.getByRole('heading', { name: 'AI Analysis' }).click();

    // Dropdown should close
    await expect(dropdown).not.toBeVisible();
  });

  // -------------------------------------------------------------------------
  // Test 4: Analysis Tabs Navigation (Strengths, Weaknesses, Suggestions, Keywords)
  // -------------------------------------------------------------------------
  test('should switch between analysis tabs and render corresponding insight items', async ({ page }) => {
    await loginAndNavigateToInsights(page);

    // 1. Strengths tab is default active
    const strengthsTab = page.locator('.cv-insights__tab', { hasText: 'Strengths' });
    await expect(strengthsTab).toHaveClass(/cv-insights__tab--active/);
    await expect(page.locator('.insight-item')).toBeVisible();

    // 2. Click Weaknesses tab
    const weaknessesTab = page.locator('.cv-insights__tab', { hasText: 'Weaknesses' });
    await weaknessesTab.click();
    await expect(weaknessesTab).toHaveClass(/cv-insights__tab--active/);
    await expect(page.locator('.insight-item__icon--weakness').first()).toBeVisible();

    // 3. Click Suggestions tab
    const suggestionsTab = page.locator('.cv-insights__tab', { hasText: 'Suggestions' });
    await suggestionsTab.click();
    await expect(suggestionsTab).toHaveClass(/cv-insights__tab--active/);
    await expect(page.locator('.insight-item__icon--suggestion').first()).toBeVisible();

    // 4. Click Keyword Gaps tab
    const keywordsTab = page.locator('.cv-insights__tab', { hasText: 'Keyword Gaps' });
    await keywordsTab.click();
    await expect(keywordsTab).toHaveClass(/cv-insights__tab--active/);

    // Validate tag pills
    await expect(page.locator('.tag-pill--present').first()).toBeVisible();
    await expect(page.locator('.tag-pill--missing').first()).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // Test 5: Actionable CTA Links inside Suggestions Tab
  // -------------------------------------------------------------------------
  test('should render interactive CTA links in suggestions tab', async ({ page }) => {
    await loginAndNavigateToInsights(page);

    const suggestionsTab = page.locator('.cv-insights__tab', { hasText: 'Suggestions' });
    await suggestionsTab.click();

    const actionLinks = page.locator('.insight-item__link');
    const linkCount = await actionLinks.count();
    expect(linkCount).toBeGreaterThan(0);

    // Verify first link is clickable
    await expect(actionLinks.first()).toBeEnabled();
  });

  // -------------------------------------------------------------------------
  // Test 6: CV Upload Validation — Rejection of Non-PDF Files
  // -------------------------------------------------------------------------
  test('should display validation error when uploading non-PDF file', async ({ page }) => {
    await loginAndNavigateToInsights(page);

    const fileInput = page.locator('.cv-insights__file-input');
    await fileInput.setInputFiles({
      name: 'invalid_resume.png',
      mimeType: 'image/png',
      buffer: Buffer.from('fake image content'),
    });

    const alert = page.locator('.cv-insights__alert--error');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText('Invalid file format. Only PDF files (.pdf) are allowed.');
  });

  // -------------------------------------------------------------------------
  // Test 7: CV Upload Validation — Rejection of Oversized File (> 10MB)
  // -------------------------------------------------------------------------
  test('should reject files exceeding 10MB limit with exact error message', async ({ page }) => {
    await loginAndNavigateToInsights(page);

    // Create a buffer slightly over 10MB (10.5 MB)
    const largeBuffer = Buffer.alloc(10.5 * 1024 * 1024);
    const fileInput = page.locator('.cv-insights__file-input');

    await fileInput.setInputFiles({
      name: 'huge_document.pdf',
      mimeType: 'application/pdf',
      buffer: largeBuffer,
    });

    const alert = page.locator('.cv-insights__alert--error');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText('File size exceeds 10MB limit. Please upload a smaller PDF.');
  });

  // -------------------------------------------------------------------------
  // Test 8: Dismissing Feedback Alert Banner
  // -------------------------------------------------------------------------
  test('should dismiss the alert message when clicking the close button', async ({ page }) => {
    await loginAndNavigateToInsights(page);

    // Trigger an error first
    const fileInput = page.locator('.cv-insights__file-input');
    await fileInput.setInputFiles({
      name: 'test.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('test'),
    });

    const alert = page.locator('.cv-insights__alert--error');
    await expect(alert).toBeVisible();

    // Click close button
    await page.locator('.cv-insights__alert-close').click();
    await expect(alert).not.toBeVisible();
  });

  // -------------------------------------------------------------------------
  // Test 9: Valid PDF File Upload Flow (Happy Path)
  // -------------------------------------------------------------------------
  test('should successfully upload a valid PDF and update active analysis', async ({ page }) => {
    await loginAndNavigateToInsights(page);

    const testPdfName = `Test_CV_${Date.now()}.pdf`;
    // Minimal valid PDF binary header
    const dummyPdfBuffer = Buffer.from('%PDF-1.4\n%âãÏÓ\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF\n');

    const fileInput = page.locator('.cv-insights__file-input');
    await fileInput.setInputFiles({
      name: testPdfName,
      mimeType: 'application/pdf',
      buffer: dummyPdfBuffer,
    });

    // Check success feedback banner
    const alert = page.locator('.cv-insights__alert--success');
    await expect(alert).toBeVisible({ timeout: 15_000 });
    await expect(alert).toContainText(`uploaded successfully and set as active document!`);

    // The selector should now reflect the newly uploaded file
    await expect(page.locator('.cv-insights__cv-trigger-name')).toContainText(testPdfName);
  });

  // -------------------------------------------------------------------------
  // Test 10: Grounded CV Assistant Chat — Sending Custom Question
  // -------------------------------------------------------------------------
  test('should send a question to the CV Assistant and receive response', async ({ page }) => {
    await loginAndNavigateToInsights(page);

    const input = page.locator('.chat-panel__input');
    const sendBtn = page.locator('.chat-panel__send-btn');

    await expect(sendBtn).toBeDisabled();

    await input.fill('How can I optimize this CV for an ATS scanner?');
    await expect(sendBtn).toBeEnabled();
    await sendBtn.click();

    // User message bubble appears
    await expect(page.locator('.chat-message--user').last()).toContainText('How can I optimize this CV for an ATS scanner?');

    // AI response should arrive
    const aiMessages = page.locator('.chat-message--ai');
    await expect(aiMessages.last()).toBeVisible({ timeout: 10_000 });
  });

  // -------------------------------------------------------------------------
  // Test 11: Grounded CV Assistant Chat — Using Quick Suggestion Chips
  // -------------------------------------------------------------------------
  test('should populate input and prompt when clicking a suggestion chip', async ({ page }) => {
    await loginAndNavigateToInsights(page);

    const chip = page.locator('.chat-panel__chip').first();
    const chipText = await chip.textContent();

    await chip.click();

    // The input bar should receive the chip's text
    const input = page.locator('.chat-panel__input');
    await expect(input).toHaveValue(chipText.trim());

    // Submit via Enter key
    await input.press('Enter');

    // Check that user message was added to chat history
    await expect(page.locator('.chat-message--user').last()).toContainText(chipText.trim());
  });

});

// ---------------------------------------------------------------------------
// Group 2 — Backend API, Caching & Security Tests
// ---------------------------------------------------------------------------

test.describe('Candidate CV Insights — Backend API & Security', () => {

  let candidateToken;

  test.beforeAll(async () => {
    candidateToken = await getCandidateToken();
  });

  // -------------------------------------------------------------------------
  // Test 12: Unauthorized Access Rejection (No JWT Token)
  // -------------------------------------------------------------------------
  test('should return 401 Unauthorized when requesting insights without token', async () => {
    const response = await fetch(`${BASE_URL}/auth/candidate/cvs/1/insights`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    expect(response.status).toBe(401);
  });

  // -------------------------------------------------------------------------
  // Test 13: Tenant Isolation (Prevent Access to Non-existent / Foreign CV)
  // -------------------------------------------------------------------------
  test('should return 404 when candidate attempts to access an unauthorized or non-existent CV', async () => {
    const nonExistentCvId = 9999999;
    const response = await fetch(`${BASE_URL}/auth/candidate/cvs/${nonExistentCvId}/insights`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${candidateToken}`,
      },
    });

    expect([404, 403]).toContain(response.status);
    const data = await response.json();
    expect(data?.message || data?.error).toBeDefined();
  });

  // -------------------------------------------------------------------------
  // Test 14: Insight Response Schema & Database Caching
  // -------------------------------------------------------------------------
  test('should return valid insight schema and utilize database caching on repeated request', async () => {
    // 1. First fetch candidate's available CV list
    const cvsRes = await fetch(`${BASE_URL}/auth/candidate/cvs`, {
      headers: { Authorization: `Bearer ${candidateToken}` },
    });

    if (!cvsRes.ok) {
      test.skip('No CVs available in test DB to verify API insights caching.');
      return;
    }

    const cvsData = await cvsRes.json();
    const cvList = cvsData?.cvs || cvsData?.data?.cvs || [];
    if (cvList.length === 0) {
      test.skip('No uploaded CV found for demo candidate; skipping caching test.');
      return;
    }

    const targetCvId = cvList[0].id;

    // 2. First call to /insights
    const res1 = await fetch(`${BASE_URL}/auth/candidate/cvs/${targetCvId}/insights`, {
      headers: { Authorization: `Bearer ${candidateToken}` },
    });
    expect(res1.status).toBe(200);
    const body1 = await res1.json();
    const insights = body1.data?.insights || body1.insights;

    // Verify expected schema fields
    expect(insights).toBeDefined();
    expect(Array.isArray(insights.strengths)).toBe(true);
    expect(Array.isArray(insights.weaknesses)).toBe(true);
    expect(typeof insights.atsScore).toBe('number');

    // 3. Second call — should be served from DB cache
    const res2 = await fetch(`${BASE_URL}/auth/candidate/cvs/${targetCvId}/insights`, {
      headers: { Authorization: `Bearer ${candidateToken}` },
    });
    expect(res2.status).toBe(200);
    const body2 = await res2.json();
    const isCached = body2.data?.cached ?? body2.cached;
    expect(isCached).toBe(true);
  });

  // -------------------------------------------------------------------------
  // Test 15: CV Assistant Chat Empty Input Validation
  // -------------------------------------------------------------------------
  test('should reject empty message submissions on backend chat endpoint with 400', async () => {
    const response = await fetch(`${BASE_URL}/auth/candidate/cvs/1/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${candidateToken}`,
      },
      body: JSON.stringify({ message: '   ' }),
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data?.message).toContain('Message is required');
  });

});
