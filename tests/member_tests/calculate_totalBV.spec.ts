import { test, expect } from '@playwright/test';
import 'dotenv/config';
import { levels } from '../../utils/levels';

test('test direct referral bonus', async ({ page, request }) => {
  const username = "alphatinebahoy@gmail.com";
  const password = "@sC3ndraA!i25";

  // 1. Log in
  await page.goto('https://ascendra-portal-staging.azurewebsites.net/login');
  await page.getByRole('textbox', { name: 'Username' }).fill(username);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('paragraph').filter({ hasText: 'Dashboard' }).waitFor();
  console.log('✅ Member logged in successfully');

  await page.getByRole('button', { name: 'My Team My Team' }).click();
  await page.getByRole('link', { name: 'Binary Level Structure Binary' }).click();
    const binaryResponse = await page.waitForResponse(res =>
      res.url().includes('binary?max_level=100') && res.status() === 200
    );
  
    const data = await binaryResponse.json();
    const nodes = data.result;
    const self = nodes[0];
    const myRank = self.rank;
    const bvCap = levels[myRank as keyof typeof levels] || 0;
  
    const nodeMap: Record<string, any> = {};
    nodes.forEach((node: { id: string | number }) => (nodeMap[node.id] = node));
  
    const leftRootId = '667';
    const rightRootId = '567';
  
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
