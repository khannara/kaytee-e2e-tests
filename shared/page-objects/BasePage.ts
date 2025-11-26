import { Page, Locator, expect } from '@playwright/test';

/**
 * Base page object class providing common functionality for all page objects.
 *
 * All page objects in the ecosystem should extend this class to ensure
 * consistent patterns and reusable utilities.
 */
export abstract class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to this page's URL.
   * Subclasses should implement this with their specific URL.
   */
  abstract goto(): Promise<void>;

  /**
   * Wait for the page to be fully loaded.
   * Subclasses can override this with specific loading indicators.
   */
  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get the current page title.
   */
  async getTitle(): Promise<string> {
    return this.page.title();
  }

  /**
   * Get the current URL.
   */
  getUrl(): string {
    return this.page.url();
  }

  /**
   * Check if an element is visible on the page.
   */
  async isVisible(locator: Locator): Promise<boolean> {
    return locator.isVisible();
  }

  /**
   * Wait for an element to be visible with custom timeout.
   */
  async waitForVisible(locator: Locator, timeout = 10000): Promise<void> {
    await expect(locator).toBeVisible({ timeout });
  }

  /**
   * Click an element and wait for navigation.
   */
  async clickAndWaitForNavigation(locator: Locator): Promise<void> {
    await Promise.all([
      this.page.waitForURL('**/*'),
      locator.click(),
    ]);
  }

  /**
   * Fill a form field.
   */
  async fill(locator: Locator, value: string): Promise<void> {
    await locator.fill(value);
  }

  /**
   * Select an option from a dropdown.
   */
  async selectOption(locator: Locator, value: string): Promise<void> {
    await locator.selectOption(value);
  }

  /**
   * Take a screenshot with a descriptive name.
   */
  async screenshot(name: string): Promise<Buffer> {
    return this.page.screenshot({
      path: `test-results/screenshots/${name}.png`,
      fullPage: true,
    });
  }

  /**
   * Get all text content from the page.
   */
  async getTextContent(locator: Locator): Promise<string | null> {
    return locator.textContent();
  }

  /**
   * Check if the page has any console errors.
   */
  async hasConsoleErrors(): Promise<boolean> {
    const errors: string[] = [];
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    await this.page.waitForTimeout(1000);
    return errors.length > 0;
  }

  /**
   * Get performance metrics for the page.
   */
  async getPerformanceMetrics(): Promise<{
    loadTime: number;
    domContentLoaded: number;
    firstPaint: number;
  }> {
    const metrics = await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      const firstPaint = paint.find((p) => p.name === 'first-paint');

      return {
        loadTime: navigation.loadEventEnd - navigation.startTime,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.startTime,
        firstPaint: firstPaint?.startTime || 0,
      };
    });

    return metrics;
  }
}
