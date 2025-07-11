import { expect, Page } from '@playwright/test';
import fs from 'fs';


export async function adminLogin(page: Page) {
    await page.goto('https://smart-city-ascendra-por-ppd2-g7c0e7echsdse3cq.southeastasia-01.azurewebsites.net/');
    await page.getByRole('textbox', { name: 'Username' }).click();
    await page.getByRole('textbox', { name: 'Username' }).fill('sysadmin');
    await page.getByRole('textbox', { name: 'Username' }).press('Tab');
    await page.getByRole('textbox', { name: 'Password' }).fill('@sC3ndraA!i25');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByRole('paragraph').filter({ hasText: /^Users$/ })).toBeVisible();
  }

  export async function adminIncorrectLogin(page: Page) {
    await page.goto('https://smart-city-ascendra-por-ppd2-g7c0e7echsdse3cq.southeastasia-01.azurewebsites.net/');
    await page.getByRole('textbox', { name: 'Username' }).click();
    await page.getByRole('textbox', { name: 'Username' }).fill('sysadmin');
    console.log('successfully inputs username');
    await page.getByRole('textbox', { name: 'Username' }).press('Tab');
    await page.getByRole('textbox', { name: 'Password' }).fill('a$c3ndr@_Adm!Ns');
    console.log('successfully inputs password');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByText('Incorrect Username or Password')).toBeVisible();
  }


export async function memberLogin(page: Page) {
  // Read credentials from the saved JSON file
  const credentials = JSON.parse(fs.readFileSync('./tests/utils/latest-user.json', 'utf-8'));
  const { email, password } = credentials;

  await page.goto('https://smart-city-ascendra-por-ppd2-g7c0e7echsdse3cq.southeastasia-01.azurewebsites.net/');

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
  await page.goto('https://smart-city-ascendra-por-ppd2-g7c0e7echsdse3cq.southeastasia-01.azurewebsites.net/');
  await page.getByRole('textbox', { name: 'Username' }).click();
  await page.getByRole('textbox', { name: 'Username' }).fill('member');
  console.log('successfully inputs username');
  await page.getByRole('textbox', { name: 'Username' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('a$c3ndr@_Adm!Ns');
  console.log('successfully inputs password');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByText('Incorrect Username or Password')).toBeVisible();
}
  