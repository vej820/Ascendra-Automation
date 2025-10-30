import { test, expect } from '@playwright/test';
import { getLatestEmail } from '../../../gmailReader';
import fs from 'fs';
import path from 'path';

test('Login using Gmail credentials and extract Sponsor Code and Rank', async ({ page }) => {
  const creds = await getLatestEmail();
  console.log('✅ Logging in to Gmail...');

  expect(creds).toBeTruthy();
  if (!creds) return;

  console.log('✅ Username:', creds.username);
  console.log('✅ Password:', creds.password);

  const filePath = path.join(__dirname, 'utils', 'latest-user.json');

  // This directory creation logic was slightly incorrect, it should create the directory, not the file path
  const utilsDir = path.dirname(filePath);
  if (!fs.existsSync(utilsDir)) {
    fs.mkdirSync(utilsDir, { recursive: true });
  }

  console.log('🌐 Navigating to login page...');
  await page.goto('https://smartcity-project-a-portal-ppd2-c3ave4fdfpbwdyd2.southeastasia-01.azurewebsites.net/');

  await page.getByRole('textbox', { name: 'Username' }).fill(creds.username);
  await page.getByRole('textbox', { name: 'Password' }).fill(creds.password);
  await page.getByRole('button', { name: 'Login' }).click();
  console.log('🔍 Verifying login success by checking URL...');
  await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
  console.log('✅ Login successful! Now searching for Sponsor Code.');

  const sponsorLocator = page.getByText(/ASC-\d+/);
  await sponsorLocator.waitFor();

  const sponsorCodeText = await sponsorLocator.textContent();
  const extractedCode = sponsorCodeText?.match(/ASC-\d+/)?.[0];

  if (!extractedCode) {
    test.fail(true, 'Sponsor code not found. Nothing written.');
    return;
  }

  console.log('✅ Sponsor Code Extracted:', extractedCode);

  // =================================================================
  // 1. NEW LOGIC: EXTRACT THE RANK
  // =================================================================
  console.log('🔍 Extracting rank...');
  const rankLocator = page.locator('div').filter({ hasText: 'CURRENT RANK' }).first();
  const fullRankText = await rankLocator.textContent();
  let rank = 'Unknown'; // Default value if not found

  if (fullRankText) {
    const rankPattern = /CURRENT RANK(Associate|Builder|Consultant|Director|Executive)/;
    const match = fullRankText.match(rankPattern);
    // The captured rank is at index 1 of the match array
    if (match && match[1]) {
      rank = match[1];
      console.log(`✅ Rank Extracted: ${rank}`);
    } else {
      console.log('⚠️ Could not parse rank from text:', fullRankText);
    }
  } else {
    console.log('⚠️ Could not find rank element text.');
  }

  // ----- APPEND-ONLY -----
  // =================================================================
  // 2. UPDATE THE DATA TYPE TO INCLUDE 'rank'
  // =================================================================
  let data: Array<{ email: string; password: string; sponsorCode: string; rank: string }> = [];

  try {
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf-8').trim();
      if (fileContent) {
        data = JSON.parse(fileContent);
      }
    }
  } catch (err) {
    console.error('❌ Failed to read/parse latest-user.json:', err);
  }

  // =================================================================
  // 3. ADD THE 'rank' VARIABLE TO THE NEW USER OBJECT
  // =================================================================
  data.push({
    email: creds.username,
    password: creds.password,
    sponsorCode: extractedCode,
    rank: rank // Add the extracted rank here
  });
  console.log('➕ Added new user entry with rank.');

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`📥 Appended to latest-user.json (total: ${data.length} records)`);
});