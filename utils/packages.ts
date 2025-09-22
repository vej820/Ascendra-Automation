import { expect, Page } from '@playwright/test';

export async function associate(page: Page) {
  await page.getByRole('combobox').first().click();
  await page.getByRole('combobox').first().click();
  // await page.pause();
  // await page.getByLabel('MVP (Combination)').getByText('MVP (Combination)').click();
  await page.getByLabel('MP (Insurance)').first().getByText('MP (Insurance)').click();
  await page.getByRole('button', { name: 'Choose Package' }).first().click();
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByText('Associate').isVisible();
  await expect(page.getByText('PHP')).toHaveText('PHP 8,500.00');
  await expect(page.getByText('MP (Insurance)')).toBeVisible();
  console.log('✅ Selected Associate package is correct');

  }

  export async function builder(page: Page) {
  await page.getByRole('combobox').nth(1).click();
  await page.getByRole('combobox').nth(1).click();
  await page.getByLabel('MVP (Combination)').getByText('MVP (Combination)').click();
  // await page.getByLabel('MP (Insurance)').first().getByText('MP (Insurance)').click();
  await page.getByRole('button', { name: 'Choose Package' }).nth(1).click();
  await expect(page.getByRole('button', { name: 'Package Selected' })).toBeVisible();
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByText('Builder').isVisible();
  await expect(page.getByText('PHP')).toHaveText('PHP 17,500.00');
  await expect(page.getByText('MVP (Combination)')).toBeVisible();
  console.log('✅ Selected Builder package is correct');

  }

  export async function consultant(page: Page) {
  // await page.pause(); // Pause for manual selection if needed
  // await page.getByRole('combobox').nth(2).click();
  await page.getByRole('combobox').nth(2).click();
  // await page.getByLabel('MVP (Combination)').getByText('MVP (Combination)').click();
  await page.getByLabel('MP (Insurance)').first().getByText('MP (Insurance)').click();
  await page.getByRole('button', { name: 'Choose Package' }).nth(2).click();
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByText('Consultant').isVisible();
  await expect(page.getByText('PHP')).toHaveText('PHP 45,500.00');
  await expect(page.getByText('MP (Insurance)')).toBeVisible();
  console.log('✅ Selected Consultant package is correct');

  }

  export async function director(page: Page) {

  // await page.getByRole('combobox').nth(3).click();
  await page.getByRole('combobox').nth(3).click();
  // await page.getByLabel('MVP (Combination)').getByText('MVP (Combination)').click();
  await page.getByLabel('MP (Insurance)').first().getByText('MP (Insurance)').click();
  await page.getByRole('button', { name: 'Choose Package' }).nth(3).click();
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByText('Director').isVisible();
  await expect(page.getByText('PHP')).toHaveText('PHP 110,500.00');
  await expect(page.getByText('MP (Insurance)')).toBeVisible();
  console.log('✅ Selected Director package is correct');
  }


  export async function executive(page: Page) {


  // await page.getByRole('combobox').nth(4).click();
  await page.getByRole('combobox').nth(4).click();
  // await page.getByLabel('MVP (Combination)').getByText('MVP (Combination)').click();
  await page.getByLabel('MP (Insurance)').first().getByText('MP (Insurance)').click();
  await page.getByRole('button', { name: 'Choose Package' }).nth(4).click();
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByText('Executive').isVisible();
  await expect(page.getByText('PHP')).toHaveText('PHP 199,800.00');
  await expect(page.getByText('MP (Insurance)')).toBeVisible();
  console.log('✅ Selected Executive package is correct');
  }