import puppeteer from 'puppeteer';

(async () => {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    
    console.log('Navigating to Sets & Relations...');
    await page.goto('https://questions.examside.com/past-years/jee/mathematics/sets-relations-and-functions', { waitUntil: 'networkidle2' });
    
    await new Promise(r => setTimeout(r, 5000));
    await page.screenshot({ path: 'examside_test.png' });
    
    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log('Body Text Snippet:', bodyText.substring(0, 500));

    await browser.close();
})();
