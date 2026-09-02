import { defineConfig } from '@playwright/test';

const liveBaseURL = process.env.PLAYWRIGHT_BASE_URL;

export default defineConfig({
  testDir: './tests',
  testMatch: /.*\.e2e\.ts/,
  use: { baseURL: liveBaseURL || 'http://127.0.0.1:4173', browserName: 'chromium', headless: true },
  webServer: liveBaseURL ? undefined : { command: 'npm run build && swa start dist --host 127.0.0.1 --port 4173', url: 'http://127.0.0.1:4173', reuseExistingServer: !process.env.CI },
});
