import { test } from '@playwright/test';
import { memberLogin, memberIncorrectLogin, adminLogin, adminIncorrectLogin } from '../../../utils/login';

test('test valid member login credential', async ({ page }) => {
  await page.goto('https://ascendra-portal-staging.azurewebsites.net/login');
  await page.getByRole('textbox', { name: 'Username' }).click();
  await page.getByRole('textbox', { name: 'Username' }).fill('vegie+updated2@skunkworks.ai');
  console.log('successfully inputs email');
  await page.getByRole('textbox', { name: 'Username' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('kuN7jZ4g');
  console.log('Successfully inputs password');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('paragraph').filter({ hasText: 'Dashboard' }).waitFor();
  console.log('✅ Member logged in successfully');
});

test('test valid admin login credential', async ({ page }) => {
  await page.goto('https://ascendra-portal-staging.azurewebsites.net/login');
  await page.getByRole('textbox', { name: 'Username' }).click();
  await page.getByRole('textbox', { name: 'Username' }).fill('sysadmin');
  console.log('successfully inputs username');
  await page.getByRole('textbox', { name: 'Username' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('@sC3ndraA!i25');
  console.log('Successfully inputs password');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByText('User Management', { exact: true }).waitFor();
  console.log('✅ Admin logged in successfully');
});
