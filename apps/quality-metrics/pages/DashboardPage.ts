import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../../shared/page-objects/BasePage.js';

/**
 * Page object for the Quality Metrics Dashboard.
 *
 * URL: https://qa.khannara.dev
 */
export class DashboardPage extends BasePage {
  // Navigation elements - using flexible locators
  readonly navLogo: Locator;
  readonly overviewLink: Locator;
  readonly unitTestsLink: Locator;
  readonly e2eTestsLink: Locator;
  readonly integrationLink: Locator;
  readonly trendsLink: Locator;

  // Dashboard content
  readonly pageTitle: Locator;
  readonly metricsCards: Locator;
  readonly chartsContainer: Locator;
  readonly mainContent: Locator;

  // Theme toggle
  readonly themeToggle: Locator;

  constructor(page: Page) {
    super(page);

    // Navigation - using multiple possible selectors
    this.navLogo = page.locator('header a, nav a, [class*="logo"], img[alt*="logo"]').first();
    this.overviewLink = page.locator('a:has-text("Overview"), a[href*="overview"]').first();
    this.unitTestsLink = page.locator('a:has-text("Unit"), a[href*="unit"]').first();
    this.e2eTestsLink = page.locator('a:has-text("E2E"), a[href*="e2e"]').first();
    this.integrationLink = page.locator('a:has-text("Integration"), a[href*="integration"]').first();
    this.trendsLink = page.locator('a:has-text("Trends"), a[href*="trends"]').first();

    // Content - flexible selectors
    this.pageTitle = page.locator('h1, h2').first();
    this.metricsCards = page.locator('[data-testid="metrics-card"], [class*="card"], [class*="metric"]');
    this.chartsContainer = page.locator('[data-testid="charts-container"], [class*="chart"]');
    this.mainContent = page.locator('main, [role="main"], #__next > div');

    // Theme
    this.themeToggle = page.locator('[data-testid="theme-toggle"], button:has-text("theme"), [class*="theme"]').first();
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
    await this.waitForLoad();
  }

  async gotoOverview(): Promise<void> {
    await this.page.goto('/dashboard/overview');
    await this.waitForLoad();
  }

  async gotoUnitTests(): Promise<void> {
    await this.page.goto('/dashboard/unit-tests');
    await this.waitForLoad();
  }

  async gotoE2ETests(): Promise<void> {
    await this.page.goto('/dashboard/e2e-tests');
    await this.waitForLoad();
  }

  async gotoIntegration(): Promise<void> {
    await this.page.goto('/dashboard/integration');
    await this.waitForLoad();
  }

  async gotoTrends(): Promise<void> {
    await this.page.goto('/dashboard/trends');
    await this.waitForLoad();
  }

  async waitForLoad(): Promise<void> {
    // Wait for page to be fully loaded - using flexible check
    await this.page.waitForLoadState('domcontentloaded');
    // Wait for main content area to exist
    await expect(this.mainContent).toBeVisible({ timeout: 15000 });
  }

  async getPageTitleText(): Promise<string> {
    return (await this.pageTitle.textContent()) || '';
  }

  async getMetricsCardCount(): Promise<number> {
    return this.metricsCards.count();
  }

  async toggleTheme(): Promise<void> {
    await this.themeToggle.click();
  }

  async isDarkMode(): Promise<boolean> {
    const html = this.page.locator('html');
    const className = await html.getAttribute('class');
    return className?.includes('dark') ?? false;
  }
}
