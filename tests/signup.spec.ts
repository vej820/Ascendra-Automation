import { test } from '@playwright/test';
import { signup } from '../utils/signup.ts';

test('Signup', async ({ page }) => {
  await signup(page);
});
