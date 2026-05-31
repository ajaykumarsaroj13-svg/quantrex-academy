import fs from 'fs';

const manifestPath = "C:\\Users\\Admin\\.gemini\\antigravity\\scratch\\quantrex-academy\\frontend\\backend\\data\\test_series\\manifest.json";
const content = fs.readFileSync(manifestPath, 'utf8');
const manifest = JSON.parse(content);

console.log('Manifest Keys:', Object.keys(manifest));

for (const key of Object.keys(manifest)) {
  const val = manifest[key];
  console.log(`Key: "${key}" | Type: ${Array.isArray(val) ? 'Array' : typeof val}`);
  if (Array.isArray(val)) {
    console.log(`  Length: ${val.length}`);
    if (val.length > 0) {
      console.log(`  Sample item keys:`, Object.keys(val[0]));
      console.log(`  Sample item:`, JSON.stringify(val[0]).substring(0, 300));
    }
  } else {
    console.log(`  Value keys:`, Object.keys(val));
  }
}
