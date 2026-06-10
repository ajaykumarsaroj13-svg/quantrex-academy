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

        await page.goto('https://room.examgoal.com/', { waitUntil: 'networkidle2' });
        await delay(5000);

        // Fetch using page.evaluate so it includes all cookies and tokens automatically!
        const token = await page.evaluate(() => {
            return localStorage.getItem('auth.token'); // examgoal might store it here
        });

        const data = await page.evaluate(async () => {
            let res = [];
            for (let i = 0; i < 5; i++) {
                try {
                    const req = await fetch(`https://room.examgoal.com/api/v1/test/test-id-series/tsr-19g61mnpryz1v?section=${i}`, {
                        headers: {
                            'Authorization': localStorage.getItem('auth.token') || ''
                        }
                    });
                    const json = await req.json();
                    res.push({ section: i, data: json });
                } catch(e) {
                    res.push({ section: i, error: e.toString() });
                }
            }
            return res;
        });

        fs.writeFileSync('ultimate_tests.json', JSON.stringify(data, null, 2));
        console.log('Saved ultimate_tests.json');

        await browser.close();
    } catch (e) {
        console.error(e);
        await browser.close();
    }
}
run();
