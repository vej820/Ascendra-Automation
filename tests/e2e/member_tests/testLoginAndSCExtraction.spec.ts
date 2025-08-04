import { test, expect } from '@playwright/test';
import { getLatestEmail } from '../../../gmailReader';
import fs from 'fs';
import path from 'path';

test('Login using Gmail credentials and extract Sponsor Code', async ({ page }) => {
  const creds = await getLatestEmail();
  console.log('✅ Logging in to Gmail...');

  expect(creds).toBeTruthy();
  if (!creds) return;

  console.log('✅ Username:', creds.username);
  console.log('✅ Password:', creds.password);

const utilsDir = path.join(__dirname, 'utils');
const filePath = path.join(utilsDir, 'latest-user.json');

// Create the directory if it doesn't exist
if (!fs.existsSync(utilsDir)) {
fs.mkdirSync(utilsDir, { recursive: true });
}

  console.log('🌐 Navigating to login page...');
  await page.goto('https://smart-city-ascendra-por-ppd2-g7c0e7echsdse3cq.southeastasia-01.azurewebsites.net');

  await page.getByRole('textbox', { name: 'Username' }).fill(creds.username);
  await page.getByRole('textbox', { name: 'Password' }).fill(creds.password);
  await page.getByRole('button', { name: 'Login' }).click();

  console.log('🔍 Waiting for dashboard...');
  // await page.pause();
  // await expect(page.getByText('CURRENT RANK')).toBeVisible();
  // Extract sponsor code (adjust selector if needed)
  await page.waitForTimeout(4000); // Wait for the page to load completely
  const sponsorCodeText = await page.getByText('ASC-').textContent();
  const extractedCode = sponsorCodeText?.match(/ASC-\d+/)?.[0];

  expect(extractedCode).toBeTruthy();
  if (!extractedCode) {
    console.log('❌ Sponsor code not found.');
    return;
  }

  console.log('✅ Sponsor Code Extracted:', extractedCode);

  // Append to latest-user.json
let data = [];

if (fs.existsSync(filePath)) {
  const fileContent = fs.readFileSync(filePath, 'utf-8').trim();

  if (fileContent) {
    try {
      data = JSON.parse(fileContent);
    } catch (error) {
      if (error instanceof Error) {
        console.error('❌ Failed to parse JSON:', error.message);
      } else {
        console.error('❌ Failed to parse JSON:', error);
      }
      // Optional: rename or reset the corrupted file
      fs.renameSync(filePath, filePath + '.bak');
      console.log('🚨 Renamed corrupted file to latest-user.json.bak');
      data = [];
    }
  }
}

  data.push({
    email: creds.username,
    password: creds.password,
    sponsorCode: extractedCode
  });
if (!fs.existsSync(utilsDir)) {
  fs.mkdirSync(utilsDir, { recursive: true });
}
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log('📥 Appended to latest-user.json');
});
