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

  console.log('Clicking JEE Main img...');
  const img = await page.$('img[alt="JEE Main"]');
  if (img) {
      await img.click();
      await page.waitForTimeout(3000);
  }
  
  await page.screenshot({ path: 'after_jee_img_click.png' });
  
  // Close the right panel
  const closeIcons = await page.$$('.i-lucide\\:x, .i-mdi\\:close');
  for (const icon of closeIcons) {
      try { await icon.click(); await page.waitForTimeout(1000); break; } catch (e) {}
  }
  
  await page.screenshot({ path: 'after_panel_close.png' });
  
  // Now click Previous Year Questions
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
  const pageHtml = await page.content();
  fs.writeFileSync('final_pyq.html', pageHtml);
  await page.screenshot({ path: 'final_pyq.png' });

  await browser.close();
})();
