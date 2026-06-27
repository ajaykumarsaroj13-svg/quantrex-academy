const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  await page.setRequestInterception(true);
  page.on('request', req => req.continue());
  
  const allApiData = {};
  
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('api') || url.includes('graphql') || url.includes('question') || url.includes('room.examgoal.com')) {
      const ct = response.headers()['content-type'] || '';
      if (ct.includes('application/json') || ct.includes('text/json')) {
        try {
            const text = await response.text();
            allApiData[url] = JSON.parse(text);
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
  
  await page.waitForTimeout(5000);
  
  const url = 'https://room.examgoal.com/pyq/subject/65f55b3f-ebcd-51b9-8d4f-ec4f7943e29a/chapter/6b83327c-6da3-51f7-8845-5192226d0d87';
  await page.goto(url, { waitUntil: 'networkidle2' });
  await page.waitForTimeout(5000);
  
  fs.writeFileSync('examgoal_api_data.json', JSON.stringify(allApiData, null, 2));
  console.log('Saved examgoal_api_data.json with keys:', Object.keys(allApiData));

  await browser.close();
})();
