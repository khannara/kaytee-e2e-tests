# KayTee E2E Tests

Centralized E2E testing repository for the KayTee ecosystem.

[![Azure DevOps](https://dev.azure.com/phay/kaytee-e2e-tests/_apis/build/status/CI?branchName=main)](https://dev.azure.com/phay/kaytee-e2e-tests/_build)

## Overview

This repository contains Playwright E2E tests for all ecosystem applications:

| Application | URL | Test Directory |
|-------------|-----|----------------|
| **KayTee Tropical Dashboard** | https://kayteetropical.com | `apps/kaytee-tropical/` |
| **Quality Metrics Dashboard** | https://qa.khannara.dev | `apps/quality-metrics/` |
| **Digital Portfolio** | https://khannara.dev | `apps/digital-portfolio/` |
| **KayTee Tropical Hub** | https://hub.kayteetropical.com | `apps/kaytee-hub/` |

## Architecture

```
kaytee-e2e-tests/
├── apps/                       # App-specific tests
│   ├── kaytee-tropical/        # Business dashboard
│   │   ├── pages/              # Page objects
│   │   └── tests/              # Test specs
│   ├── quality-metrics/        # QA metrics dashboard
│   ├── digital-portfolio/      # Portfolio
│   └── kaytee-hub/             # Operations hub
├── shared/                     # Shared utilities
│   ├── fixtures/               # Test fixtures
│   ├── page-objects/           # Base page object
│   ├── reporters/              # Custom reporters
│   └── utils/                  # API helpers
├── playwright.config.ts        # Playwright configuration
├── azure-pipelines.yml         # CI/CD pipeline
└── package.json
```

## Quick Start

### Prerequisites

- Node.js 20+
- npm 10+

### Installation

```bash
# Clone the repository
git clone https://github.com/khannara/kaytee-e2e-tests.git
cd kaytee-e2e-tests

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### Configuration

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Application URLs (defaults to production)
KAYTEE_TROPICAL_URL=https://kayteetropical.com
QUALITY_METRICS_URL=https://qa.khannara.dev
PORTFOLIO_URL=https://khannara.dev
KAYTEE_HUB_URL=https://hub.kayteetropical.com

# Metrics API (for reporting results)
METRICS_API_URL=https://api.khannara.dev
METRICS_API_KEY=your_api_key

# Test credentials (for authenticated tests)
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=your_password
```

## Running Tests

### All Tests

```bash
npm test
```

### By Application

```bash
# Quality Metrics Dashboard
npm run test:quality

# Digital Portfolio
npm run test:portfolio

# KayTee Tropical Dashboard
npm run test:tropical

# KayTee Hub
npm run test:hub
```

### Interactive UI Mode

```bash
npm run test:ui
```

### Headed Mode (Watch Tests Run)

```bash
npm run test:headed
```

### Debug Mode

```bash
npm run test:debug
```

### View Test Report

```bash
npm run test:report
```

## Test Structure

### Page Objects

Each application has page objects in `apps/{app}/pages/`:

```typescript
import { Page, Locator } from '@playwright/test';
import { BasePage } from '../../../shared/page-objects/BasePage.js';

export class DashboardPage extends BasePage {
  readonly navLogo: Locator;

  constructor(page: Page) {
    super(page);
    this.navLogo = page.locator('a[href="/"]');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
    await this.waitForLoad();
  }
}
```

### Test Specs

Tests use the page objects and shared fixtures:

```typescript
import { test, expect } from '../../../shared/fixtures/test-fixtures.js';
import { DashboardPage } from '../pages/DashboardPage.js';

test.describe('Dashboard', () => {
  test('should load successfully', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await expect(dashboard.navLogo).toBeVisible();
  });
});
```

### Test Tags

Use tags to categorize tests:

- `@performance` - Performance-related tests
- `@mobile` - Mobile viewport tests

```bash
# Run only mobile tests
npx playwright test --grep @mobile

# Run only performance tests
npx playwright test --grep @performance
```

## Custom Reporter

Test results are automatically sent to the KayTee Metrics API (`api.khannara.dev`).

The custom reporter in `shared/reporters/metrics-api-reporter.ts`:

1. Collects test results during the run
2. Aggregates results by project
3. POSTs results to `/results` endpoint on completion

To enable reporting, set `METRICS_API_KEY` in your environment.

## CI/CD

### Azure DevOps Pipeline

Tests run automatically:

- On push to `main` or `develop`
- On pull requests
- Weekly schedule (Monday 3 AM UTC)

Pipeline configuration: `azure-pipelines.yml`

### Pipeline Variables

Set these in Azure DevOps pipeline variables:

| Variable | Description | Secret |
|----------|-------------|--------|
| `METRICS_API_KEY` | API key for metrics reporting | Yes |
| `TEST_USER_EMAIL` | Test user email for authenticated tests | Yes |
| `TEST_USER_PASSWORD` | Test user password | Yes |

## Development

### Linting

```bash
npm run lint
npm run lint:fix
```

### Type Checking

```bash
npm run type-check
```

### Full Validation

```bash
npm run validate
```

## Project Status

| Application | Tests | Status |
|-------------|-------|--------|
| Quality Metrics | 12 tests | ✅ Complete |
| Digital Portfolio | 14 tests | ✅ Complete |
| KayTee Tropical | 8 tests | 🟡 Auth tests need credentials |
| KayTee Hub | 6 tests | ⏸️ Skipped (hub in development) |

## Related Documentation

- [Master Roadmap](https://github.com/khannara/kaytee-ecosystem/blob/main/docs/ecosystem/MASTER_ROADMAP.md)
- [Project Ecosystem](https://github.com/khannara/kaytee-ecosystem/blob/main/docs/ecosystem/PROJECT_ECOSYSTEM.md)
- [KayTee Metrics API](https://github.com/khannara/kaytee-metrics-api)

## License

MIT
