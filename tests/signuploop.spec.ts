import { test } from '@playwright/test';
import { signup } from '../utils/signuploop';

test('Signup', async ({ page }) => {
  await signup(page);
});
