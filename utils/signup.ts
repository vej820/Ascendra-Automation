import { expect, Page } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { associate, builder, consultant, director, executive } from './packages';


let sponsorCode = 'ASC-5710724913';
export async function signup(page: Page) {
  const firstName = faker.person.firstName();
  const middleName = faker.person.middleName();
  const lastName = faker.person.lastName();
  const birthday = faker.date.birthdate({ min: 18, max: 50, mode: 'age' }).toISOString().split('T')[0];
  const email = faker.person.firstName();
  const address = faker.location.streetAddress();

  await page.goto('https://smartcity-a-portal-fd-ppd-hzg4bhfvf5drdxcs.z03.azurefd.net/');
  console.log('✅ Visited homepage');

  await page.getByRole('link', { name: 'Signup' }).click();
  console.log('✅ Clicked Signup link');

  await page.getByRole('textbox', { name: 'First Name *' }).fill(firstName);
  console.log(`✅ First Name filled: ${firstName}`);

  await page.getByRole('textbox', { name: 'Middle Name' }).fill(middleName);
  console.log(`✅ Middle Name filled: ${middleName}`);

  await page.getByRole('textbox', { name: 'Last Name *' }).fill(lastName);
  console.log(`✅ Last Name filled: ${lastName}`);

  await page.getByRole('textbox', { name: 'Suffix' }).press('Tab');

  await page.getByRole('textbox', { name: 'Birthday *' }).fill(birthday);
  console.log(`✅ Birthday filled: ${birthday}`);

  await page.getByRole('combobox').filter({ hasText: 'Gender' }).click();
  await page.getByRole('option', { name: 'Male', exact: true }).click();
  console.log('✅ Gender selected: Male');

  await page.getByRole('combobox').filter({ hasText: 'Status' }).click();
  await page.getByRole('option', { name: 'Single' }).click();
  console.log('✅ Status selected: Single');

  const fakeEmail = `vegie+${email}@skunkworks.ai`;
  await page.getByRole('textbox', { name: 'Email Address *' }).fill(fakeEmail);
  console.log(`✅ Email filled: ${fakeEmail}`);

  await page.getByRole('textbox', { name: 'Address *', exact: true }).fill(address);
  console.log(`✅ Address filled: ${address}`);

  await page.getByRole('textbox', { name: 'Sponsor ID *' }).fill(sponsorCode);
  console.log('✅ Sponsor ID filled');

  await page.getByRole('button', { name: 'Next' }).click();
  console.log('✅ Clicked Next');

  // Uncomment the following lines to test different packages
  await associate(page);
  // await builder(page);
  // await consultant(page);
  // await director(page);
  // await executive(page);

  await page.getByText('Terms and Condition').click();
  console.log('✅ Clicked Terms and Condition');

  await page.getByRole('button', { name: 'Pay Now' }).click();
  console.log('✅ Clicked Pay Now');

  await page.getByRole('button', { name: 'Understood' }).click();
  console.log('✅ Clicked Understood');

  console.log('🎉 Test completed successfully!');
  }
