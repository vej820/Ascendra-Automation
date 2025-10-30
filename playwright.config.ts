import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  
  /* Run tests in files in parallel */
  fullyParallel: false, // Disabled for slow internet
  
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 1, // Added retry for slow networks
  
  /* Opt out of parallel tests on CI. */
  workers: 1, // Single worker for slow internet
  
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* OPTIMIZED FOR SLOW INTERNET */
    actionTimeout: 120000, // 2 minutes for actions (doubled)
    navigationTimeout: 180000, // 3 minutes for page navigation (tripled)
    
    /* Slow network simulation - comment out if you want to test with actual slow speed */
    // launchOptions: {
    //   slowMo: 1000, // 1 second delay between actions
    // },
  },

  /* Global timeout for entire test - increased for slow internet */
  timeout: 600000, // 10 minutes per test (doubled)

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        /* Additional settings for slow internet */
        launchOptions: {
          args: [
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
            '--no-sandbox', // Helps with performance on slow systems
          ]
        }
      },
    },

    // Commented out other browsers to focus on one for slow internet
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],
});