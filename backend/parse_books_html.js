import fs from 'fs';
import * as cheerio from 'cheerio';

const htmlPath = "C:/Users/Admin/.gemini/antigravity/scratch/quantrex-academy/backend/page_books.html";

if (!fs.existsSync(htmlPath)) {
  console.log('page_books.html does not exist.');
  process.exit(0);
}

const html = fs.readFileSync(htmlPath, 'utf8');
const $ = cheerio.load(html);

console.log('=== Analyzing Books Cards ===');

$('div').each((i, el) => {
  const text = $(el).clone().children().remove().end().text().trim();
  if (text === 'Physics XI - Part 1') {
    // Print grandparent HTML
    const grandparent = $(el).parent().parent();
    console.log('=== Grandparent HTML of Physics XI - Part 1 ===');
    console.log($.html(grandparent));
  }
});
