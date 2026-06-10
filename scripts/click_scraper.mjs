import puppeteer from 'puppeteer';
import fs from 'fs';

const PASSWORD = '12345678';

async function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,900'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });
  
  const savedFiles = [];
  
  await page.setRequestInterception(true);
  page.on('request', req => req.continue());
  
  page.on('response', async res => {
    const url = res.url();
    const ct = res.headers()['content-type'] || '';
    if (url.includes('room.examgoal.com/api/v1/past-question') && ct.includes('json')) {
      try {
        const json = await res.json();
        const suffix = url.replace(/.*\/past-question\//,'').replace(/[^a-zA-Z0-9]/g,'_').substring(0,60);
        const fname = `pyq_${suffix}_${Date.now()}.json`;
        fs.writeFileSync(fname, JSON.stringify(json, null, 2));
        savedFiles.push({ fname, url, keys: Object.keys(json || {}) });
        console.log('[SAVED]', fname, '| Keys:', Object.keys(json || {}).join(','), '| URL:', url.substring(0,80));
      } catch(e) {}
    }
  });

  // Login
  console.log('Logging in...');
  await page.goto('https://accounts.examgoal.com/login', { waitUntil: 'networkidle2' });
  await delay(2000);
  
  const allBtns = await page.$$('button');
  for (const b of allBtns) {
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
  
  const loginBtns = await page.$$('button');
  for (const b of loginBtns) {
    const t = await page.evaluate(el => el.textContent.trim(), b);
    if (/^Login$/i.test(t)) { await b.click(); break; }
  }
  await delay(6000);
  console.log('Logged in. URL:', page.url());

  // Navigate to ExamGoal PYQ section through the proper path
  // Try direct URL to PYQ chapter selection
  await page.goto('https://room.examgoal.com/', { waitUntil: 'networkidle2' });
  await delay(3000);
  await page.screenshot({ path: 'step1_home.png' });
  
  // Check what's on home page
  const homeHTML = await page.evaluate(() => document.body.innerText.substring(0, 1000));
  console.log('Home page text:', homeHTML);
  
  // Look for PYQ navigation
  const navItems = await page.evaluate(() => 
    Array.from(document.querySelectorAll('a, button, [role="link"]'))
      .map(el => ({ text: el.innerText?.trim().substring(0, 30), tag: el.tagName, href: el.href || '' }))
      .filter(x => x.text && x.text.length > 0)
  );
  console.log('Nav items:', JSON.stringify(navItems.slice(0, 30)));
  
  // Click on PYQ link
  const clicked = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('a, button'));
    const pyqEl = els.find(el => /pyq|past.*year|chapter.*wise/i.test(el.innerText));
    if (pyqEl) { pyqEl.click(); return pyqEl.innerText; }
    return null;
  });
  console.log('Clicked PYQ element:', clicked);
  await delay(4000);
  await page.screenshot({ path: 'step2_after_pyq_click.png' });
  console.log('URL after PYQ click:', page.url());

  // Try clicking JEE Main
  await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('a, button, div, span'));
    const el = els.find(e => /jee\s*main/i.test(e.innerText?.trim()) && e.innerText?.trim().length < 20);
    if (el) el.click();
  });
  await delay(4000);
  await page.screenshot({ path: 'step3_after_jeemain.png' });
  console.log('URL after JEE Main:', page.url());

  // Try clicking Mathematics
  await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('a, button, div, span'));
    const el = els.find(e => /^mathematics$/i.test(e.innerText?.trim()));
    if (el) el.click();
  });
  await delay(5000);
  await page.screenshot({ path: 'step4_after_math.png' });
  console.log('URL after Math:', page.url());
  
  // Log all page text to see chapters
  const mathPageText = await page.evaluate(() => document.body.innerText.substring(0, 2000));
  console.log('Math page content:', mathPageText);

  await browser.close();
  console.log('\nSaved files:', savedFiles.length);
  savedFiles.forEach(f => console.log(f.fname, f.url));
})();
