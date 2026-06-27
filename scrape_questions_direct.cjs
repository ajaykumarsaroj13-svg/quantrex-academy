const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const fs = require('fs');
const path = require('path');

(async () => {
  const chaptersData = require('./extracted_all_math_chapters.json');
  console.log('Starting Scraper for', chaptersData.length, 'chapters...');
  
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  await page.setRequestInterception(true);
  page.on('request', req => req.continue());
  
  const chapterResponses = {};
  
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('/past-question/question/meta/')) {
        const ct = response.headers()['content-type'] || '';
        if (ct.includes('application/json')) {
          try {
              const data = await response.json();
              const chapterId = url.split('/').pop().split('?')[0];
              chapterResponses[chapterId] = data;
              console.log('Intercepted data for chapter:', chapterId);
          } catch(e) {}
        }
    }
  });
  
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('https://room.examgoal.com/login', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  
  const tabs = await page.$$('button[role="tab"]');
  for (const tab of tabs) {
    const text = await page.evaluate(el => el.textContent, tab);
    if (text.includes('Phone')) {
      await tab.click();
      break;
    }
  }
  
  await page.waitForTimeout(1000);
  const phoneInput = await page.$('input[type="number"][name="phone"]');
  if (phoneInput) await phoneInput.type('7750858874');
  const passInput = await page.$('input[type="password"]');
  if (passInput) await passInput.type('12345678');
  const submitBtn = await page.$('button[type="submit"]');
  if (submitBtn) await submitBtn.click();
  
  await page.waitForTimeout(4000);
  
  const dir = path.join(__dirname, 'public', 'data', 'questions', 'raw_math');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  
  for (const ch of chaptersData) {
    console.log('Navigating to chapter:', ch.name);
    try {
        const chapUrl = `https://room.examgoal.com/pyq/subject/65f55b3f-ebcd-51b9-8d4f-ec4f7943e29a/chapter/${ch.id}`;
        await page.goto(chapUrl, { waitUntil: 'networkidle2' });
        await page.waitForTimeout(3000);
        
        if (chapterResponses[ch.id]) {
            const filePath = path.join(dir, `raw_math_${ch.id}.json`);
            fs.writeFileSync(filePath, JSON.stringify(chapterResponses[ch.id], null, 2));
            console.log('Saved data for', ch.name);
        } else {
            console.log('Failed to capture JSON for', ch.name);
        }
    } catch(e) {
        console.log('Error navigating to ' + ch.name, e);
    }
  }
  console.log('All chapters scraped successfully!');
  await browser.close();
})();
