import { test } from '@playwright/test';
import { signup } from '../utils/signup';

test('Signup', async ({ page }) => {
  await signup(page);
});
