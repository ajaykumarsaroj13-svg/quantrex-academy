import puppeteer from 'puppeteer';
import fs from 'fs';

const MOBILE = '7750858874';
const PASSWORD = '12345678';
const LOGIN_URL = 'https://accounts.examgoal.com/login';

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--window-size=1280,800'] });
  const page = await browser.newPage();
  
  let capturedData = {};

  page.on('response', async (res) => {
      const url = res.url();
      if (url.includes('/api/') && res.request().method() !== 'OPTIONS') {
          try {
              const text = await res.text();
              if (text && (text.startsWith('{') || text.startsWith('['))) {
                  const json = JSON.parse(text);
                  console.log(`[API INTERCEPT] ${url.substring(0, 80)}...`);
                  if (JSON.stringify(json).length > 1000) {
                      const name = url.split('/').pop().split('?')[0].replace(/[^a-zA-Z0-9]/g, '_');
                      fs.writeFileSync(`examgoal_api_${name}_${Date.now()}.json`, JSON.stringify(json, null, 2));
                      console.log(`Saved examgoal_api_${name}_${Date.now()}.json`);
                  }
              }
          } catch (e) {
              // Ignore
          }
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
  
  console.log('Navigating to PYQ Mathematics...');
  // Instead of clicking, just go to the URL
  await page.goto('https://room.examgoal.com/pyq/jee-main/mathematics', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 5000));
  
  console.log('Clicking the second chapter (Complex Numbers)...');
  await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      const mathLinks = links.filter(l => l.href.includes('/pyq/jee-main/mathematics/'));
      if (mathLinks.length > 1) {
          mathLinks[1].click();
      }
  });
  
  await new Promise(r => setTimeout(r, 10000));

  console.log('Clicking the third chapter (Matrices)...');
  await page.goto('https://room.examgoal.com/pyq/jee-main/mathematics', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      const mathLinks = links.filter(l => l.href.includes('/pyq/jee-main/mathematics/'));
      if (mathLinks.length > 2) {
          mathLinks[2].click();
      }
  });
  
  await new Promise(r => setTimeout(r, 10000));

  await browser.close();
  console.log('Done.');
})();
