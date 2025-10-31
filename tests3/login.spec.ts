import { test } from '@playwright/test';
import { memberLogin, memberIncorrectLogin, adminLogin, adminIncorrectLogin } from '../utils/login';

test('test valid member login credential', async ({ page }) => {
  await page.goto('https://smartcity-project-a-portal-ppd2-c3ave4fdfpbwdyd2.southeastasia-01.azurewebsites.net/login');
  await page.getByRole('textbox', { name: 'Username' }).click();
  await page.getByRole('textbox', { name: 'Username' }).fill('thirzahtanya12a@gmail.com');
  // console.log('successfully inputs email');
  await page.getByRole('textbox', { name: 'Username' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('P@ssword1');
  console.log('Successfully inputs password');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('paragraph').filter({ hasText: 'Dashboard' }).waitFor();
  console.log('✅ Member logged in successfully');
});

test('test valid admin login credential', async ({ page }) => {
  await page.goto('https://smartcity-project-a-portal-ppd2-c3ave4fdfpbwdyd2.southeastasia-01.azurewebsites.net/login');
  await page.getByRole('textbox', { name: 'Username' }).click();
  await page.getByRole('textbox', { name: 'Username' }).fill('sysadmin');
  console.log('successfully inputs username');
  await page.getByRole('textbox', { name: 'Username' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('P@ssword1');
  console.log('Successfully inputs password');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByText('User Management', { exact: true }).waitFor();
  console.log('✅ Admin logged in successfully');
});

test('test invalid member login credential', async ({ page }) => {
  await memberIncorrectLogin(page);
  console.log('✅ Error message displayed for invalid member login');
});

test('test invalid admin login credential', async ({ page }) => {
  await adminIncorrectLogin(page);
  console.log('✅ Error message displayed for invalid admin login');
});