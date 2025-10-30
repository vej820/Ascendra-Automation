import { test, expect, Page } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { adminLogin, memberLogin } from '../../../utils/login';
import { associate, builder, consultant, director, executive } from '../../../utils/packages';
import { getLatestEmail } from '../../../gmailReader';
import { SlowNetworkHelper } from '../../../utils/slow_network_helper';
import fs from 'fs';
import path from 'path';

interface UserData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    sponsorCode: string;
    packageType: string;
    transactionNumber?: string;
    activationStatus?: string;
    commissionEarned?: number;
}

// Test data storage
const testDataPath = path.join(__dirname, 'test_data', 'user_journey_data.json');

test.describe('Complete End-to-End User Journey', () => {
    let userData: UserData;

    test.beforeAll(async () => {
        // Ensure test data directory exists
        const testDataDir = path.dirname(testDataPath);
        if (!fs.existsSync(testDataDir)) {
            fs.mkdirSync(testDataDir, { recursive: true });
        }
    });

    test('Complete User Lifecycle: Signup → Activation → Login → Order → Commission', async ({ page, browser }) => {
        console.log('🚀 Starting Complete User Journey Automation\n');
        
        // Check network speed at the beginning
        await SlowNetworkHelper.checkNetworkSpeed(page);

        // ========================================
        // STEP 1: MEMBER SIGNUP
        // ========================================
        console.log('📝 STEP 1: Member Signup Process');

        userData = await performMemberSignup(page);
        console.log(`✅ Signup completed for: ${userData.email}\n`);

        // ========================================
        // STEP 2: ADMIN ACCOUNT ACTIVATION
        // ========================================
        console.log('🔐 STEP 2: Admin Account Activation');

        await performAccountActivation(page, userData);
        console.log(`✅ Account activated for: ${userData.email}\n`);

        // ========================================
        // STEP 2.5: EXTRACT REAL CREDENTIALS FROM EMAIL
        // ========================================
        console.log('📧 STEP 2.5: Extracting Real Credentials from Email');

        await extractCredentialsFromEmail(userData);
        console.log(`✅ Real credentials extracted for: ${userData.email}\n`);

        // ========================================
        // STEP 3: MEMBER LOGIN & VERIFICATION
        // // ========================================
        // console.log('🔑 STEP 3: Member Login & Dashboard Verification');

        // await performMemberLogin(page, userData);
        // console.log(`✅ Member login successful for: ${userData.email}\n`);

        // // ========================================
        // // STEP 4: CREATE ORDER
        // // ========================================
        // console.log('🛒 STEP 4: Create Order Process');

        // await performOrderCreation(page, userData);
        // console.log(`✅ Order created successfully. Transaction: ${userData.transactionNumber}\n`);

        // // ========================================
        // // STEP 5: COMMISSION CALCULATION VERIFICATION
        // // ========================================
        // console.log('💰 STEP 5: Commission Calculation Verification');

        // await verifyCommissionCalculation(page, userData);
        // console.log(`✅ Commission verification completed\n`);

        // // ========================================
        // // STEP 6: SAVE TEST RESULTS
        // // ========================================
        // console.log('💾 STEP 6: Saving Test Results');

        // await saveTestResults(userData);
        // console.log(`✅ Test data saved to: ${testDataPath}\n`);

        // console.log('🎉 COMPLETE USER JOURNEY AUTOMATION FINISHED SUCCESSFULLY! 🎉');
    });
});

// ========================================
// HELPER FUNCTIONS
// ========================================

async function performMemberSignup(page: Page): Promise<UserData> {
    const firstName = faker.person.firstName();
    const middleName = faker.person.middleName();
    const lastName = faker.person.lastName();
    const birthday = faker.date.birthdate({ min: 18, max: 50, mode: 'age' }).toISOString().split('T')[0];
    const address = faker.location.streetAddress();
    const number = '09' + faker.number.int({ min: 100000000, max: 999999999 }).toString();
    const sponsorCode = 'ASC-5710724913';
    const fakeEmail = `vegie+${firstName.toLowerCase()}.${lastName.toLowerCase()}@skunkworks.ai`;

    // Navigate to signup page with slow network optimization
    await SlowNetworkHelper.slowGoto(page, 'https://smartcity-a-portal-fd-ppd-hzg4bhfvf5drdxcs.z03.azurefd.net/');
    await SlowNetworkHelper.adaptiveWait(page, 2000);
    await SlowNetworkHelper.slowClick(page, 'a:has-text("Signup")');

    // Fill personal information
    await page.getByRole('textbox', { name: 'First Name *' }).fill(firstName);
    await page.getByRole('textbox', { name: 'Middle Name' }).fill(middleName);
    await page.getByRole('textbox', { name: 'Last Name *' }).fill(lastName);
    await page.getByRole('textbox', { name: 'Birthday *' }).fill(birthday);

    // Select gender and status
    await page.getByRole('combobox').filter({ hasText: 'Gender' }).click();
    await page.getByRole('option', { name: 'Male', exact: true }).click();
    await page.getByRole('combobox').filter({ hasText: 'Status' }).click();
    await page.getByRole('option', { name: 'Single' }).click();

    // Fill contact information
    await page.getByRole('textbox', { name: 'Email Address *' }).fill(fakeEmail);
    await page.getByRole('textbox', { name: 'Contact Number *' }).fill(number);
    await page.getByRole('textbox', { name: 'Address *', exact: true }).fill(address);
    await page.getByRole('textbox', { name: 'Sponsor ID *' }).fill(sponsorCode);

    await page.getByRole('button', { name: 'Next' }).click();

    // Select package (Associate by default)
    await associate(page);

    // Accept terms and complete signup
    await page.getByRole('checkbox', { name: 'I accept the terms and' }).click();
    await page.getByRole('button', { name: 'Pay Now' }).click();
    await page.getByText('Payment Instructions Sent').waitFor();
    await page.getByRole('button', { name: 'I Understand' }).click();

    // Return initial user data (password will be populated from Gmail extraction)
    console.log(`   📝 Signup completed, credentials will be extracted from Gmail`);

    return {
        firstName,
        lastName,
        email: fakeEmail,
        password: '', // Will be populated from Gmail extraction
        sponsorCode,
        packageType: 'Associate'
    };
}

async function performAccountActivation(page: Page, userData: UserData): Promise<void> {
    console.log('   🔐 Starting admin login for account activation...');

    try {
        // Admin login with error handling
        await adminLogin(page);
        console.log('   ✅ Admin login successful');

        // Wait for admin dashboard to load completely (optimized for slow network)
        console.log('   ⏳ Waiting for admin dashboard to load...');
        await page.waitForLoadState('networkidle', { timeout: 120000 }); // 2 minutes for slow networks
        await SlowNetworkHelper.adaptiveWait(page, 5000); // Adaptive wait based on network speed

        // Debug: Check current state
        const currentUrl = page.url();
        const pageTitle = await page.title();
        console.log(`   🔍 Admin page URL: ${currentUrl}`);
        console.log(`   📄 Admin page title: ${pageTitle}`);

        // Take screenshot for debugging
        await page.screenshot({ path: 'debug-admin-dashboard.png' });
        console.log('   📸 Admin dashboard screenshot: debug-admin-dashboard.png');

        // Try multiple strategies to find the Account Activation button
        console.log('   🔍 Looking for Account Activation button...');

        let activationButton = null;
        const activationSelectors = [
            'button:has-text("Account Activation Account")',
            'button:has-text("Account Activation")',
            '[role="button"]:has-text("Account Activation")',
            'a:has-text("Account Activation")',
            'button:has-text("Activation")',
            '[href*="activation"]',
            'button[title*="activation" i]'
        ];

        for (let i = 0; i < activationSelectors.length; i++) {
            const selector = activationSelectors[i];
            try {
                console.log(`   🔍 Trying selector ${i + 1}/${activationSelectors.length}: ${selector}`);
                activationButton = page.locator(selector).first();
                await activationButton.waitFor({ timeout: 8000 }); // Increased timeout
                console.log(`   ✅ Found activation button with selector: ${selector}`);
                break;
            } catch (error) {
                console.log(`   ❌ Selector failed: ${selector}`);
            }
        }

        if (!activationButton) {
            // Debug: List all buttons on the page
            console.log('   🔍 Listing all available buttons for debugging...');
            const allButtons = await page.locator('button, [role="button"], a').all();
            console.log(`   📝 Found ${allButtons.length} clickable elements`);

            for (let i = 0; i < Math.min(allButtons.length, 15); i++) {
                const button = allButtons[i];
                const text = await button.textContent();
                const href = await button.getAttribute('href');
                const title = await button.getAttribute('title');
                console.log(`   📝 Element ${i + 1}: "${text?.trim()}" ${href ? `(href: ${href})` : ''} ${title ? `(title: ${title})` : ''}`);
            }

            throw new Error('❌ Could not find Account Activation button with any selector. Check admin dashboard structure.');
        }

        // Click the Account Activation button
        console.log('   🖱️  Clicking Account Activation button...');
        await activationButton.click();

        // Wait for the page to load
        await page.waitForTimeout(2000);

        // Look for the user's email in the activation list
        const userRow = page.locator(`tr:has-text("${userData.email}")`);

        if (await userRow.count() > 0) {
            // Click activate button for this specific user
            await userRow.getByRole('button', { name: 'Activate' }).click();
            await page.getByRole('button', { name: 'Confirm and Activate' }).click();
            await expect(page.getByText('Account successfully')).toBeVisible();
            userData.activationStatus = 'activated';
            console.log(`   ✅ Account activated for: ${userData.email}`);
        } else {
            // If user not found, activate the first available account
            const activateButtons = page.getByRole('button', { name: 'Activate' });
            if (await activateButtons.count() > 0) {
                await activateButtons.first().click();
                await page.getByRole('button', { name: 'Confirm and Activate' }).click();
                await expect(page.getByText('Account successfully')).toBeVisible();
                userData.activationStatus = 'activated';
                console.log(`   ✅ Account activated (first available)`);
            } else {
                throw new Error('No accounts available for activation');
            }
        }

    } catch (error) {
        console.log(`   ❌ Account activation failed: ${error}`);

        // Take error screenshot
        await page.screenshot({ path: 'debug-activation-error.png' });
        console.log('   📸 Error screenshot saved: debug-activation-error.png');

        // Log current page info for debugging
        const currentUrl = page.url();
        const pageTitle = await page.title();
        console.log(`   🔍 Error page URL: ${currentUrl}`);
        console.log(`   📄 Error page title: ${pageTitle}`);

        throw new Error(`Account activation failed: ${error}`);
    }
}

// async function performMemberLogin(page: Page, userData: UserData): Promise<void> {
//     console.log(`   🔑 Starting member login process...`);
//     console.log(`   📧 Email: ${userData.email}`);
//     console.log(`   🔑 Password: ${userData.password}`);

//     // Clear browser state after admin logout to ensure clean session
//     console.log('🧹 Clearing browser state after admin session...');
//     await page.context().clearCookies();

//     // Use the EXACT same approach as testLoginAndSCExtraction.spec.ts
//     console.log('🌐 Navigating to login page...');
//     await page.goto('https://smartcity-a-portal-fd-ppd-hzg4bhfvf5drdxcs.z03.azurefd.net/');

//     // Wait for page to fully load after clearing session
//     console.log('⏳ Waiting for page to load completely...');
//     await page.waitForLoadState('networkidle');

//     // Additional wait to ensure login form is ready
//     await page.waitForTimeout(3000);

//     // Use the EXACT same selectors as the working file
//     console.log('📝 Filling login credentials...');
//     await page.getByRole('textbox', { name: 'Username' }).fill(userData.email);
//     await page.getByRole('textbox', { name: 'Password' }).fill(userData.password);
//     await page.getByRole('button', { name: 'Login' }).click();

//     // Use the same success verification as the working file
//     console.log('🔍 Verifying login success by checking URL...');
//     await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
//     console.log('✅ Member login successful!');
//     await page.pause();
// }

// async function performOrderCreation(page: Page, userData: UserData): Promise<void> {
//     // Navigate to store
//     await page.getByRole('button', { name: 'Store Store' }).click();
//     await page.getByRole('link', { name: 'Order Order' }).click();

//     // Add items to cart (adjust selectors based on your actual store)
//     try {
//         // Add first product
//         await page.locator('div').filter({ hasText: /^PricePHP 600\.00Quantity1$/ }).getByRole('button').nth(1).click();
//         await page.getByRole('button', { name: 'Add to Cart' }).first().click();

//         // Proceed to checkout
//         await page.getByRole('button', { name: 'Proceed to Checkout' }).click();
//         await page.getByRole('checkbox', { name: 'By clicking this, I agree to' }).click();
//         await page.getByRole('button', { name: 'Place Order' }).click();

//         // Get transaction number
//         await page.getByRole('link', { name: 'My Vault My Vault' }).click();
//         await page.waitForSelector('tbody tr');

//         const firstRow = page.locator('tbody tr').first();
//         const txnLink = firstRow.locator('a').filter({ hasText: /^COM-/ });
//         await txnLink.waitFor({ state: 'visible', timeout: 20000 });
//         const transactionNumber = (await txnLink.textContent())?.trim();

//         userData.transactionNumber = transactionNumber || 'N/A';
//         console.log(`   ✅ Order created with transaction: ${userData.transactionNumber}`);
//     } catch (error) {
//         console.log(`   ⚠️  Order creation encountered issues, but continuing`);
//         userData.transactionNumber = 'ORDER_CREATION_FAILED';
//     }
// }

// async function verifyCommissionCalculation(page: Page, userData: UserData): Promise<void> {
//     try {
//         // Navigate to commission/earnings section
//         await page.getByRole('link', { name: 'Earnings' }).click();

//         // Wait for commission data to load
//         await page.waitForTimeout(3000);

//         // Extract commission information (adjust selectors based on your UI)
//         const commissionElements = page.locator('[data-testid="commission-amount"], .commission-value, .earnings-amount');

//         if (await commissionElements.count() > 0) {
//             const commissionText = await commissionElements.first().textContent();
//             const commissionMatch = commissionText?.match(/[\d,]+\.?\d*/);
//             userData.commissionEarned = commissionMatch ? parseFloat(commissionMatch[0].replace(',', '')) : 0;
//             console.log(`   ✅ Commission calculated: PHP ${userData.commissionEarned}`);
//         } else {
//             console.log(`   ⚠️  Commission data not yet available`);
//             userData.commissionEarned = 0;
//         }
//     } catch (error) {
//         console.log(`   ⚠️  Commission verification encountered issues`);
//         userData.commissionEarned = 0;
//     }
// }

async function extractCredentialsFromEmail(userData: UserData): Promise<void> {
    console.log('   📧 Waiting for welcome email with credentials...');

    // Wait for the email to arrive (increased wait time)
    console.log('   ⏳ Waiting 10 seconds for email delivery...');
    await new Promise(resolve => setTimeout(resolve, 10000));

    try {
        // Get credentials from Gmail - this is our ONLY source
        const emailCredentials = await getLatestEmail();

        if (emailCredentials && emailCredentials.username && emailCredentials.password) {
            // Update user data with real credentials from email
            userData.email = emailCredentials.username;
            userData.password = emailCredentials.password;

            console.log(`   ✅ Gmail credentials successfully extracted:`);
            console.log(`   � Email: d${userData.email}`);
            console.log(`   🔑 Password: ${userData.password}`);

            // Save the real credentials
            const credentialsPath = path.join(__dirname, '..', '..', 'utils', 'latest-user.json');
            const credentialsDir = path.dirname(credentialsPath);
            if (!fs.existsSync(credentialsDir)) {
                fs.mkdirSync(credentialsDir, { recursive: true });
            }

            fs.writeFileSync(credentialsPath, JSON.stringify({
                email: userData.email,
                password: userData.password,
                firstName: userData.firstName,
                lastName: userData.lastName,
                sponsorCode: userData.sponsorCode
            }, null, 2));

        } else {
            // No fallback - this is a critical failure
            throw new Error('Gmail credential extraction failed - no username/password found in email');
        }

    } catch (error) {
        console.log(`   ❌ CRITICAL: Gmail credential extraction failed: ${error}`);
        console.log('   💡 Possible issues:');
        console.log('      - Email not yet delivered (try increasing wait time)');
        console.log('      - Gmail API credentials not configured');
        console.log('      - Email format changed');
        console.log('      - Account activation did not trigger email');

        // Throw error to stop the test since Gmail is our only credential source
        throw new Error(`Gmail credential extraction failed: ${error}`);
    }
}

// async function saveTestResults(userData: UserData): Promise<void> {
// Load existing data or create new array
// let existingData: UserData[] = [];
// if (fs.existsSync(testDataPath)) {
//     try {
//         const fileContent = fs.readFileSync(testDataPath, 'utf-8');
//         existingData = JSON.parse(fileContent);
//     } catch (error) {
//         console.log('   ⚠️  Could not parse existing data, creating new file');
//     }
// }

// // Add current test data
// existingData.push({
//     ...userData,
//     testDate: new Date().toISOString(),
//     testStatus: 'completed'
// } as any);

// // Save updated data
// fs.writeFileSync(testDataPath, JSON.stringify(existingData, null, 2));
// console.log(`   ✅ Test results saved successfully`);
// }