import { test } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { associate, builder, consultant, director, executive } from '../utils/packages';
import { getRandomUnusedPackage } from '../utils/randomPackageSelector';
import fs from 'fs';
import path from 'path';

// ✅ Read sponsorCode from latest-user.json
const userFilePath = path.join(__dirname, 'utils', 'latest-user.json');
let sponsorCode = '';

if (fs.existsSync(userFilePath)) {
  const users = JSON.parse(fs.readFileSync(userFilePath, 'utf-8'));
  const lastUser = users[users.length - 1];
  sponsorCode = lastUser?.sponsorCode;
}

if (!sponsorCode) {
  throw new Error('❌ No sponsor code found in latest-user.json');
}

test('User Signup Flow', async ({ page }) => {
  const firstName = faker.person.firstName();
  const middleName = faker.person.middleName();
  const lastName = faker.person.lastName();
  const birthday = faker.date.birthdate({ min: 18, max: 50, mode: 'age' }).toISOString().split('T')[0];
  const base = faker.person.firstName().toLowerCase();
  const address = faker.location.streetAddress();
  const number = '09' + faker.number.int({ min: 100000000, max: 999999999 }).toString();

  await page.goto('https://ascendra-portal-staging.azurewebsites.net/');
  console.log('✅ Visited homepage');

  await page.getByRole('link', { name: 'Signup' }).click();
  console.log('✅ Clicked Signup link');

  await page.getByRole('textbox', { name: 'First Name *' }).fill(firstName);
  console.log(`✅ Filled First Name: ${firstName}`);
  await page.getByRole('textbox', { name: 'Middle Name' }).fill(middleName);
  console.log(`✅ Filled Middle Name: ${middleName}`);
  await page.getByRole('textbox', { name: 'Last Name *' }).fill(lastName);
  console.log(`✅ Filled Last Name: ${lastName}`);
  await page.getByRole('textbox', { name: 'Suffix' }).press('Tab');
  await page.getByRole('textbox', { name: 'Birthday *' }).fill(birthday);
  await page.getByRole('combobox').filter({ hasText: 'Gender' }).click();
  await page.getByRole('option', { name: 'Male', exact: true }).click();
  await page.getByRole('combobox').filter({ hasText: 'Status' }).click();
  await page.getByRole('option', { name: 'Single' }).click();
  const fakeEmail = `vegie+${firstName.toLowerCase()}.${lastName.toLowerCase()}@skunkworks.ai`;
  await page.getByRole('textbox', { name: 'Email Address *' }).fill(fakeEmail);
  console.log(`✅ Filled Email Address: ${fakeEmail}`);
  await page.getByRole('textbox', { name: 'Contact Number *' }).fill(number);
  console.log(`✅ Contact Number filled: ${number}`);
  await page.getByRole('textbox', { name: 'Address *', exact: true }).fill(address);
  await page.getByRole('textbox', { name: 'Sponsor ID *' }).fill(sponsorCode);
  console.log(`✅ Filled Sponsor ID: ${sponsorCode}`);
  await page.getByRole('button', { name: 'Next' }).click();

  // Random but non-repeating package selection
  const selected = getRandomUnusedPackage();
  console.log(`📦 Selected package: ${selected}`);
  switch (selected) {
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
  }

  await page.getByRole('checkbox', { name: 'I accept the terms and' }).click();
  await page.getByRole('button', { name: 'Pay Now' }).click();
  await page.getByText('Payment Instructions Sent').waitFor();
  await page.getByRole('button', { name: 'I Understand' }).click();
  console.log('🎉 Member account signup completed successfully!');
});
