import puppeteer from 'puppeteer';
import fs from 'fs';
import * as cheerio from 'cheerio'; // It might be installed, if not we will use regex

async function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
    const browser = await puppeteer.launch({ 
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    try {
        console.log('Logging in...');
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

        console.log('Going to /test-series...');
        await page.goto('https://room.examgoal.com/test-series', { waitUntil: 'networkidle2' });
        await delay(5000);

        const html = await page.content();
        fs.writeFileSync('test_series.html', html);
        console.log('Saved test_series.html');

        // Extract all links
        const links = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('a')).map(a => ({ text: a.textContent.trim(), href: a.href }));
        });
        fs.writeFileSync('test_series_links.json', JSON.stringify(links, null, 2));
        console.log('Saved links');

        await browser.close();
    } catch (e) {
        console.error(e);
        await browser.close();
    }
}
run();
