import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
  await page.setViewport({ width: 1280, height: 800 });
  
  console.log('Navigating...');
  try {
    await page.goto('https://room.examgoal.com/tests/series/tsr-19g61mnpryz1v', { waitUntil: 'domcontentloaded', timeout: 30000 });
  } catch (e) {
    console.error('Error during goto:', e.message);
  }
  
  console.log('Waiting 10 seconds for page data to load...');
  await new Promise(r => setTimeout(r, 10000));
  
  const text = await page.evaluate(() => {
    return document.body.innerText;
  });
  
  fs.writeFileSync('examgoal_text.txt', text);
  console.log('Saved to examgoal_text.txt');
  
  await browser.close();
})();
