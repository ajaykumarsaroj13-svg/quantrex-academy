import fs from 'fs';
import path from 'path';

const manifestPath = "C:\\Users\\Admin\\.gemini\\antigravity\\scratch\\quantrex-academy\\frontend\\backend\\data\\test_series\\manifest.json";

if (!fs.existsSync(manifestPath)) {
  console.log('Manifest file does not exist.');
  process.exit(0);
}

const content = fs.readFileSync(manifestPath, 'utf8');
const manifest = JSON.parse(content);

console.log(`Manifest loaded. It has ${Array.isArray(manifest) ? manifest.length : Object.keys(manifest).length} entries.`);
if (Array.isArray(manifest)) {
  console.log('Total entries:', manifest.length);
  // Count by exam type
  const counts = {};
  manifest.forEach(item => {
    const exam = item.exam || 'Unknown';
    counts[exam] = (counts[exam] || 0) + 1;
  });
  console.log('Counts by exam type:', counts);
  console.log('First 10 entries:');
  manifest.slice(0, 10).forEach((item, idx) => {
    console.log(`  ${idx+1}. Title: "${item.title}" | Exam: "${item.exam}" | Year: ${item.year} | FilePath: "${item.filePath}"`);
  });
} else {
  console.log('Manifest format:', typeof manifest);
}
