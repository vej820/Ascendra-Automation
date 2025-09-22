import { test } from '@playwright/test';

test('Count members per rank under left/right downlines with commission', async ({ page }) => {
  await page.goto('https://smartcity-project-a-portal-staging-hwdzfbateqe9ezhv.southeastasia-01.azurewebsites.net/login');

  // Login
  await page.getByRole('textbox', { name: 'Username' }).fill('ascendrainternationalbyangelo@gmail.com');
  await page.getByRole('textbox', { name: 'Username' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('P@ssword1');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('paragraph').filter({ hasText: 'Dashboard' }).waitFor();

  // Navigate to Binary Level Structure
  await page.getByRole('button', { name: 'My Team My Team' }).click();
  await page.getByRole('link', { name: 'Binary Level Structure Binary' }).click();
  await page.getByRole('combobox').click();

  // Get all options in the combobox
  const options = await page.getByRole('option').all();

  // Find the max value
  let maxOption: string = '0';
  for (const option of options) {
    const text = await option.textContent();
    if (!text) continue;
    if (parseInt(text) > parseInt(maxOption)) {
      maxOption = text;
    }
  }
  console.log('🔍 Max level option found:', maxOption);

  // Click the max option
  await page.getByRole('option', { name: maxOption }).click();

  // Wait for binary data response (match max_level dynamically)
  const binaryResponse = await page.waitForResponse(res =>
    res.url().includes(`max_level=${maxOption}`) && res.status() === 200
  );

  const data = await binaryResponse.json();
  const nodes = data.result;

  // Store top upline rank (very first node in payload)
  const topUplineRank = nodes[0]?.rank as 'Associate' | 'Builder' | 'Consultant' | 'Director' | 'Executive' | 'Legacy Partner';
  console.log('🌟 Top Upline Rank:', topUplineRank);

  // Map nodes by ID for quick lookup
  const nodeMap: Record<string, any> = {};
  nodes.forEach((node: { id: string | number }) => (nodeMap[node.id] = node));

  // Commission mapping
  const commissionMap: Record<string, number> = {
    Associate: 600,
    Builder: 1000,
    Consultant: 3200,
    Director: 8000,
    Executive: 10000,
    'Legacy Partner': 0 // Add the new rank here
  };

  // Rank order (lower index = lower rank)
  type Rank = 'Associate' | 'Builder' | 'Consultant' | 'Director' | 'Executive' | 'Legacy Partner'; // Update the Rank type
  const rankOrder: Rank[] = ['Associate', 'Builder', 'Consultant', 'Director', 'Executive', 'Legacy Partner']; // Add to the rank order array

  // Initialize counts and commission per rank
  const emptyRankCounts: Record<Rank, number> = {
    Associate: 0,
    Builder: 0,
    Consultant: 0,
    Director: 0,
    Executive: 0,
    'Legacy Partner': 0, // Add the new rank to the initial counts
  };
  const leftByRank: Record<Rank, number> = { ...emptyRankCounts };
  const rightByRank: Record<Rank, number> = { ...emptyRankCounts };
  const leftCommission: Record<Rank, number> = { ...emptyRankCounts };
  const rightCommission: Record<Rank, number> = { ...emptyRankCounts };

  // Dynamically get left and right root IDs (2nd and 3rd node in payload)
  const leftRootId = nodes[1]?.id;
  const rightRootId = nodes[2]?.id;

  if (!leftRootId || !rightRootId) {
    throw new Error('Cannot determine leftRootId and rightRootId from payload.');
  }

  // Recursive function to assign branch, count, and calculate commission
  const assignBranch = (
    nodeId: string,
    branch: 'left' | 'right',
    maxAllowedRank: Rank // Use topUplineRank as max allowed
  ) => {
    const node = nodeMap[nodeId];
    if (!node) return;

    const nodeRank = node.rank as Rank;

    // Effective rank for commission cannot exceed topUplineRank
    const effectiveRank =
      rankOrder.indexOf(nodeRank) > rankOrder.indexOf(maxAllowedRank)
        ? maxAllowedRank
        : nodeRank;

    if (!node.is_free_slot) {
      if (branch === 'left') {
        leftByRank[nodeRank] += 1;
        leftCommission[nodeRank] += commissionMap[effectiveRank];
      } else {
        rightByRank[nodeRank] += 1;
        rightCommission[nodeRank] += commissionMap[effectiveRank];
      }
    } 
    else {
      console.log(`⚠️ Skipping free slot: ${node.name} (ID: ${node.id})`);
    }

    // Recurse into downlines, passing down topUplineRank as max
    if (node.left_id && node.left_id !== 'null') assignBranch(node.left_id, branch, maxAllowedRank);
    if (node.right_id && node.right_id !== 'null') assignBranch(node.right_id, branch, maxAllowedRank);
  };

  // Start recursion from the two main downlines using topUplineRank as max cap
  assignBranch(leftRootId, 'left', topUplineRank);
  assignBranch(rightRootId, 'right', topUplineRank);

  console.log('📥 LEFT BRANCH MEMBERS BY RANK:', leftByRank);
  console.log('📤 RIGHT BRANCH MEMBERS BY RANK:', rightByRank);
  console.log('💰 LEFT BRANCH COMMISSION:', leftCommission);
  console.log('💰 RIGHT BRANCH COMMISSION:', rightCommission);

  // Optional: calculate grand total per branch
  const leftTotal = Object.values(leftCommission).reduce((a, b) => a + b, 0);
  const rightTotal = Object.values(rightCommission).reduce((a, b) => a + b, 0);
  console.log('🏆 LEFT BRANCH TOTAL COMMISSION:', leftTotal);
  console.log('🏆 RIGHT BRANCH TOTAL COMMISSION:', rightTotal);
});