const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  console.log('Navigating to login...');
  await page.goto('https://room.examgoal.com/login', { waitUntil: 'domcontentloaded' });

  // wait a bit for react to render
  await page.waitForTimeout(3000);

  console.log('Finding Phone tab...');
  const tabs = await page.$$('button[role="tab"]');
  for (const tab of tabs) {
    const text = await page.evaluate(el => el.textContent, tab);
    if (text.includes('Phone')) {
      await tab.click();
      console.log('Clicked Phone tab.');
      break;
    }
  }

  await page.waitForTimeout(1000);

  console.log('Logging in...');
  const phoneInput = await page.$('input[type="number"][name="phone"]');
  if (phoneInput) await phoneInput.type('7750858874');

  const passInput = await page.$('input[type="password"]');
  if (passInput) await passInput.type('12345678');

  const submitBtn = await page.$('button[type="submit"]');
  if (submitBtn) {
    console.log('Clicking submit...');
    await submitBtn.click();
  } else {
    console.log('Submit button not found');
  }

  console.log('Waiting 8 seconds for login to process...');
  await page.waitForTimeout(8000);
  
  const currentUrl = page.url();
  console.log('Current URL after login:', currentUrl);

  if (currentUrl.includes('login')) {
      console.log('Still on login page? Navigating to root explicitly...');
      await page.goto('https://room.examgoal.com/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(5000);
  }

  console.log('Final URL:', page.url());

  const links = await page.evaluate(() => Array.from(document.querySelectorAll('a')).map(a => ({ text: a.innerText, href: a.href })));
  fs.writeFileSync('links_after_login4.json', JSON.stringify(links, null, 2));

  await browser.close();
})();
