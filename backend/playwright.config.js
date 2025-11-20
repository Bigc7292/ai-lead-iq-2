const { defineConfig } = require('@playwright/test');

/**
 * Playwright Configuration for E2E API Testing
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
    testDir: './tests/e2e',

    // Maximum time one test can run
    timeout: 30 * 1000,

    // Test execution settings
    fullyParallel: false, // Run tests sequentially for API consistency
    forbidOnly: !!process.env.CI, // Fail CI if test.only() is accidentally left in
    retries: process.env.CI ? 2 : 0, // Retry on CI only
    workers: 1, // Run tests sequentially (important for database state)

    // Reporter configuration
    reporter: [
        ['list'], // Console output
        ['html', { outputFolder: 'playwright-report', open: 'never' }],
        ['json', { outputFile: 'playwright-report/results.json' }],
    ],

    // Global test configuration
    use: {
        // Base URL for API requests
        baseURL: process.env.API_BASE_URL || 'http://localhost:3000',

        // Request options
        extraHTTPHeaders: {
            'Content-Type': 'application/json',
        },

        // Timeout for each action
        actionTimeout: 10 * 1000,

        // Collect trace for debugging
        trace: process.env.CI ? 'on-first-retry' : 'off',
    },

    // Web server to start before tests (optional - for local testing)
    webServer: process.env.CI ? undefined : {
        command: 'npm run dev',
        port: 3000,
        timeout: 120 * 1000,
        reuseExistingServer: !process.env.CI,
    },
});
