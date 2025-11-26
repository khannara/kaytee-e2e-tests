import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from '@playwright/test/reporter';

interface TestResultPayload {
  project: string;
  test_type: 'e2e';
  status: 'passed' | 'failed' | 'skipped';
  total_tests: number;
  passed_tests: number;
  failed_tests: number;
  skipped_tests: number;
  duration_ms: number;
  metadata: {
    browser: string;
    playwright_version: string;
    node_version: string;
    ci: boolean;
    commit_sha?: string;
    branch?: string;
    run_id?: string;
    failed_test_names?: string[];
  };
}

/**
 * Custom Playwright reporter that sends test results to kaytee-metrics-api.
 *
 * Results are sent to POST /results endpoint at the end of the test run.
 * API documentation: https://api.khannara.dev/docs
 */
class MetricsApiReporter implements Reporter {
  private results: Map<string, TestResultPayload> = new Map();
  private startTime: number = 0;
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    this.apiUrl = process.env.METRICS_API_URL || 'https://api.khannara.dev';
    this.apiKey = process.env.METRICS_API_KEY || '';
  }

  onBegin(_config: FullConfig, _suite: Suite): void {
    this.startTime = Date.now();
    console.info('[MetricsApiReporter] Test run started');
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    const projectName = test.parent.project()?.name || 'unknown';

    // Initialize project results if not exists
    if (!this.results.has(projectName)) {
      this.results.set(projectName, {
        project: projectName,
        test_type: 'e2e',
        status: 'passed',
        total_tests: 0,
        passed_tests: 0,
        failed_tests: 0,
        skipped_tests: 0,
        duration_ms: 0,
        metadata: {
          browser: test.parent.project()?.use?.defaultBrowserType || 'chromium',
          playwright_version: require('@playwright/test/package.json').version as string,
          node_version: process.version,
          ci: !!process.env.CI,
          commit_sha: process.env.BUILD_SOURCEVERSION || process.env.GITHUB_SHA,
          branch: process.env.BUILD_SOURCEBRANCH || process.env.GITHUB_REF,
          run_id: process.env.BUILD_BUILDID || process.env.GITHUB_RUN_ID,
          failed_test_names: [],
        },
      });
    }

    const projectResult = this.results.get(projectName)!;
    projectResult.total_tests++;
    projectResult.duration_ms += result.duration;

    switch (result.status) {
      case 'passed':
        projectResult.passed_tests++;
        break;
      case 'failed':
      case 'timedOut':
        projectResult.failed_tests++;
        projectResult.status = 'failed';
        projectResult.metadata.failed_test_names?.push(test.title);
        break;
      case 'skipped':
        projectResult.skipped_tests++;
        break;
    }
  }

  async onEnd(result: FullResult): Promise<void> {
    const totalDuration = Date.now() - this.startTime;
    console.info(`[MetricsApiReporter] Test run completed in ${totalDuration}ms`);
    console.info(`[MetricsApiReporter] Overall status: ${result.status}`);

    // Skip reporting if no API key configured
    if (!this.apiKey) {
      console.warn('[MetricsApiReporter] METRICS_API_KEY not set, skipping result upload');
      return;
    }

    // Send results for each project
    for (const [projectName, projectResult] of this.results) {
      try {
        await this.sendResults(projectResult);
        console.info(`[MetricsApiReporter] Results sent for project: ${projectName}`);
      } catch (error) {
        console.error(`[MetricsApiReporter] Failed to send results for ${projectName}:`, error);
      }
    }
  }

  private async sendResults(payload: TestResultPayload): Promise<void> {
    const response = await fetch(`${this.apiUrl}/results`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} ${errorText}`);
    }
  }
}

export default MetricsApiReporter;
