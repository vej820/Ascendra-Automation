import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://staging.sulod.ascendrainternational.ai/');
  await page.getByRole('textbox', { name: 'Username' }).click();
  await page.getByRole('textbox', { name: 'Username' }).fill('vegie@skunkworks.ai');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('mHhn$n6c');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('button', { name: 'Store Store' }).click();
  await page.getByRole('link', { name: 'Order Order' }).click();
  await page.locator('div').filter({ hasText: /^PricePHP 600\.00Quantity1$/ }).getByRole('button').nth(1).click();
  await page.locator('div').filter({ hasText: /^PricePHP 3,300\.00Quantity1$/ }).getByRole('button').nth(1).click();
  await page.locator('html').click({
    button: 'right'
  });
  await page.getByRole('button', { name: 'Add to Cart' }).first().click();
  await page.getByRole('button', { name: 'Proceed to Checkout' }).click();
  await page.getByRole('checkbox', { name: 'By clicking this, I agree to' }).click();
  await page.getByRole('button', { name: 'Place Order' }).click();
  await page.getByRole('link', { name: 'My Vault My Vault' }).click();
  await page.waitForSelector('tbody tr');
  await page.getByRole('cell', { name: 'Date Ordered' }).getByRole('img').click();
  const firstRow = page.locator('tbody tr').first();
  const txnLink = firstRow.locator('a').filter({ hasText: /^COM-/ });
  await txnLink.waitFor({ state: 'visible', timeout: 20000 });
  const transactionNumber = (await txnLink.textContent())?.trim();
  console.log('First row transaction number:', transactionNumber);
});