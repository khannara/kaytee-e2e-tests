import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local (preferred) or .env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config(); // Fallback to .env

/**
 * Centralized Playwright configuration for KayTee Ecosystem E2E tests.
 *
 * Projects:
 * - kaytee-tropical: Business dashboard (kayteetropical.com)
 * - quality-metrics: QA metrics dashboard (qa.khannara.dev)
 * - digital-portfolio: Personal portfolio (khannara.dev)
 * - kaytee-hub: Operations hub (hub.kayteetropical.com)
 */
export default defineConfig({
  testDir: './apps',

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI for stability */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter to use */
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/e2e-results.xml' }],
    // Custom reporter for kaytee-metrics-api
    ['./shared/reporters/metrics-api-reporter.ts'],
  ],

  /* Shared settings for all projects */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: process.env.BASE_URL || 'http://localhost:3000',

    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',

    /* Screenshot on failure */
    screenshot: 'only-on-failure',

    /* Video on failure */
    video: 'on-first-retry',
  },

  /* Configure projects for different ecosystem apps */
  projects: [
    // KayTee Tropical Dashboard - Business finance management
    // Uses dev environment by default for safer E2E testing
    {
      name: 'kaytee-tropical',
      testDir: './apps/kaytee-tropical/tests',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.KAYTEE_TROPICAL_URL || 'https://dev.kayteetropical.com',
      },
    },

    // Quality Metrics Dashboard - QA metrics showcase
    {
      name: 'quality-metrics',
      testDir: './apps/quality-metrics/tests',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.QUALITY_METRICS_URL || 'https://qa.khannara.dev',
      },
    },

    // Digital Portfolio - Professional showcase
    {
      name: 'digital-portfolio',
      testDir: './apps/digital-portfolio/tests',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.PORTFOLIO_URL || 'https://khannara.dev',
      },
    },

    // KayTee Tropical Hub - Operations control plane
    {
      name: 'kaytee-hub',
      testDir: './apps/kaytee-hub/tests',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.KAYTEE_HUB_URL || 'https://hub.khannara.dev',
      },
    },

    // Mobile viewport tests
    {
      name: 'mobile-chrome',
      testDir: './apps',
      use: {
        ...devices['Pixel 5'],
      },
      grep: /@mobile/,
    },
  ],

  /* Global timeout for each test */
  timeout: 30000,

  /* Expect timeout */
  expect: {
    timeout: 10000,
  },

  /* Output folder for test artifacts */
  outputDir: 'test-results/',
});
