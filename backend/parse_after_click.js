import fs from 'fs';
import * as cheerio from 'cheerio';

const htmlPath = "C:/Users/Admin/.gemini/antigravity/scratch/quantrex-academy/backend/after_click_adv.html";

if (!fs.existsSync(htmlPath)) {
  console.log('after_click_adv.html does not exist.');
  process.exit(0);
}

const html = fs.readFileSync(htmlPath, 'utf8');
const $ = cheerio.load(html);

console.log('=== Analyzing page content after clicking badge ===');
const text = $('body').text().trim().replace(/\s+/g, ' ');
console.log('Page body snippet:');
console.log(text.substring(0, 1500));

// Check for dialogs, modals, or subscription texts
console.log('\n--- Checking for potential subscription dialog elements ---');
$('[role="dialog"], .modal, .popup, [class*="modal"], [class*="dialog"]').each((i, el) => {
  console.log(`Tag: <${el.tagName}> | Class: "${$(el).attr('class') || ''}" | Text: "${$(el).text().trim().replace(/\s+/g, ' ').substring(0, 100)}"`);
});
