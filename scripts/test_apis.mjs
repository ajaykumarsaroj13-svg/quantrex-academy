import puppeteer from 'puppeteer';

(async () => {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    
    page.on('response', async (res) => {
        const url = res.url();
        const type = res.request().resourceType();
        if (type === 'xhr' || type === 'fetch') {
            console.log(`[API CALL] ${url}`);
        }
    });

    console.log('Navigating to questions.examside.com/past-years/jee/mathematics/sets-relations-and-functions ...');
    await page.goto('https://questions.examside.com/past-years/jee/mathematics/sets-relations-and-functions', { waitUntil: 'networkidle2' });
    
    await new Promise(r => setTimeout(r, 3000));
    await browser.close();
})();
