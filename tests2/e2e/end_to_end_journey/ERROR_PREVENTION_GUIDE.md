# 🛡️ Error Prevention Guide for Playwright Automation

## 🚨 Common Timeout Errors and How to Avoid Them

### **1. Element Not Found Errors**

**❌ Problem:**
```typescript
await page.getByRole('button', { name: 'Account Activation Account' }).click();
// Error: Test timeout of 30000ms exceeded
```

**✅ Solution - Multiple Selector Strategy:**
```typescript
const selectors = [
    'button:has-text("Account Activation Account")',
    'button:has-text("Account Activation")', 
    '[role="button"]:has-text("Account Activation")',
    'a:has-text("Account Activation")'
];

let element = null;
for (const selector of selectors) {
    try {
        element = page.locator(selector).first();
        await element.waitFor({ timeout: 8000 });
        break;
    } catch (error) {
        console.log(`Selector failed: ${selector}`);
    }
}

if (!element) {
    throw new Error('Could not find element with any selector');
}
```

### **2. Page Loading Issues**

**❌ Problem:**
```typescript
await page.goto('https://example.com');
await page.click('button'); // Fails because page not fully loaded
```

**✅ Solution - Proper Wait Conditions:**
```typescript
await page.goto('https://example.com');
await page.waitForLoadState('networkidle'); // Wait for network to be idle
await page.waitForTimeout(3000); // Additional buffer time
await page.click('button');
```

### **3. Session State Issues**

**❌ Problem:**
```typescript
// Admin logs out, then member login fails
await adminLogin(page);
// ... admin operations
await memberLogin(page); // Fails due to session conflicts
```

**✅ Solution - Clear Browser State:**
```typescript
await adminLogin(page);
// ... admin operations

// Clear state before member login
await page.context().clearCookies();
await page.waitForTimeout(2000);
await memberLogin(page);
```

### **4. Dynamic Content Loading**

**❌ Problem:**
```typescript
await page.click('button');
await page.fill('input', 'text'); // Fails if content loads dynamically
```

**✅ Solution - Wait for Specific Elements:**
```typescript
await page.click('button');
await page.waitForSelector('input', { timeout: 10000 });
await page.fill('input', 'text');
```

## 🔧 **Best Practices for Robust Automation**

### **1. Always Use Try-Catch Blocks**
```typescript
async function robustFunction(page: Page) {
    try {
        await page.click('button');
        console.log('✅ Success');
    } catch (error) {
        console.log(`❌ Error: ${error}`);
        await page.screenshot({ path: 'debug-error.png' });
        throw error;
    }
}
```

### **2. Add Debugging Screenshots**
```typescript
// Before critical operations
await page.screenshot({ path: 'debug-before-action.png' });
await page.click('button');
await page.screenshot({ path: 'debug-after-action.png' });
```

### **3. Use Increased Timeouts for Slow Operations**
```typescript
// For slow-loading pages
await page.waitFor({ timeout: 60000 });

// For elements that take time to appear
await page.waitForSelector('button', { timeout: 30000 });
```

### **4. Log Detailed Information**
```typescript
console.log(`🔍 Current URL: ${page.url()}`);
console.log(`📄 Page title: ${await page.title()}`);

// List available elements for debugging
const buttons = await page.locator('button').all();
console.log(`📝 Found ${buttons.length} buttons`);
```

### **5. Use Element Existence Checks**
```typescript
const elementExists = await page.locator('button').count() > 0;
if (elementExists) {
    await page.click('button');
} else {
    console.log('⚠️ Button not found, skipping action');
}
```

## ⚙️ **Playwright Configuration for Better Reliability**

### **playwright.config.ts:**
```typescript
export default defineConfig({
  use: {
    actionTimeout: 60000,        // 60s for actions
    navigationTimeout: 60000,    // 60s for navigation
  },
  timeout: 300000,              // 5 minutes per test
  retries: 2,                   // Retry failed tests
});
```

## 🎯 **Specific Fixes for Your Error**

### **Your Error:**
```
Error: locator.click: Test timeout of 30000ms exceeded.
- waiting for getByRole('button', { name: 'Account Activation Account' })
```

### **Root Causes:**
1. **Admin login didn't work properly**
2. **Page structure is different than expected**
3. **Button text is slightly different**
4. **Page is still loading when trying to click**

### **Solutions Applied:**
1. ✅ **Multiple selector strategies** for finding the button
2. ✅ **Increased timeouts** (30s → 60s)
3. ✅ **Better wait conditions** (networkidle + buffer time)
4. ✅ **Debug screenshots** to see actual page state
5. ✅ **Detailed logging** to track what's happening
6. ✅ **Element listing** to see all available buttons

## 🚀 **Quick Checklist to Avoid Timeouts**

- [ ] Use `page.waitForLoadState('networkidle')` after navigation
- [ ] Add buffer time with `page.waitForTimeout(3000)`
- [ ] Use multiple selector strategies for critical elements
- [ ] Increase timeouts for slow operations
- [ ] Add try-catch blocks with error screenshots
- [ ] Clear browser state between different user sessions
- [ ] Log current URL and page title for debugging
- [ ] List available elements when selectors fail

**Following these practices will make your automation much more reliable!** 🎉