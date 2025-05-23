import { test } from '@playwright/test';
import { signup } from '../utils/signup.ts';

test('Account activation after signup', async ({ page }) => {
  await signup(page);});