import { faker } from '@faker-js/faker';
import { test, expect } from '@playwright/test';

/**
 * @file This test suite covers the "Add Free Slot" functionality in the admin portal.
 * It includes tests for valid data submission, empty required fields, and invalid data formats.
 */

// We use test.describe() to group related tests into a suite.
test.describe('Admin Portal - Free Slot Creation', () => {
  
  // This hook runs before each test in this suite.
  // It handles the common login steps, keeping our tests clean and focused (DRY principle).
  test.beforeEach(async ({ page }) => {
    await page.goto('https://smartcity-project-a-portal-ppd2-c3ave4fdfpbwdyd2.southeastasia-01.azurewebsites.net/');
    await page.getByRole('textbox', { name: 'Username' }).fill('sysadmin');
    await page.getByRole('textbox', { name: 'Password' }).fill('P@ssword1');
    await page.getByRole('button', { name: 'Login' }).click();
    // Wait for a unique element on the dashboard to confirm a successful login.
    await expect(page.getByText('User Management', { exact: true })).toBeVisible();
    console.log('✅ Admin logged in successfully');
  });

  // Test Case 1: The original "happy path" test for valid data.
  test('should create a free slot successfully with all valid data', async ({ page }) => {
    // --- Generate random valid data ---
    const firstName = faker.person.firstName();
    const middleName = faker.person.middleName();
    const lastName = faker.person.lastName();
    const birthday = faker.date.birthdate({ min: 18, max: 50, mode: 'age' }).toISOString().split('T')[0];
    const address = faker.location.streetAddress();
    const number = `09${faker.number.int({ min: 100000000, max: 999999999 })}`;
    const fakeEmail = `vegie+${firstName.toLowerCase()}.${lastName.toLowerCase()}@skunkworks.ai`;
    const sponsorCode = 'ASC-6814736228';

    // --- Fill out the form ---
    await page.getByRole('button', { name: 'Add Free Slot' }).click();
    await page.getByRole('textbox', { name: 'Sponsor ID *' }).fill(sponsorCode);
    await page.getByRole('combobox', { name: 'Rank *' }).click();
    await page.getByRole('option', { name: 'Builder' }).click();
    await page.getByRole('textbox', { name: 'First Name *' }).fill(firstName);
    await page.getByRole('textbox', { name: 'Middle Name' }).fill(middleName);
    await page.getByRole('textbox', { name: 'Last Name *' }).fill(lastName);
    await page.getByRole('textbox', { name: 'Birthday *' }).fill(birthday);
    await page.getByRole('combobox', { name: 'Gender *' }).click();
    await page.getByRole('option', { name: 'Male', exact: true }).click();
    await page.getByRole('combobox', { name: 'Status *' }).click();
    await page.getByRole('option', { name: 'Single' }).click();
    await page.getByRole('textbox', { name: 'Email Address *' }).fill(fakeEmail);
    await page.getByRole('textbox', { name: 'Contact Number *' }).fill(number);
    await page.getByRole('textbox', { name: 'Address *', exact: true }).fill(address);

    // --- Submit and Verify ---
    await page.getByRole('button', { name: 'Save Free Slot' }).click();
    await page.getByRole('textbox', { name: 'Search Name' }).fill(`${firstName} ${middleName} ${lastName}`);
    
    await expect(page.getByText(fakeEmail)).toBeVisible();
    console.log('✅ Test Passed: Free slot creation with valid data was successful.');
  });

  // Test Case 2: Test for empty required fields validation.
  test('should display required field errors when submitting an empty form', async ({ page }) => {
    await page.getByRole('button', { name: 'Add Free Slot' }).click();
    
    // Click save without filling in any information.
    await page.getByRole('button', { name: 'Save Free Slot' }).click();
    console.log('✅ Submitted an empty form to trigger validation.');

    // --- Assert that all required field error messages are visible ---
    // Note: You may need to adjust the exact error text to match your application.
    await expect(page.getByText('Sponsor does not exist.')).toBeVisible();
    await expect(page.getByText('Rank Id must be a valid number.')).toBeVisible();
    await expect(page.getByText('First name must be between 1 and 50 characters')).toBeVisible();
    await expect(page.getByText('Last name must be between 1 and 50 characters')).toBeVisible();
    await expect(page.getByText('You must be at least 15 years old.')).toBeVisible();
    await expect(page.getByText('Please select a valid gender.')).toBeVisible();
    await expect(page.getByText('Civil Status must be one of: Single, Married, Separated, Divorced, Widowed')).toBeVisible();
    await expect(page.getByText('Please provide a valid email address.')).toBeVisible();
    await expect(page.getByText('Please enter a valid phone number.')).toBeVisible();
    await expect(page.getByText('Address is required')).toBeVisible();
    
    console.log('✅ Test Passed: Verified all required field error messages are displayed.');
  });
  
  // Test Case 3: Test for invalid email format validation.
  test('should display an error for an invalid email format', async ({ page }) => {
    await page.getByRole('button', { name: 'Add Free Slot' }).click();

    // --- Fill the form with otherwise valid data ---
    await page.getByRole('textbox', { name: 'Sponsor ID *' }).fill('ASC-6814736228');
    await page.getByRole('textbox', { name: 'First Name *' }).fill('Test');
    await page.getByRole('textbox', { name: 'Last Name *' }).fill('User');
    // ... fill other required fields as needed ...
    
    // --- Input an invalid email ---
    const invalidEmail = 'this-is-not-a-valid-email';
    await page.getByRole('textbox', { name: 'Email Address *' }).fill(invalidEmail);
    console.log(`✅ Inputted invalid email: ${invalidEmail}`);

    // --- Submit and Assert ---
    await page.getByRole('button', { name: 'Save Free Slot' }).click();
    
    // Check for the specific validation error message for the email field.
    await expect(page.getByText('Please provide a valid email address.')).toBeVisible();
    console.log('✅ Test Passed: Verified invalid email format error message.');
  });

  // Test Case 4: Test for invalid contact number format.
  test('should display an error for an invalid contact number', async ({ page }) => {
    await page.getByRole('button', { name: 'Add Free Slot' }).click();
    
    // --- Fill other required fields with valid data ---
    await page.getByRole('textbox', { name: 'Sponsor ID *' }).fill('ASC-6814736228');
    await page.getByRole('textbox', { name: 'First Name *' }).fill('Test');
    await page.getByRole('textbox', { name: 'Last Name *' }).fill('User');
    await page.getByRole('textbox', { name: 'Email Address *' }).fill(faker.internet.email());
    // ... fill other required fields as needed ...
    
    // --- Input an invalid contact number (e.g., with letters) ---
    const invalidNumber = 'not-a-number';
    await page.getByRole('textbox', { name: 'Contact Number *' }).fill(invalidNumber);
    console.log(`✅ Inputted invalid contact number: ${invalidNumber}`);
    
    // --- Submit and Assert ---
    await page.getByRole('button', { name: 'Save Free Slot' }).click();

    // Check for the specific validation error message.
    await expect(page.getByText('Please enter a valid phone number.')).toBeVisible();
    console.log('✅ Test Passed: Verified invalid contact number error message.');
  });
});