import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    
    console.log('Going to URL...');
    await page.goto('https://questions.examside.com/past-years/jee/mathematics', { waitUntil: 'networkidle2' });
    
    const html = await page.content();
    fs.writeFileSync('examside_math.html', html);
    
    await page.goto('https://questions.examside.com/past-years/jee/mathematics/sets-relations-and-functions', { waitUntil: 'networkidle2' });
    const html2 = await page.content();
    fs.writeFileSync('examside_math_sets.html', html2);

    console.log('Done!');
    await browser.close();
})();
