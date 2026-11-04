/**
 * End-to-end and integration test suite for the IntelliHire CV Insights feature.
 * Validates document switching, ATS analysis display, file upload constraints,
 * conversational AI assistant, and backend API security.
 */

const { test, expect } = require('@playwright/test');
const { DEMO_CANDIDATE_EMAIL, DEMO_CANDIDATE_PASSWORD, BASE_URL } = require('../helpers/api');

/**
 * Signs in as a candidate and navigates to the CV Insights page.
 */
async function loginAndNavigateToInsights(page) {
  await page.goto('/signin');
  await page.locator('#email').fill(DEMO_CANDIDATE_EMAIL);
  await page.locator('#password').fill(DEMO_CANDIDATE_PASSWORD);
  await page.locator('button[type="submit"]').click();

  await page.waitForURL('**/candidate/**', { timeout: 10_000 });

  await page.goto('/candidate/cv-insights');
  await expect(page.locator('.cv-insights')).toBeVisible({ timeout: 10_000 });
}

/**
 * Obtains a candidate JWT token directly via REST API for API-level assertions.
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

test.describe('Candidate CV Insights — Frontend UI & Interactions', () => {

  test('should load CV Insights page with toolbar, AI analysis panel, and chat assistant', async ({ page }) => {
    await loginAndNavigateToInsights(page);

    await expect(page.locator('.cv-insights__toolbar')).toBeVisible();
    await expect(page.locator('.cv-insights__cv-trigger')).toBeVisible();
    await expect(page.locator('.cv-insights__upload-btn')).toBeVisible();

    await expect(page.getByRole('heading', { name: 'AI Analysis' })).toBeVisible();
    await expect(page.locator('.cv-insights__analysis-header-badge')).toContainText('POWERED BY INTELLI·AI');

    await expect(page.getByRole('heading', { name: 'Ask the CV Assistant' })).toBeVisible();
    await expect(page.locator('.chat-panel__input')).toBeVisible();
    await expect(page.locator('.chat-panel__send-btn')).toBeVisible();
  });

  test('should display CV selector and allow switching active document', async ({ page }) => {
    await loginAndNavigateToInsights(page);

    const trigger = page.locator('.cv-insights__cv-trigger');
    await trigger.click();

    const dropdown = page.locator('.cv-insights__cv-dropdown');
    await expect(dropdown).toBeVisible();

    const options = page.locator('.cv-insights__cv-option');
    const optionCount = await options.count();
    expect(optionCount).toBeGreaterThan(0);

    if (optionCount > 1) {
      const secondOptionName = await options.nth(1).locator('.cv-insights__cv-option-name').textContent();
      await options.nth(1).click();

      await expect(dropdown).not.toBeVisible();
      await expect(page.locator('.cv-insights__cv-trigger-name')).toContainText(secondOptionName.trim());
    }
  });

  test('should close the CV selector dropdown when clicking outside', async ({ page }) => {
    await loginAndNavigateToInsights(page);

    const trigger = page.locator('.cv-insights__cv-trigger');
    await trigger.click();

    const dropdown = page.locator('.cv-insights__cv-dropdown');
    await expect(dropdown).toBeVisible();

    await page.locator('body').click({ position: { x: 5, y: 5 } });
    await expect(dropdown).not.toBeVisible();
  });

  test('should switch between analysis tabs and render corresponding insight items', async ({ page }) => {
    await loginAndNavigateToInsights(page);

    // Strengths tab is active by default
    const strengthsTab = page.locator('.cv-insights__tab', { hasText: 'Strengths' });
    await expect(strengthsTab).toHaveClass(/cv-insights__tab--active/);
    await expect(page.locator('.insight-item').first()).toBeVisible();

    // Weaknesses tab
    const weaknessesTab = page.locator('.cv-insights__tab', { hasText: 'Weaknesses' });
    await weaknessesTab.click();
    await expect(weaknessesTab).toHaveClass(/cv-insights__tab--active/);
    await expect(page.locator('.insight-item__icon--weakness').first()).toBeVisible();

    // Suggestions tab
    const suggestionsTab = page.locator('.cv-insights__tab', { hasText: 'Suggestions' });
    await suggestionsTab.click();
    await expect(suggestionsTab).toHaveClass(/cv-insights__tab--active/);
    await expect(page.locator('.insight-item__icon--suggestion').first()).toBeVisible();

    // Keyword Gaps tab
    const keywordsTab = page.locator('.cv-insights__tab', { hasText: 'Keyword Gaps' });
    await keywordsTab.click();
    await expect(keywordsTab).toHaveClass(/cv-insights__tab--active/);

    await expect(page.locator('.tag-pill--present').first()).toBeVisible();
    await expect(page.locator('.tag-pill--missing').first()).toBeVisible();
  });

  test('should render interactive CTA links in suggestions tab', async ({ page }) => {
    await loginAndNavigateToInsights(page);

    const suggestionsTab = page.locator('.cv-insights__tab', { hasText: 'Suggestions' });
    await suggestionsTab.click();

    const actionLinks = page.locator('.insight-item__link');
    const linkCount = await actionLinks.count();
    expect(linkCount).toBeGreaterThan(0);

    await expect(actionLinks.first()).toBeEnabled();
  });

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

  test('should reject files exceeding 5MB limit with exact error message', async ({ page }) => {
    await loginAndNavigateToInsights(page);

    // Buffer slightly over 5MB limit
    const largeBuffer = Buffer.alloc(5.5 * 1024 * 1024);
    const fileInput = page.locator('.cv-insights__file-input');

    await fileInput.setInputFiles({
      name: 'huge_document.pdf',
      mimeType: 'application/pdf',
      buffer: largeBuffer,
    });

    const alert = page.locator('.cv-insights__alert--error');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText('File size exceeds 5MB limit. Please upload a smaller PDF.');
  });

  test('should dismiss the alert message when clicking the close button', async ({ page }) => {
    await loginAndNavigateToInsights(page);

    const fileInput = page.locator('.cv-insights__file-input');
    await fileInput.setInputFiles({
      name: 'test.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('test'),
    });

    const alert = page.locator('.cv-insights__alert--error');
    await expect(alert).toBeVisible();

    await page.locator('.cv-insights__alert-close').click();
    await expect(alert).not.toBeVisible();
  });

  test('should successfully upload a valid PDF and update active analysis', async ({ page }) => {
    await loginAndNavigateToInsights(page);

    const testPdfName = `Test_CV_${Date.now()}.pdf`;
    const dummyPdfBuffer = Buffer.from('%PDF-1.4\n%âãÏÓ\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF\n');

    const fileInput = page.locator('.cv-insights__file-input');
    await fileInput.setInputFiles({
      name: testPdfName,
      mimeType: 'application/pdf',
      buffer: dummyPdfBuffer,
    });

    const alert = page.locator('.cv-insights__alert--success');
    await expect(alert).toBeVisible({ timeout: 15_000 });
    await expect(alert).toContainText('uploaded successfully and set as active document!');

    await expect(page.locator('.cv-insights__cv-trigger-name')).toContainText(testPdfName);
  });

  test('should send a question to the CV Assistant and receive response', async ({ page }) => {
    await loginAndNavigateToInsights(page);

    const input = page.locator('.chat-panel__input');
    const sendBtn = page.locator('.chat-panel__send-btn');

    await expect(sendBtn).toBeDisabled();

    await input.fill('How can I optimize this CV for an ATS scanner?');
    await expect(sendBtn).toBeEnabled();
    await sendBtn.click();

    await expect(page.locator('.chat-message--user').last()).toContainText('How can I optimize this CV for an ATS scanner?');

    const aiMessages = page.locator('.chat-message--ai');
    await expect(aiMessages.last()).toBeVisible({ timeout: 10_000 });
  });

  test('should populate input and prompt when clicking a suggestion chip', async ({ page }) => {
    await loginAndNavigateToInsights(page);

    const chip = page.locator('.chat-panel__chip').first();
    const chipText = await chip.textContent();

    await chip.click();

    const input = page.locator('.chat-panel__input');
    await expect(input).toHaveValue(chipText.trim());

    await input.press('Enter');

    await expect(page.locator('.chat-message--user').last()).toContainText(chipText.trim());
  });

});

test.describe('Candidate CV Insights — Backend API & Security', () => {

  let candidateToken;

  test.beforeAll(async () => {
    candidateToken = await getCandidateToken();
  });

  test('should return 401 Unauthorized when requesting insights without token', async () => {
    const response = await fetch(`${BASE_URL}/auth/candidate/cvs/1/insights`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    expect(response.status).toBe(401);
  });

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

  test('should return valid insight schema and utilize database caching on repeated request', async () => {
    test.setTimeout(60_000);

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

    const targetCv = cvList.find((c) => c.insights) || cvList[0];
    const targetCvId = targetCv.id;

    // Initial request
    const res1 = await fetch(`${BASE_URL}/auth/candidate/cvs/${targetCvId}/insights`, {
      headers: { Authorization: `Bearer ${candidateToken}` },
    });
    expect(res1.status).toBe(200);
    const body1 = await res1.json();
    const insights = body1.data?.insights || body1.insights;

    expect(insights).toBeDefined();
    expect(Array.isArray(insights.strengths)).toBe(true);
    expect(Array.isArray(insights.weaknesses)).toBe(true);
    expect(typeof insights.atsScore).toBe('number');

    // Second request should be served from PostgreSQL cache
    const res2 = await fetch(`${BASE_URL}/auth/candidate/cvs/${targetCvId}/insights`, {
      headers: { Authorization: `Bearer ${candidateToken}` },
    });
    expect(res2.status).toBe(200);
    const body2 = await res2.json();
    const isCached = body2.data?.cached ?? body2.cached;
    expect(isCached).toBe(true);
  });

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
