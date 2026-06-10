import puppeteer from 'puppeteer';

async function run() {
    const browser = await puppeteer.launch({ 
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');

    try {
        console.log('Going to examgoal.com...');
        await page.goto('https://examgoal.com', { waitUntil: 'networkidle2' });
        await page.screenshot({ path: 'examgoal_home.png' });
        
        const loginBtn = await page.$('a[href*="login"]');
        if (loginBtn) {
            const href = await page.evaluate(el => el.href, loginBtn);
            console.log('Login URL is:', href);
        } else {
            console.log('No login button found.');
        }

        await browser.close();
    } catch (e) {
        console.error(e);
        await browser.close();
    }
}
run();
