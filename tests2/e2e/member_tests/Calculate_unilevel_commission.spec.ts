import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// --- Configuration ---
const rankValues = {
  "Associate": 25,
  "Builder": 50,
  "Consultant": 70,
  "Director": 200,
  "Executive": 300
};

test('Login, extract balance, and verify commission calculation', async ({ page }) => {
  const latestUserJsonPath = path.join(__dirname, 'utils', 'latest-user.json');
  let userData;

  try {
    const fileContent = fs.readFileSync(latestUserJsonPath, 'utf-8');
    userData = JSON.parse(fileContent);
  } catch (error) {
    test.fail(true, `Failed to read or parse latest-user.json: ${(error as Error).message}`);
    return; // Stop the test if the file can't be read
  }

  if (!Array.isArray(userData) || userData.length === 0) {
    test.fail(true, 'latest-user.json is empty or not an array.');
    return;
  }

  // Get the first user from the array
  const firstUser = userData[0];
  const { email: username, password } = firstUser; // Assuming the key is 'email'

  if (!username || !password) {
      test.fail(true, 'First user in JSON is missing email or password.');
      return;
  }
  // --- 1. Login Steps ---
  await page.goto('https://smartcity-project-a-portal-ppd2-c3ave4fdfpbwdyd2.southeastasia-01.azurewebsites.net/');
  console.log(`✅ Navigated to login, attempting to log in as: ${username}`);
  await page.getByRole('textbox', { name: 'Username' }).fill(username);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await page.getByRole('button', { name: 'Login' }).click();
  
  await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
  console.log('✅ Logged in successfully');
  await page.waitForTimeout(2000);

  // --- 2. Locate and Extract the Actual Balance from UI ---
  console.log('🔍 Locating expansion account balance...');
  const balanceContainer = page.locator('div:has-text("Expansion Account Balance")').last();
  const fullText = await balanceContainer.textContent();

  if (!fullText) {
    throw new Error('Could not find the text content of the balance container.');
  }

  const match = fullText.match(/PHP\s*([\d,]+\.\d{2})/);
  const amountString = match ? match[1] : null;

  if (!amountString) {
    test.fail(true, `Could not parse the amount from the text: "${fullText}"`);
    return; // Stop the test if amount isn't found
  }
  
  const actualBalance = parseFloat(amountString.replace(/,/g, ''));
  console.log(`🔢 Actual Balance from UI: ${actualBalance}`);

  // --- 3. Read JSON and Calculate Expected Commission ---
  console.log('\n🔍 Reading latest-user.json to calculate expected commission...');
  let expectedCommission = 0;

  try {
    const fileContent = fs.readFileSync(latestUserJsonPath, 'utf-8');
    const userData = JSON.parse(fileContent);

    if (Array.isArray(userData) && userData.length > 1) {
      // Get all users *except* the first one using slice(1)
      const usersToCalculate = userData.slice(1);
      
      // Calculate the total using reduce
      expectedCommission = usersToCalculate.reduce((accumulator, currentUser) => {
        // Look up the rank's value, default to 0 if rank is not in our list
        const commission = rankValues[currentUser.rank as keyof typeof rankValues] || 0;
        console.log(`   - User Rank: ${currentUser.rank}, Commission: ${commission}`);
        return accumulator + commission;
      }, 0); // Start the sum at 0

      console.log(`💰 Expected Total Commission: ${expectedCommission}`);
    } else {
      console.log('⚠️ Not enough users in JSON file to calculate commission.');
    }
  } catch (error) {
    const errorMessage = (error instanceof Error) ? error.message : String(error);
    test.fail(true, `Failed to read or process latest-user.json: ${errorMessage}`);
    return;
  }

  // --- 4. Compare Actual Balance with Expected Commission ---
  console.log('\n🧪 Comparing values...');
  console.log(`- Actual Balance:   ${actualBalance}`);
  console.log(`- Expected Commission: ${expectedCommission}`);
  
  expect(actualBalance).toBe(expectedCommission);
  
  console.log('✅ Success! The actual balance matches the calculated commission.');
});