import puppeteer from 'puppeteer';
import fs from 'fs';

async function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
    const browser = await puppeteer.launch({ 
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    const page = await browser.newPage();
    
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

        const token = await page.evaluate(() => localStorage.getItem('auth.token'));
        
        const res = await page.evaluate(async (token) => {
            const testId = 'tst-19g61mnpzhlyq'; // PREMIUM test
            try {
                const req = await fetch('https://room.examgoal.com/api/v1/past-question/user/practice-session', {
                    method: 'POST',
                    headers: { 'Authorization': token, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: "create", exam: "jee-main", examGroup: "jee", refId: testId, practiceType: "test" })
                });
                return { status: req.status, json: await req.json() };
            } catch(e) {
                return { error: e.toString() };
            }
        }, token);

        console.log('Fetch Result:', res);
        fs.writeFileSync('fetch_start_result_premium.json', JSON.stringify({res}, null, 2));

        await browser.close();
    } catch (e) {
        console.error(e);
        await browser.close();
    }
}
run();
