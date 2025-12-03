#!/usr/bin/env node
/**
 * Generate .env.local from Bitwarden Secrets Manager
 *
 * Prerequisites:
 *   1. bws CLI installed and in PATH
 *   2. BWS_ACCESS_TOKEN environment variable set (User level)
 *
 * Usage:
 *   npm run env:generate
 *   node scripts/generate-env.mjs
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const colors = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
};

function main() {
  console.log(colors.cyan('\n==========================================='));
  console.log(colors.cyan('  KayTee E2E Tests - env:generate'));
  console.log(colors.cyan('===========================================\n'));

  if (!process.env.BWS_ACCESS_TOKEN) {
    console.error(colors.red('ERROR: BWS_ACCESS_TOKEN environment variable not set\n'));
    console.log(colors.yellow('Set it with:'));
    console.log('  Windows: [System.Environment]::SetEnvironmentVariable(\'BWS_ACCESS_TOKEN\', \'your-token\', \'User\')');
    console.log('  macOS/Linux: echo \'export BWS_ACCESS_TOKEN="your-token"\' >> ~/.bashrc && source ~/.bashrc\n');
    process.exit(1);
  }

  try {
    execSync('bws --version', { stdio: 'pipe' });
  } catch {
    console.error(colors.red('ERROR: bws CLI not found in PATH\n'));
    console.log(colors.yellow('Install with: winget install Bitwarden.BWS'));
    process.exit(1);
  }

  console.log(colors.cyan('Fetching secrets from Bitwarden Secrets Manager...'));
  let secrets;
  try {
    const output = execSync('bws secret list -o json', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
    secrets = JSON.parse(output);
    console.log(colors.green(`  Found ${secrets.length} secrets in vault\n`));
  } catch (error) {
    console.error(colors.red('ERROR: Failed to fetch secrets from Bitwarden'));
    process.exit(1);
  }

  const get = (key) => {
    const secret = secrets.find((s) => s.key === key);
    if (!secret) {
      console.warn(colors.yellow(`  Warning: Secret '${key}' not found`));
      return '';
    }
    return secret.value;
  };

  const envContent = `# Auto-generated from Bitwarden Secrets Manager
# Generated: ${new Date().toISOString()}
# Run: npm run env:generate
# DO NOT COMMIT THIS FILE

# Application URLs
KAYTEE_TROPICAL_URL=https://dev.kayteetropical.com
KAYTEE_TROPICAL_DEV_URL=https://dev.kayteetropical.com
QUALITY_METRICS_URL=https://qa.khannara.dev
PORTFOLIO_URL=https://khannara.dev
KAYTEE_HUB_URL=https://hub.khannara.dev

# Metrics API
METRICS_API_URL=${get('HUB_METRICS_API_URL')}
METRICS_API_KEY=${get('HUB_METRICS_API_KEY')}

# Test User Credentials
LOCALHOST_EMAIL=${get('KTD_LOCALHOST_EMAIL')}
LOCALHOST_PASSWORD=${get('KTD_LOCALHOST_PASSWORD')}

# Preview environment credentials
PREVIEW_ADMIN_EMAIL=${get('KTD_LOCALHOST_EMAIL')}
PREVIEW_ADMIN_PASSWORD=${get('E2E_PREVIEW_ADMIN_PASSWORD')}

# Production credentials
PROD_ADMIN_EMAIL=${get('KTD_LOCALHOST_EMAIL')}
PROD_ADMIN_PASSWORD=${get('E2E_PROD_ADMIN_PASSWORD')}
`;

  const envPath = path.join(__dirname, '..', '.env.local');
  fs.writeFileSync(envPath, envContent);

  console.log(colors.green('==========================================='));
  console.log(colors.green('  .env.local generated successfully!'));
  console.log(colors.green('===========================================\n'));
  console.log(colors.cyan(`Location: ${envPath}`));
  console.log(colors.cyan('Next: npx playwright test\n'));
}

main();
