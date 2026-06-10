import puppeteer from 'puppeteer';
import fs from 'fs';

const PASSWORD = '12345678';

async function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });
  
  const allApiCalls = [];
  
  await page.setRequestInterception(true);
  page.on('request', req => {
    const url = req.url();
    if (url.includes('room.examgoal.com/api')) {
      allApiCalls.push({ url, method: req.method(), headers: req.headers() });
    }
    req.continue();
  });

  page.on('response', async res => {
    const url = res.url();
    const ct = res.headers()['content-type'] || '';
    if (url.includes('room.examgoal.com/api') && ct.includes('json') && !url.includes('personalized')) {
      try {
        const json = await res.json();
        const suffix = url.replace(/.*examgoal\.com\/api\/v\d\//,'').replace(/[^a-zA-Z0-9]/g,'_').substring(0,60);
        const fname = `api_${suffix}_${Date.now()}.json`;
        fs.writeFileSync(fname, JSON.stringify(json, null, 2));
        console.log('[SAVED]', fname, 'keys:', JSON.stringify(Object.keys(json || {})));
      } catch(e) {}
    }
  });

  // Login
  await page.goto('https://accounts.examgoal.com/login', { waitUntil: 'networkidle2' });
  await delay(2000);
  
  const btns1 = await page.$$('button');
  for (const b of btns1) {
    const t = await page.evaluate(el => el.textContent.trim().toLowerCase(), b);
    if (t === 'phone') { await b.click(); break; }
  }
  await delay(1500);
  
  await page.evaluate(() => {
    const inp = document.querySelector('input[type="number"]');
    if (inp) { inp.value = '7750858874'; inp.dispatchEvent(new Event('input', { bubbles: true })); }
  });
  await delay(600);
  
  const passField = await page.$('input[type="password"]');
  if (passField) { await passField.click({ clickCount: 3 }); await page.keyboard.type(PASSWORD, { delay: 50 }); }
  
  const btns2 = await page.$$('button');
  for (const b of btns2) {
    const t = await page.evaluate(el => el.textContent.trim(), b);
    if (/^Login$/i.test(t)) { await b.click(); break; }
  }
  await delay(5000);
  console.log('Logged in:', page.url());

  // Try various possible URL patterns for chapter-wise PYQ
  const urls = [
    'https://room.examgoal.com/pyq/jee-main/mathematics/complex-numbers',
    'https://room.examgoal.com/pyq/chapter/jee-main/mathematics/complex-numbers',
    'https://room.examgoal.com/past-year/jee-main/mathematics',
    'https://room.examgoal.com/pyq',
  ];
  
  for (const url of urls) {
    allApiCalls.length = 0;
    await page.goto(url, { waitUntil: 'networkidle2' });
    await delay(5000);
    const text = await page.evaluate(() => document.body.innerText.substring(0, 500));
    console.log(`\n--- ${url} ---`);
    console.log('Page text:', text);
    console.log('API calls:', allApiCalls.map(c => c.url).join('\n'));
    await page.screenshot({ path: `url_test_${url.split('/').pop()}.png` });
  }
  
  await browser.close();
})();
