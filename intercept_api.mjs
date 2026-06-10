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
    
    const apiLogs = [];
    
    page.on('response', async response => {
        const url = response.url();
        if (url.includes('api/v1')) {
            try {
                const text = await response.text();
                apiLogs.push({ url, status: response.status(), text: text.substring(0, 500) });
            } catch (e) {}
        }
    });

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
        
        console.log('Login successful. Taking screenshot...');
        await page.screenshot({ path: 'dashboard.png' });
        
        // Find links that contain "Test Series" and click them
        const links = await page.$$('a');
        let clicked = false;
        for (const link of links) {
            const text = await page.evaluate(el => el.textContent, link);
            if (text && text.toLowerCase().includes('test series')) {
                console.log('Clicking link: ' + text);
                await link.click();
                clicked = true;
                break;
            }
        }
        
        if (!clicked) {
            console.log('Could not find Test Series link. Trying elements with text "Test Series"...');
            const els = await page.$$('*');
            for (const el of els) {
                const text = await page.evaluate(e => e.textContent, el);
                if (text && text.trim() === 'Test Series') {
                    await el.click();
                    break;
                }
            }
        }

        await delay(5000);
        await page.screenshot({ path: 'test_series_clicked.png' });

        fs.writeFileSync('api_intercept.json', JSON.stringify(apiLogs, null, 2));
        console.log('Saved intercepted APIs to api_intercept.json');

    } catch (e) {
        console.error(e);
    } finally {
        await browser.close();
    }
}

run();
