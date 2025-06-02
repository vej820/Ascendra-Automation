import fs from 'fs';
import path from 'path';

const stateFile = path.join(__dirname, 'used-packages.json');
const allPackages = ['associate', 'builder', 'consultant', 'director', 'executive'];

export function getRandomUnusedPackage(): string {
  let used: string[] = [];

  if (fs.existsSync(stateFile)) {
    used = JSON.parse(fs.readFileSync(stateFile, 'utf-8'));
  }

  const unused = allPackages.filter(pkg => !used.includes(pkg));

  if (unused.length === 0) {
    // Reset when all packages have been used
    fs.writeFileSync(stateFile, JSON.stringify([]));
    return getRandomUnusedPackage();
  }

  const random = unused[Math.floor(Math.random() * unused.length)];
  used.push(random);
  fs.writeFileSync(stateFile, JSON.stringify(used));

  return random;
}
