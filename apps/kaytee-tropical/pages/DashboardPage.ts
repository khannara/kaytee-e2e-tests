import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../../shared/page-objects/BasePage.js';

/**
 * Page object for the KayTee Tropical Dashboard main dashboard.
 *
 * URL: https://kayteetropical.com/dashboard
 */
export class TropicalDashboardPage extends BasePage {
  // Navigation
  readonly sidebar: Locator;
  readonly dashboardLink: Locator;
  readonly transactionsLink: Locator;
  readonly vendorsLink: Locator;
  readonly reportsLink: Locator;
  readonly settingsLink: Locator;

  // Header
  readonly header: Locator;
  readonly userMenu: Locator;
  readonly logoutButton: Locator;

  // Dashboard content
  readonly pageTitle: Locator;
  readonly statsCards: Locator;
  readonly recentTransactions: Locator;

  constructor(page: Page) {
    super(page);

    // Navigation
    this.sidebar = page.locator('aside, nav[role="navigation"]');
    this.dashboardLink = page.locator('a[href*="/dashboard"]').first();
    this.transactionsLink = page.locator('a[href*="/transactions"]');
    this.vendorsLink = page.locator('a[href*="/vendors"]');
    this.reportsLink = page.locator('a[href*="/reports"]');
    this.settingsLink = page.locator('a[href*="/settings"]');

    // Header
    this.header = page.locator('header');
    this.userMenu = page.locator('[data-testid="user-menu"], button:has-text("Account")');
    this.logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout")');

    // Content
    this.pageTitle = page.locator('h1').first();
    this.statsCards = page.locator('[data-testid="stats-card"], .stats-card');
    this.recentTransactions = page.locator('[data-testid="recent-transactions"]');
  }

  async goto(): Promise<void> {
    await this.page.goto('/dashboard');
    await this.waitForLoad();
  }

  async waitForLoad(): Promise<void> {
    await expect(this.sidebar).toBeVisible({ timeout: 10000 });
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToTransactions(): Promise<void> {
    await this.transactionsLink.click();
    await this.page.waitForURL('**/transactions**');
  }

  async navigateToVendors(): Promise<void> {
    await this.vendorsLink.click();
    await this.page.waitForURL('**/vendors**');
  }

  async navigateToReports(): Promise<void> {
    await this.reportsLink.click();
    await this.page.waitForURL('**/reports**');
  }

  async navigateToSettings(): Promise<void> {
    await this.settingsLink.click();
    await this.page.waitForURL('**/settings**');
  }

  async logout(): Promise<void> {
    await this.userMenu.click();
    await this.logoutButton.click();
    await this.page.waitForURL('**/auth/**');
  }

  async getStatsCardCount(): Promise<number> {
    return this.statsCards.count();
  }

  async getPageTitleText(): Promise<string> {
    return (await this.pageTitle.textContent()) || '';
  }
}
