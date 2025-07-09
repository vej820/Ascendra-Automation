import { Page, test } from '@playwright/test';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { faker } from '@faker-js/faker';
import { associate, builder, consultant, director, executive} from '../../utils/packages';
import { levels } from '../../utils/levels';


test('BV login and check', async ({ page, browser }) => {

  await page.goto('https://ascendra-portal-staging.azurewebsites.net/login');

  await page.getByRole('textbox', { name: 'Username' }).click();
  //Update username and password to enable assigning left member and right member
  await page.getByRole('textbox', { name: 'Username' }).fill("0000000005");
  await page.getByRole('textbox', { name: 'Username' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill("0000000005@ascendra.ph");
  await page.getByRole('button', { name: 'Login' }).click();

  // ✅ Wait for dashboard
  await page.getByRole('paragraph').filter({ hasText: 'Dashboard' }).waitFor();
  console.log('✅ Member logged in successfully');

  await page.getByRole('button', { name: 'My Team My Team' }).click();
  await page.getByRole('link', { name: 'Binary Level Structure Binary' }).click();
  await page.getByRole('button', { name: '+ Assign Left Member' }).click();
  await page.locator('div.p-2.rounded.cursor-pointer').nth(0).click();
  await page.getByRole('button', { name: 'Assign' }).click();
  await page.getByRole('button', { name: 'Dashboard Dashboard' }).click();
  await page.locator('button:has(svg.lucide-chevron-down)').click();
  await page.getByRole('menuitem', { name: 'Log out' }).click();
  await page.waitForTimeout(3000);


  const bvPath = path.join(__dirname, 'utils', 'BVtester.json');
  const users = JSON.parse(fs.readFileSync(bvPath, 'utf-8'));
  const firstUser = users[0];
  const { email, password } = firstUser;

  await page.goto('https://ascendra-portal-staging.azurewebsites.net/login');

  await page.getByRole('textbox', { name: 'Username' }).click();
  await page.getByRole('textbox', { name: 'Username' }).fill(email);
  console.log(`📧 Email: ${email}`);
  await page.getByRole('textbox', { name: 'Username' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  console.log(`🔐 Password: ${password}`);

  await page.getByRole('button', { name: 'Login' }).click();

  // ✅ Wait for dashboard
  await page.getByRole('paragraph').filter({ hasText: 'Dashboard' }).waitFor();
  console.log('✅ Member logged in successfully');

  await page.getByRole('button', { name: 'My Team My Team' }).click();
  await page.getByRole('link', { name: 'Binary Level Structure Binary' }).click();
  await page.getByRole('button', { name: '+ Assign Left Member' }).click();
  await page.locator('div.p-2.rounded.cursor-pointer').nth(0).click();
  await page.getByRole('button', { name: 'Assign' }).click();
  await page.getByRole('button', { name: '+ Assign Right Member' }).click();
  await page.locator('div.p-2.rounded.cursor-pointer').nth(1).click();
  await page.getByRole('button', { name: 'Assign' }).click();
  await page.getByRole('button', { name: 'Dashboard Dashboard' }).click();
  await page.getByRole('button', { name: 'My Team My Team' }).click();
  await page.getByRole('link', { name: 'Binary Level Structure Binary' }).click();
  await page.getByRole('button', { name: 'Dashboard Dashboard' }).click();

    const binaryResponse = await page.waitForResponse(res =>
      res.url().includes('binary?max_level=5') && res.status() === 200
    );
  
    const data = await binaryResponse.json();
    const nodes = data.result;
    const self = nodes[0];
    const myRank = self.rank;
    const bvCap = levels[myRank as keyof typeof levels] || 0;
  
    const nodeMap: Record<string, any> = {};
    nodes.forEach((node: { id: string | number }) => (nodeMap[node.id] = node));
  
    const leftRootId = '118';
    const rightRootId = '109';
  
    const leftDownlines: { rank: string; value: number; original: number }[] = [];
    const rightDownlines: { rank: string; value: number; original: number }[] = [];
    let sumLeft = 0;
    let sumRight = 0;
  
    const getRootUpline = (id: string): string | null => {
      let current = nodeMap[id];
      while (current?.upline_id && current.upline_id !== self.id) {
        current = nodeMap[current.upline_id];
      }
      return current?.id || null;
    };
  
    for (const node of nodes.slice(1)) {
      const rootUpline = getRootUpline(node.id);
      const rank = node.rank;
      const original = levels[rank as keyof typeof levels] || 0;
      const cappedValue = Math.min(original, bvCap);
  
      if (rootUpline === leftRootId) {
        leftDownlines.push({ rank, value: cappedValue, original });
        sumLeft += cappedValue;
      } else if (rootUpline === rightRootId) {
        rightDownlines.push({ rank, value: cappedValue, original });
        sumRight += cappedValue;
      }
    }
  
    console.log(`\n🧾 Your Rank: ${myRank} (BV Cap: ₱${bvCap})`);
    console.log('\n📥 LEFT DOWNLINES:');
    leftDownlines.forEach(d => {
      const note = d.value < d.original ? `✅ (capped from ₱${d.original})` : '';
      console.log(`- ${d.rank}: ₱${d.value} ${note}`);
    });
    console.log(`👉 TOTAL LEFT: ₱${sumLeft}\n`);
  
    console.log('📤 RIGHT DOWNLINES:');
    rightDownlines.forEach(d => {
      const note = d.value < d.original ? `✅ (capped from ₱${d.original})` : '';
      console.log(`- ${d.rank}: ₱${d.value} ${note}`);
    });
    console.log(`👉 TOTAL RIGHT: ₱${sumRight}\n`);
  
    // UI values
    await page.getByRole('button', { name: 'Dashboard Dashboard' }).click();
  
    const bvLeftText = await page.locator('text=BV Left').locator('..').textContent();
    const bvRightText = await page.locator('text=BV Right').locator('..').textContent();
    const commissionText = await page.locator('text=Total Binary Level Commission').locator('..').textContent();
  
    const uiLeft = parseInt(bvLeftText?.replace(/[^\d]/g, '') || '0', 10);
    const uiRight = parseInt(bvRightText?.replace(/[^\d]/g, '') || '0', 10);
    const uiCommission = parseInt(commissionText?.replace(/[^\d]/g, '') || '0', 10);
  
    const expectedCommission = Math.min(uiLeft, uiRight);
    const remainingBV = Math.abs(uiLeft - uiRight);
  
    console.log(`🖥️ UI BV Left: ₱${uiLeft}`);
    console.log(`🖥️ UI BV Right: ₱${uiRight}`);
    console.log(`💰 Expected Binary Commission: ₱${expectedCommission}`);
    console.log(`📊 Remaining BV (carried over): ₱${remainingBV}`);
  
    // Optional assertions
    // expect(uiCommission).toBe(expectedCommission);
});