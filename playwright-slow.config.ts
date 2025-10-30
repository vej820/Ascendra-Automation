import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration optimized for SLOW INTERNET connections
 * Use this config when running tests on slow networks
 * 
 * Run with: npx playwright test --config=playwright-slow.config.ts
 */
export default defineConfig({
  testDir: './tests',
  
  /* Disable parallel execution for slow networks */
  fullyParallel: false,
  workers: 1,
  
  /* Increased retries for network issues */
  retries: 2,
  
  /* Reporter */
  reporter: [
    ['html'],
    ['list'] // Shows progress in console
  ],
  
  /* SLOW NETWORK OPTIMIZED SETTINGS */
  use: {
    /* Extended timeouts for slow networks */
    actionTimeout: 180000,      // 3 minutes for actions
    navigationTimeout: 300000,  // 5 minutes for navigation
    
    /* Collect trace for debugging */
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    /* Slow down actions to help with slow networks */
    launchOptions: {
      slowMo: 500, // 500ms delay between actions
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
      ]
    }
  },

  /* Very long timeout for entire test suite */
  timeout: 900000, // 15 minutes per test

  /* Single browser for slow networks */
  projects: [
    {
      name: 'chromium-slow',
      use: { 
        ...devices['Desktop Chrome'],
        /* Additional slow network optimizations */
        contextOptions: {
          // Reduce resource usage
          reducedMotion: 'reduce',
        }
      },
    },
  ],

  /* Global setup for slow network tests */
  globalSetup: require.resolve('./tests/global-setup-slow.ts'),
});