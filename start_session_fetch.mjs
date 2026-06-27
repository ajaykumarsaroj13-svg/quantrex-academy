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
                if (url.includes('session') || url.includes('question') || url.includes('test')) {
                    fs.writeFileSync(`test_api_${Date.now()}.json`, JSON.stringify({url, json}, null, 2));
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

        // Try to start a session directly via fetch in the browser console
        console.log('Executing fetch directly...');
        const token = await page.evaluate(() => localStorage.getItem('auth.token'));
        
        const res = await page.evaluate(async (token) => {
            const testId = 'tst-19g71mnq5nfun'; // FREE test
            try {
                const req = await fetch('https://room.examgoal.com/api/v1/test/user/practice-session', {
                    method: 'POST',
                    headers: { 'Authorization': token, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: "create", exam: "jee-main", examGroup: "jee", refId: testId })
                });
                return { status: req.status, json: await req.json() };
            } catch(e) {
                return { error: e.toString() };
            }
        }, token);

        console.log('Fetch Result 1:', res);

        const res2 = await page.evaluate(async (token) => {
            const testId = 'tst-19g71mnq5nfun'; // FREE test
            try {
                const req = await fetch('https://room.examgoal.com/api/v1/test/user/test-session', {
                    method: 'POST',
                    headers: { 'Authorization': token, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: "create", exam: "jee-main", examGroup: "jee", refId: testId })
                });
                return { status: req.status, json: await req.json() };
            } catch(e) {
                return { error: e.toString() };
            }
        }, token);

        console.log('Fetch Result 2:', res2);

        fs.writeFileSync('fetch_start_result.json', JSON.stringify({res, res2}, null, 2));

        await browser.close();
    } catch (e) {
        console.error(e);
        await browser.close();
    }
}
run();
