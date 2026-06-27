import puppeteer from 'puppeteer';
import fs from 'fs';

async function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
    const browser = await puppeteer.launch({ 
        headless: 'new',
        args: ['--no-sandbox'] 
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

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
        await delay(3000);

        // We are logged in, let's dump local storage
        const ls = await page.evaluate(() => JSON.stringify(localStorage));
        fs.writeFileSync('examgoal_ls.json', ls);
        console.log('Dumped localstorage');

        await browser.close();
    } catch (e) {
        console.error(e);
        await browser.close();
    }
}
run();
