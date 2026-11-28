/**
 * tests/candidate/mock-interview-jd-question-generation.spec.js
 *
 * Playwright End-to-End (E2E) test suite for IntelliHire
 * Role-Specific & Job-Description-Based AI Question Generation.
 *
 * Covers:
 *  - AI Job Description analysis (skills, responsibilities, experience requirements)
 *  - Stale-analysis detection when JD is edited
 *  - Role-specific + JD-based question generation on "Continue & Generate >"
 *  - Switching roles clears stale JD/questions and generates role-authentic questions
 *  - Generator parameter controls (focusType, difficulty, questionCount) & Regenerate Set
 *  - Single-question "Generate Again" producing a distinct JD-grounded question
 *  - Starting Mock Interview session from a generated question with tailored hint
 *  - Direct backend API E2E verification for analyze & generate-questions endpoints
 */

const { test, expect } = require('@playwright/test');
const {
  BASE_URL,
  DEMO_CANDIDATE_EMAIL,
  DEMO_CANDIDATE_PASSWORD,
  apiPost,
} = require('../helpers/api');

let cachedAuth = null;

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
    if (!res.ok || !data?.token) {
      throw new Error(`Candidate login failed [${res.status}]: ${JSON.stringify(data)}`);
    }
    cachedAuth = { token: data.token, user: data.user };
  }
  return cachedAuth;
}

async function loginAndNavigateToRoleSelection(page) {
  const auth = await getCandidateAuth();
  await page.addInitScript(({ token, user }) => {
    localStorage.setItem('intellihire_token', token);
    localStorage.setItem('intellihire_user', JSON.stringify(user));
  }, auth);

  await page.goto('/candidate/mock-interviews/roleselection', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.role-selection-container')).toBeVisible({ timeout: 12_000 });
}

async function selectRoleAndProceedToStep2(page, roleTitle = 'Backend Developer') {
  await loginAndNavigateToRoleSelection(page);

  const roleCard = page.locator('.role-card', { hasText: roleTitle });
  await expect(roleCard).toBeVisible({ timeout: 8_000 });
  await roleCard.click();

  const continueBtn = page.locator('.bottom-action-bar .continue-btn');
  await expect(continueBtn).toBeEnabled();
  await continueBtn.click();

  await expect(page.locator('.page-title')).toContainText('Provide a Job Description', { timeout: 8_000 });
  await expect(page.locator('.jd-textarea')).toBeVisible();
}

test.describe('Mock Interview — JD-Based AI Question Generation E2E Suite', () => {
  test.describe.configure({ timeout: 90_000 });

  test('TC-QG-01: Analyzes JD on Step 2 and displays extracted skills, responsibilities, and experience requirements', async ({ page }) => {
    await selectRoleAndProceedToStep2(page, 'Backend Developer');

    const richJd = [
      '# Position: Senior Backend Developer',
      '## Core Responsibilities',
      '- Architect and scale REST APIs and microservices using Node.js and PostgreSQL.',
      '- Optimize Redis caching and asynchronous event pipelines.',
      '## Experience Requirements',
      '- 5+ years of backend software engineering experience in production environments.',
      '- Bachelor degree in Computer Science or equivalent practical experience.',
      '- Required Skill: Docker, Kubernetes',
    ].join('\n');

    const textarea = page.locator('.jd-textarea');
    await textarea.fill(richJd);

    const analyzeBtn = page.locator('.jd-analyze-btn');
    await expect(analyzeBtn).toBeEnabled();
    await analyzeBtn.click();

    const analysisPanel = page.locator('.jd-analysis-panel');
    await expect(analysisPanel).toBeVisible({ timeout: 25_000 });
    await expect(analysisPanel.locator('.jd-analysis-body')).toBeVisible({ timeout: 30_000 });
    await expect(analysisPanel).toContainText('AI Job Description Analysis');
    await expect(analysisPanel.locator('.jd-source-pill')).toBeVisible();
    await expect(analysisPanel).toContainText('Extracted Technical Skills');
    await expect(analysisPanel).toContainText('Key Responsibilities');
    await expect(analysisPanel).toContainText('Experience Requirements');
    await expect(analysisPanel.locator('.jd-extracted-chip').first()).toBeVisible();
  });

  test('TC-QG-02: Editing JD after analysis displays stale-analysis indicator for re-analysis', async ({ page }) => {
    await selectRoleAndProceedToStep2(page, 'Backend Developer');

    const textarea = page.locator('.jd-textarea');
    await textarea.fill('Senior Backend Developer with Node.js, PostgreSQL, and 4+ years experience.');

    await page.locator('.jd-analyze-btn').click();
    await expect(page.locator('.jd-analysis-panel .jd-analysis-body')).toBeVisible({ timeout: 30_000 });
    await expect(page.locator('.jd-analysis-panel .jd-source-pill')).toBeVisible();

    await textarea.fill('Senior Backend Developer with Node.js, PostgreSQL, GraphQL, and 5+ years experience.');
    await expect(page.locator('.jd-stale-pill')).toBeVisible();
  });

  test('TC-QG-03: Submitting JD generates role-specific and JD-based questions with insights and session persistence', async ({ page }) => {
    await selectRoleAndProceedToStep2(page, 'Frontend Developer');

    const frontendJd = [
      '# Position: Senior Frontend Developer',
      '## Core Responsibilities',
      '- Build modular React and TypeScript user interfaces with strong Web Performance.',
      '- Collaborate with UI/UX designers to implement accessible design systems.',
      '## Experience Requirements',
      '- 3+ years of production frontend engineering experience with React and Next.js.',
    ].join('\n');

    await page.locator('.jd-textarea').fill(frontendJd);
    await page.locator('.bottom-action-bar .continue-btn').click();

    await expect(page).toHaveURL(/\/candidate\/mock-interviews\/questions/, { timeout: 45_000 });
    await expect(page.locator('.generated-questions-container')).toBeVisible({ timeout: 10_000 });

    // Wait for questions to finish generating if auto-loading
    await expect(page.locator('.question-card').first()).toBeVisible({ timeout: 25_000 });
    const count = await page.locator('.question-card').count();
    expect(count).toBe(5);

    // Verify JD analysis summary card and expandable insights
    const analysisCard = page.locator('.gq-jd-analysis-card');
    await expect(analysisCard).toBeVisible({ timeout: 15_000 });
    await analysisCard.locator('.gq-jd-toggle-btn').click();
    await expect(analysisCard.locator('.gq-jd-details')).toBeVisible();
    await expect(analysisCard).toContainText('Key Responsibilities');
    await expect(analysisCard).toContainText('Experience Requirements');

    // Verify role alignment & JD reference badges on question cards
    await expect(page.locator('.question-card .role-align-badge').first()).toContainText('Frontend Developer');
    await expect(page.locator('.question-card .jd-ref-badge').first()).toBeVisible();

    // Verify sessionStorage persistence
    const storedQuestionsRaw = await page.evaluate(() =>
      sessionStorage.getItem('mock_interview_generated_questions')
    );
    expect(storedQuestionsRaw).toBeTruthy();
    const storedQuestions = JSON.parse(storedQuestionsRaw);
    expect(storedQuestions.roleId).toBe('frontend');
    expect(storedQuestions.questions).toHaveLength(5);
  });

  test('TC-QG-04: Switching to UI/UX Designer clears stale context and generates design-specific questions', async ({ page }) => {
    await loginAndNavigateToRoleSelection(page);

    // First select Frontend Developer and proceed to Step 2
    await page.locator('.role-card', { hasText: 'Frontend Developer' }).click();
    await page.locator('.bottom-action-bar .continue-btn').click();
    await expect(page.locator('.page-title')).toContainText('Provide a Job Description');

    // Switch back and select UI/UX Designer
    await page.locator('.change-role-btn').click();
    await expect(page.locator('.page-title')).toContainText('Select Job Role');

    await page.locator('.role-card', { hasText: 'UI/UX Designer' }).click();
    await page.locator('.bottom-action-bar .continue-btn').click();
    await expect(page.locator('.selected-role-title')).toContainText('UI/UX Designer');

    const designJd = [
      '# Position: Product UI/UX Designer',
      '## Core Responsibilities',
      '- Create wireframes, interactive Figma prototypes, and scalable Design Systems.',
      '- Conduct User Research and usability testing across mobile and web flows.',
      '## Experience Requirements',
      '- 3+ years of UI/UX design experience shipping consumer web products.',
    ].join('\n');

    await page.locator('.jd-textarea').fill(designJd);
    await page.locator('.bottom-action-bar .continue-btn').click();

    await expect(page).toHaveURL(/\/candidate\/mock-interviews\/questions/, { timeout: 45_000 });
    await expect(page.locator('.question-card .role-align-badge').first()).toContainText('UI/UX Designer', {
      timeout: 25_000,
    });
  });

  test('TC-QG-05: Adjusting Generator Parameters (focus, difficulty, count) regenerates tailored question set', async ({ page }) => {
    await selectRoleAndProceedToStep2(page, 'QA Engineer');

    const qaJd = [
      '# Position: QA Automation Engineer',
      '## Core Responsibilities',
      '- Build reliable automated E2E suites using Playwright and Jest in CI/CD.',
      '## Experience Requirements',
      '- 3+ years of automated QA and API testing experience.',
    ].join('\n');

    await page.locator('.jd-textarea').fill(qaJd);
    await page.locator('.bottom-action-bar .continue-btn').click();
    await expect(page).toHaveURL(/\/candidate\/mock-interviews\/questions/, { timeout: 45_000 });
    await expect(page.locator('.question-card')).toHaveCount(5, { timeout: 25_000 });

    // Open Generator Parameters panel
    await page.locator('.gq-params-toggle-btn').click();
    await expect(page.locator('.gq-generator-panel')).toBeVisible();

    await page.locator('#gq-focus-select').selectOption('technical');
    await page.locator('#gq-difficulty-select').selectOption('hard');
    await page.locator('#gq-count-select').selectOption('3');

    await page.locator('.gq-apply-params-btn').click();

    // Verify updated count and difficulty badges
    await expect(page.locator('.question-card')).toHaveCount(3, { timeout: 45_000 });
    const diffBadges = page.locator('.question-card .difficulty-badge');
    for (let i = 0; i < 3; i++) {
      await expect(diffBadges.nth(i)).toContainText('Hard');
    }
  });

  test('TC-QG-06: Single-question "Generate Again" replaces question with a fresh JD-grounded question', async ({ page }) => {
    await selectRoleAndProceedToStep2(page, 'Data Analyst');

    const dataJd = [
      '# Position: Senior Data Analyst',
      '## Core Responsibilities',
      '- Build SQL data models and Tableau executive dashboards.',
      '- Partner with product leads on statistical experimentation and KPI definitions.',
      '## Experience Requirements',
      '- 4+ years of experience with SQL, Python, and data visualization.',
    ].join('\n');

    await page.locator('.jd-textarea').fill(dataJd);
    await page.locator('.bottom-action-bar .continue-btn').click();
    await expect(page).toHaveURL(/\/candidate\/mock-interviews\/questions/, { timeout: 45_000 });

    const firstCard = page.locator('.question-card').first();
    await expect(firstCard).toBeVisible({ timeout: 25_000 });
    const originalText = (await firstCard.locator('.question-description').textContent()).trim();

    await firstCard.locator('.card-action-btn.generate-btn').click();

    await expect(async () => {
      const updatedText = (await firstCard.locator('.question-description').textContent()).trim();
      expect(updatedText.length).toBeGreaterThan(20);
      expect(updatedText).not.toContain('[Updated Variant]');
      expect(updatedText).not.toBe(originalText);
    }).toPass({ timeout: 25_000 });
  });

  test('TC-QG-07: Starting interview from a generated question forwards role, question, and hint to session', async ({ page }) => {
    await selectRoleAndProceedToStep2(page, 'Backend Developer');

    await page
      .locator('.jd-textarea')
      .fill('Backend Developer building Node.js REST APIs and PostgreSQL schemas with 2+ years experience.');
    await page.locator('.bottom-action-bar .continue-btn').click();
    await expect(page).toHaveURL(/\/candidate\/mock-interviews\/questions/, { timeout: 45_000 });

    const firstCard = page.locator('.question-card').first();
    await expect(firstCard).toBeVisible({ timeout: 25_000 });
    const expectedQuestion = (await firstCard.locator('.question-description').textContent()).trim();

    await firstCard.locator('.card-action-btn.start-btn').click();
    await expect(page).toHaveURL(/\/candidate\/mock-interviews\/session/, { timeout: 10_000 });

    await expect(page.locator('.session-role-title')).toContainText('Backend Developer Interview');
    await expect(page.locator('.question-prompt-text')).toHaveText(expectedQuestion);

    // Open guidance hint modal
    await page.locator('.hint-help-btn').click();
    await expect(page.locator('.modal-box')).toBeVisible();
    const hintText = (await page.locator('.modal-box .modal-body p').textContent()).trim();
    expect(hintText.length).toBeGreaterThan(15);
  });
});

test.describe('Mock Interview — JD Question Generation Backend API E2E', () => {
  test.describe.configure({ timeout: 90_000 });
  let candidateToken;

  test.beforeAll(async () => {
    const auth = await getCandidateAuth();
    candidateToken = auth.token;
  });

  test('TC-QG-API-01: POST /mock-interviews/job-descriptions/analyze extracts skills, responsibilities, and experience', async () => {
    const res = await apiPost(
      '/mock-interviews/job-descriptions/analyze',
      {
        roleId: 'backend',
        roleTitle: 'Backend Developer',
        category: 'engineering',
        jobDescription: [
          '# Position: Senior Backend Developer',
          '## Core Responsibilities',
          '- Design scalable REST APIs with Node.js and PostgreSQL.',
          '## Experience Requirements',
          '- 5+ years of backend engineering experience.',
        ].join('\n'),
      },
      candidateToken
    );

    expect(res.working).toBe(true);
    expect(res.analysis).toBeDefined();
    expect(res.analysis.technicalSkills).toEqual(expect.arrayContaining(['Node.js', 'PostgreSQL']));
    expect(res.analysis.responsibilities.length).toBeGreaterThanOrEqual(1);
    expect(res.analysis.experienceRequirements.length).toBeGreaterThanOrEqual(1);
    expect(res.analysis.yearsOfExperience).toMatch(/5\+\s*years/i);
  });

  test('TC-QG-API-02: POST /mock-interviews/questions/generate returns role-specific and JD-based questions', async () => {
    const res = await apiPost(
      '/mock-interviews/questions/generate',
      {
        roleId: 'qa',
        roleTitle: 'QA Engineer',
        category: 'qa',
        jobDescription:
          'QA Engineer automating Playwright and Jest suites with 3+ years CI/CD testing experience.',
        questionCount: 3,
        focusType: 'technical',
        difficulty: 'medium',
      },
      candidateToken
    );

    expect(res.working).toBe(true);
    expect(res.questions).toHaveLength(3);
    expect(res.roleProfile.roleId).toBe('qa');
    expect(res.parameters).toEqual({
      questionCount: 3,
      focusType: 'technical',
      difficulty: 'medium',
    });
    res.questions.forEach((q) => {
      expect(q.roleAlignment).toBe('QA Engineer');
      expect(q.difficulty).toBe('Medium');
      expect(q.jdReference).toBeTruthy();
      expect(q.description).toBeTruthy();
      expect(q.hint).toBeTruthy();
    });
  });

  test('TC-QG-API-03: Rejects empty payload with 400 validation error', async () => {
    const res = await fetch(`${BASE_URL}/mock-interviews/questions/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${candidateToken}`,
      },
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.working).toBe(false);
  });
});
