import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
  console.log("Launching Puppeteer...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  try {
    console.log("Navigating to room.examgoal.com/dashboard...");
    const response = await page.goto('https://room.examgoal.com/dashboard', { waitUntil: 'networkidle2', timeout: 60000 });
    
    console.log("Response Status:", response ? response.status() : 'null');
    console.log("Current URL after load:", page.url());
    
    const body = await page.evaluate(() => document.body.innerText);
    console.log("Body text preview:");
    console.log(body.substring(0, 1000));
    
    fs.writeFileSync('examgoal_initial_page.html', await page.content());
    
  } catch(e) {
    console.error("Error:", e.message);
  } finally {
    await browser.close();
  }
})();
