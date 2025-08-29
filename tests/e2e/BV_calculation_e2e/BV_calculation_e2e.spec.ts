import { expect, Page, test } from '@playwright/test';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { faker } from '@faker-js/faker';
import { associate, builder, consultant, director, executive } from '../../../utils/packages';
import { levels } from '../../../utils/levels';
// Update the import path below to the correct location of your login utility
// Example: If the correct path is '../../../utils/login', update accordingly
import { adminLogin } from '../../../utils/login';

test('BV calculation', async ({ page, browser }) => {
  // functions in order of rank
  const ranks = [associate, builder, consultant, director, executive];    
  const totalAccounts = 4; // total accounts to activate after signup
  // get the sponsor code from a user------------------------------------------------------------------
  const username = "vegie+arlo.crona@skunkworks.ai";
  const password = 'YlWYG8zU';
  await page.goto('https://smartcity-project-a-portal-ppd2-c3ave4fdfpbwdyd2.southeastasia-01.azurewebsites.net/');
  await page.getByRole('textbox', { name: 'Username' }).click();
  await page.getByRole('textbox', { name: 'Username' }).fill(username);
  await page.getByRole('textbox', { name: 'Username' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('paragraph').filter({ hasText: 'Dashboard' }).waitFor();
  console.log('✅ Member logged in successfully');
  const currentRankCard = page.locator('div:has(:text("CURRENT RANK"))').first();
  await expect(currentRankCard).toBeVisible(); // wait robustly

  const sponsorCode = (await currentRankCard.getByText(/^ASC-/).first().innerText()).trim();
  console.log('Sponsor:', sponsorCode);
  //logout
  await page.getByRole('button', { name: 'D', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Log out' }).click();
  console.log('🔍 Sponsor code fetched successfully:', sponsorCode);
  // loop through ranks and create users-----------------------------------------------------------------
  console.log(`🔄 Starting signup process for ${totalAccounts} accounts...`);
  for (let i = 1; i <= totalAccounts; i++) {
    const firstName = faker.person.firstName();
    const middleName = faker.person.middleName();
    const lastName = faker.person.lastName();
    const birthday = faker.date.birthdate({ min: 18, max: 50, mode: 'age' }).toISOString().split('T')[0];
    const address = faker.location.streetAddress();
    const number = '09' + faker.number.int({ min: 100000000, max: 999999999 }).toString();
    console.log(`✅ [Run #${i}] Visited homepage`);
    await page.getByRole('link', { name: 'Signup' }).click();
    await page.getByRole('textbox', { name: 'First Name *' }).fill(firstName);
    await page.getByRole('textbox', { name: 'Middle Name' }).fill(middleName);
    await page.getByRole('textbox', { name: 'Last Name *' }).fill(lastName);
    await page.getByRole('textbox', { name: 'Suffix' }).press('Tab');
    await page.getByRole('textbox', { name: 'Birthday *' }).fill(birthday);
    await page.getByRole('combobox').filter({ hasText: 'Gender' }).click();
    await page.getByRole('option', { name: 'Male', exact: true }).click();
    await page.getByRole('combobox').filter({ hasText: 'Status' }).click();
    await page.getByRole('option', { name: 'Single' }).click();

    const fakeEmail = `vegie+${firstName.toLowerCase()}.${lastName.toLowerCase()}@skunkworks.ai`;
    await page.getByRole('textbox', { name: 'Email Address *' }).fill(fakeEmail);
    await page.getByRole('textbox', { name: 'Contact Number *' }).fill(number);
    await page.getByRole('textbox', { name: 'Address *', exact: true }).fill(address);
    await page.getByRole('textbox', { name: 'Sponsor ID *' }).fill(sponsorCode);
    await page.getByRole('button', { name: 'Next' }).click();

    // pick rank based on loop count: 1..5 then repeat
    const rankIndex = (i - 1) % ranks.length; // 0..4
    await ranks[rankIndex](page);

    await page.getByRole('checkbox', { name: 'I accept the terms and' }).click();
    await page.getByRole('button', { name: 'Pay Now' }).click();
    // await page.pause(); // Pause for manual verification if needed
    await page.getByText('Payment Instructions Sent').waitFor();
    await page.getByRole('button', { name: 'I Understand' }).click();

    console.log(`🎉 [Run #${i}] Signup completed successfully!`);
    console.log(`📧 Email: ${fakeEmail}`);
  }
    // login admin and activate the created accounts--------------------------------------------------
    console.log('🔍 Logging in as admin to activate accounts...');
    await adminLogin(page);
    await page.getByRole('button', { name: 'Account Activation Account' }).click();
    for (let j = 0; j < totalAccounts; j++) {
        const activateButtons = await page.getByRole('button', { name: 'Activate' });
        await page.waitForTimeout(1000);
        await page.getByRole('cell', { name: 'Date Request' }).getByRole('img').click(); // Sort by date requested
        await activateButtons.nth(1).click(); // Click the first button
        await page.getByRole('button', { name: 'Confirm and Activate' }).click(); // Wait for activation to complete
        console.log(`✅ Account #${j + 1} activated successfully`);
    }
    // logout admin
    await page.waitForSelector('button');
    await page.getByRole('button', { name: 'ASCENDRA SUPER ADMIN' }).click();
    await page.getByRole('menuitem', { name: 'Log out' }).click();

    // login upline member and assign accounts----------------------------------------------------------
    // await page.goto('https://staging.sulod.ascendrainternational.ai/');
    await page.pause(); // Pause for manual input if needed
    await page.getByRole('textbox', { name: 'Username' }).click();
    await page.getByRole('textbox', { name: 'Username' }).fill(username);
    await page.getByRole('textbox', { name: 'Username' }).press('Tab');
    await page.getByRole('textbox', { name: 'Password' }).fill(password);
    await page.getByRole('button', { name: 'Login' }).click();
    await page.getByRole('paragraph').filter({ hasText: 'Dashboard' }).waitFor();
    console.log('✅ Member logged in successfully');  
    await page.getByRole('button', { name: 'My Team My Team' }).click();
    await page.getByRole('link', { name: 'Binary Level Structure Binary' }).click();
    for (let k = 0; k < totalAccounts; k++) {  
        await page.waitForTimeout(1000); // Wait for the UI to stabilize
        await page.getByRole('button', { name: '+ Assign Left Member' }).click();
        await page.locator('.p-2.rounded.cursor-pointer.hover\\:bg-blue-100').first().click();
        await page.getByRole('button', { name: 'Assign' }).click();
        await page.getByRole('button', { name: 'Confirm and Assign' }).click();
        await page.waitForTimeout(2000); // Wait for the assignment to complete
  }
});
