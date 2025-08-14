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

  if (!fs.existsSync(utilsDir)) {
    fs.mkdirSync(utilsDir, { recursive: true });
  }

  console.log('🌐 Navigating to login page...');
  await page.goto('https://staging.sulod.ascendrainternational.ai/');

  await page.getByRole('textbox', { name: 'Username' }).fill(creds.username);
  await page.getByRole('textbox', { name: 'Password' }).fill(creds.password);
  await page.getByRole('button', { name: 'Login' }).click();

  console.log('🔍 Waiting for dashboard...');
  const sponsorLocator = page.getByText(/ASC-\d+/);
  await sponsorLocator.waitFor();

  const sponsorCodeText = await sponsorLocator.textContent();
  const extractedCode = sponsorCodeText?.match(/ASC-\d+/)?.[0];

  expect(extractedCode).toBeTruthy();
  if (!extractedCode) {
    console.log('❌ Sponsor code not found. Nothing written.');
    return;
  }

  console.log('✅ Sponsor Code Extracted:', extractedCode);

  // ----- APPEND-ONLY -----
  let data: Array<{ email: string; password: string; sponsorCode: string }> = [];

  try {
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf-8').trim();
      if (fileContent) {
        const parsed = JSON.parse(fileContent);
        if (Array.isArray(parsed)) {
          data = parsed;
        }
      }
    }
  } catch (err) {
    console.error('❌ Failed to read/parse latest-user.json:', err);
    fs.renameSync(filePath, filePath + '.bak');
    data = [];
  }

  // Always append new record — no overwrite
  data.push({
    email: creds.username,
    password: creds.password,
    sponsorCode: extractedCode
  });
  console.log('➕ Added new user entry.');

  // Save back to file (overwrite the file content with full array)
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`📥 Appended to latest-user.json (total: ${data.length} records)`);
});
