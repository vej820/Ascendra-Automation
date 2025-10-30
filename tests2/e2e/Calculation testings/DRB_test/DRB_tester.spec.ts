import { test } from '@playwright/test';
import fs from 'fs';

test('Count members per rank under left/right downlines with commission', async ({ page }) => {
  await page.goto('https://smartcity-project-a-portal-staging-hwdzfbateqe9ezhv.southeastasia-01.azurewebsites.net/login');

  // --- Login ---
  await page.getByRole('textbox', { name: 'Username' }).fill('thirzahtanya12a@gmail.com');
  await page.getByRole('textbox', { name: 'Username' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('P@ssword1');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('paragraph').filter({ hasText: 'Dashboard' }).waitFor();

  // --- Extract top upline rank ---
  const rankElement = page.getByText('Executive');
  const uplineRank = (await rankElement.textContent())?.trim();
  console.log("Upline rank:", uplineRank);

  // --- Navigate to Uni Level Structure ---
  await page.getByRole('button', { name: 'My Team My Team' }).click();
  await page.getByRole('link', { name: 'Uni Level Structure Uni Level' }).click();
  await page.getByRole('combobox').filter({ hasText: '10' }).click();
  await page.getByRole('option', { name: '50' }).click();

  // --- Wait for API Response with limit=50 ---
  const unilevelResponse = await page.waitForResponse(async res => {
    if (!res.url().includes('unilevel') || res.status() !== 200) return false;

    try {
      const postData = res.request().postData();
      if (postData) {
        const parsed = JSON.parse(postData);
        return parsed.limit === 50; // ✅ only match limit=50 requests
      }
    } catch {
      return false;
    }
    return false;
  });

  const data = await unilevelResponse.json();
  //   console.log(JSON.stringify(data, null, 2));

  // --- Commission Mapping ---
  const enrollmentCommissionMap: Record<string, Record<string, number>> = {
    Associate: {
      Associate: 1700,
      Builder: 1900,
      Consultant: 5000,
      Director: 17000,
      Executive: 40000,
    },
    Builder: {
      Associate: 1700,
      Builder: 3500,
      Consultant: 6500,
      Director: 19500,
      Executive: 45000,
    },
    Consultant: {
      Associate: 1700,
      Builder: 3500,
      Consultant: 11000,
      Director: 23000,
      Executive: 50000,
    },
    Director: {
      Associate: 1700,
      Builder: 3500,
      Consultant: 11000,
      Director: 33000,
      Executive: 60000,
    },
    Executive: {
      Associate: 1700,
      Builder: 3500,
      Consultant: 11000,
      Director: 33000,
      Executive: 70000,
    },
  };

  // --- Filter members to exclude free slots and pending status ---
  const members = data.result.data.filter((m: any) =>
    m.is_free_slot === false && m.status !== 'Pending'
  );

  // --- Deduplicate members (by ID if available, otherwise by name) ---
  const seen = new Set<string>();
  const uniqueMembers = members.filter((m: any) => {
    const key = m.id || m.name; // prefer unique ID if available
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // --- Calculate total referral commission ---
  let totalCommission = 0;

  for (const member of uniqueMembers) {
    const memberRank = member.rank;

    if (uplineRank && enrollmentCommissionMap[uplineRank]?.[memberRank]) {
      const commission = enrollmentCommissionMap[uplineRank][memberRank];
      totalCommission += commission;

      console.log(`Member: ${member.name}, Rank: ${memberRank}, Commission: ${commission}`);
    } else {
      console.log(`No commission mapping found for member: ${member.name} (${memberRank})`);
    }
  }

  console.log("Total Referral Commission:", totalCommission);
});