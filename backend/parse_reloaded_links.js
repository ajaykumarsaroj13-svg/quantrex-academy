import fs from 'fs';
import * as cheerio from 'cheerio';

const htmlPath = "C:/Users/Admin/.gemini/antigravity/scratch/quantrex-academy/backend/dashboard_reloaded_adv.html";

if (!fs.existsSync(htmlPath)) {
  console.log('dashboard_reloaded_adv.html does not exist.');
  process.exit(0);
}

const html = fs.readFileSync(htmlPath, 'utf8');
const $ = cheerio.load(html);

console.log('=== All Anchor Links on Dashboard ===');
$('a').each((i, el) => {
  const text = $(el).text().trim().replace(/\s+/g, ' ');
  const href = $(el).attr('href') || '';
  console.log(`Link ${i}: Text: "${text}" | Href: "${href}"`);
});

console.log('\n=== Sidebar Elements structure ===');
// Search for element with text "Previous Year Questions"
$(':contains("Previous Year Questions")').each((i, el) => {
  // Leaf elements
  const text = $(el).clone().children().remove().end().text().trim();
  if (text === 'Previous Year Questions') {
    console.log(`Tag: <${el.tagName}> | Class: "${$(el).attr('class') || ''}"`);
    let parent = $(el).parent();
    console.log(`  Parent Tag: <${parent[0]?.tagName}> | Class: "${parent.attr('class') || ''}" | Href: "${parent.attr('href') || ''}"`);
    let grandparent = parent.parent();
    console.log(`  Grandparent Tag: <${grandparent[0]?.tagName}> | Class: "${grandparent.attr('class') || ''}" | Href: "${grandparent.attr('href') || ''}"`);
  }
});
