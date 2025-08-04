import { test } from '@playwright/test';
// Update the import path below to the correct relative path where 'signup.ts' actually exists
import { signup } from '../../../utils/signup'; // e.g., '../../utils/signup' or '../../../helpers/signup'

test('Signup', async ({ page }) => {
  await signup(page);
});
