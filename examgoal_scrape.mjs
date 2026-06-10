import puppeteer from 'puppeteer';

(async () => {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({ 
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');

    try {
        console.log('Navigating to login...');
        await page.goto('https://room.examgoal.com/login', { waitUntil: 'networkidle2' });
        
        console.log('Clicking "Phone" tab...');
        const buttons = await page.$$('button');
        for (const btn of buttons) {
            const text = await page.evaluate(el => el.textContent, btn);
            if (text.trim() === 'Phone') {
                await btn.click();
                console.log('Clicked Phone tab.');
                break;
            }
        }

        await new Promise(r => setTimeout(r, 1000));

        console.log('Finding inputs...');
        const inputs = await page.$$('input');
        for (let i = 0; i < inputs.length; i++) {
            const type = await page.evaluate(el => el.type, inputs[i]);
            const placeholder = await page.evaluate(el => el.placeholder, inputs[i]);
            console.log(`Input ${i}: type=${type}, placeholder=${placeholder}`);
        }

        // We know from previous failure that type="tel" is wrong. Let's see what the types are.
        
        // Let's assume the last input is password, and the one before it is the mobile number.
        if (inputs.length >= 2) {
            await inputs[inputs.length - 2].type('7750858874');
            await inputs[inputs.length - 1].type('12345678');
            console.log('Typed credentials.');
            
            await page.screenshot({ path: 'login_typed.png' });
        }

    } catch (e) {
        console.error(e);
    } finally {
        await browser.close();
        console.log('Done.');
    }
})();
