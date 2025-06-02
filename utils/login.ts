import { expect, Page } from '@playwright/test';
import fs from 'fs';


export async function adminLogin(page: Page) {
    await page.goto('https://ascendra-portal-staging.azurewebsites.net/login');
    await page.getByRole('textbox', { name: 'Username' }).click();
    await page.getByRole('textbox', { name: 'Username' }).fill('sysadmin');
    await page.getByRole('textbox', { name: 'Username' }).press('Tab');
    await page.getByRole('textbox', { name: 'Password' }).fill('a$c3ndr@_Adm!N');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByRole('paragraph').filter({ hasText: 'Dashboard' })).toBeVisible();
  }

  export async function adminIncorrectLogin(page: Page) {
    await page.goto('https://ascendra-portal-staging.azurewebsites.net/login');
    await page.getByRole('textbox', { name: 'Username' }).click();
    await page.getByRole('textbox', { name: 'Username' }).fill('sysadmin');
    await page.getByRole('textbox', { name: 'Username' }).press('Tab');
    await page.getByRole('textbox', { name: 'Password' }).fill('a$c3ndr@_Adm!Ns');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByText('Incorrect Username or Password')).toBeVisible();
  }


export async function memberLogin(page: Page) {
  // Read credentials from the saved JSON file
  const credentials = JSON.parse(fs.readFileSync('./tests/utils/latest-user.json', 'utf-8'));
  const { email, password } = credentials;

  await page.goto('https://ascendra-portal-staging.azurewebsites.net/login');

  await page.getByRole('textbox', { name: 'Username' }).click();
  await page.getByRole('textbox', { name: 'Username' }).fill(email);
  console.log(email); // Use extracted email
  await page.getByRole('textbox', { name: 'Username' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  console.log(password); // Use extracted password

  await page.getByRole('button', { name: 'Login' }).click();
  // Wait for the dashboard to be visible
  await page.getByRole('paragraph').filter({ hasText: 'Dashboard' }).waitFor();
  console.log('✅ Member logged in successfully');

}


export async function memberIncorrectLogin(page: Page) {
  await page.goto('https://ascendra-portal-staging.azurewebsites.net/login');
  await page.getByRole('textbox', { name: 'Username' }).click();
  await page.getByRole('textbox', { name: 'Username' }).fill('member');
  await page.getByRole('textbox', { name: 'Username' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('a$c3ndr@_Adm!Ns');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByText('Incorrect Username or Password')).toBeVisible();
}
  