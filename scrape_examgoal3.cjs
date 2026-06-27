const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  console.log('Navigating to login...');
  await page.goto('https://room.examgoal.com/login', { waitUntil: 'networkidle2' });

  console.log('Logging in...');
  await page.type('input[name="email"]', '7750858874');
  await page.type('input[name="password"]', '12345678');
  await page.keyboard.press('Enter');

  console.log('Waiting 5 seconds...');
  await page.waitForTimeout(5000);

  console.log('Taking screenshot...');
  await page.screenshot({ path: 'login_error.png' });

  console.log('Done.');
  await browser.close();
})();
