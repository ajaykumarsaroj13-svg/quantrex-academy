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
        if (url.includes('/api/') && response.request().method() === 'GET') {
            apiCalls.push(url);
            try {
                const json = await response.json();
                if (url.includes('tests') || url.includes('ultimate') || url.includes('series')) {
                    fs.writeFileSync(`intercepted_${Date.now()}.json`, JSON.stringify(json, null, 2));
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

        console.log('Waiting for login redirect to dashboard...');
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
        await delay(5000);

        console.log('Going to home room...');
        await page.goto('https://room.examgoal.com/', { waitUntil: 'networkidle2' });
        await delay(5000);

        console.log('Clicking I Understand modal...');
        const buttons2 = await page.$$('button');
        for (const btn of buttons2) {
            const text = await page.evaluate(el => el.textContent, btn);
            if (text.includes('I Understand')) {
                await btn.click();
                console.log('Clicked I Understand!');
                break;
            }
        }
        await delay(2000);

        console.log('Clicking JEE Main div...');
        const divs = await page.$$('div');
        for (const div of divs) {
            const text = await page.evaluate(el => el.textContent, div);
            if (text === 'JEE Main') {
                await div.click();
                console.log('Clicked JEE Main!');
                break;
            }
        }
        await delay(5000);

        console.log('Looking for Test Series div...');
        const divs2 = await page.$$('div, a');
        for (const el of divs2) {
            const text = await page.evaluate(e => e.textContent, el);
            if (text && text.includes('Test Series')) {
                await el.click();
                console.log('Clicked Test Series!');
                break;
            }
        }
        await delay(8000);

        console.log('Looking for Ultimate div...');
        const divs3 = await page.$$('div, a, button');
        for (const el of divs3) {
            const text = await page.evaluate(e => e.textContent, el);
            if (text && text.includes('Ultimate Online Test Series - 2027')) {
                await el.click();
                console.log('Clicked Ultimate Test Series!');
                break;
            }
        }
        await delay(8000);

        fs.writeFileSync('all_api_calls.json', JSON.stringify(apiCalls, null, 2));
        await page.screenshot({ path: 'final_step.png' });

        await browser.close();
    } catch (e) {
        console.error(e);
        await browser.close();
    }
}
run();
