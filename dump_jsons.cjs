const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  await page.setRequestInterception(true);
  page.on('request', req => req.continue());
  
  let allData = {};
  
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('api') && !url.includes('firebase')) {
      const ct = response.headers()['content-type'] || '';
      if (ct.includes('application/json')) {
        try {
            const data = await response.json();
            allData[url] = data;
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
  
  console.log('Navigating to subject page...');
  await page.goto('https://room.examgoal.com/pyq/subject/65f55b3f-ebcd-51b9-8d4f-ec4f7943e29a', { waitUntil: 'networkidle2' });
  await page.waitForTimeout(4000);
  
  fs.writeFileSync('all_intercepted_data.json', JSON.stringify(allData, null, 2));
  console.log('Saved intercepted data.');
  await browser.close();
})();
