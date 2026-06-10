import fs from 'fs';
import * as cheerio from 'cheerio';

const html2 = fs.readFileSync('examside_math_sets.html', 'utf8');
const $ = cheerio.load(html2);

console.log('Title:', $('title').text());

console.log('--- Subtopics in Sets & Relations ---');
const subtopics = [];
$('.list-group-item').each((i, el) => {
    const text = $(el).text().trim();
    const href = $(el).attr('href');
    if (href && href.includes('/past-years/jee/mathematics/sets-relations-and-functions/')) {
        console.log(`Topic ${i+1}: ${text.replace(/\s+/g, ' ')}`);
        subtopics.push({ text, href });
    }
});

if (subtopics.length === 0) {
    console.log('Trying other selectors...');
    $('a').each((i, el) => {
        const text = $(el).text().trim();
        const href = $(el).attr('href');
        if (href && href.includes('/past-years/jee/mathematics/sets-relations-and-functions/')) {
            console.log(`Link: ${text} | ${href}`);
        }
    });
}
