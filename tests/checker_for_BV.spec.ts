import { test, expect } from '@playwright/test';
import { levels } from '../utils/levels';

test('Calculate separated binary BV values by left/right upline roots', async ({ page }) => {
  await page.goto('https://smart-city-ascendra-por-ppd2-g7c0e7echsdse3cq.southeastasia-01.azurewebsites.net/');
  console.log('✅ Navigated to login page');

  await page.getByRole('textbox', { name: 'Username' }).fill('vegie+elyse.lebsack@skunkworks.ai');
  await page.getByRole('textbox', { name: 'Username' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('lWtrQ7jS');
  await page.getByRole('button', { name: 'Login' }).click();
  console.log('✅ Logged in');

  await page.getByRole('paragraph').filter({ hasText: 'Dashboard' }).waitFor();
  console.log('✅ Dashboard loaded');

  await page.getByRole('button', { name: 'My Team My Team' }).click();
  await page.getByRole('link', { name: 'Binary Level Structure Binary' }).click();
  console.log('✅ Navigated to Binary Level Structure');

  const binaryResponse = await page.waitForResponse(res =>
    res.url().includes('binary?max_level=10') && res.status() === 200
  );
  console.log('✅ Binary data loaded');

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

  await page.getByRole('button', { name: 'Dashboard Dashboard' }).click();
  console.log('✅ Returned to Dashboard');

  const bvLeftText = await page.locator('text=BV Left').locator('..').textContent();
  const bvRightText = await page.locator('text=BV Right').locator('..').textContent();
  const commissionText = await page.locator('text=Total Binary Level Commission').locator('..').textContent();

  const uiLeft = parseInt(bvLeftText?.replace(/[^\d]/g, '') || '0', 10);
  const uiRight = parseInt(bvRightText?.replace(/[^\d]/g, '') || '0', 10);
  const uiCommission = parseInt(commissionText?.replace(/[^\d]/g, '') || '0', 10);

  const expectedCommission = Math.min(uiLeft, uiRight);
  const remainingBV = Math.abs(uiLeft - uiRight);

  console.log(`🖥️ UI BV Left: ₱${(uiLeft / 100).toLocaleString()}`);
  console.log(`🖥️ UI BV Right: ₱${(uiRight / 100).toLocaleString()}`);
  console.log(`💰 Expected Binary Commission: ₱${(expectedCommission / 100).toLocaleString()}`);
  console.log(`📊 Remaining BV (carried over): ₱${(remainingBV / 100).toLocaleString()}`);
  console.log('✅ All steps completed successfully');
});
