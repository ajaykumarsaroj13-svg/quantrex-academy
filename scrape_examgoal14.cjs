const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  await page.goto('https://room.examgoal.com/login', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

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
  
  await page.waitForTimeout(8000);
  await page.goto('https://room.examgoal.com/dashboard', { waitUntil: 'networkidle2' });
  await page.waitForTimeout(5000);

  // click "PYQ Topic wise"
  const badges = await page.$$('div.badge, div');
  for (const badge of badges) {
     const text = await page.evaluate(el => el.textContent, badge);
     if (text && text.includes('PYQ Topic wise')) {
         console.log('Found PYQ Topic wise button, clicking...');
         await badge.click();
         await page.waitForTimeout(5000);
         break;
     }
  }
  
  const currentUrl = page.url();
  console.log('URL after clicking PYQ Topic wise:', currentUrl);

  const pageHtml = await page.content();
  fs.writeFileSync('topics.html', pageHtml);
  await page.screenshot({ path: 'topics.png' });

  await browser.close();
})();
