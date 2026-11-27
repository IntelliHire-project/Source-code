/**
 * tests/recruiter/tc-qb-002.spec.js
 *
 * Test Case ID: TC-QB-002
 * Test Scenario: Real-Time Search & Skill Tag Click Filtering in Question Bank
 *
 * Preconditions:
 *  - Application is running at http://localhost:8080
 *  - Seeded recruiter account exists (recruiter@intellihire.com / Recruiter@2026)
 *
 * Test Steps:
 *  1. Log in as recruiter and navigate to /recruiter/question-bank
 *  2. Record the initial Question Bank row count
 *  3. Type a live keyword/skill from the table into .am-search input
 *  4. Verify rows filter dynamically to matching results
 *  5. Type 'NonExistentQuestionXYZ999' and verify empty state ('No questions found')
 *  6. Clear search input and verify initial row count is restored
 *  7. Click a skill pill (.am-skill-pill) and verify search input auto-populates
 */

const { test, expect } = require('@playwright/test');
const {
  BASE_URL,
  DEMO_RECRUITER_EMAIL,
  DEMO_RECRUITER_PASSWORD,
} = require('../helpers/api');

async function loginAndOpenQuestionBank(page) {
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
      await page.addInitScript(({ token, user }) => {
        localStorage.setItem('intellihire_token', token);
        localStorage.setItem('intellihire_user', JSON.stringify(user));
      }, { token: data.token, user: data.user });
      await page.goto('/recruiter/question-bank', { waitUntil: 'domcontentloaded' });
      return;
    }
  } catch (err) {
    // Fallback to UI login
  }

  await page.goto('/signin', { waitUntil: 'domcontentloaded' });
  await page.locator('#email').fill(DEMO_RECRUITER_EMAIL);
  await page.locator('#password').fill(DEMO_RECRUITER_PASSWORD);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL('**/recruiter/**', { waitUntil: 'domcontentloaded', timeout: 12_000 });
  await page.goto('/recruiter/question-bank', { waitUntil: 'domcontentloaded' });
}

test.describe('TC-QB-002: Question Bank Search & Skill Tag Filtering Suite', () => {

  test('TC-QB-02: Filters questions in real time via search input, checks empty state, and filters by skill pill click', async ({ page }) => {
    // Step 1: Login and navigate to Question Bank
    await loginAndOpenQuestionBank(page);

    const rows = page.locator('.am-table tbody tr');
    await expect(rows.first()).toBeVisible({ timeout: 10_000 });

    // Step 2: Record initial row count
    const initialCount = await rows.count();
    expect(initialCount).toBeGreaterThanOrEqual(1);

    const searchInput = page.locator('.am-search input');
    await expect(searchInput).toBeVisible();

    // Determine a live keyword from the first row (skill pill or snippet word)
    const firstSkill = page.locator('.am-table tbody tr .am-skill-pill').first();
    const hasSkill = (await firstSkill.count()) > 0;
    let searchTerm = 'JavaScript';
    if (hasSkill) {
      searchTerm = (await firstSkill.textContent()).trim();
    } else {
      const snippetText = (await rows.first().locator('.am-q-snippet p').textContent()) || '';
      const firstWord = snippetText.trim().split(/\s+/).find(w => w.length > 3);
      if (firstWord) searchTerm = firstWord;
    }

    // Step 3 & 4: Filter by live keyword
    await searchInput.fill(searchTerm);
    await expect(rows.first()).toContainText(searchTerm);
    expect(await rows.count()).toBeLessThanOrEqual(initialCount);

    // Step 5: Test empty state on non-existent query
    await searchInput.fill('NonExistentQuestionXYZ999');
    const emptyState = page.locator('.am-table-empty');
    await expect(emptyState).toBeVisible();
    await expect(emptyState).toContainText('No questions found');

    // Step 6: Clear search and verify restoration
    await searchInput.fill('');
    await expect(rows).toHaveCount(initialCount);

    // Step 7: Click skill pill directly if available
    if (hasSkill) {
      await firstSkill.click();
      await expect(searchInput).toHaveValue(searchTerm);
      await expect(rows.first()).toContainText(searchTerm);
    }
  });

});
