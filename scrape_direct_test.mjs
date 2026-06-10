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
    
    let apiCalls = [];
    page.on('response', async (response) => {
        const url = response.url();
        if (url.includes('/api/')) {
            try {
                const json = await response.json();
                apiCalls.push({ url, method: response.request().method(), status: response.status() });
                if (url.includes('session') || url.includes('question') || url.includes('test')) {
                    fs.writeFileSync(`test_direct_${Date.now()}.json`, JSON.stringify({url, json}, null, 2));
                    console.log('Saved JSON for:', url);
                }
            } catch(e){}
        }
    });

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

        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
        await delay(5000);

        const testId = 'tst-19g61mnpzhlyq';
        const urlsToTry = [
            `https://room.examgoal.com/test-series/test/${testId}`,
            `https://room.examgoal.com/test/${testId}`,
            `https://room.examgoal.com/test-series/ultimate/jee-main-2027/${testId}`
        ];

        for (const url of urlsToTry) {
            console.log('Trying URL:', url);
            await page.goto(url, { waitUntil: 'networkidle2' });
            await delay(5000);
            const content = await page.content();
            if (!content.includes('Page not found')) {
                console.log('Found valid URL!');
                await page.screenshot({ path: `test_found_${Date.now()}.png` });
                fs.writeFileSync('all_direct_api.json', JSON.stringify(apiCalls, null, 2));
                await browser.close();
                return;
            }
        }

        console.log('None of the direct URLs worked.');
        fs.writeFileSync('all_direct_api.json', JSON.stringify(apiCalls, null, 2));
        await browser.close();
    } catch (e) {
        console.error(e);
        await browser.close();
    }
}
run();
