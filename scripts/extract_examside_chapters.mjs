import fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('examside_math.html', 'utf8');
const $ = cheerio.load(html);

console.log('Links found in Examside Math:');
$('a').each((i, el) => {
    const text = $(el).text().trim();
    const href = $(el).attr('href');
    if (href && href.includes('/past-years/jee/mathematics/')) {
        console.log(`- ${text} | ${href}`);
    }
});
