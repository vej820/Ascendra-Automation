import { test } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { associate, builder, consultant, director, executive } from '../utils/packages';

// CSV parser
function parseCSV(data: string) {
  const lines = data.trim().split('\n');
  const headers = lines[0].split(',');
  return lines.slice(1).map(line => {
    const values = line.split(',');
    return headers.reduce((obj, key, i) => ({ ...obj, [key.trim()]: values[i].trim() }), {});
  });
}

// Package map
const packageMap: Record<string, (page: any) => Promise<void>> = {
  associate,
  builder,
  consultant,
  director,
  executive,
};

test('Signup using data from CSV (with sponsor code and rank)', async ({ page }) => {
  const csvPath = path.join(__dirname, 'utils', 'users.csv');
  const csvData = fs.readFileSync(csvPath, 'utf-8');
  type User = {
    firstName: string;
    middleName: string;
    lastName: string;
    birthday: string;
    address: string;
    contactNumber: string;
    email: string;
    sponsorCode: string;
    rank: string;
  };

  const users = parseCSV(csvData) as User[];

  for (const user of users) {
    const {
      firstName,
      middleName,
      lastName,
      birthday,
      address,
      contactNumber,
      email,
      sponsorCode,
      rank,
    } = user;

    const rankFunction = packageMap[rank.toLowerCase()];
    if (!rankFunction) {
      console.warn(`⚠️ Skipping ${email}: Unknown rank "${rank}"`);
      continue;
    }

    await page.goto('https://ascendra-portal-staging.azurewebsites.net/');
    console.log(`✅ Visited homepage for ${email}`);

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

    await page.getByRole('textbox', { name: 'Email Address *' }).fill(email);
    await page.getByRole('textbox', { name: 'Contact Number *' }).fill(contactNumber);
    await page.getByRole('textbox', { name: 'Address *', exact: true }).fill(address);
    await page.getByRole('textbox', { name: 'Sponsor ID *' }).fill(sponsorCode);

    await page.getByRole('button', { name: 'Next' }).click();
    console.log(`📦 Selected rank: ${rank}`);

    await rankFunction(page); // dynamic rank execution
    await page.getByRole('checkbox', { name: 'I accept the terms and' }).click();
    await page.getByRole('button', { name: 'Pay Now' }).click();
    await page.getByText('Payment Instructions Sent').waitFor();
    await page.getByRole('button', { name: 'I Understand' }).click();

    console.log(`🎉 Successfully signed up: ${email}`);
  }
});
