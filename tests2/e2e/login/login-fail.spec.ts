import { test } from '@playwright/test';
import { memberLogin, memberIncorrectLogin, adminLogin, adminIncorrectLogin } from '../../../utils/login';

test('test invalid member login credential', async ({ page }) => {
  await memberIncorrectLogin(page);
  console.log('✅ Error message displayed for invalid member login');
});

test('test invalid admin login credential', async ({ page }) => {
  await adminIncorrectLogin(page);
  console.log('✅ Error message displayed for invalid admin login');
});