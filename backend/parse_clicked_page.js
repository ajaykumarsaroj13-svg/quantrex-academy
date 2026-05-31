import fs from 'fs';
import * as cheerio from 'cheerio';

const htmlPath = "C:/Users/Admin/.gemini/antigravity/scratch/quantrex-academy/backend/jee_advanced_page.html";

if (!fs.existsSync(htmlPath)) {
  console.log('jee_advanced_page.html does not exist.');
  process.exit(0);
}

const html = fs.readFileSync(htmlPath, 'utf8');
const $ = cheerio.load(html);

console.log('=== Analyzing page after clicking JEE Advanced ===');
console.log('Page Title:', $('title').text());

const bodyText = $('body').text().trim().replace(/\s+/g, ' ');
console.log('\nPage Body Snippet (first 1000 chars):');
console.log(bodyText.substring(0, 1000));

// Check if there are subject links or buttons (e.g. Physics, Chemistry, Mathematics)
console.log('\n--- Checking for subject cards or links ---');
$('a, button, div').each((i, el) => {
  const text = $(el).clone().children().remove().end().text().trim().replace(/\s+/g, ' ');
  const href = $(el).attr('href') || '';
  if (text.includes('Physics') || text.includes('Chemistry') || text.includes('Mathematics') || text.includes('Biology')) {
    if (text.length < 50) {
      console.log(`Tag: <${el.tagName}> | Class: "${$(el).attr('class') || ''}" | Text: "${text}" | Href: "${href}"`);
    }
  }
});
