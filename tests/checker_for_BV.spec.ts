import { test, expect } from '@playwright/test';
import { memberLogin } from '../utils/login';
import { levels } from '../utils/levels';

test('Calculate total binary value per side with BV capping and full logging', async ({ page }) => {
  await memberLogin(page);

  await page.getByRole('paragraph').filter({ hasText: 'Dashboard' }).waitFor();
  await page.getByRole('button', { name: 'My Team My Team' }).click();
  await page.getByRole('link', { name: 'Binary Level Structure Binary' }).click();

  const binaryResponse = await page.waitForResponse((res) =>
    res.url().includes('binary?max_level=5') && res.status() === 200
  );

  await page.getByRole('button', { name: 'Dashboard Dashboard' }).click();

  const data = await binaryResponse.json();

  const myRank = data.result[0].rank;
  const bvCap = levels[myRank as keyof typeof levels] || 0;

  const leftDownlines: { rank: string; value: number; original: number }[] = [];
  const rightDownlines: { rank: string; value: number; original: number }[] = [];
  let sumLeft = 0;
  let sumRight = 0;

  const downlines = data.result.slice(1); // Skip self

  for (const node of downlines) {
    const rank = node.rank;
    const original = levels[rank as keyof typeof levels] || 0;
    const cappedValue = Math.min(original, bvCap);

    if (node.position === 'Left') {
      leftDownlines.push({ rank, value: cappedValue, original });
      sumLeft += cappedValue;
    } else if (node.position === 'Right') {
      rightDownlines.push({ rank, value: cappedValue, original });
      sumRight += cappedValue;
    }
  }

  // 🧾 Sample Output
  console.log(`\n🧾 Your Rank: ${myRank} (BV Cap: ₱${bvCap})\n`);

  console.log('📥 LEFT DOWNLINES:');
  leftDownlines.forEach(d => {
    const cappedNote = d.value < d.original ? `✅ (capped from ₱${d.original})` : '';
    console.log(`- ${d.rank}: ₱${d.value} ${cappedNote}`);
  });
  console.log(`👉 TOTAL LEFT: ₱${sumLeft}\n`);

  console.log('📤 RIGHT DOWNLINES:');
  rightDownlines.forEach(d => {
    const cappedNote = d.value < d.original ? `✅ (capped from ₱${d.original})` : '';
    console.log(`- ${d.rank}: ₱${d.value} ${cappedNote}`);
  });
  console.log(`👉 TOTAL RIGHT: ₱${sumRight}\n`);

  // Extract UI values
  const bvLeftText = await page.locator('text=BV Left').locator('..').textContent();
  const bvRightText = await page.locator('text=BV Right').locator('..').textContent();

  const uiLeft = parseInt(bvLeftText?.replace(/[^\d]/g, '') || '0', 10);
  const uiRight = parseInt(bvRightText?.replace(/[^\d]/g, '') || '0', 10);

  console.log(`🖥️ UI BV Left: ${uiLeft}`);
  console.log(`🖥️ UI BV Right: ${uiRight}`);

  // Assertions
  expect(uiLeft).toBe(sumLeft);
  expect(uiRight).toBe(sumRight);
});
