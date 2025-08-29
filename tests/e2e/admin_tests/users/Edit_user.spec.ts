import { faker } from '@faker-js/faker';
import { test, expect } from '@playwright/test';

/**
 * @file This test suite covers the "Edit User" functionality in the admin portal.
 * It includes tests for successful updates, as well as handling of empty and invalid inputs.
 */

// We use test.describe() to group related tests into a suite.
test.describe('Admin Portal - Edit User', () => {
  
  // This hook runs before each test in this suite.
  // It handles the common login steps, keeping our tests clean and focused.
  test.beforeEach(async ({ page }) => {
    await page.goto('https://smartcity-project-a-portal-ppd2-c3ave4fdfpbwdyd2.southeastasia-01.azurewebsites.net/');
    await page.getByRole('textbox', { name: 'Username' }).fill('sysadmin');
    await page.getByRole('textbox', { name: 'Password' }).fill('P@ssword1');
    await page.getByRole('button', { name: 'Login' }).click();
    // Wait for a unique element on the dashboard to confirm a successful login.
    await expect(page.getByText('User Management', { exact: true })).toBeVisible();
    console.log('✅ Admin logged in successfully');
  });

  // Test Case 1: The "happy path" test for a successful update.
  test('should update user data successfully with all valid data', async ({ page }) => {
    // --- Generate random valid data for the update ---
    const firstName = faker.person.firstName();
    const middleName = faker.person.middleName();
    const lastName = faker.person.lastName();
    const birthday = faker.date.birthdate({ min: 18, max: 50, mode: 'age' }).toISOString().split('T')[0];
    const address = faker.location.streetAddress();
    const number = `09${faker.number.int({ min: 100000000, max: 999999999 })}`;
    const fakeEmail = `vegie+${firstName.toLowerCase()}.${lastName.toLowerCase()}@skunkworks.ai`;

    // --- Find the user and open the Edit modal ---
    // Note: This test relies on 'vegie+zelma.kilback@skunkworks.ai' existing.
    await page.getByRole('textbox', { name: 'Search Name' }).fill('ASC-9089479468');
    await page.locator('tbody tr').first().getByRole('button').click();
    await page.getByRole('menuitem', { name: 'Edit User' }).click();

    // --- Fill out the form with new, valid data ---
    await page.getByRole('textbox', { name: 'First Name' }).fill(firstName);
    await page.getByRole('textbox', { name: 'Last Name' }).fill(lastName);
    await page.getByRole('textbox', { name: 'Middle Name' }).fill(middleName);
    await page.getByRole('textbox', { name: 'Date of Birth' }).fill(birthday);
    await page.getByRole('combobox', { name: 'Civil Status' }).click();
    await page.getByRole('option', { name: 'Married' }).click();
    await page.getByRole('textbox', { name: 'Email Address' }).fill(fakeEmail);
    await page.getByRole('textbox', { name: 'Phone Number' }).fill(number);
    await page.getByRole('textbox', { name: 'Complete Address' }).fill(address);
    console.log(`✅ Form filled with new email: ${fakeEmail}`);

    // --- Save changes and verify success ---
    // Note: The button name 'Update User' and message 'User updated successfully!' are assumptions.
    // Please adjust them if your application uses different text.
    await page.getByRole('button', { name: 'Save Changes' }).click();
    await expect(page.getByText('User updated successfully.')).toBeVisible();
    console.log('✅ Test Passed: User data was updated successfully.');
  });

  // Test Case 2: Test for empty required fields validation.
  test('should display required field errors when clearing inputs and saving', async ({ page }) => {
    // --- Find the user and open the Edit modal ---
    await page.getByRole('textbox', { name: 'Search Name' }).fill('ASC-9089479468');
    await page.locator('tbody tr').first().getByRole('button').click();
    await page.getByRole('menuitem', { name: 'Edit User' }).click();
    console.log('✅ Navigated to the Edit User form.');

    // --- Clear the content of required fields ---
    await page.getByRole('textbox', { name: 'First Name' }).fill('');
    await page.getByRole('textbox', { name: 'Last Name' }).fill('');
    await page.getByRole('textbox', { name: 'Email Address' }).fill('');
    console.log('✅ Cleared required fields.');

    // --- Attempt to save the changes ---
    await page.getByRole('button', { name: 'Update User' }).click();

    // --- Assert that error messages are visible ---
    // Note: The exact error text ('... is required') may be different in your application.
    await expect(page.getByText('First Name is required')).toBeVisible();
    await expect(page.getByText('Last Name is required')).toBeVisible();
    await expect(page.getByText('Email Address is required')).toBeVisible();
    console.log('✅ Test Passed: Verified required field error messages are displayed.');
  });

  // Test Case 3: Test for invalid email format validation.
  test('should display an error for an invalid email format', async ({ page }) => {
    // --- Find the user and open the Edit modal ---
    await page.getByRole('textbox', { name: 'Search Name' }).fill('ASC-9089479468');
    await page.locator('tbody tr').first().getByRole('button').click();
    await page.getByRole('menuitem', { name: 'Edit User' }).click();

    // --- Enter an invalid email ---
    await page.getByRole('textbox', { name: 'Email Address' }).fill('not-a-valid-email');
    console.log('✅ Entered an invalid email format.');

    // --- Attempt to save and assert the error ---
    await page.getByRole('button', { name: 'Update User' }).click();
    await expect(page.getByText('Invalid email format')).toBeVisible();
    console.log('✅ Test Passed: Verified invalid email error message.');
  });

  // Test Case 4: Test for invalid phone number format validation.
  test('should display an error for an invalid phone number', async ({ page }) => {
    // --- Find the user and open the Edit modal ---
    await page.getByRole('textbox', { name: 'Search Name' }).fill('ASC-9089479468');
    await page.locator('tbody tr').first().getByRole('button').click();
    await page.getByRole('menuitem', { name: 'Edit User' }).click();

    // --- Enter an invalid phone number ---
    await page.getByRole('textbox', { name: 'Phone Number' }).fill('not-a-number');
    console.log('✅ Entered an invalid phone number format.');

    // --- Attempt to save and assert the error ---
    await page.getByRole('button', { name: 'Update User' }).click();
    await expect(page.getByText('Invalid phone number')).toBeVisible();
    console.log('✅ Test Passed: Verified invalid phone number error message.');
  });
});