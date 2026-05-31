import fs from 'fs';
import path from 'path';

const filePath = "C:\\Users\\Admin\\.gemini\\antigravity\\scratch\\quantrex-academy\\backend\\data\\tests.json";

if (!fs.existsSync(filePath)) {
  console.log('tests.json does not exist.');
  process.exit(0);
}

const content = fs.readFileSync(filePath, 'utf8');
const parsed = JSON.parse(content);

console.log('Total items in tests.json:', parsed.length || Object.keys(parsed).length);
if (Array.isArray(parsed)) {
  parsed.slice(0, 10).forEach((t, i) => {
    console.log(`  ${i+1}. Title: "${t.title || t.name}" | Questions: ${t.questions ? t.questions.length : 0} | Category: ${t.exam || t.category || 'N/A'}`);
  });
} else {
  console.log('Keys:', Object.keys(parsed));
  const keys = Object.keys(parsed);
  if (keys.length > 0) {
    const val = parsed[keys[0]];
    console.log(`First key '${keys[0]}' type:`, typeof val);
    if (Array.isArray(val)) {
      console.log(`First key val is array of length ${val.length}`);
      val.slice(0, 10).forEach((t, i) => {
        console.log(`  ${i+1}. Title: "${t.title}" | Questions: ${t.questions ? t.questions.length : 0}`);
      });
    }
  }
}
