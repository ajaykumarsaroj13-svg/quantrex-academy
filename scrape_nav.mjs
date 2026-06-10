import puppeteer from 'puppeteer';
import fs from 'fs';

async function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
    const browser = await puppeteer.launch({ 
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');

    page.on('response', async (response) => {
        const url = response.url();
        if (url.includes('/api/') || url.includes('/test')) {
            console.log('Response:', response.status(), url);
        }
    });

    try {
        console.log('Logging in...');
        await page.goto('https://room.examgoal.com/login', { waitUntil: 'networkidle2' });
        
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

        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
        await delay(5000);

        console.log('Current URL after login:', page.url());

        // Now find the link to Test Series in the sidebar
        console.log('Clicking Test Series in sidebar...');
        const links = await page.$$('a');
        let clicked = false;
        for (const link of links) {
            const text = await page.evaluate(el => el.textContent, link);
            if (text && text.toLowerCase().includes('test series')) {
                const href = await page.evaluate(el => el.getAttribute('href'), link);
                console.log('Found Test Series link:', href);
                await link.click();
                clicked = true;
                break;
            }
        }

        if (clicked) {
            await delay(5000);
            console.log('Current URL after clicking Test Series:', page.url());
            fs.writeFileSync('examgoal_test_series.html', await page.content());
        }

        await browser.close();
    } catch (e) {
        console.error(e);
        await browser.close();
    }
}
run();
