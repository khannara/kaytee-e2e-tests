import { Page, Locator } from '@playwright/test';
import { BasePage } from '../../../shared/page-objects/BasePage.js';

/**
 * Page object for the KayTee Tropical Hub (Operations Control Plane).
 *
 * URL: https://hub.khannara.dev
 *
 * Hub provides centralized operations monitoring for the KayTee ecosystem:
 * - Health monitoring for all services
 * - Metrics aggregation from kaytee-metrics-api
 * - Deployment status from Vercel
 * - Pipeline status from Azure DevOps
 * - Log aggregation from Axiom
 */
export class HubPage extends BasePage {
  // Navigation
  readonly sidebar: Locator;
  readonly mobileMenuButton: Locator;
  readonly overviewLink: Locator;
  readonly healthLink: Locator;
  readonly metricsLink: Locator;
  readonly operationsLink: Locator;
  readonly infrastructureLink: Locator;
  readonly logsLink: Locator;
  readonly deploymentsLink: Locator;
  readonly pipelinesLink: Locator;
  readonly settingsLink: Locator;

  // Dashboard content
  readonly pageTitle: Locator;
  readonly statusCards: Locator;
  readonly refreshButton: Locator;

  // Theme
  readonly themeSwitcher: Locator;

  // Settings
  readonly notificationToggles: Locator;
  readonly apiStatusSection: Locator;

  constructor(page: Page) {
    super(page);

    // Navigation - Desktop sidebar
    this.sidebar = page.locator('aside').first();
    this.mobileMenuButton = page.locator('button').filter({ has: page.locator('svg.lucide-menu') });
    this.overviewLink = page.locator('a[href="/dashboard"]').first();
    this.healthLink = page.locator('a[href="/dashboard/health"]');
    this.metricsLink = page.locator('a[href="/dashboard/metrics"]');
    this.operationsLink = page.locator('a[href="/dashboard/operations"]');
    this.infrastructureLink = page.locator('a[href="/dashboard/infrastructure"]');
    this.logsLink = page.locator('a[href="/dashboard/logs"]');
    this.deploymentsLink = page.locator('a[href="/dashboard/deployments"]');
    this.pipelinesLink = page.locator('aside a[href="/dashboard/pipelines"]').first();
    this.settingsLink = page.locator('a[href="/dashboard/settings"]');

    // Content
    this.pageTitle = page.locator('h1').first();
    this.statusCards = page.locator('[class*="rounded-xl"]').filter({ hasText: /Health|Metrics|Operations/ });
    this.refreshButton = page.locator('button').filter({ has: page.locator('svg.lucide-refresh-cw') });

    // Theme
    this.themeSwitcher = page.locator('button').filter({ hasText: /Theme|Palette|Colors/ });

    // Settings
    this.notificationToggles = page.locator('button[class*="rounded-full"]');
    this.apiStatusSection = page.locator('text=API Integrations').first();
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
    await this.waitForLoad();
  }

  async gotoDashboard(): Promise<void> {
    await this.page.goto('/dashboard');
    await this.waitForLoad();
  }

  async waitForLoad(): Promise<void> {
    // Wait for the page to be fully loaded
    await this.page.waitForLoadState('networkidle');
    // Wait for sidebar to be visible (desktop) or page content
    await this.page.waitForSelector('h1', { timeout: 10000 });
  }

  async navigateToHealth(): Promise<void> {
    await this.healthLink.click();
    await this.page.waitForURL('**/dashboard/health**');
  }

  async navigateToMetrics(): Promise<void> {
    await this.metricsLink.click();
    await this.page.waitForURL('**/dashboard/metrics**');
  }

  async navigateToOperations(): Promise<void> {
    await this.operationsLink.click();
    await this.page.waitForURL('**/dashboard/operations**');
  }

  async navigateToLogs(): Promise<void> {
    await this.logsLink.click();
    await this.page.waitForURL('**/dashboard/logs**');
  }

  async navigateToDeployments(): Promise<void> {
    await this.deploymentsLink.click();
    await this.page.waitForURL('**/dashboard/deployments**');
  }

  async navigateToPipelines(): Promise<void> {
    await this.pipelinesLink.click();
    await this.page.waitForURL('**/dashboard/pipelines**');
  }

  async navigateToSettings(): Promise<void> {
    await this.settingsLink.click();
    await this.page.waitForURL('**/dashboard/settings**');
  }

  async navigateToInfrastructure(): Promise<void> {
    await this.infrastructureLink.click();
    await this.page.waitForURL('**/dashboard/infrastructure**');
  }

  async getPageTitleText(): Promise<string> {
    return (await this.pageTitle.textContent()) || '';
  }

  async getStatusCardCount(): Promise<number> {
    return this.statusCards.count();
  }

  async openMobileMenu(): Promise<void> {
    await this.mobileMenuButton.click();
    // Wait for sidebar animation
    await this.page.waitForTimeout(300);
  }

  async isSidebarVisible(): Promise<boolean> {
    return this.sidebar.isVisible();
  }
}
