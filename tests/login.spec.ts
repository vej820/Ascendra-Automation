import { test } from '@playwright/test';
import { LoginPage } from '../pages/login';
import { validUser, InvalidUser } from '../utils/credentials';


test('Correct credential', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.login(validUser.email, validUser.password);
  await loginPage.assertLoginSuccess();
});

test('Incorrect credential', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.login(InvalidUser.email, InvalidUser.password);
  await loginPage.assertLoginFailure();
});
