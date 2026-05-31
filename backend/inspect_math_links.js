import fs from 'fs';
import path from 'path';

const filePath = "C:\\Users\\Admin\\.gemini\\antigravity\\scratch\\scraper\\math_links.json";
const content = fs.readFileSync(filePath, 'utf8');
const links = JSON.parse(content);

console.log('Total links:', links.length);
links.slice(0, 15).forEach((l, i) => {
  console.log(`  ${i+1}. Text: "${l.text}" | Href: "${l.href}"`);
});
