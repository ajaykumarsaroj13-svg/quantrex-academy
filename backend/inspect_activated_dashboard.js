import fs from 'fs';
import * as cheerio from 'cheerio';

const htmlPath = "C:/Users/Admin/.gemini/antigravity/scratch/quantrex-academy/backend/after_dom_click_adv.html";

if (!fs.existsSync(htmlPath)) {
  console.log('after_dom_click_adv.html does not exist.');
  process.exit(0);
}

const html = fs.readFileSync(htmlPath, 'utf8');
const $ = cheerio.load(html);

console.log('=== Analyzing dashboard after activation ===');
// Search for JEE Advanced text and see its surroundings
$('div').each((i, el) => {
  const text = $(el).clone().children().remove().end().text().trim();
  if (text === 'JEE Advanced') {
    const parent = $(el).parent();
    console.log(`\n- Parent of JEE Advanced: Tag <${parent[0]?.tagName}> | Classes: "${parent.attr('class') || ''}"`);
    console.log(`  Content: "${parent.text().trim().replace(/\s+/g, ' ')}"`);
    
    const grandparent = parent.parent();
    console.log(`- Grandparent: Tag <${grandparent[0]?.tagName}> | Classes: "${grandparent.attr('class') || ''}"`);
    console.log(`  Content: "${grandparent.text().trim().replace(/\s+/g, ' ')}"`);
  }
});
