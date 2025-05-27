import { expect, Page } from '@playwright/test';

export async function builder(page: Page) {
  await page.getByRole('button', { name: 'Choose Package' }).nth(1).click();
  await page.getByRole('combobox').nth(1).click();
  await page.getByRole('option', { name: 'Insurance' }).click();
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByText('Builder')).toBeVisible();
  await expect(page.getByText('PHP')).toHaveText('PHP 17,600.00');
  await expect(page.getByText('Insurance')).toBeVisible();
  console.log('✅ Selected Builder package is correct');

  }