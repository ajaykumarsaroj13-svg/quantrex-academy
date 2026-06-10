import puppeteer from 'puppeteer';

async function run() {
    const browser = await puppeteer.launch({ 
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');

    page.on('response', async response => {
        const url = response.url();
        if (url.includes('api/v1') && requestIsInteresting(url)) {
            try {
                const text = await response.text();
                console.log(`\n--- Response from ${url} ---`);
                console.log(text.substring(0, 500));
            } catch (e) {}
        }
    });

    function requestIsInteresting(url) {
        return url.includes('login') || url.includes('token') || url.includes('auth');
    }

    try {
        await page.goto('https://room.examgoal.com/login', { waitUntil: 'networkidle2' });
        
        const buttons = await page.$$('button');
        for (const btn of buttons) {
            const text = await page.evaluate(el => el.textContent, btn);
            if (text.trim() === 'Phone') { await btn.click(); break; }
        }

        await new Promise(r => setTimeout(r, 1000));
        
        const inputs = await page.$$('input');
        if (inputs.length >= 3) {
            await inputs[1].type('7750858874');
            await inputs[2].type('12345678');
        }

        const loginBtns = await page.$$('button');
        for (const btn of loginBtns) {
            const text = await page.evaluate(el => el.textContent, btn);
            if (text.trim() === 'Login') { await btn.click(); break; }
        }

        console.log('Clicked login, waiting for network responses...');
        await new Promise(r => setTimeout(r, 5000));

    } finally {
        await browser.close();
    }
}
run();
