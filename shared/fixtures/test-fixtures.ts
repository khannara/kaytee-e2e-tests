import { test as base, expect as baseExpect, APIResponse } from '@playwright/test';

/**
 * Extended test fixtures for the KayTee ecosystem.
 *
 * These fixtures provide common setup/teardown patterns and
 * utilities that can be used across all app test suites.
 */

// Extend the base test with custom fixtures
export const test = base.extend<{
  /**
   * API client for interacting with kaytee-metrics-api
   */
  metricsApi: {
    postResult: (data: object) => Promise<APIResponse>;
    getHealth: () => Promise<APIResponse>;
  };

  /**
   * Test data generator for consistent test data
   */
  testData: {
    generateEmail: () => string;
    generatePassword: () => string;
    generateName: () => string;
  };
}>({
  // Metrics API client fixture
  metricsApi: async ({ request }, use) => {
    const apiUrl = process.env.METRICS_API_URL || 'https://api.khannara.dev';
    const apiKey = process.env.METRICS_API_KEY || '';

    const client = {
      postResult: async (data: object) => {
        return request.post(`${apiUrl}/results`, {
          data,
          headers: {
            'X-API-Key': apiKey,
          },
        });
      },
      getHealth: async () => {
        return request.get(`${apiUrl}/health`);
      },
    };

    await use(client);
  },

  // Test data generator fixture
  testData: async ({}, use) => {
    const timestamp = Date.now();

    const generator = {
      generateEmail: () => `test-${timestamp}-${Math.random().toString(36).slice(2)}@test.kaytee.dev`,
      generatePassword: () => `Test${Math.random().toString(36).slice(2)}!@#`,
      generateName: () => `Test User ${timestamp}`,
    };

    await use(generator);
  },
});

// Re-export expect for convenience
export { baseExpect as expect };

/**
 * Custom assertions for common E2E patterns
 */
export const customExpect = {
  /**
   * Assert that an API response is successful (2xx status)
   */
  toBeSuccessful: async (response: APIResponse) => {
    const status = response.status();
    if (status < 200 || status >= 300) {
      throw new Error(`Expected successful response, got ${status}`);
    }
  },

  /**
   * Assert that page load time is within acceptable threshold
   */
  toLoadWithin: async (page: { waitForLoadState: (state: string) => Promise<void> }, ms: number) => {
    const start = Date.now();
    await page.waitForLoadState('networkidle');
    const duration = Date.now() - start;
    if (duration > ms) {
      throw new Error(`Page took ${duration}ms to load, expected < ${ms}ms`);
    }
  },
};
