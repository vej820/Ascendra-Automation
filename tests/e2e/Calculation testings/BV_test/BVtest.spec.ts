import { Page, test } from '@playwright/test';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { faker } from '@faker-js/faker';
import { associate, builder, consultant, director, executive} from '../../../../utils/packages';
import { levels } from '../../../../utils/levels';


test('BV tester', async ({ page, browser }) => {
  const utilsDir = path.join(__dirname, 'utils');
  if (!fs.existsSync(utilsDir)) {
    fs.mkdirSync(utilsDir, { recursive: true });
  }
  const userJsonPath = path.join(utilsDir, '..', 'utils', 'BVtester.json');
  fs.writeFileSync(userJsonPath, '[]');
  console.log('🧹 Cleared BVtester.json before starting automation.\n');

  const LOOP_COUNT = 3;

  for (let i = 0; i < LOOP_COUNT; i++) {
    console.log(`🔁 Loop ${i + 1} of ${LOOP_COUNT}`);

    if (i === 0) {
      execSync('npx playwright test tests/unilevel_signup.spec.ts', { stdio: 'inherit' });
      execSync('npx playwright test tests/accountactivation.spec.ts', { stdio: 'inherit' });
      execSync('npx playwright test BV_testLoginAndSCExtraction.spec.ts', { stdio: 'inherit' });
    } else {
      execSync('npx playwright test BV_membersignup.spec.ts', { stdio: 'inherit' });
      execSync('npx playwright test tests/accountactivation.spec.ts', { stdio: 'inherit' });
      execSync('npx playwright test BV_testLoginAndSCExtraction.spec.ts', { stdio: 'inherit' });
    }
  }
  console.log('✅ All loops completed successfully.');
  execSync('npx playwright test BVloginandchecking.spec.ts', { stdio: 'inherit' });
});