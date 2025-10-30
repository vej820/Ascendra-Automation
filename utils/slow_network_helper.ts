import { Page } from '@playwright/test';

export class SlowNetworkHelper {
  
  /**
   * Navigate with extended timeout for slow networks
   */
  static async slowGoto(page: Page, url: string, options?: { timeout?: number }): Promise<void> {
    const timeout = options?.timeout || 180000; // 3 minutes default
    
    console.log(`🌐 Navigating to: ${url} (timeout: ${timeout/1000}s)`);
    
    try {
      await page.goto(url, { 
        timeout,
        waitUntil: 'domcontentloaded' // Faster than 'load' for slow networks
      });
      
      // Wait for network to be mostly idle
      await page.waitForLoadState('networkidle', { timeout: 60000 });
      console.log('✅ Page loaded successfully');
      
    } catch (error) {
      console.log(`⚠️ Navigation timeout, but continuing... Error: ${error}`);
      // Don't throw error, just continue - page might be partially loaded
    }
  }

  /**
   * Click with retry logic for slow networks
   */
  static async slowClick(page: Page, selector: string, options?: { timeout?: number, retries?: number }): Promise<void> {
    const timeout = options?.timeout || 60000; // 1 minute default
    const retries = options?.retries || 3;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`🖱️ Attempting click (${attempt}/${retries}): ${selector}`);
        
        // Wait for element to be visible and enabled
        await page.waitForSelector(selector, { timeout, state: 'visible' });
        await page.waitForTimeout(1000); // Small buffer for slow networks
        
        await page.click(selector, { timeout });
        console.log('✅ Click successful');
        return;
        
      } catch (error) {
        console.log(`❌ Click attempt ${attempt} failed: ${error}`);
        
        if (attempt === retries) {
          throw new Error(`Click failed after ${retries} attempts: ${selector}`);
        }
        
        // Wait before retry
        await page.waitForTimeout(2000);
      }
    }
  }

  /**
   * Fill text with retry logic for slow networks
   */
  static async slowFill(page: Page, selector: string, text: string, options?: { timeout?: number }): Promise<void> {
    const timeout = options?.timeout || 60000;
    
    try {
      console.log(`📝 Filling field: ${selector}`);
      
      // Wait for element and clear it first
      await page.waitForSelector(selector, { timeout, state: 'visible' });
      await page.waitForTimeout(500); // Buffer for slow networks
      
      await page.fill(selector, '', { timeout }); // Clear first
      await page.waitForTimeout(500);
      
      await page.fill(selector, text, { timeout });
      console.log('✅ Fill successful');
      
    } catch (error) {
      console.log(`❌ Fill failed: ${error}`);
      throw error;
    }
  }

  /**
   * Wait for element with extended timeout
   */
  static async slowWaitFor(page: Page, selector: string, options?: { timeout?: number }): Promise<void> {
    const timeout = options?.timeout || 120000; // 2 minutes default
    
    console.log(`⏳ Waiting for element: ${selector} (timeout: ${timeout/1000}s)`);
    
    try {
      await page.waitForSelector(selector, { timeout, state: 'visible' });
      console.log('✅ Element found');
    } catch (error) {
      console.log(`❌ Element not found: ${selector}`);
      throw error;
    }
  }

  /**
   * Smart wait that adapts to network speed
   */
  static async adaptiveWait(page: Page, baseWaitTime: number = 3000): Promise<void> {
    // Measure network speed by timing a small request
    const startTime = Date.now();
    
    try {
      // Make a small request to measure speed
      await page.evaluate(() => fetch('/favicon.ico').catch(() => {}));
      const responseTime = Date.now() - startTime;
      
      // Adjust wait time based on response time
      let adjustedWait = baseWaitTime;
      if (responseTime > 5000) {
        adjustedWait = baseWaitTime * 3; // Very slow network
      } else if (responseTime > 2000) {
        adjustedWait = baseWaitTime * 2; // Slow network
      }
      
      console.log(`⏳ Adaptive wait: ${adjustedWait}ms (based on ${responseTime}ms response time)`);
      await page.waitForTimeout(adjustedWait);
      
    } catch (error) {
      // Fallback to base wait time
      console.log(`⏳ Fallback wait: ${baseWaitTime}ms`);
      await page.waitForTimeout(baseWaitTime);
    }
  }

  /**
   * Check if network is slow and log warning
   */
  static async checkNetworkSpeed(page: Page): Promise<void> {
    console.log('🔍 Checking network speed...');
    
    const startTime = Date.now();
    
    try {
      await page.evaluate(() => fetch('/favicon.ico').catch(() => {}));
      const responseTime = Date.now() - startTime;
      
      if (responseTime > 5000) {
        console.log('🐌 VERY SLOW NETWORK DETECTED - Expect longer test times');
      } else if (responseTime > 2000) {
        console.log('⚠️ SLOW NETWORK DETECTED - Tests may take longer');
      } else {
        console.log('✅ Network speed appears normal');
      }
      
      console.log(`📊 Network response time: ${responseTime}ms`);
      
    } catch (error) {
      console.log('⚠️ Could not measure network speed');
    }
  }
}