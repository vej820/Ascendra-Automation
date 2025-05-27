import { test } from '@playwright/test';
import { signup } from '../utils/signuploop.ts';

test('Signup', async ({ page }) => {
  await signup(page);
});
