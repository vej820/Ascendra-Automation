import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🐌 SLOW NETWORK MODE ENABLED');
  console.log('⚙️  Optimizations applied:');
  console.log('   - Extended timeouts (3-5x normal)');
  console.log('   - Single worker execution');
  console.log('   - Reduced browser resource usage');
  console.log('   - Adaptive wait times');
  console.log('   - Enhanced error handling');
  console.log('');
  
  // Test basic connectivity
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    console.log('🔍 Testing network connectivity...');
    const startTime = Date.now();
    await page.goto('https://www.google.com', { timeout: 60000 });
    const loadTime = Date.now() - startTime;
    
    if (loadTime > 10000) {
      console.log('🐌 VERY SLOW NETWORK DETECTED');
      console.log(`   Load time: ${loadTime}ms`);
      console.log('   Recommendation: Consider running tests during off-peak hours');
    } else if (loadTime > 5000) {
      console.log('⚠️  SLOW NETWORK DETECTED');
      console.log(`   Load time: ${loadTime}ms`);
    } else {
      console.log('✅ Network speed acceptable');
      console.log(`   Load time: ${loadTime}ms`);
    }
    
  } catch (error) {
    console.log('❌ Network connectivity test failed');
    console.log('   Tests may experience timeouts');
  } finally {
    await browser.close();
  }
  
  console.log('');
}

export default globalSetup;