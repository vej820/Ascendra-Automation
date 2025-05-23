import { Page, expect } from '@playwright/test';

export class LoginPage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('https://ascendra-portal-staging.azurewebsites.net/');
  }

  async enterUsername(username: string) {
    await this.page.getByRole('textbox', { name: 'Username' }).fill(username);
  }

  async enterPassword(password: string) {
    await this.page.getByRole('textbox', { name: 'Password' }).fill(password);
  }

  async checkRememberMe() {
    await this.page.getByRole('checkbox', { name: 'Remember me' }).check();
  }

  async submitLogin() {
    await this.page.getByRole('button', { name: 'Login' }).click();
  }

  async login(username: string, password: string) {
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.checkRememberMe();
    await this.submitLogin();
  }

  async assertLoginSuccess() {
    await expect(this.page.getByRole('paragraph').filter({ hasText: 'Dashboard' })).toBeVisible();
  }

  async assertLoginFailure() {
    await expect(this.page.getByText('Incorrect Username or Password')).toBeVisible();
  }
}
