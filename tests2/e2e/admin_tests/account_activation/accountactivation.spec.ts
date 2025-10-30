import { expect, test } from '@playwright/test';
import { adminLogin } from '../../../../utils/login';


test('Account activation after signup', async ({ page }) => {
  await adminLogin(page);

  await page.getByRole('button', { name: 'Account Activation Account' }).click();
  const activateButtons = await page.getByRole('button', { name: 'Activate' });
  await page.waitForTimeout(1000) // Pause for manual verification
  await page.getByRole('cell', { name: 'Date Request' }).getByRole('img').click(); 
  await activateButtons.nth(0).click();
  await page.getByRole('button', { name: 'Confirm and Activate' }).click();
  await expect(page.getByText('Account successfully')).toBeVisible();
  console.log('✅ Account activated successfully');
});


// test('Account activation after signup', async ({ page }) => {
//   await adminLogin(page);

//   // Navigate to the Account Activation page
//   await page.getByRole('button', { name: 'Account Activation Account' }).click();

//   // change the x in i < x if how many accounts to activate
//   for (let i = 0; i < 10; i++) {
//     // Get all Activate buttons
//     const activateButtons = await page.getByRole('button', { name: 'Activate' });
//     await activateButtons.first().waitFor(); // Ensure at least one button is present
//     // If there are no activate buttons left, break the loop
//     const count = await activateButtons.count();
//     if (count === 0) {
//       console.log('No more accounts to activate.');
//       break;
//     }

//     // Click the last activate button
//     await activateButtons.nth(-1).click();

//     // Optional: Wait for a success message (if shown)
//     // await page.getByText('Account successfully').waitFor(); // uncomment if needed

//     // Optional short wait to allow UI to update
//     await page.waitForTimeout(2000);
//   }

//   await page.pause(); // Pause for manual verification
// });


// test('Account rejection after signup', async ({ page }) => {
//   await adminLogin(page);
//   await page.getByRole('button', { name: 'Account Activation Account' }).click();
//   await page.getByRole('button', { name: 'Reject' }).nth(-1).click();
//   await page.getByRole('button', { name: 'Reject' }).click();
//   await page.getByText('Account successfully rejected.').click();
// });