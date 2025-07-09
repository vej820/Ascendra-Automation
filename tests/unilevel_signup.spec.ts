// import { test, expect } from '@playwright/test';
// import { faker } from '@faker-js/faker';
// import { associate, builder, consultant, director, executive} from '../utils/packages';

// let sponsorCode = 'ASC-CA00000001';
// test('Signup', async ({ page }) => {
//   const firstName = faker.person.firstName();
//   const middleName = faker.person.middleName();
//   const lastName = faker.person.lastName();
//   const birthday = faker.date.birthdate({ min: 18, max: 50, mode: 'age' }).toISOString().split('T')[0];
//   const address = faker.location.streetAddress();
//   const number = '09' + faker.number.int({ min: 100000000, max: 999999999 }).toString();

//   await page.goto('https://ascendra-portal-staging.azurewebsites.net/');
//   console.log('✅ Visited homepage');
//   await page.getByRole('link', { name: 'Signup' }).click();
//   console.log('✅ Clicked Signup link');
//   await page.getByRole('textbox', { name: 'First Name *' }).fill(firstName);
//   console.log(`✅ First Name filled: ${firstName}`);
//   await page.getByRole('textbox', { name: 'Middle Name' }).fill(middleName);
//   console.log(`✅ Middle Name filled: ${middleName}`);
//   await page.getByRole('textbox', { name: 'Last Name *' }).fill(lastName);
//   console.log(`✅ Last Name filled: ${lastName}`);
//   await page.getByRole('textbox', { name: 'Suffix' }).press('Tab');
//   await page.getByRole('textbox', { name: 'Birthday *' }).fill(birthday);
//   await page.getByRole('combobox').filter({ hasText: 'Gender' }).click();
//   await page.getByRole('option', { name: 'Male', exact: true }).click();
//   await page.getByRole('combobox').filter({ hasText: 'Status' }).click();
//   await page.getByRole('option', { name: 'Single' }).click();
//   const fakeEmail = `vegie+${firstName.toLowerCase()}.${lastName.toLowerCase()}@skunkworks.ai`;
//   await page.getByRole('textbox', { name: 'Email Address *' }).fill(fakeEmail);
//   console.log(`✅ Email filled: ${fakeEmail}`);
//   await page.getByRole('textbox', { name: 'Contact Number *' }).fill(number);
//   console.log(`✅ Contact Number filled: ${number}`);
//   // await page.pause(); // Pause for manual email verification if needed
//   await page.getByRole('textbox', { name: 'Address *', exact: true }).fill(address);
//   // await page.getByRole('checkbox', { name: 'Did someone invite you?' }).click();
//   // await page.pause(); // Pause for manual input if needed
//   await page.getByRole('textbox', { name: 'Sponsor ID *' }).fill(sponsorCode);
//   console.log(`✅ Filled Sponsor ID: ${sponsorCode}`);
//   await page.getByRole('button', { name: 'Next' }).click();
//   // await associate(page);
//   await builder(page);
//   // await consultant(page);
//   // await director(page);
//   // await executive(page);
//   await page.getByRole('checkbox', { name: 'I accept the terms and' }).click();
//   await page.getByRole('button', { name: 'Pay Now' }).click();
//   await page.getByText('Payment Instructions Sent').waitFor();
//   await page.getByRole('button', { name: 'I Understand' }).click();
//   console.log('🎉 Root account signup completed successfully!');
// });



import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { associate, builder, consultant, director, executive} from '../utils/packages';

let sponsorCode = 'ASC-8535772803';

for (let i = 1; i <= 3; i++) {
  test(`Signup Run #${i}`, async ({ page }) => {
    const firstName = faker.person.firstName();
    const middleName = faker.person.middleName();
    const lastName = faker.person.lastName();
    const birthday = faker.date.birthdate({ min: 18, max: 50, mode: 'age' }).toISOString().split('T')[0];
    const address = faker.location.streetAddress();
    const number = '09' + faker.number.int({ min: 100000000, max: 999999999 }).toString();

    await page.goto('https://ascendra-portal-staging.azurewebsites.net/');
    console.log(`✅ [Run #${i}] Visited homepage`);
    await page.getByRole('link', { name: 'Signup' }).click();
    await page.getByRole('textbox', { name: 'First Name *' }).fill(firstName);
    await page.getByRole('textbox', { name: 'Middle Name' }).fill(middleName);
    await page.getByRole('textbox', { name: 'Last Name *' }).fill(lastName);
    await page.getByRole('textbox', { name: 'Suffix' }).press('Tab');
    await page.getByRole('textbox', { name: 'Birthday *' }).fill(birthday);
    await page.getByRole('combobox').filter({ hasText: 'Gender' }).click();
    await page.getByRole('option', { name: 'Male', exact: true }).click();
    await page.getByRole('combobox').filter({ hasText: 'Status' }).click();
    await page.getByRole('option', { name: 'Single' }).click();

    const fakeEmail = `vegie+${firstName.toLowerCase()}.${lastName.toLowerCase()}@skunkworks.ai`;
    await page.getByRole('textbox', { name: 'Email Address *' }).fill(fakeEmail);
    await page.getByRole('textbox', { name: 'Contact Number *' }).fill(number);
    await page.getByRole('textbox', { name: 'Address *', exact: true }).fill(address);
    await page.getByRole('textbox', { name: 'Sponsor ID *' }).fill(sponsorCode);
    await page.getByRole('button', { name: 'Next' }).click();
    // await associate(page);
    // await builder(page);
    // await consultant(page);
    // await director(page);
    await executive(page);
    await page.getByRole('checkbox', { name: 'I accept the terms and' }).click();
    await page.getByRole('button', { name: 'Pay Now' }).click();
    await page.getByText('Payment Instructions Sent').waitFor();
    await page.getByRole('button', { name: 'I Understand' }).click();

    console.log(`🎉 [Run #${i}] Signup completed successfully!`);
  });
}