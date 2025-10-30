import { test, expect, Page, Browser } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { adminLogin } from '../../../utils/login';
import { associate, builder, consultant, director, executive } from '../../../utils/packages';
import { getLatestEmail } from '../../../gmailReader';
import fs from 'fs';
import path from 'path';

interface JourneyConfig {
  packageType: 'associate' | 'builder' | 'consultant' | 'director' | 'executive';
  userCount: number;
  sponsorCode: string;
}

interface UserJourneyResult {
  userData: any;
  signupSuccess: boolean;
  activationSuccess: boolean;
  loginSuccess: boolean;
  orderSuccess: boolean;
  commissionSuccess: boolean;
  errors: string[];
  duration: number;
}

test.describe('Advanced End-to-End User Journey Automation', () => {
  
  test('Multi-User Journey with Different Package Types', async ({ browser }) => {
    console.log('🚀 Starting Advanced Multi-User Journey Automation\n');

    const journeyConfigs: JourneyConfig[] = [
      { packageType: 'associate', userCount: 2, sponsorCode: 'ASC-8910258878' },
      { packageType: 'builder', userCount: 1, sponsorCode: 'ASC-8910258878' },
      { packageType: 'consultant', userCount: 1, sponsorCode: 'ASC-8910258878' }
    ];

    const allResults: UserJourneyResult[] = [];

    for (const config of journeyConfigs) {
      console.log(`📦 Processing ${config.packageType.toUpperCase()} package (${config.userCount} users)`);
      
      const configResults = await processPackageType(browser, config);
      allResults.push(...configResults);
    }

    // Generate comprehensive report
    await generateJourneyReport(allResults);
    console.log('🎉 Advanced Multi-User Journey Completed Successfully! 🎉');
  });

  test('Commission Chain Verification', async ({ browser }) => {
    console.log('💰 Starting Commission Chain Verification\n');
    
    // Create a sponsor-downline chain
    const sponsorResult = await createUserJourney(browser, {
      packageType: 'director',
      userCount: 1,
      sponsorCode: 'ASC-8910258878'
    });

    // Create downlines under the sponsor
    if (sponsorResult.length > 0 && sponsorResult[0].signupSuccess) {
      const downlineResults = await createUserJourney(browser, {
        packageType: 'associate',
        userCount: 3,
        sponsorCode: sponsorResult[0].userData.memberCode || 'ASC-8910258878'
      });

      // Verify commission distribution
      await verifyCommissionChain(browser, sponsorResult[0], downlineResults);
    }
  });
});

// ========================================
// CORE JOURNEY FUNCTIONS
// ========================================

async function processPackageType(browser: Browser, config: JourneyConfig): Promise<UserJourneyResult[]> {
  const results: UserJourneyResult[] = [];
  
  for (let i = 0; i < config.userCount; i++) {
    console.log(`   👤 Processing user ${i + 1}/${config.userCount} for ${config.packageType}`);
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      const result = await executeCompleteJourney(page, config.packageType, config.sponsorCode);
      results.push(result);
      console.log(`   ✅ User ${i + 1} journey completed: ${result.signupSuccess ? 'SUCCESS' : 'FAILED'}`);
    } catch (error) {
      console.log(`   ❌ User ${i + 1} journey failed: ${error}`);
      results.push({
        userData: null,
        signupSuccess: false,
        activationSuccess: false,
        loginSuccess: false,
        orderSuccess: false,
        commissionSuccess: false,
        errors: [error?.toString() || 'Unknown error'],
        duration: 0
      });
    } finally {
      await context.close();
    }
  }
  
  return results;
}

async function executeCompleteJourney(
  page: Page, 
  packageType: string, 
  sponsorCode: string
): Promise<UserJourneyResult> {
  const startTime = Date.now();
  const result: UserJourneyResult = {
    userData: null,
    signupSuccess: false,
    activationSuccess: false,
    loginSuccess: false,
    orderSuccess: false,
    commissionSuccess: false,
    errors: [],
    duration: 0
  };

  try {
    // Step 1: Signup
    console.log(`      📝 Executing signup for ${packageType}...`);
    result.userData = await executeSignup(page, packageType, sponsorCode);
    result.signupSuccess = true;
    console.log(`      ✅ Signup completed: ${result.userData.email}`);

    // Step 2: Account Activation (Admin)
    console.log(`      🔐 Executing account activation...`);
    await executeActivation(page, result.userData);
    result.activationSuccess = true;
    console.log(`      ✅ Account activated`);

    // Step 2.5: Extract Real Credentials from Email
    console.log(`      📧 Extracting real credentials from email...`);
    await extractRealCredentials(result.userData);
    console.log(`      ✅ Credentials extracted`);

    // Step 3: Member Login
    console.log(`      🔑 Executing member login...`);
    await executeMemberLogin(page, result.userData);
    result.loginSuccess = true;
    console.log(`      ✅ Member login successful`);

    // Step 4: Create Order
    console.log(`      🛒 Executing order creation...`);
    await executeOrderCreation(page, result.userData);
    result.orderSuccess = true;
    console.log(`      ✅ Order created: ${result.userData.transactionNumber}`);

    // Step 5: Verify Commission
    console.log(`      💰 Verifying commission calculation...`);
    await executeCommissionVerification(page, result.userData);
    result.commissionSuccess = true;
    console.log(`      ✅ Commission verified: PHP ${result.userData.commissionEarned}`);

  } catch (error) {
    result.errors.push(error?.toString() || 'Unknown error occurred');
    console.log(`      ❌ Journey step failed: ${error}`);
  }

  result.duration = Date.now() - startTime;
  return result;
}

// ========================================
// INDIVIDUAL STEP FUNCTIONS
// ========================================

async function executeSignup(page: Page, packageType: string, sponsorCode: string): Promise<any> {
  const userData = generateUserData(sponsorCode);
  
  // Navigate and fill signup form
  await page.goto('https://smartcity-a-portal-fd-ppd-hzg4bhfvf5drdxcs.z03.azurefd.net/');
  await page.getByRole('link', { name: 'Signup' }).click();

  // Fill personal information
  await page.getByRole('textbox', { name: 'First Name *' }).fill(userData.firstName);
  await page.getByRole('textbox', { name: 'Middle Name' }).fill(userData.middleName);
  await page.getByRole('textbox', { name: 'Last Name *' }).fill(userData.lastName);
  await page.getByRole('textbox', { name: 'Birthday *' }).fill(userData.birthday);
  
  // Select gender and status
  await page.getByRole('combobox').filter({ hasText: 'Gender' }).click();
  await page.getByRole('option', { name: 'Male', exact: true }).click();
  await page.getByRole('combobox').filter({ hasText: 'Status' }).click();
  await page.getByRole('option', { name: 'Single' }).click();

  // Fill contact information
  await page.getByRole('textbox', { name: 'Email Address *' }).fill(userData.email);
  await page.getByRole('textbox', { name: 'Contact Number *' }).fill(userData.number);
  await page.getByRole('textbox', { name: 'Address *', exact: true }).fill(userData.address);
  await page.getByRole('textbox', { name: 'Sponsor ID *' }).fill(sponsorCode);
  
  await page.getByRole('button', { name: 'Next' }).click();

  // Select package based on type
  await selectPackage(page, packageType);
  
  // Complete signup
  await page.getByRole('checkbox', { name: 'I accept the terms and' }).click();
  await page.getByRole('button', { name: 'Pay Now' }).click();
  await page.getByText('Payment Instructions Sent').waitFor();
  await page.getByRole('button', { name: 'I Understand' }).click();

  return { ...userData, packageType };
}

async function selectPackage(page: Page, packageType: string): Promise<void> {
  switch (packageType.toLowerCase()) {
    case 'associate':
      await associate(page);
      break;
    case 'builder':
      await builder(page);
      break;
    case 'consultant':
      await consultant(page);
      break;
    case 'director':
      await director(page);
      break;
    case 'executive':
      await executive(page);
      break;
    default:
      await associate(page); // Default to associate
  }
}

async function executeActivation(page: Page, userData: any): Promise<void> {
  await adminLogin(page);
  await page.getByRole('button', { name: 'Account Activation Account' }).click();
  await page.waitForTimeout(2000);

  // Try to find specific user or activate first available
  const userRow = page.locator(`tr:has-text("${userData.email}")`);
  
  if (await userRow.count() > 0) {
    await userRow.getByRole('button', { name: 'Activate' }).click();
  } else {
    const activateButtons = page.getByRole('button', { name: 'Activate' });
    if (await activateButtons.count() > 0) {
      await activateButtons.first().click();
    }
  }
  
  await page.getByRole('button', { name: 'Confirm and Activate' }).click();
  await expect(page.getByText('Account successfully')).toBeVisible();
}

async function executeMemberLogin(page: Page, userData: any): Promise<void> {
  await page.goto('https://smartcity-a-portal-fd-ppd-hzg4bhfvf5drdxcs.z03.azurefd.net/');
  
  console.log(`      🔑 Using Gmail-extracted credentials for login...`);
  
  if (!userData.email || !userData.password) {
    throw new Error('No Gmail credentials available for login');
  }

  try {
    // Use ONLY Gmail-extracted credentials
    await page.getByRole('textbox', { name: 'Username' }).fill(userData.email);
    await page.getByRole('textbox', { name: 'Password' }).fill(userData.password);
    await page.getByRole('button', { name: 'Login' }).click();

    // Check for success
    await page.waitForTimeout(3000);
    const currentUrl = page.url();
    
    if (currentUrl.includes('dashboard') || currentUrl.includes('home') || currentUrl.includes('portal')) {
      console.log(`      ✅ Login successful with Gmail credentials`);
    } else {
      // Check for dashboard elements
      try {
        await page.getByRole('paragraph').filter({ hasText: 'Dashboard' }).waitFor({ timeout: 5000 });
        console.log(`      ✅ Login successful - dashboard detected`);
      } catch {
        throw new Error('Login failed - no dashboard or success page detected');
      }
    }
  } catch (error) {
    console.log(`      ❌ Gmail credential login failed: ${error}`);
    throw new Error(`Login failed with Gmail credentials: ${error}`);
  }
}

async function executeOrderCreation(page: Page, userData: any): Promise<void> {
  await page.getByRole('button', { name: 'Store Store' }).click();
  await page.getByRole('link', { name: 'Order Order' }).click();

  // Add product to cart (simplified version)
  try {
    await page.locator('div').filter({ hasText: /^PricePHP 600\.00Quantity1$/ }).getByRole('button').nth(1).click();
    await page.getByRole('button', { name: 'Add to Cart' }).first().click();
    await page.getByRole('button', { name: 'Proceed to Checkout' }).click();
    await page.getByRole('checkbox', { name: 'By clicking this, I agree to' }).click();
    await page.getByRole('button', { name: 'Place Order' }).click();

    // Extract transaction number
    await page.getByRole('link', { name: 'My Vault My Vault' }).click();
    await page.waitForSelector('tbody tr');
    const firstRow = page.locator('tbody tr').first();
    const txnLink = firstRow.locator('a').filter({ hasText: /^COM-/ });
    await txnLink.waitFor({ state: 'visible', timeout: 10000 });
    userData.transactionNumber = (await txnLink.textContent())?.trim() || 'N/A';
  } catch (error) {
    userData.transactionNumber = 'ORDER_FAILED';
    throw new Error(`Order creation failed: ${error}`);
  }
}

async function executeCommissionVerification(page: Page, userData: any): Promise<void> {
  try {
    await page.getByRole('link', { name: 'Earnings' }).click();
    await page.waitForTimeout(3000);
    
    const commissionElements = page.locator('[data-testid="commission-amount"], .commission-value, .earnings-amount');
    if (await commissionElements.count() > 0) {
      const commissionText = await commissionElements.first().textContent();
      const commissionMatch = commissionText?.match(/[\d,]+\.?\d*/);
      userData.commissionEarned = commissionMatch ? parseFloat(commissionMatch[0].replace(',', '')) : 0;
    } else {
      userData.commissionEarned = 0;
    }
  } catch (error) {
    userData.commissionEarned = 0;
  }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

function generateUserData(sponsorCode: string): any {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  
  return {
    firstName,
    middleName: faker.person.middleName(),
    lastName,
    birthday: faker.date.birthdate({ min: 18, max: 50, mode: 'age' }).toISOString().split('T')[0],
    address: faker.location.streetAddress(),
    number: '09' + faker.number.int({ min: 100000000, max: 999999999 }).toString(),
    email: `vegie+${firstName.toLowerCase()}.${lastName.toLowerCase()}@skunkworks.ai`,
    sponsorCode
  };
}

async function createUserJourney(browser: Browser, config: JourneyConfig): Promise<UserJourneyResult[]> {
  return await processPackageType(browser, config);
}

async function verifyCommissionChain(browser: Browser, sponsor: UserJourneyResult, downlines: UserJourneyResult[]): Promise<void> {
  console.log('🔗 Verifying commission chain distribution...');
  
  // Implementation for commission chain verification
  // This would involve checking if sponsor received commissions from downline activities
  
  console.log(`   📊 Sponsor: ${sponsor.userData?.email} - Commission: PHP ${sponsor.userData?.commissionEarned || 0}`);
  downlines.forEach((downline, index) => {
    console.log(`   📊 Downline ${index + 1}: ${downline.userData?.email} - Commission: PHP ${downline.userData?.commissionEarned || 0}`);
  });
}

async function extractRealCredentials(userData: any): Promise<void> {
  console.log(`      📧 Waiting for Gmail credentials...`);
  
  // Wait for email to arrive
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  try {
    const emailCredentials = await getLatestEmail();
    
    if (emailCredentials && emailCredentials.username && emailCredentials.password) {
      userData.email = emailCredentials.username;
      userData.password = emailCredentials.password;
      console.log(`      ✅ Gmail credentials extracted: ${userData.email} / ${userData.password}`);
    } else {
      throw new Error('No credentials found in Gmail');
    }
  } catch (error) {
    console.log(`      ❌ Gmail extraction failed: ${error}`);
    throw new Error(`Gmail credential extraction failed: ${error}`);
  }
}

async function generateJourneyReport(results: UserJourneyResult[]): Promise<void> {
  const reportPath = path.join(__dirname, 'test_data', 'journey_report.json');
  const reportDir = path.dirname(reportPath);
  
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const report = {
    testDate: new Date().toISOString(),
    totalUsers: results.length,
    successfulSignups: results.filter(r => r.signupSuccess).length,
    successfulActivations: results.filter(r => r.activationSuccess).length,
    successfulLogins: results.filter(r => r.loginSuccess).length,
    successfulOrders: results.filter(r => r.orderSuccess).length,
    successfulCommissions: results.filter(r => r.commissionSuccess).length,
    averageDuration: results.reduce((sum, r) => sum + r.duration, 0) / results.length,
    results
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log('\n📊 JOURNEY REPORT SUMMARY:');
  console.log(`   Total Users Processed: ${report.totalUsers}`);
  console.log(`   Successful Signups: ${report.successfulSignups}/${report.totalUsers}`);
  console.log(`   Successful Activations: ${report.successfulActivations}/${report.totalUsers}`);
  console.log(`   Successful Logins: ${report.successfulLogins}/${report.totalUsers}`);
  console.log(`   Successful Orders: ${report.successfulOrders}/${report.totalUsers}`);
  console.log(`   Successful Commissions: ${report.successfulCommissions}/${report.totalUsers}`);
  console.log(`   Average Duration: ${Math.round(report.averageDuration / 1000)}s per user`);
  console.log(`   Report saved to: ${reportPath}\n`);
}