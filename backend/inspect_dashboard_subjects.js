import fs from 'fs';
import * as cheerio from 'cheerio';

const htmlPath = "C:/Users/Admin/.gemini/antigravity/scratch/quantrex-academy/backend/after_dom_click_adv.html";

if (!fs.existsSync(htmlPath)) {
  console.log('after_dom_click_adv.html does not exist.');
  process.exit(0);
}

const html = fs.readFileSync(htmlPath, 'utf8');
const $ = cheerio.load(html);

console.log('=== Analyzing main dashboard content ===');

// Print all links in the main dashboard content
$('main a, main button, div[class*="main"] a, div[class*="content"] a').each((i, el) => {
  const text = $(el).text().trim().replace(/\s+/g, ' ');
  const href = $(el).attr('href') || '';
  console.log(`Link ${i}: "${text}" -> "${href}"`);
});

// Let's print out all links containing 'subject' or 'pyq' anywhere in the page
console.log('\n--- All links containing subject or pyq ---');
$('a').each((i, el) => {
  const href = $(el).attr('href') || '';
  const text = $(el).text().trim().replace(/\s+/g, ' ');
  if (href.includes('subject') || href.includes('pyq') || href.includes('chapter')) {
    console.log(`Text: "${text}" | Href: "${href}"`);
  }
});
