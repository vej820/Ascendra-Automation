import { test } from '@playwright/test';
import { adminLogin } from '../utils/login.ts';

// test('Account activation after signup', async ({ page }) => {
//   await adminLogin(page);


//   await page.getByRole('button', { name: 'Account Activation Account' }).click();
//   const activateButtons = await page.getByRole('button', { name: 'Activate' });
//   await activateButtons.nth(-1).click();
//   await page.getByRole('button', { name: 'Activate' }).click();

//   await page.pause(); 
// });


test('Account activation after signup', async ({ page }) => {
  await adminLogin(page);

  // Navigate to the Account Activation page
  await page.getByRole('button', { name: 'Account Activation Account' }).click();

  for (let i = 0; i < 5; i++) {
    // Get all Activate buttons
    const activateButtons = await page.getByRole('button', { name: 'Activate' });
    await activateButtons.first().waitFor(); // Ensure at least one button is present
    // If there are no activate buttons left, break the loop
    const count = await activateButtons.count();
    if (count === 0) {
      console.log('No more accounts to activate.');
      break;
    }

    // Click the last activate button
    await activateButtons.nth(-1).click();

    // Optional: Wait for a success message (if shown)
    // await page.getByText('Account successfully').waitFor(); // uncomment if needed

    // Optional short wait to allow UI to update
    await page.waitForTimeout(1000);
  }

  await page.pause(); // Pause for manual verification
});


test('Account rejection after signup', async ({ page }) => {
  await adminLogin(page);
  await page.getByRole('button', { name: 'Account Activation Account' }).click();
  await page.getByRole('button', { name: 'Reject' }).nth(-1).click();
  await page.getByRole('button', { name: 'Reject' }).click();
  await page.getByText('Account successfully rejected.').click();
});