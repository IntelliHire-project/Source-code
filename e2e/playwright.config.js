// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Playwright configuration for IntelliHire E2E tests.
 *
 * The application is served via Docker + nginx at http://localhost:8080.
 * All tests hit the real running stack — no mocks, no stubs.
 *
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  // Directory where test files live
  testDir: './tests',

  // Run tests in each file in parallel (within one file they run sequentially)
  fullyParallel: false,

  // Fail the build on CI if you accidentally left `test.only` in source
  forbidOnly: !!process.env.CI,

  // Retry once on CI, never locally (so failures are fast to see locally)
  retries: process.env.CI ? 1 : 0,

  // One worker at a time — auth tests share state (the DB), so keep them sequential
  workers: 1,

  // Reporter: HTML report (open with `npm run test:report`) + console summary
  reporter: [['html', { open: 'never' }], ['list']],

  use: {
    // The base URL of the running application (Docker full-stack via nginx)
    baseURL: 'http://localhost:8080',

    // Capture a screenshot automatically when a test fails — very helpful for debugging
    screenshot: 'only-on-failure',

    // Record a video on first retry (helps diagnose flaky tests)
    video: 'on-first-retry',

    // Record a full trace on first retry (open in Playwright Trace Viewer)
    trace: 'on-first-retry',

    // Give each action up to 10 seconds before timing out
    actionTimeout: 10_000,

    // Give each `expect()` assertion up to 8 seconds (useful for async UI updates)
    expect: { timeout: 8_000 },
  },

  projects: [
    {
      // Use locally installed Google Chrome to avoid downloading external binaries
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
    },
  ],

  // -----------------------------------------------------------------------
  // Global timeout per test (ms). 30 seconds is generous for auth flows.
  // -----------------------------------------------------------------------
  timeout: 30_000,
});
