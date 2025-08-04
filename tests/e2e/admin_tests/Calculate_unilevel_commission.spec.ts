import { test, expect } from '@playwright/test';
import fs from 'fs';

test('Calculate total unilevel commission using JSON mapping', async ({ page }) => {

  // Load commission rates from the JSON file
  const commissionRates = {
    associate: 25,
    builder: 50,
    consultant: 70,
    director: 200,
    executive: 300
  };

  // Go to login page
  await page.goto('https://staging.sulod.ascendrainternational.ai/');
  console.log('✅ Navigated to login');

  // Login
  await page.getByRole('textbox', { name: 'Username' }).fill('ascendratesting@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('@sC3ndraA!i25');
  await page.getByRole('button', { name: 'Login' }).click();

  // Wait for dashboard
  await page.getByText('User Management', { exact: true }).waitFor();

  // Navigate to user
  await page.getByRole('textbox', { name: 'Search Name' }).fill('tanya');
  await page.getByRole('link', { name: 'Thirzah Tanya Villanueva' }).click();
  await page.getByText('Unilevel').click();
  await page.getByRole('combobox').filter({ hasText: '10' }).click();
  await page.getByRole('option', { name: '50' }).click();

  // Wait for the API response
  const response = await page.waitForResponse(
    resp => resp.url().includes('/users/99/networks/unilevel') && resp.request().method() === 'POST'
  );

  const jsonData = await response.json();
  const members = jsonData.result.data;

  // Calculate commission
  let totalCommission = 0;
  for (const member of members) {
    if (member.is_free_slot === false) {
      const rank = member.rank.toLowerCase() as keyof typeof commissionRates;
      const commission = commissionRates[rank] || 0;
      totalCommission += commission;

      console.log(`✅ ${member.name} (${member.rank}, is_free_slot: false): +${commission}`);
    } else {
      console.log(`ℹ️ Skipped ${member.name} (is_free_slot: true)`);
    }
  }

  console.log(`🎯 TOTAL COMMISSION (only is_free_slot: false): ${totalCommission}`);
});