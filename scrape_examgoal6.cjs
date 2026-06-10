const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  console.log('Navigating to login...');
  await page.goto('https://room.examgoal.com/login', { waitUntil: 'networkidle0' });

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
  // Type into phone input specifically avoiding hidden inputs
  const phoneInput = await page.$('input[type="number"][name="phone"]');
  if (phoneInput) {
    await phoneInput.type('7750858874');
    console.log('Entered phone number.');
  } else {
    console.log('Phone input not found!');
  }

  const passInput = await page.$('input[type="password"]');
  if (passInput) {
    await passInput.type('12345678');
    console.log('Entered password.');
  }

  const submitBtn = await page.$('button[type="submit"]');
  if (submitBtn) {
    await submitBtn.click();
    console.log('Clicked submit button.');
  }

  console.log('Waiting for navigation...');
  try {
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
    console.log('Logged in successfully!');
  } catch (err) {
    console.log('Navigation timeout. Taking screenshot...');
    await page.screenshot({ path: 'login_error3.png' });
    const html = await page.content();
    fs.writeFileSync('login_error3.html', html);
  }

  console.log('Current URL:', page.url());
  const links = await page.evaluate(() => Array.from(document.querySelectorAll('a')).map(a => ({ text: a.innerText, href: a.href })));
  fs.writeFileSync('links_after_login3.json', JSON.stringify(links, null, 2));

  // Let's navigate to JEE Main -> Chapter wise if we can find it
  // Usually the dashboard has a list of exams.

  await browser.close();
})();
