import puppeteer from 'puppeteer';

async function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
    const browser = await puppeteer.launch({ 
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800'] 
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');

    try {
        console.log('Logging in...');
        await page.goto('https://room.examgoal.com/login', { waitUntil: 'networkidle2' });
        await delay(2000);
        
        const buttons = await page.$$('button');
        for (const btn of buttons) {
            const text = await page.evaluate(el => el.textContent, btn);
            if (text.trim() === 'Phone') { await btn.click(); break; }
        }
        await delay(1000);

        const inputs = await page.$$('input');
        if (inputs.length >= 2) {
            await inputs[inputs.length - 2].type('7750858874');
            await inputs[inputs.length - 1].type('12345678');
        }
        
        const loginBtns = await page.$$('button');
        for (const btn of loginBtns) {
            const text = await page.evaluate(el => el.textContent, btn);
            if (text.trim() === 'Login') { await btn.click(); break; }
        }

        console.log('Waiting for login...');
        await delay(8000); // Wait enough time for dashboard to load

        console.log('Current URL:', page.url());
        await page.screenshot({ path: 'dashboard.png' });

        // Let's navigate directly to test-series
        console.log('Going to /test-series');
        await page.goto('https://room.examgoal.com/test-series', { waitUntil: 'networkidle2' });
        await delay(5000);
        await page.screenshot({ path: 'test_series_page.png' });
        
        // Find links
        const links = await page.$$('a');
        for(let a of links) {
            const txt = await page.evaluate(el => el.textContent, a);
            const href = await page.evaluate(el => el.href, a);
            if (txt && href && href.includes('ultimate')) {
                console.log('Found ultimate link:', txt.trim(), href);
            }
        }

        await browser.close();
    } catch (e) {
        console.error(e);
        await browser.close();
    }
}
run();
