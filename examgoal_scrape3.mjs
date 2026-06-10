import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
    console.log("Starting browser...");
    const browser = await puppeteer.launch({ 
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    try {
        console.log("Navigating to ExamGoal login...");
        await page.goto('https://room.examgoal.com/login', { waitUntil: 'networkidle2' });
        
        await new Promise(r => setTimeout(r, 2000));
        
        console.log("Taking screenshot of login page...");
        await page.screenshot({ path: 'login_page2.png' });
        
        const html = await page.content();
        fs.writeFileSync('login_page2.html', html);
        console.log("Saved login_page2.html");

    } catch (error) {
        console.error("Error during Puppeteer script:", error);
    } finally {
        await browser.close();
    }
})();
