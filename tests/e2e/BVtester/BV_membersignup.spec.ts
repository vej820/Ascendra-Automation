import { test } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { associate, builder, consultant, director, executive } from '../../../utils/packages';
import { getRandomUnusedPackage } from '../../../utils/randomPackageSelector';
import fs from 'fs';
import path from 'path';

// ✅ Read sponsorCode from FIRST USER in BVtester.json


test('User Signup Flow', async ({ page }) => {
  const bvPath = path.join(__dirname, '..', 'utils', 'BVtester.json');
  let sponsorCode = '';

  if (fs.existsSync(bvPath)) {
    const users = JSON.parse(fs.readFileSync(bvPath, 'utf-8'));
    const firstUser = users[0]; //👈 get the FIRST user's sponsorCode
    sponsorCode = firstUser?.sponsorCode;
  }

  if (!sponsorCode) {
    throw new Error('❌ No sponsor code found in BVtester.json');
  }
  const firstName = faker.person.firstName();
  const middleName = faker.person.middleName();
  const lastName = faker.person.lastName();
  const birthday = faker.date.birthdate({ min: 18, max: 50, mode: 'age' }).toISOString().split('T')[0];
  const address = faker.location.streetAddress();
  const fakeEmail = `vegie+${firstName.toLowerCase()}.${lastName.toLowerCase()}@skunkworks.ai`;

  await page.goto('https://staging.sulod.ascendrainternational.ai/');
  console.log('✅ Visited homepage');

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
  await page.getByRole('textbox', { name: 'Email Address *' }).fill(fakeEmail);
  await page.getByRole('textbox', { name: 'Address *', exact: true }).fill(address);

  await page.getByRole('textbox', { name: 'Sponsor ID *' }).fill(sponsorCode);
  console.log(`✅ Filled Sponsor ID: ${sponsorCode}`);

  await page.getByRole('button', { name: 'Next' }).click();

  const selected = getRandomUnusedPackage();
  console.log(`📦 Selected package: ${selected}`);
  switch (selected) {
    case 'associate': await associate(page); break;
    case 'builder': await builder(page); break;
    case 'consultant': await consultant(page); break;
    case 'director': await director(page); break;
    case 'executive': await executive(page); break;
  }

  await page.getByRole('checkbox', { name: 'I accept the terms and' }).click();
  await page.getByRole('button', { name: 'Pay Now' }).click();
  await page.getByText('Payment Instructions Sent').waitFor();
  await page.getByRole('button', { name: 'I Understand' }).click();
  console.log('🎉 Member account signup completed successfully!');
});