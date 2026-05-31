import fs from 'fs';
import * as cheerio from 'cheerio';

const htmlPath = "C:/Users/Admin/.gemini/antigravity/scratch/quantrex-academy/backend/jee_advanced_page.html";

if (!fs.existsSync(htmlPath)) {
  console.log('jee_advanced_page.html does not exist.');
  process.exit(0);
}

const html = fs.readFileSync(htmlPath, 'utf8');
const $ = cheerio.load(html);

// Find the div containing "JEE Advanced"
$('div').each((i, el) => {
  const text = $(el).clone().children().remove().end().text().trim();
  if (text === 'JEE Advanced') {
    // Print grandparent's HTML
    const grandparent = $(el).parent().parent();
    console.log('=== Grandparent HTML ===');
    console.log($.html(grandparent));
  }
});
