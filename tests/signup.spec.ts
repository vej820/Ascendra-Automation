import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

test('test', async ({ page }) => {
  const firstName = faker.person.firstName();
  const middleName = faker.person.middleName();
  const lastName = faker.person.lastName();
  const birthday = faker.date.birthdate({ min: 18, max: 50, mode: 'age' }).toISOString().split('T')[0];
  const email = faker.person.firstName();
  const address = faker.location.streetAddress();

  await page.goto('https://ascendra-portal-staging.azurewebsites.net/');
  await page.getByRole('link', { name: 'Signup' }).click();

  await page.getByRole('textbox', { name: 'First Name *' }).fill(firstName);
  await page.getByRole('textbox', { name: 'First Name *' }).press('Tab');
  await page.getByRole('textbox', { name: 'Middle Name' }).fill(middleName);
  await page.getByRole('textbox', { name: 'Middle Name' }).press('Tab');
  await page.getByRole('textbox', { name: 'Last Name *' }).fill(lastName);
  await page.getByRole('textbox', { name: 'Last Name *' }).press('Tab');
  await page.getByRole('textbox', { name: 'Suffix' }).press('Tab');
  await page.getByRole('textbox', { name: 'Birthday *' }).fill(birthday);
  await page.getByRole('textbox', { name: 'Birthday *' }).press('Tab');
  await page.getByRole('textbox', { name: 'Birthday *' }).press('Tab');
  await page.getByRole('textbox', { name: 'Birthday *' }).press('Tab');
  await page.getByRole('textbox', { name: 'Birthday *' }).press('Tab');

  await page.getByRole('combobox').filter({ hasText: 'Gender' }).click();
  await page.getByRole('option', { name: 'Male', exact: true }).click(); // Or randomize with faker.name.sex()

  await page.getByRole('combobox').filter({ hasText: 'Status' }).click();
  await page.getByRole('option', { name: 'Single' }).click();

  await page.getByRole('textbox', { name: 'Email Address *' }).fill('vegie+'+email+'@skunkworks.ai');
  await page.getByRole('textbox', { name: 'Email Address *' }).press('Tab');
  await page.getByRole('textbox', { name: 'Address *', exact: true }).fill(address);
  await page.getByRole('textbox', { name: 'Sponsor ID *' }).fill('ASC-8503045209');

  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Choose Package' }).first().click();
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByText('Terms and Condition').click();
  await page.getByRole('button', { name: 'Pay Now' }).click();
  await page.getByRole('button', { name: 'Understood' }).click();
});
