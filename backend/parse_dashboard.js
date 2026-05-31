import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';

const dashboardPath = "C:/Users/Admin/.gemini/antigravity/scratch/scraper/dashboard.html";

if (!fs.existsSync(dashboardPath)) {
  console.log('dashboard.html does not exist.');
  process.exit(0);
}

const html = fs.readFileSync(dashboardPath, 'utf8');
const $ = cheerio.load(html);

console.log('=== Parsing dashboard.html ===');

// Print all links and their text
$('a').each((i, el) => {
  const href = $(el).attr('href') || '';
  const text = $(el).text().trim().replace(/\s+/g, ' ');
  if (href.includes('/pyq/') || href.includes('subject') || href.includes('chapter') || text.toLowerCase().includes('jee') || text.toLowerCase().includes('nda') || text.toLowerCase().includes('bitsat')) {
    console.log(`Link: "${text}" -> "${href}"`);
  }
});

// Also check for select options or script blocks containing JSON data
console.log('\n=== Checking for JSON scripts ===');
$('script').each((i, el) => {
  const content = $(el).html() || '';
  if (content.includes('__NUXT__') || content.includes('window.__') || content.includes('data')) {
    console.log(`Script ${i} length: ${content.length}`);
    if (content.includes('65f55b3f-ebcd-51b9-8d4f-ec4f7943e29a')) {
      console.log(`  -> Script ${i} contains the Math subject ID!`);
      // Let's write the first 1000 chars of the script
      fs.writeFileSync(`nuxt_data_${i}.js`, content);
      console.log(`  -> Saved nuxt_data_${i}.js`);
    }
  }
});
