import fs from 'fs';
import * as cheerio from 'cheerio';

const htmlPath = "C:/Users/Admin/.gemini/antigravity/scratch/quantrex-academy/backend/dashboard_content.html";

if (!fs.existsSync(htmlPath)) {
  console.log('dashboard_content.html does not exist.');
  process.exit(0);
}

const html = fs.readFileSync(htmlPath, 'utf8');
const $ = cheerio.load(html);

console.log('=== Element structure analysis ===');

// Find all elements containing text like 'JEE Main' or 'JEE Advanced' or 'NDA'
const examTexts = ['JEE Main', 'JEE Advanced', 'BITSAT', 'NDA', 'MHT CET', 'NCERT'];

examTexts.forEach(exam => {
  console.log(`\n--- Matches for "${exam}" ---`);
  $(`*:contains("${exam}")`).each((i, el) => {
    // Only print elements that don't have children containing the same text to find the leaf elements
    const text = $(el).clone().children().remove().end().text().trim();
    if (text.toLowerCase().includes(exam.toLowerCase())) {
      console.log(`Tag: <${el.tagName}> | Classes: "${$(el).attr('class') || ''}" | Text: "${text}"`);
      // Parent structure
      let parent = $(el).parent();
      console.log(`  Parent Tag: <${parent[0]?.tagName}> | Classes: "${parent.attr('class') || ''}"`);
      let grandparent = parent.parent();
      console.log(`  Grandparent Tag: <${grandparent[0]?.tagName}> | Classes: "${grandparent.attr('class') || ''}"`);
    }
  });
});
