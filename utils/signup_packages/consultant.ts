import { expect, Page } from '@playwright/test';

export async function consultant(page: Page) {
  await page.getByRole('button', { name: 'Choose Package' }).nth(2).click();
  await page.getByRole('combobox').nth(2).click();
  await page.getByRole('option', { name: 'Combined' }).click();
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByText('Consultant')).toBeVisible();
  await expect(page.getByText('PHP')).toHaveText('PHP 45,500.00');
  await expect(page.getByText('Combined')).toBeVisible();
  console.log('✅ Selected Consultant package is correct');

  }