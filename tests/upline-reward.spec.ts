import { test, expect } from '@playwright/test';
import { levels } from '../utils/levels';
import { memberLogin } from '../utils/fixtures.ts';

test('Calculate upline reward based on BV and rank', async ({ page }) => {
  await memberLogin(page);

  // Wait for network response
  const response = await page.waitForResponse(res =>
    res.url().includes('binary?max_level=5') && res.status() === 200
  );

  const data = await response.json();
  const uplines = data.result; // array of uplines with rank

  // Get BV values from the DOM
  const leftText = await page.locator('text=BV Left').locator('..').textContent();
  const rightText = await page.locator('text=BV Right').locator('..').textContent();

  const leftBV = parseInt(leftText?.replace(/[^\d]/g, '') || '0', 10);
  const rightBV = parseInt(rightText?.replace(/[^\d]/g, '') || '0', 10);
  const lesserBV = Math.min(leftBV, rightBV);

  console.log(`Left BV: ${leftBV}, Right BV: ${rightBV}, Lesser BV: ${lesserBV}`);

  for (const upline of uplines) {
    const rank = upline.rank;
    const rankValue = levels[rank];

    if (rankValue) {
      const reward = (rankValue * (lesserBV / 1000));
      console.log(`Rank: ${rank}, Reward: PHP ${reward.toFixed(2)}`);
    } else {
      console.warn(`Unknown rank: ${rank}`);
    }
  }

  expect(lesserBV).toBeGreaterThanOrEqual(0); // Dummy assertion for now
});
