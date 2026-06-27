import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
    console.log("Starting browser...");
    const browser = await puppeteer.launch({ 
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({width: 1280, height: 800});

    let interceptedData = {};

    page.on('response', async (response) => {
        const url = response.url();
        if (url.includes('/api/v1/')) {
            try {
                const contentType = response.headers()['content-type'];
                if (contentType && contentType.includes('application/json')) {
                    const data = await response.json();
                    const endpoint = url.split('/api/v1/')[1].split('?')[0];
                    if (!interceptedData[endpoint]) interceptedData[endpoint] = [];
                    interceptedData[endpoint].push(data);
                    console.log(`Captured data from: ${endpoint}`);
                }
            } catch (e) { }
        }
    });

    console.log('Navigating to ExamGOAL login...');
    await page.goto('https://room.examgoal.com/auth/login', {waitUntil: 'networkidle2'});

    // Wait for the login form to load
    await page.waitForSelector('input');
    
    // Switch to Phone tab
    console.log('Switching to Phone tab...');
    const tabs = await page.$$('button');
    for (let tab of tabs) {
        const text = await page.evaluate(el => el.textContent, tab);
        if (text && text.includes('Phone')) {
            await tab.click();
            console.log('Clicked Phone tab');
            break;
        }
    }
    
    await new Promise(r => setTimeout(r, 1000));
    
    // In ExamGoal phone login, there's a country code input and a phone number input.
    // Let's type in the inputs
    const inputs = await page.$$('input');
    console.log('Found inputs:', inputs.length);
    
    // Usually input[0] is country code if it's visible, input[1] is phone, input[2] is password
    // Let's just try to type in the inputs that look like phone and password
    try {
        if(inputs.length >= 3) {
            await inputs[1].type('7750858874');
            await inputs[2].type('12345678');
            await page.keyboard.press('Enter');
            console.log('Pressed enter, waiting for login...');
        } else {
            console.log('Not enough inputs found!');
        }
    } catch(e) {
        console.log("Error typing credentials:", e);
    }
    
    await new Promise(r => setTimeout(r, 5000));
    console.log("URL after login:", page.url());
    await page.screenshot({path: 'step2_after_login.png'});
    
    // Save cookies for future use
    const cookies = await page.cookies();
    fs.writeFileSync('examgoal_cookies_new.json', JSON.stringify(cookies, null, 2));

    console.log('Navigating to JEE Advanced portal...');
    await page.goto('https://room.examgoal.com/portal/jee-advanced/mathematics', {waitUntil: 'networkidle2'});
    await new Promise(r => setTimeout(r, 5000));
    await page.screenshot({path: 'step3_dashboard.png'});
    
    console.log('Looking for Quadratic Equations chapter...');
    const chapterLinks = await page.$$('a');
    let clicked = false;
    for (let link of chapterLinks) {
        const text = await page.evaluate(el => el.textContent, link);
        if (text && text.toLowerCase().includes('quadratic equation')) {
            await link.click();
            console.log('Clicked Quadratic Equations chapter');
            clicked = true;
            break;
        }
    }
    
    if (!clicked) {
        console.log('Could not find Quadratic Equations chapter link. Clicking the first chapter card...');
        const cards = await page.$$('.cursor-pointer');
        for (let card of cards) {
            const text = await page.evaluate(el => el.textContent, card);
            if (text && text.toLowerCase().includes('quadratic equation')) {
                await card.click();
                console.log('Clicked Quadratic Equations card');
                clicked = true;
                break;
            }
        }
    }
    
    // Wait for the questions to load
    await new Promise(r => setTimeout(r, 10000));
    await page.screenshot({path: 'step4_chapter.png'});

    console.log("Saving intercepted data to intercepted_adv_math.json...");
    fs.writeFileSync('intercepted_adv_math.json', JSON.stringify(interceptedData, null, 2));

    await browser.close();
    console.log("Browser closed. Scraping done.");
})();
