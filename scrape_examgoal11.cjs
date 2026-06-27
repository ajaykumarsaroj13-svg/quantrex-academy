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
  
  console.log('Navigating to specific PYQ chapter wise url...');
  await page.goto('https://room.examgoal.com/pyq/jee-main/chapter-wise', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'jee_main_pyq.png' });

  // wait, the user said: "Binomial theorem chapter mein exam goal se JEE Main chapter wise section mein jana hai."
  // I will just get all links on this page to see the chapters.
  const links = await page.evaluate(() => Array.from(document.querySelectorAll('a')).map(a => ({ text: a.innerText.trim(), href: a.href })));
  fs.writeFileSync('jee_main_links.json', JSON.stringify(links, null, 2));

  await browser.close();
})();
