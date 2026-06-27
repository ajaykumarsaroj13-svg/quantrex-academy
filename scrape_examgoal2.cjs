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

  console.log('Logging in...');
  await page.type('input[name="email"]', '7750858874');
  await page.type('input[name="password"]', '12345678');
  await page.keyboard.press('Enter');

  console.log('Waiting for navigation after login...');
  await page.waitForNavigation({ waitUntil: 'networkidle2' });

  console.log('Logged in successfully. Extracting links to find Binomial Theorem...');
  
  // We need to navigate to JEE Main chapterwise. Let's dump links
  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a')).map(a => ({ text: a.innerText, href: a.href }));
  });

  fs.writeFileSync('links_after_login.json', JSON.stringify(links, null, 2));
  console.log('Saved links_after_login.json');

  await browser.close();
})();
