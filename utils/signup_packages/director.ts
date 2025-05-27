import { expect, Page } from '@playwright/test';

export async function director(page: Page) {
  await page.getByRole('button', { name: 'Choose Package' }).nth(3).click();
  await page.getByRole('combobox').nth(3).click();
  await page.getByRole('option', { name: 'Combined' }).click();
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByText('Director')).toBeVisible();
  await expect(page.getByText('PHP')).toHaveText('PHP 110,500.00');
  await expect(page.getByText('Combined')).toBeVisible();
  console.log('✅ Selected Director package is correct');
  }