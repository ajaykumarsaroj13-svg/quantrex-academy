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
        console.log("Navigating to ExamGoal...");
        await page.goto('https://room.examgoal.com/', { waitUntil: 'networkidle2' });
        
        // Wait for the modal or anything and click close if it exists
        try {
            await page.click('.close-button-class-here'); // we don't know the class, we will just press Escape
        } catch(e) {}
        await page.keyboard.press('Escape');
        
        console.log("Checking if logged in...");
        const html = await page.content();
        if(html.includes('Dashboard')) {
            console.log("Already logged in or no login needed for this view.");
            await page.screenshot({ path: 'dashboard.png' });
        } else {
            console.log("Looking for login button...");
            // We need to find the login button and type credentials
            // But wait, the previous screenshot showed "Dashboard" and "Choose Your Exam".
        }
        
        // Dump the html so I can analyze it to find the Sets and Relations test
        fs.writeFileSync('examgoal_home.html', html);
        console.log("Saved examgoal_home.html");

    } catch (error) {
        console.error("Error during Puppeteer script:", error);
    } finally {
        await browser.close();
    }
})();
