const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1280, height: 800 });
  
  console.log('Navigating...');
  await page.goto('https://room.examgoal.com/tests/series/tsr-19g61mnpryz1v', { waitUntil: 'networkidle2' });
  
  console.log('Waiting 8 seconds for page data to load...');
  await new Promise(r => setTimeout(r, 8000));
  
  const text = await page.evaluate(() => {
    return document.body.innerText;
  });
  
  fs.writeFileSync('examgoal_text.txt', text);
  console.log('Saved to examgoal_text.txt');
  
  await browser.close();
})();
