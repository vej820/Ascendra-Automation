import { test as base, Page } from '@playwright/test';


export async function adminLogin(page: Page) {
    await page.goto('https://staging.sulod.ascendrainternational.ai/');
    await page.getByRole('textbox', { name: 'Username' }).click();
    await page.getByRole('textbox', { name: 'Username' }).fill('admin');
    await page.getByRole('textbox', { name: 'Username' }).press('Tab');
    await page.getByRole('textbox', { name: 'Password' }).fill('a$c3ndr@_Adm!N');
    await page.getByRole('button', { name: 'Login' }).click();
  }

export async function memberLogin(page: Page) {
  await page.goto('https://staging.sulod.ascendrainternational.ai/');
  await page.getByRole('textbox', { name: 'Username' }).click();
  await page.getByRole('textbox', { name: 'Username' }).fill('member');
  await page.getByRole('textbox', { name: 'Username' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('a$c3ndr@_Adm!N');
  await page.getByRole('button', { name: 'Login' }).click();
}  
  