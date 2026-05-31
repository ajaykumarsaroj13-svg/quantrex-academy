import fs from 'fs';
import path from 'path';

const projectRoot = "C:\\Users\\Admin\\.gemini\\antigravity\\scratch\\quantrex-academy";

function searchDir(dir) {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      if (file === 'node_modules' || file === '.git' || file === '.github') return;
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        if (file.toLowerCase().includes('test_series') || file.toLowerCase().includes('test-series') || file.toLowerCase().includes('data')) {
          results.push(fullPath);
        }
        results = results.concat(searchDir(fullPath));
      } else {
        if (file.toLowerCase().includes('manifest') || file.toLowerCase().includes('test_series') || file.toLowerCase().includes('test-series')) {
          results.push(fullPath);
        }
      }
    });
  } catch (e) {
    // ignore
  }
  return results;
}

console.log('Searching for test series/data directories and files...');
const found = searchDir(projectRoot);
console.log('Found matches:', found);
