import puppeteer from 'puppeteer';

(async () => {
    console.log("Starting browser...");
    const browser = await puppeteer.launch({ 
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    try {
        console.log("Navigating to ExamGoal...");
        await page.goto('https://room.examgoal.com/', { waitUntil: 'networkidle2' });
        
        console.log("Taking screenshot of login page...");
        await page.screenshot({ path: 'login_page.png' });
        
        // Dump the HTML body to see what the inputs are
        const html = await page.content();
        const fs = require('fs');
        fs.writeFileSync('login_page.html', html);
        console.log("Saved login_page.html");

    } catch (error) {
        console.error("Error during Puppeteer script:", error);
    } finally {
        await browser.close();
    }
})();
