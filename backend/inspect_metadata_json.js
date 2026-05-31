import fs from 'fs';

const filePath = "C:/Users/Admin/.gemini/antigravity/scratch/quantrex-academy/backend/metadata.json";

if (!fs.existsSync(filePath)) {
  console.log('metadata.json does not exist.');
  process.exit(0);
}

const content = fs.readFileSync(filePath, 'utf8');
const data = JSON.parse(content);

console.log('Keys of metadata:', Object.keys(data));

for (const key of Object.keys(data)) {
  const val = data[key];
  console.log(`\nKey: "${key}" | Type: ${Array.isArray(val) ? 'Array' : typeof val}`);
  if (val) {
    if (Array.isArray(val)) {
      console.log(`  Length: ${val.length}`);
      if (val.length > 0) {
        console.log(`  Sample 1st item keys:`, Object.keys(val[0]));
        console.log(`  Sample 1st item:`, JSON.stringify(val[0]).substring(0, 400));
      }
    } else {
      console.log(`  Keys:`, Object.keys(val));
      if (val.results) {
        console.log(`  Has "results" of type ${Array.isArray(val.results) ? 'Array' : typeof val.results}`);
        if (Array.isArray(val.results)) {
          console.log(`    Length of results: ${val.results.length}`);
          if (val.results.length > 0) {
            console.log(`    Sample 1st result keys:`, Object.keys(val.results[0]));
            console.log(`    Sample 1st result:`, JSON.stringify(val.results[0]).substring(0, 400));
          }
        }
      }
    }
  }
}
