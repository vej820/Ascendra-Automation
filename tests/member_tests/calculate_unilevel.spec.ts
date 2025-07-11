import { test, expect } from '@playwright/test';
import 'dotenv/config';

test('fetch all expansion commissions (uni-level & binary)', async ({ page, request }) => {
  const username = "ascendratesting@gmail.com";
  const password = "@sC3ndraA!i25";
  console.log("BEARER_TOKEN:", process.env.BEARER_TOKEN_admin);

  // 1. Login
  await page.goto('https://smart-city-ascendra-por-ppd2-g7c0e7echsdse3cq.southeastasia-01.azurewebsites.net/');
  await page.getByRole('textbox', { name: 'Username' }).fill(username);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByText('User Management', { exact: true }).waitFor();
  console.log('✅ Admin logged in successfully');
  // await page.getByRole('textbox', { name: 'Search Name' }).fill('Tanya/Dhon Corpo');
  // await page.getByRole('link', { name: 'Tanya/Dhon Corpo' }).click();
  // await page.getByText('Transaction Logs').click();


  // 2. Loop to collect all transactions
  let pageNumber = 1;
  let allTransactions: any[] = [];

  while (true) {
    console.log(`📄 Fetching page ${pageNumber}...`);

    const response = await request.post(
      'https://smart-city-ascendra-ser-ppd2-gbcrc5aybze4agaz.southeastasia-01.azurewebsites.net/users/2545/compensation/transactions', // change ID to change target member
      {
        headers: {
          Authorization: `Bearer ${process.env.BEARER_TOKEN_admin!}`,
          'Content-Type': 'application/json',
        },
        data: {
          limit: 50,
          page: pageNumber,
        },
      }
    );

    const json = await response.json();

    if (!json.success) {
      throw new Error(`❌ API call failed on page ${pageNumber}: ${json.message}`);
    }

    const pageData = json.result?.data || [];

    console.log(`✅ Retrieved ${pageData.length} transactions`);

    if (pageData.length === 0) {
      console.log('✅ No more records, stopping pagination');
      break;
    }

    allTransactions = allTransactions.concat(pageData);
    pageNumber++;
  }

  console.log(`🎯 Fetched total ${allTransactions.length} transactions`);

  // 3. Filter transactions for Expansion & Uni-Level
  const expansionUnilevelTransactions = allTransactions.filter(
    (tx) =>
      tx.compensation_account?.type === "Expansion" &&
      tx.description?.toLowerCase().includes('uni-level')
  );

  // 4. Filter transactions for Expansion & Binary
  const expansionBinaryTransactions = allTransactions.filter(
    (tx) =>
      tx.compensation_account?.type === "Expansion" &&
      tx.description?.toLowerCase().includes('binary')
  );

  console.log(`🎯 Found ${expansionUnilevelTransactions.length} Uni-Level transactions in Expansion account`);
  console.log(`🎯 Found ${expansionBinaryTransactions.length} Binary transactions in Expansion account`);

  // 5. Sum amounts
  let totalExpansionUnilevel = 0;
  for (const tx of expansionUnilevelTransactions) {
    const amount = parseFloat(tx.amount || "0");
    totalExpansionUnilevel += amount;
  }

  let totalExpansionBinary = 0;
  for (const tx of expansionBinaryTransactions) {
    const amount = parseFloat(tx.amount || "0");
    totalExpansionBinary += amount;
  }

  const totalExpansionCommission = totalExpansionUnilevel + totalExpansionBinary;
  // const uvAndBvTotal = totalCommissionUnilevelView + totalCommissionBinaryTree;

  console.log(`🎯 Total Expansion Commission: PHP ${totalExpansionCommission.toLocaleString()}`);
  console.log(`💰 Commission logs (Unilevel only): PHP ${totalExpansionUnilevel.toLocaleString()}`);
  console.log(`💰 Commission logs (Binary only): PHP ${totalExpansionBinary.toLocaleString()}`);

  // console.log(`💰 Unilevel view : PHP ${totalCommissionUnilevelView.toLocaleString()}`);
  // console.log(`💰 Binary view : PHP ${totalCommissionBinaryTree.toLocaleString()}`);
  // console.log(`💰 Binary view : PHP ${uvAndBvTotal.toLocaleString()}`);
});
