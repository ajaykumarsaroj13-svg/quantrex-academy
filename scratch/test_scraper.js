import fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('scratch/q2.html', 'utf8');
const $ = cheerio.load(html);

console.log("Options text:");
$('body').find('*').each((i, el) => {
  const t = $(el).text();
  if (t === 'Correct Answer') {
    console.log("Found Correct Answer label.");
    console.log("Parent HTML:", $(el).parent().html());
  }
});
