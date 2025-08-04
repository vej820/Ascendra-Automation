import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { associate, builder, consultant, director, executive} from '../../../utils/packages';

let sponsorCode = 'ASC-00000334343';

for (let i = 1; i <= 1; i++) {
  test(`Signup Run #${i}`, async ({ page }) => {
    const firstName = faker.person.firstName();
    const middleName = faker.person.middleName();
    const lastName = faker.person.lastName();
    const birthday = faker.date.birthdate({ min: 18, max: 50, mode: 'age' }).toISOString().split('T')[0];
    const address = faker.location.streetAddress();
    const number = '09' + faker.number.int({ min: 100000000, max: 999999999 }).toString();

    await page.goto('https://ascendra-portal-staging.azurewebsites.net/');
    await page.getByRole('link', { name: 'Signup' }).click();
    await page.getByRole('textbox', { name: 'First Name *' }).fill('');
    await page.getByRole('textbox', { name: 'Middle Name' }).fill(middleName);
    await page.getByRole('textbox', { name: 'Last Name *' }).fill('');
    await page.getByRole('textbox', { name: 'Suffix' }).press('Tab');
    await page.getByRole('textbox', { name: 'Birthday *' }).fill('');
    await page.getByRole('combobox').filter({ hasText: 'Gender' }).click();
    await page.getByRole('option', { name: 'Male', exact: true }).click();
    await page.getByRole('combobox').filter({ hasText: 'Status' }).click();
    await page.getByRole('option', { name: 'Single' }).click();

    const fakeEmail = `vegie+${firstName.toLowerCase()}.${lastName.toLowerCase()}@skunkworks.ai`;
    await page.getByRole('textbox', { name: 'Email Address *' }).fill('veigasdasd@mailcom');
    await page.getByRole('textbox', { name: 'Contact Number *' }).fill('');
    await page.getByRole('textbox', { name: 'Address *', exact: true }).fill('');
    await page.getByRole('textbox', { name: 'Sponsor ID *' }).fill('');
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByText('First Name is required').waitFor();
    console.log('✅ First Name validation passed');
    await page.getByText('Last Name is required').waitFor();
    console.log('✅ Last Name validation passed');
    await page.getByText('Birthday is required').waitFor();
    console.log('✅ Birthday validation passed');
    await page.getByText('Invalid email').waitFor();
    console.log('✅ Email validation passed');
    await page.getByText('Contact Number is required').waitFor();
    console.log('✅ Contact Number validation passed');
    await page.getByText('Address is required').waitFor();
    console.log('✅ Address validation passed');
    await page.getByText('Sponsor Id is required').waitFor();
    console.log('✅ Sponsor Id validation passed');
    console.log(`✅ Signup failed as expected due to validation errors!`);
  });
}