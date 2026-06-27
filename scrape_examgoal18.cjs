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

  // dismiss modal
  const btns = await page.$$('button');
  for (const btn of btns) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('I Understand')) {
      await btn.click();
      await page.waitForTimeout(1000);
      break;
    }
  }

  // close 'Choose Your Exam' panel if it's open
  console.log('Trying to close choose your exam panel...');
  const closeBtns = await page.$$('button');
  for (const btn of closeBtns) {
      const html = await page.evaluate(el => el.innerHTML, btn);
      // The x button has some iconify class or is just an x
      if (html.includes('i-lucide:x') || html.includes('i-mdi:close')) {
          try { await btn.click(); await page.waitForTimeout(1000); } catch (e) {}
      }
  }
  
  // Click Previous Year Questions
  console.log('Clicking Previous Year Questions...');
  const links = await page.$$('a');
  for (const link of links) {
      const text = await page.evaluate(el => el.textContent, link);
      if (text && text.includes('Previous Year Questions')) {
          await link.click();
          await page.waitForTimeout(5000);
          break;
      }
  }
  
  console.log('URL after clicking PYQ:', page.url());
  
  // Click JEE Main accordion
  console.log('Clicking JEE Main accordion...');
  const triggers = await page.$$('button[data-slot="trigger"]');
  for (const trigger of triggers) {
      const text = await page.evaluate(el => el.textContent, trigger);
      if (text.includes('JEE Main')) {
         await trigger.click();
         await page.waitForTimeout(3000);
         break;
      }
  }

  const pageHtml = await page.content();
  fs.writeFileSync('pyq_open.html', pageHtml);
  await page.screenshot({ path: 'pyq_open.png' });

  // Get all links now
  const allLinks = await page.evaluate(() => {
     return Array.from(document.querySelectorAll('a')).map(a => ({ text: a.innerText.trim(), href: a.href })).filter(a => a.href.includes('pyq') || a.href.includes('jee'));
  });
  console.log('PYQ Links:', allLinks);

  await browser.close();
})();
