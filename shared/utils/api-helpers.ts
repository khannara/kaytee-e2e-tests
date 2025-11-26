import { APIRequestContext } from '@playwright/test';

/**
 * API helper utilities for E2E tests.
 *
 * These helpers facilitate API interactions for test setup,
 * teardown, and verification.
 */

export interface ApiConfig {
  baseUrl: string;
  apiKey?: string;
  timeout?: number;
}

/**
 * Generic API client for making requests during tests.
 */
export class ApiClient {
  private request: APIRequestContext;
  private config: ApiConfig;

  constructor(request: APIRequestContext, config: ApiConfig) {
    this.request = request;
    this.config = config;
  }

  /**
   * Make a GET request.
   */
  async get<T>(path: string): Promise<T> {
    const response = await this.request.get(`${this.config.baseUrl}${path}`, {
      headers: this.getHeaders(),
      timeout: this.config.timeout,
    });

    if (!response.ok()) {
      throw new Error(`GET ${path} failed: ${response.status()}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Make a POST request.
   */
  async post<T>(path: string, data: object): Promise<T> {
    const response = await this.request.post(`${this.config.baseUrl}${path}`, {
      data,
      headers: this.getHeaders(),
      timeout: this.config.timeout,
    });

    if (!response.ok()) {
      throw new Error(`POST ${path} failed: ${response.status()}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Make a DELETE request.
   */
  async delete(path: string): Promise<void> {
    const response = await this.request.delete(`${this.config.baseUrl}${path}`, {
      headers: this.getHeaders(),
      timeout: this.config.timeout,
    });

    if (!response.ok()) {
      throw new Error(`DELETE ${path} failed: ${response.status()}`);
    }
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.config.apiKey) {
      headers['X-API-Key'] = this.config.apiKey;
    }

    return headers;
  }
}

/**
 * Wait for an API endpoint to become healthy.
 * Useful for waiting on services to start in CI.
 */
export async function waitForHealthy(
  request: APIRequestContext,
  url: string,
  options: { maxAttempts?: number; delayMs?: number } = {}
): Promise<boolean> {
  const { maxAttempts = 30, delayMs = 2000 } = options;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await request.get(`${url}/health`);
      if (response.ok()) {
        console.info(`[waitForHealthy] ${url} is healthy after ${attempt} attempts`);
        return true;
      }
    } catch {
      // Ignore errors, retry
    }

    if (attempt < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  console.error(`[waitForHealthy] ${url} did not become healthy after ${maxAttempts} attempts`);
  return false;
}

/**
 * Verify that an API endpoint returns expected status.
 */
export async function expectStatus(
  request: APIRequestContext,
  url: string,
  expectedStatus: number
): Promise<void> {
  const response = await request.get(url);
  if (response.status() !== expectedStatus) {
    throw new Error(`Expected ${expectedStatus}, got ${response.status()} from ${url}`);
  }
}
