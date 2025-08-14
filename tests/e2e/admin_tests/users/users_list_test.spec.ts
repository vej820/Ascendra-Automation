import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://staging.sulod.ascendrainternational.ai/');
  await page.getByRole('textbox', { name: 'Username' }).click();
  await page.getByRole('textbox', { name: 'Username' }).fill('ascendratesting@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('P@ssword1');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Search Name' }).click();
  await page.getByRole('textbox', { name: 'Search Name' }).fill('vegie');
  await page.getByRole('link', { name: 'Vegie free slot1.1 vegie+' }).click();
  await page.getByRole('heading', { name: 'Vegie free slot1.1' }).click();
  await page.getByRole('link', { name: 'arrow-left' }).click();
  await page.getByRole('button', { name: '2' }).click();
  await page.getByRole('button', { name: '3' }).click();
  await page.getByRole('combobox').click();
  await page.getByText('50').click();
  await page.getByText('61', { exact: true }).click();
  await page.getByRole('button', { name: '2' }).click();
  await page.getByRole('cell', { name: 'Date Joined' }).getByRole('img').click();
});