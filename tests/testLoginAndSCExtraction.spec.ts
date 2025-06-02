import { test, expect } from '@playwright/test';
import { getLatestEmail } from '../gmailReader';
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
  await page.goto('https://ascendra-portal-staging.azurewebsites.net/login');

  await page.getByRole('textbox', { name: 'Username' }).fill(creds.username);
  await page.getByRole('textbox', { name: 'Password' }).fill(creds.password);
  await page.getByRole('button', { name: 'Login' }).click();

  console.log('🔍 Waiting for dashboard...');
  // await page.pause(); // Wait for 2 seconds to ensure the page loads
  await expect(page.getByText('CURRENT RANK')).toBeVisible();
  // Extract sponsor code (adjust selector if needed)
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
    data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
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
