import puppeteer from 'puppeteer';
import fs from 'fs';

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({ 
        headless: 'new', // use headless: false if you want to see it visually
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    // Set user agent to bypass some basic bot checks
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');

    try {
        console.log('Navigating to login...');
        await page.goto('https://room.examgoal.com/login', { waitUntil: 'networkidle2' });
        
        console.log('Selecting Phone login...');
        const buttons = await page.$$('button');
        for (const btn of buttons) {
            const text = await page.evaluate(el => el.textContent, btn);
            if (text.trim() === 'Phone') {
                await btn.click();
                break;
            }
        }
        await delay(1000);

        console.log('Entering credentials...');
        const inputs = await page.$$('input');
        if (inputs.length >= 2) {
            await inputs[inputs.length - 2].type('7750858874');
            await inputs[inputs.length - 1].type('12345678');
        }
        
        console.log('Clicking login...');
        const loginBtns = await page.$$('button');
        for (const btn of loginBtns) {
            const text = await page.evaluate(el => el.textContent, btn);
            if (text.trim() === 'Login') {
                await btn.click();
                break;
            }
        }

        console.log('Waiting for login to complete...');
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => console.log('Navigation timeout, continuing...'));
        await delay(5000);

        // We are logged in. Now we want to intercept requests or fetch from the console.
        console.log('Checking Auth...');
        const profile = await page.evaluate(async () => {
            try {
                const res = await fetch('/api/v1/auth/profile/me');
                return await res.json();
            } catch (e) {
                return { error: e.toString() };
            }
        });
        console.log('Profile:', profile.data?.displayName || profile);

        console.log('Navigating to Test Series page...');
        await page.goto('https://room.examgoal.com/test-series/ultimate/jee-main', { waitUntil: 'networkidle2' });
        await delay(5000);

        // Try to find how the tests are loaded. Let's dump window.__NUXT__ state if it exists.
        const nuxtData = await page.evaluate(() => {
            return window.__NUXT__ ? true : false;
        });
        console.log('Has __NUXT__ data?', nuxtData);

        if (nuxtData) {
            const extracted = await page.evaluate(() => {
                // Return a snippet of nuxt state related to test series
                return JSON.stringify(window.__NUXT__);
            });
            fs.writeFileSync('nuxt_state.json', extracted);
            console.log('Saved Nuxt state to nuxt_state.json');
        }

        await browser.close();
    } catch (e) {
        console.error('Error during scraping:', e);
        await page.screenshot({ path: 'error_screenshot.png' });
        await browser.close();
    }
}

run();
