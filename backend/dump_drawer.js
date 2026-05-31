import fs from 'fs';
import * as cheerio from 'cheerio';

const htmlPath = "C:/Users/Admin/.gemini/antigravity/scratch/quantrex-academy/backend/after_click_adv.html";

if (!fs.existsSync(htmlPath)) {
  console.log('after_click_adv.html does not exist.');
  process.exit(0);
}

const html = fs.readFileSync(htmlPath, 'utf8');
const $ = cheerio.load(html);

// Print the entire HTML code of the Choose Your Exam drawer
console.log('=== Choose Your Exam Drawer HTML ===');
const drawer = $('div[class*="inset-y-0 right-0"]');
if (drawer.length > 0) {
  console.log($.html(drawer));
} else {
  console.log('Drawer element not found.');
}
