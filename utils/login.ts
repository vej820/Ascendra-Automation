import { test as base, expect, Page } from '@playwright/test';
import { validUser, InvalidUser } from './credentials'; 


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
  await page.goto('https://ascendra-portal-staging.azurewebsites.net/login');
  await page.getByRole('textbox', { name: 'Username' }).click();
  await page.getByRole('textbox', { name: 'Username' }).fill('admin');
  await page.getByRole('textbox', { name: 'Username' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('a$c3ndr@_Adm!N');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByRole('paragraph').filter({ hasText: 'Dashboard' })).toBeVisible();
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
  