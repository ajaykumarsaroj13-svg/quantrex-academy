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
                if (url.includes(url)) {
                    fs.writeFileSync(`test_click_${Date.now()}.json`, JSON.stringify({url, json}, null, 2));
                    console.log('Saved JSON for:', url);
                }
            } catch(e){}
        } else if (url.includes('/api/') && response.request().method() === 'POST') {
             apiCalls.push('POST: ' + url);
             try {
                const json = await response.json();
                fs.writeFileSync(`test_click_${Date.now()}.json`, JSON.stringify({url, json, post:true}, null, 2));
                console.log('Saved POST JSON for:', url);
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

        await page.goto('https://room.examgoal.com/test-series/ultimate/jee-main-2027', { waitUntil: 'networkidle2' });
        await delay(8000);
        
        const content = await page.content();
        if (content.includes('Page not found')) {
            console.log('Direct URL failed, trying to click through...');
            await page.goto('https://room.examgoal.com/', { waitUntil: 'networkidle2' });
            await delay(5000);
            
            const buttons2 = await page.$$('button');
            for (const btn of buttons2) {
                const text = await page.evaluate(el => el.textContent, btn);
                if (text.includes('I Understand')) { await btn.click(); await delay(2000); break; }
            }
            
            const divs = await page.$$('div');
            for (const div of divs) {
                const text = await page.evaluate(el => el.textContent, div);
                if (text === 'JEE Main') { await div.click(); break; }
            }
            await delay(3000);
            
            const divs2 = await page.$$('div, a');
            for (const el of divs2) {
                const text = await page.evaluate(e => e.textContent, el);
                if (text && text.includes('Test Series')) { await el.click(); break; }
            }
            await delay(4000);
            
            const divs3 = await page.$$('div, a, button');
            for (const el of divs3) {
                const text = await page.evaluate(e => e.textContent, el);
                if (text && text.includes('Ultimate Online Test Series - 2027')) { await el.click(); break; }
            }
            await delay(8000);
        }

        console.log('Now at Test Series page, clicking the first test...');
        const possibleTests = await page.$$('div, button');
        for (const el of possibleTests) {
            const text = await page.evaluate(e => e.textContent, el);
            if (text && text.includes('Start Test')) {
                console.log('Found Start Test button, clicking!');
                await el.click();
                break;
            }
        }
        await delay(5000);
        
        // Wait maybe there's a modal, look for "Continue" or "Agree" or "Start Now"
        const confirmBtns = await page.$$('button');
        for (const el of confirmBtns) {
            const text = await page.evaluate(e => e.textContent, el);
            if (text && (text.includes('Start Now') || text.includes('Confirm') || text.includes('Continue'))) {
                console.log('Found confirmation button, clicking!');
                await el.click();
                break;
            }
        }
        await delay(5000);

        fs.writeFileSync('all_api_calls_test.json', JSON.stringify(apiCalls, null, 2));
        await page.screenshot({ path: 'started_test.png' });

        await browser.close();
    } catch (e) {
        console.error(e);
        await browser.close();
    }
}
run();
