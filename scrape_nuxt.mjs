import puppeteer from 'puppeteer';
import fs from 'fs';

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
    const browser = await puppeteer.launch({ 
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    try {
        await page.goto('https://room.examgoal.com/login', { waitUntil: 'networkidle2' });
        
        const buttons = await page.$$('button');
        for (const btn of buttons) {
            const text = await page.evaluate(el => el.textContent, btn);
            if (text.trim() === 'Phone') { await btn.click(); break; }
        }

        await delay(1000);

        const inputs = await page.$$('input');
        if (inputs.length >= 3) {
            await inputs[1].type('7750858874'); 
            await inputs[2].type('12345678');   
        } else if (inputs.length >= 2) {
            await inputs[inputs.length - 2].type('7750858874');
            await inputs[inputs.length - 1].type('12345678');
        }
        
        const loginBtns = await page.$$('button');
        for (const btn of loginBtns) {
            const text = await page.evaluate(el => el.textContent, btn);
            if (text.trim() === 'Login') { await btn.click(); break; }
        }

        await delay(5000);
        console.log('Navigating to packages...');
        await page.goto('https://room.examgoal.com/test-series', { waitUntil: 'networkidle2' });
        await delay(3000);

        const nuxtData = await page.evaluate(() => {
            return window.__NUXT__;
        });

        fs.writeFileSync('nuxt_packages.json', JSON.stringify(nuxtData, null, 2));
        console.log('Saved window.__NUXT__ to nuxt_packages.json');

    } catch (e) {
        console.error(e);
    } finally {
        await browser.close();
    }
}

run();
