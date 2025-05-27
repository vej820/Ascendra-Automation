import { expect, Page } from '@playwright/test';

export async function executive(page: Page) {
  await page.getByRole('button', { name: 'Choose Package' }).nth(4).click();
  await page.getByRole('combobox').nth(4).click();
  await page.getByRole('option', { name: 'Wellness' }).click();
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByText('Executive')).toBeVisible();
  await expect(page.getByText('PHP')).toHaveText('PHP 199,800.00');
  await expect(page.getByText('Wellness')).toBeVisible();
  console.log('✅ Selected Executive package is correct');
  }