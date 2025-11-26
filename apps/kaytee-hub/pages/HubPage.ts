import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../../shared/page-objects/BasePage.js';

/**
 * Page object for the KayTee Tropical Hub (Operations Control Plane).
 *
 * URL: https://hub.kayteetropical.com
 *
 * Note: This is a placeholder. Hub is currently in development.
 * Update this page object as the hub features are built.
 */
export class HubPage extends BasePage {
  // Navigation
  readonly sidebar: Locator;
  readonly dashboardLink: Locator;
  readonly healthLink: Locator;
  readonly metricsLink: Locator;
  readonly operationsLink: Locator;
  readonly logsLink: Locator;

  // Dashboard content
  readonly pageTitle: Locator;
  readonly healthCards: Locator;
  readonly metricsCards: Locator;

  // Theme
  readonly themeToggle: Locator;

  constructor(page: Page) {
    super(page);

    // Navigation
    this.sidebar = page.locator('aside, nav[role="navigation"]');
    this.dashboardLink = page.locator('a[href="/"], a[href="/dashboard"]').first();
    this.healthLink = page.locator('a[href*="/health"]');
    this.metricsLink = page.locator('a[href*="/metrics"]');
    this.operationsLink = page.locator('a[href*="/operations"]');
    this.logsLink = page.locator('a[href*="/logs"]');

    // Content
    this.pageTitle = page.locator('h1').first();
    this.healthCards = page.locator('[data-testid="health-card"]');
    this.metricsCards = page.locator('[data-testid="metrics-card"]');

    // Theme
    this.themeToggle = page.locator('[data-testid="theme-toggle"]');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
    await this.waitForLoad();
  }

  async waitForLoad(): Promise<void> {
    // Wait for sidebar or main content
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToHealth(): Promise<void> {
    await this.healthLink.click();
    await this.page.waitForURL('**/health**');
  }

  async navigateToMetrics(): Promise<void> {
    await this.metricsLink.click();
    await this.page.waitForURL('**/metrics**');
  }

  async navigateToOperations(): Promise<void> {
    await this.operationsLink.click();
    await this.page.waitForURL('**/operations**');
  }

  async navigateToLogs(): Promise<void> {
    await this.logsLink.click();
    await this.page.waitForURL('**/logs**');
  }

  async getPageTitleText(): Promise<string> {
    return (await this.pageTitle.textContent()) || '';
  }

  async getHealthCardCount(): Promise<number> {
    return this.healthCards.count();
  }
}
