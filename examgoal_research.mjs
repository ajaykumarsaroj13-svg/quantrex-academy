import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({ 
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    const page = await browser.newPage();
    
    // Set a standard user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');

    let bearerToken = null;
    let userId = null;

    // Intercept requests to get the bearer token
    page.on('request', request => {
        const headers = request.headers();
        if (headers['authorization'] && headers['authorization'].startsWith('Bearer ')) {
            bearerToken = headers['authorization'];
        }
    });

    const responses = [];
    page.on('response', async response => {
        const url = response.url();
        if (url.includes('api/v1')) {
            try {
                // If it's a login response, we can grab it
                if (url.includes('auth/login')) {
                    const data = await response.json();
                    fs.writeFileSync('login_response.json', JSON.stringify(data, null, 2));
                    console.log('Got login response!');
                }
            } catch (e) {}
        }
    });

    try {
        console.log('Navigating to login...');
        await page.goto('https://room.examgoal.com/login', { waitUntil: 'networkidle2' });
        
        // Take initial screenshot
        await page.screenshot({ path: 'step1_login.png' });

        // Wait for the login form to be available
        // Usually, there's an input for email/mobile
        // The user said: "website mein do options hain, email se ya mobile se"
        // Let's dump the HTML so we can see the exact selectors
        const html = await page.content();
        fs.writeFileSync('examgoal_login.html', html);
        console.log('Saved examgoal_login.html for selector analysis.');
        
        // In most Firebase apps, there might be specific buttons to switch to mobile
        // I will take a screenshot and stop here so I can analyze the HTML structure to login.
        
    } catch (e) {
        console.error(e);
    } finally {
        await browser.close();
        console.log('Browser closed.');
    }
})();
