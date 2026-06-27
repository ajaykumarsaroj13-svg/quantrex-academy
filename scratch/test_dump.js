import fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('scratch/q2_puppeteer.html', 'utf8');
const $ = cheerio.load(html);

console.log("BODY TEXT:");
console.log($('body').text().replace(/\s+/g, ' ').substring(0, 1000));
