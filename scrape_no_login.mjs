import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  console.log('Navigating to test series...');
  // The URL from the screenshot is room.examgoal.com, wait let's look at the screenshot URL again.
  // The user's screenshot has URL: room.examgoal.com/tests/series/tsr-19g61mnpryz1v
  await page.goto('https://room.examgoal.com/tests/series/tsr-19g61mnpryz1v', { waitUntil: 'networkidle2' });
  
  await new Promise(r => setTimeout(r, 5000));
  
  const html = await page.content();
  fs.writeFileSync('examgoal_no_login.html', html);
  
  const text = await page.evaluate(() => document.body.innerText);
  fs.writeFileSync('examgoal_no_login.txt', text);
  
  await browser.close();
})();
