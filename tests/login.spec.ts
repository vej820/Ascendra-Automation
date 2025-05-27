import { test } from '@playwright/test';
import { memberLogin, memberIncorrectLogin, adminLogin, adminIncorrectLogin } from '../utils/login';

test('test valid member login credential', async ({ page }) => {
  await memberLogin(page);
});

test('test invalid member login credential', async ({ page }) => {
  await memberIncorrectLogin(page);
});

test('test valid admin login credential', async ({ page }) => {
  await adminLogin(page);
});

test('test invalid admin login credential', async ({ page }) => {
  await adminIncorrectLogin(page);
});