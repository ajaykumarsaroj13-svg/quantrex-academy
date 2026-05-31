import fs from 'fs';
import * as cheerio from 'cheerio';

const htmlPath = "C:/Users/Admin/.gemini/antigravity/scratch/quantrex-academy/backend/after_add_adv.html";

if (!fs.existsSync(htmlPath)) {
  console.log('after_add_adv.html does not exist.');
  process.exit(0);
}

const html = fs.readFileSync(htmlPath, 'utf8');
const $ = cheerio.load(html);

console.log('=== Analyzing page content after clicking add button ===');
const text = $('body').text().trim().replace(/\s+/g, ' ');
console.log('Page body snippet (first 1500 chars):');
console.log(text.substring(0, 1500));

// Check for any visible dialogs or overlays
console.log('\n--- Checking for dialogs or subscription popups ---');
$('[role="dialog"], .modal, .popup, [class*="modal"], [class*="dialog"]').each((i, el) => {
  console.log(`Tag: <${el.tagName}> | Class: "${$(el).attr('class') || ''}" | Text: "${$(el).text().trim().replace(/\s+/g, ' ').substring(0, 200)}"`);
});
