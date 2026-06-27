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

    let interceptedData = {};

    page.on('response', async (response) => {
        const url = response.url();
        if (url.includes('/api/v1/') && response.request().method() === 'GET') {
            try {
                const json = await response.json();
                interceptedData[url] = json;
                console.log('Intercepted:', url);
            } catch (e) {
                // Ignore non-json
            }
        }
    });

    try {
        console.log('Logging in at accounts.examgoal.com/login...');
        await page.goto('https://accounts.examgoal.com/login', { waitUntil: 'networkidle2' });
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

        console.log('Waiting for login redirect...');
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
        await delay(5000);

        console.log('Going to test series dashboard...');
        await page.goto('https://room.examgoal.com/test-series', { waitUntil: 'networkidle2' });
        await delay(5000);

        console.log('Saving intercepted data...');
        fs.writeFileSync('examgoal_responses_new.json', JSON.stringify(interceptedData, null, 2));

        await browser.close();
    } catch (e) {
        console.error(e);
        await browser.close();
    }
}
run();
