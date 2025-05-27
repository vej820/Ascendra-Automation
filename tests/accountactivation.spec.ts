import { test } from '@playwright/test';
<<<<<<< HEAD
import { adminLogin } from '../utils/login.ts';
=======
import { signup } from '../utils/signup.ts'; 
import { adminLogin } from '../utils/fixtures.ts';
>>>>>>> c8c428730790047ccd38d9b677aaf1644375eb44

test('Account activation after signup', async ({ page }) => {
  await adminLogin(page);
  await page.getByRole('button', { name: 'Account Activation Account' }).click();
  await page.getByRole('button', { name: 'Activate' }).nth(0).click();
  await page.getByRole('button', { name: 'Activate' }).click();
  await page.getByText('Account successfully').click();
});

test('Account rejection after signup', async ({ page }) => {
  await adminLogin(page);
  await page.getByRole('button', { name: 'Account Activation Account' }).click();
  await page.getByRole('button', { name: 'Reject' }).nth(0).click();
  await page.getByRole('button', { name: 'Reject' }).click();
  await page.getByText('Account successfully rejected.').click();
});