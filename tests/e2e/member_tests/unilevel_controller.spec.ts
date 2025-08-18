import { test } from '@playwright/test';
import { execSync } from 'child_process';
import { rankConfig } from '../../../utils/config';
import path from 'path';
import fs from 'fs';

// const RANK = 'BUILDER';
// const MAX_DEPTH = rankConfig[RANK];
const TOTAL_ACCOUNTS = 2;

test('Automate Unilevel commission', async () => {
  // const userJsonPath = path.join(__dirname, 'utils', 'latest-user.json');
  // fs.writeFileSync(userJsonPath, '[]');
  // console.log('🧹 Cleared latest-user.json before starting automation.\n');


  for (let depth = 1; depth <= TOTAL_ACCOUNTS; depth++) {
    console.log(`🧩 Creating Account at Depth ${depth}`);


    // if (depth === 0) {
    //   // execSync('npx playwright test unilevel_signup.spec.ts --headed', { stdio: 'inherit' });
    //   // execSync('npx playwright test accountactivation.spec.ts --headed', { stdio: 'inherit' });
    //   // await new Promise(resolve => setTimeout(resolve, 7000));
    //   // execSync('npx playwright test testLoginAndSCExtraction.spec.ts --headed', { stdio: 'inherit' });
      
    // } else {

        execSync('npx playwright test unilevel_membersignup.spec.ts', { stdio: 'inherit' });
        execSync('npx playwright test accountactivation.spec.ts', { stdio: 'inherit' });
        execSync('npx playwright test testLoginAndSCExtraction.spec.ts', { stdio: 'inherit' });


    // // Optional: stop if depth is greater than allowed unilevel depth
    // if (depth >= MAX_DEPTH) {
    //   console.log(`🚫 Reached max commission depth for ${RANK} (${MAX_DEPTH})`);
    //   break;
    // }
  }
});