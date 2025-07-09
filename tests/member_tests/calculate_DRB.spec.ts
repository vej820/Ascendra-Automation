import { test, expect } from '@playwright/test';
import 'dotenv/config';

test('test direct referral bonus', async ({ page, request }) => {
  const username = "thirzahtanya12a@gmail.com";
  const password = "@sC3ndraA!i25";
  console.log("BEARER_TOKEN:", process.env.BEARER_TOKEN_member);

  // 1. Log in
  await page.goto('https://ascendra-portal-staging.azurewebsites.net/login');
  await page.getByRole('textbox', { name: 'Username' }).fill(username);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('paragraph').filter({ hasText: 'Dashboard' }).waitFor();
  console.log('✅ Member logged in successfully');

  await page.getByRole('button', { name: 'My Team My Team' }).click();
  await page.getByRole('link', { name: 'Uni Level Structure Uni Level' }).click();
  await page.getByRole('combobox').filter({ hasText: '10' }).click();
  await page.getByRole('option', { name: '50' }).click();
// 2. Start waiting for the unilevel response
const unilevelResponsePromise = page.waitForResponse((res) => {
  const urlOk = res.url().includes('/networks/unilevel');
  const methodOk = res.request().method() === 'POST';
  const postData = res.request().postData();
  const postDataOk = typeof postData === 'string' && postData.includes('"limit":50');
  return urlOk && methodOk && postDataOk;
});

  // 3. Navigate to Uni Level Structure in UI


  // 4. Wait for the response and parse it
  const unilevelResponse = await unilevelResponsePromise;
  const unilevelJson = await unilevelResponse.json();

  if (!unilevelJson.success) {
    throw new Error(`❌ Unilevel API call failed: ${unilevelJson.message}`);
  }
  if (!unilevelJson.result || !Array.isArray(unilevelJson.result.data)) {
    throw new Error(`❌ Invalid unilevel API response:\n${JSON.stringify(unilevelJson, null, 2)}`);
  }

  const rankToBonus: Record<string, number> = {
    'Associate': 1700,
    'Builder': 3500,
    'Consultant': 11000,
    'Director': 33000,
    'Executive': 70000
  };

  // 5. Filter and compute expected balance
  let expected_essential_balance = 0;
  const filteredMembers = unilevelJson.result.data.filter(
    (item: any) => item.level === 1 && item.is_free_slot === false
  );
  console.log(`✅ Filtered members count: ${filteredMembers.length}`);
  console.log(`✅ Filtered members: ${JSON.stringify(filteredMembers, null, 2)}`);

  for (const member of filteredMembers) {
    const bonus = rankToBonus[member.rank ?? ''] || 0;
    expected_essential_balance += bonus;
  }

  console.log(`✅ expected_essential_balance: ${expected_essential_balance}`);
  // 6. Go to Payouts page in UI
  await page.getByRole('button', { name: 'Payout Payout' }).click();
  await page.pause();
  await page.waitForTimeout(3000);

  // 7. Fetch essential balance from Accounts API
  const accountsResponse = await request.get(
    'https://staging.services.ascendra-ai.com/accounts',
    {
      headers: {
        Authorization: `Bearer ${process.env.BEARER_TOKEN_member!}`,
      },
    }
  );
  const accountsJson = await accountsResponse.json();

  if (!accountsJson.success) {
    throw new Error(`❌ Accounts API call failed: ${accountsJson.message}`);
  }
  if (!accountsJson.result || !Array.isArray(accountsJson.result.accounts)) {
    throw new Error(`❌ Invalid accounts API response:\n${JSON.stringify(accountsJson, null, 2)}`);
  }

  const essentialAccount = accountsJson.result.accounts.find(
    (account: any) => account.type === "Essential"
  );

  if (!essentialAccount) {
    throw new Error("❌ Essential account not found in API response.");
  }

  const essential_balance = parseFloat(essentialAccount.balance);
  console.log(`✅ Retrieved essential_balance: ${essential_balance}`);
  // 8. Fetch compensations payouts
  const rows = await page.$$('table tbody tr');
let total_paid = 0;

for (const row of rows) {
  const cells = await row.$$('td');
  if (cells.length < 3) continue;

  const amountText = await cells[0].innerText(); // e.g., "PHP 10,000.00"
  const statusText = await cells[2].innerText(); // e.g., "Completed"

  const cleanedAmount = amountText.replace(/[^\d.]/g, ''); // "10000.00"
  const amount = parseFloat(cleanedAmount);

  if (['Completed', 'Pending'].includes(statusText.trim())) {
    total_paid += amount;
  }
}

console.log(`✅ Computed total_paid from table: ${total_paid}`);

const overallBalance = essential_balance + total_paid;
console.log(`✅ Overall balance: ${overallBalance}`);
console.log(`✅ Expected essential balance: ${expected_essential_balance}`);
expect(overallBalance).toBeCloseTo(expected_essential_balance, 2);
console.log('✅ Direct Referral Bonus test passed successfully');

});
