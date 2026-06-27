const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  console.log('Navigating to login...');
  await page.goto('https://room.examgoal.com/login', { waitUntil: 'networkidle2' });

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

  await page.waitForTimeout(1000); // wait for tab to switch

  console.log('Logging in...');
  // The phone input might have name="phone" or type="tel"
  const phoneInputs = await page.$$('input');
  for (const inp of phoneInputs) {
    const type = await page.evaluate(el => el.type, inp);
    const name = await page.evaluate(el => el.name, inp);
    if (type === 'tel' || name === 'phone' || name === 'mobile') {
      await inp.type('7750858874');
      console.log('Entered phone number.');
      break;
    }
  }

  await page.type('input[type="password"]', '12345678');
  await page.keyboard.press('Enter');

  console.log('Waiting for navigation...');
  try {
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
    console.log('Logged in successfully!');
  } catch (err) {
    console.log('Navigation timeout. Taking screenshot...');
    await page.screenshot({ path: 'login_error2.png' });
    const html = await page.content();
    fs.writeFileSync('login_error2.html', html);
  }

  const links = await page.evaluate(() => Array.from(document.querySelectorAll('a')).map(a => a.href));
  fs.writeFileSync('links_after_login2.json', JSON.stringify(links, null, 2));

  await browser.close();
})();
