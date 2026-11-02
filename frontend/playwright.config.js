import { defineConfig, devices } from '@playwright/test'
import { loadEnv } from 'vite'

// Same env lookup as vite.config.mjs, so the tests follow a non-root VITE_APP_BASE
const base = loadEnv('development', '../').VITE_APP_BASE || '/'
const port = 5174

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${port}${base}`,
    actionTimeout: 5000,
    trace: 'retain-on-failure'
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // Not Vite's default port, so the tests don't reuse a dev server you already have running
    command: `npm run dev -- --port ${port} --strictPort`,
    url: `http://localhost:${port}${base}`,
    reuseExistingServer: !process.env.CI
  }
})
