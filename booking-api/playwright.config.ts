import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  use: {
    baseURL: process.env.API_URL ?? 'http://localhost:4000',
    extraHTTPHeaders: {
      'Content-Type': 'application/json'
    }
  },
  timeout: 30_000
});
