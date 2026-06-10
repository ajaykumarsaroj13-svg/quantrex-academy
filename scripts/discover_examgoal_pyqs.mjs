import puppeteer from 'puppeteer';
import fs from 'fs';

const MOBILE = '7750858874';
const PASSWORD = '12345678';
const LOGIN_URL = 'https://accounts.examgoal.com/login';

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: false, args: ['--no-sandbox', '--window-size=1280,800'] });
  const page = await browser.newPage();
  
  const apis = [];
  page.on('response', async (res) => {
    const url = res.url();
    if (url.includes('/api/v1/') || url.includes('/api/v2/')) {
        try {
            const ct = res.headers()['content-type'] || '';
            if (ct.includes('json')) {
                const data = await res.json();
                apis.push({ url, data });
                fs.writeFileSync(`examgoal_pyq_api_${url.split('/').pop().split('?')[0]}.json`, JSON.stringify(data, null, 2));
            }
        } catch(e) {}
    }
  });

  console.log('Logging in...');
  await page.goto(LOGIN_URL, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  
  const phoneBtns = await page.$$('button');
  for (const btn of phoneBtns) {
    const text = await page.evaluate(el => el.textContent.trim().toLowerCase(), btn);
    if (text === 'phone') { await btn.click(); break; }
  }
  await new Promise(r => setTimeout(r, 1000));
  
  await page.evaluate(() => {
    const inp = document.querySelector('input[type="number"]');
    if(inp) { inp.value = '7750858874'; inp.dispatchEvent(new Event('input', { bubbles: true })); }
  });
  
  await new Promise(r => setTimeout(r, 500));
  const passInput = await page.$('input[type="password"]');
  if (passInput) {
    await passInput.click({ clickCount: 3 });
    await page.keyboard.type(PASSWORD, { delay: 50 });
  }
  
  const btns = await page.$$('button');
  for (const btn of btns) {
    const text = await page.evaluate(el => el.textContent.trim(), btn);
    if (text === 'Login') { await btn.click(); break; }
  }
  
  await new Promise(r => setTimeout(r, 5000));
  console.log('Current URL after login:', page.url());
  
  // Go to PYQ
  await page.goto('https://room.examgoal.com/pyq', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 5000));
  await page.screenshot({ path: 'examgoal_pyq_home.png' });
  
  // Try to click JEE Main
  const jeeMainLinks = await page.$$('a, button');
  for (const el of jeeMainLinks) {
      const text = await page.evaluate(e => e.textContent.toLowerCase(), el);
      if (text.includes('jee main')) {
          await el.click();
          break;
      }
  }
  
  await new Promise(r => setTimeout(r, 5000));
  await page.screenshot({ path: 'examgoal_pyq_jeemain.png' });
  
  // Try to click Mathematics
  const mathLinks = await page.$$('a, button, div.cursor-pointer');
  for (const el of mathLinks) {
      const text = await page.evaluate(e => e.textContent.toLowerCase(), el);
      if (text.includes('mathematics')) {
          await el.click();
          break;
      }
  }
  
  await new Promise(r => setTimeout(r, 5000));
  await page.screenshot({ path: 'examgoal_pyq_jeemain_math.png' });
  
  console.log('Done, saved screenshots and API JSONs.');
  await browser.close();
})();
