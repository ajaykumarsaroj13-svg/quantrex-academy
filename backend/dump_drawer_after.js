import fs from 'fs';
import * as cheerio from 'cheerio';

const htmlPath = "C:/Users/Admin/.gemini/antigravity/scratch/quantrex-academy/backend/after_add_adv.html";

if (!fs.existsSync(htmlPath)) {
  console.log('after_add_adv.html does not exist.');
  process.exit(0);
}

const html = fs.readFileSync(htmlPath, 'utf8');
const $ = cheerio.load(html);

$('div.exam-card').each((i, el) => {
  const text = $(el).text().trim().replace(/\s+/g, ' ');
  if (text.includes('JEE Advanced')) {
    console.log('=== JEE Advanced Card HTML after Click ===');
    console.log($.html(el));
  }
});
