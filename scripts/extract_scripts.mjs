import fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('examside_math_sets.html', 'utf8');
const $ = cheerio.load(html);

$('script').each((i, el) => {
    const text = $(el).html();
    if (text && text.includes('subtopics')) {
        console.log(`Script ${i} contains "subtopics"`);
        fs.writeFileSync(`script_data_${i}.js`, text);
    }
    if (text && text.includes('NEXT_DATA')) {
        console.log(`Script ${i} contains NEXT_DATA`);
        fs.writeFileSync(`script_next_${i}.json`, text);
    }
    if (text && text.includes('NUXT')) {
        console.log(`Script ${i} contains NUXT`);
        fs.writeFileSync(`script_nuxt_${i}.js`, text);
    }
});
console.log('Done looking for data payloads in script tags.');
