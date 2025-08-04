import { test } from '@playwright/test';
import * as fs from 'fs';

// Helper to parse CSV string into array of objects
function parseCSV(data: string): { email: string; password: string }[] {
  const lines = data.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    return {
      email: values[headers.indexOf('email')] || '',
      password: values[headers.indexOf('password')] || ''
    };
  });
}

test('Change passwords for all CSV accounts', async ({ page }) => {
  const csvData = fs.readFileSync('./tests/utils/users.csv', 'utf-8');
  const users: { email: string; password: string }[] = parseCSV(csvData); // [{email, password}, ...]

  for (const { email, password } of users) {
    console.log(`🔐 Logging in as: ${email}`);

    await page.goto('https://smart-city-ascendra-por-ppd2-g7c0e7echsdse3cq.southeastasia-01.azurewebsites.net');

    await page.getByRole('textbox', { name: 'Username' }).fill(email);
    await page.getByRole('textbox', { name: 'Username' }).press('Tab');
    await page.getByRole('textbox', { name: 'Password' }).fill(password);
    await page.getByRole('button', { name: 'Login' }).click();

    try {
      await page.getByRole('paragraph', { name: /Dashboard/i }).waitFor({ timeout: 5000 });
      console.log('✅ Logged in successfully');

      await page.getByRole('button').filter({ has: page.locator('svg') }).last().click();
      await page.getByRole('menuitem', { name: 'Account' }).click();
      await page.getByText('Security').click();

      await page.getByRole('textbox', { name: 'Old Password *' }).fill(password);
      await page.getByRole('textbox', { name: 'New Password *' }).fill('newpassword123');
      await page.getByRole('textbox', { name: 'Confirm Password *' }).fill('newpassword123');
      await page.getByRole('button', { name: 'Save Changes' }).click();
      console.log('✅ Password change form submitted successfully');

      console.log(`🔄 Password changed for ${email}`);
    } catch (err) {
      if (err instanceof Error) {
        console.error(`❌ Failed to update password for ${email}:`, err.message);
      } else {
        console.error(`❌ Failed to update password for ${email}:`, err);
      }
    }

    // Optional logout
    await page.goto('https://smart-city-ascendra-por-ppd2-g7c0e7echsdse3cq.southeastasia-01.azurewebsites.net/logout');
  }

  console.log('🎉 All accounts processed.');
});
