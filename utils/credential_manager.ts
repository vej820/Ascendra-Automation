import { Page } from '@playwright/test';
import { getLatestEmail } from '../gmailReader';
import fs from 'fs';
import path from 'path';

export interface UserCredentials {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  sponsorCode?: string;
  memberCode?: string;
  packageType?: string;
}

export class CredentialManager {
  private static readonly CREDENTIALS_FILE = path.join(__dirname, 'latest-user.json');

  /**
   * Save user credentials to file for later use
   */
  static saveCredentials(credentials: UserCredentials): void {
    try {
      const credentialsDir = path.dirname(this.CREDENTIALS_FILE);
      if (!fs.existsSync(credentialsDir)) {
        fs.mkdirSync(credentialsDir, { recursive: true });
      }
      
      fs.writeFileSync(this.CREDENTIALS_FILE, JSON.stringify(credentials, null, 2));
      console.log(`💾 Credentials saved for: ${credentials.email}`);
    } catch (error) {
      console.log(`⚠️  Failed to save credentials: ${error}`);
    }
  }

  /**
   * Load saved credentials from file
   */
  static loadCredentials(): UserCredentials | null {
    try {
      if (fs.existsSync(this.CREDENTIALS_FILE)) {
        const data = fs.readFileSync(this.CREDENTIALS_FILE, 'utf-8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.log(`⚠️  Failed to load credentials: ${error}`);
    }
    return null;
  }

  /**
   * Extract credentials from Gmail (primary and only method)
   */
  static async extractCredentialsFromGmail(): Promise<UserCredentials | null> {
    console.log(`📧 Extracting credentials from Gmail...`);
    
    try {
      const emailCredentials = await getLatestEmail();
      
      if (emailCredentials && emailCredentials.username && emailCredentials.password) {
        const credentials: UserCredentials = {
          email: emailCredentials.username,
          password: emailCredentials.password
        };
        
        console.log(`✅ Gmail credentials extracted: ${credentials.email}`);
        this.saveCredentials(credentials);
        return credentials;
      } else {
        console.log(`❌ No credentials found in Gmail`);
        return null;
      }
    } catch (error) {
      console.log(`❌ Gmail extraction failed: ${error}`);
      return null;
    }
  }

  /**
   * Check if login was successful by looking for common success indicators
   */
  private static async checkLoginSuccess(page: Page): Promise<boolean> {
    try {
      // Check for dashboard elements
      const dashboardIndicators = [
        page.getByRole('paragraph').filter({ hasText: 'Dashboard' }),
        page.getByText('Dashboard'),
        page.getByRole('button', { name: 'Store Store' }),
        page.getByRole('link', { name: 'My Vault' }),
        page.getByText('Welcome'),
        page.locator('[data-testid="dashboard"]'),
        page.locator('.dashboard'),
        page.locator('#dashboard')
      ];

      // Check URL patterns
      const currentUrl = page.url().toLowerCase();
      const successUrlPatterns = ['dashboard', 'home', 'portal', 'member'];
      const urlSuccess = successUrlPatterns.some(pattern => currentUrl.includes(pattern));

      if (urlSuccess) {
        return true;
      }

      // Check for any dashboard indicators
      for (const indicator of dashboardIndicators) {
        try {
          await indicator.waitFor({ timeout: 2000 });
          return true;
        } catch {
          // Continue checking other indicators
        }
      }

      // Check for error messages (indicates failed login)
      const errorIndicators = [
        page.getByText('Incorrect Username or Password'),
        page.getByText('Invalid credentials'),
        page.getByText('Login failed'),
        page.locator('.error'),
        page.locator('[data-testid="error"]')
      ];

      for (const errorIndicator of errorIndicators) {
        try {
          await errorIndicator.waitFor({ timeout: 1000 });
          return false; // Error message found, login failed
        } catch {
          // No error message, continue
        }
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get credentials using Gmail extraction ONLY
   */
  static async getCredentialsFromGmail(): Promise<UserCredentials | null> {
    console.log(`📧 Getting credentials from Gmail (ONLY source)...`);
    
    // Wait for email to arrive
    console.log(`⏳ Waiting 10 seconds for email delivery...`);
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    try {
      const emailCredentials = await getLatestEmail();
      
      if (emailCredentials && emailCredentials.username && emailCredentials.password) {
        const credentials: UserCredentials = {
          email: emailCredentials.username,
          password: emailCredentials.password
        };
        
        console.log(`✅ Gmail credentials extracted: ${credentials.email}`);
        this.saveCredentials(credentials);
        return credentials;
      } else {
        throw new Error('No username/password found in Gmail');
      }
    } catch (error) {
      console.log(`❌ Gmail extraction failed: ${error}`);
      throw new Error(`Gmail credential extraction failed: ${error}`);
    }
  }

  /**
   * Verify if given credentials still work
   */
  static async verifyCredentials(page: Page, credentials: UserCredentials, baseUrl: string): Promise<boolean> {
    try {
      await page.goto(baseUrl);
      await page.getByRole('textbox', { name: 'Username' }).fill(credentials.email);
      await page.getByRole('textbox', { name: 'Password' }).fill(credentials.password);
      await page.getByRole('button', { name: 'Login' }).click();
      
      await page.waitForTimeout(3000);
      return await this.checkLoginSuccess(page);
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate test credentials for signup (password will be filled from Gmail)
   */
  static generateTestCredentials(firstName: string, lastName: string, sponsorCode: string): UserCredentials {
    return {
      email: `vegie+${firstName.toLowerCase()}.${lastName.toLowerCase()}@skunkworks.ai`,
      password: '', // Will be populated from Gmail
      firstName,
      lastName,
      sponsorCode
    };
  }

  /**
   * Clear saved credentials
   */
  static clearCredentials(): void {
    try {
      if (fs.existsSync(this.CREDENTIALS_FILE)) {
        fs.unlinkSync(this.CREDENTIALS_FILE);
        console.log('🗑️  Cleared saved credentials');
      }
    } catch (error) {
      console.log(`⚠️  Failed to clear credentials: ${error}`);
    }
  }
}