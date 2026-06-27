import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const MOBILE = '7750858874';
const PASSWORD = '12345678';
const LOGIN_URL = 'https://accounts.examgoal.com/login';

const interceptedData = {};
let authToken = null;

console.log('Launching browser...');
const browser = await puppeteer.launch({
  headless: false,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,900'],
  defaultViewport: null
});

const page = await browser.newPage();

// Intercept ALL network responses to find API endpoints & auth token
await page.setRequestInterception(true);
page.on('request', req => req.continue());

page.on('response', async (response) => {
  const url = response.url();
  const ct = response.headers()['content-type'] || '';
  
  // Capture auth token from request headers
  const reqHeaders = response.request().headers();
  if (reqHeaders['authorization'] && !authToken) {
    authToken = reqHeaders['authorization'];
    console.log('✅ Auth token captured:', authToken.substring(0, 60) + '...');
    fs.writeFileSync(path.join(__dirname, 'auth_token.txt'), authToken);
  }

  // Capture useful JSON API responses
  if (ct.includes('application/json') || ct.includes('text/json')) {
    try {
      const text = await response.text().catch(() => '');
      if (text && (text.trim().startsWith('{') || text.trim().startsWith('['))) {
        const data = JSON.parse(text);
        const urlShort = url.substring(0, 120);
        
        if (url.includes('test') || url.includes('exam') || url.includes('paper') || url.includes('question') || url.includes('series')) {
          console.log('📦 API:', urlShort);
          interceptedData[url] = { url, data };
          const safeKey = url.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 100);
          fs.writeFileSync(path.join(__dirname, `api_${safeKey}.json`), JSON.stringify(data, null, 2));
        }
      }
    } catch (e) {}
  }
});

// ── STEP 1: LOGIN ────────────────────────────────────────────
console.log('\n🔑 Going to login page...');
await page.goto(LOGIN_URL, { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 2000));
await page.screenshot({ path: path.join(__dirname, 'step1_login.png') });
console.log('Current URL:', page.url());

// Print all inputs
const inputs = await page.$$eval('input', els => els.map(e => ({ type: e.type, name: e.name, placeholder: e.placeholder, id: e.id, class: e.className })));
console.log('Inputs on page:', JSON.stringify(inputs, null, 2));

// Enter mobile
const phoneSelectors = ['input[type="tel"]','input[name="mobile"]','input[name="phone"]','input[placeholder*="Mobile"]','input[placeholder*="Phone"]','input[placeholder*="mobile"]','input[id*="mobile"]'];
let phoneInput = null;
for (const sel of phoneSelectors) {
  phoneInput = await page.$(sel);
  if (phoneInput) { console.log('✅ Phone input found:', sel); break; }
}
if (!phoneInput) {
  phoneInput = await page.$('input:not([type="password"])');
  console.log('Using first non-password input as phone');
}
if (phoneInput) {
  await phoneInput.click({ clickCount: 3 });
  await phoneInput.type(MOBILE, { delay: 60 });
  console.log('✅ Entered mobile:', MOBILE);
}

await new Promise(r => setTimeout(r, 800));

// Enter password
let passInput = await page.$('input[type="password"]');
if (!passInput) {
  // Multi-step: press Enter to go to password step
  await page.keyboard.press('Enter');
  await new Promise(r => setTimeout(r, 2000));
  passInput = await page.$('input[type="password"]');
}
if (passInput) {
  await passInput.click({ clickCount: 3 });
  await passInput.type(PASSWORD, { delay: 60 });
  console.log('✅ Entered password');
}

await page.screenshot({ path: path.join(__dirname, 'step2_creds_entered.png') });

// Click login
const buttons = await page.$$('button');
let clicked = false;
for (const btn of buttons) {
  const text = await page.evaluate(el => el.textContent.trim().toLowerCase(), btn);
  if (text.includes('login') || text.includes('sign in') || text.includes('continue') || text.includes('submit')) {
    await btn.click();
    clicked = true;
    console.log('✅ Clicked button:', text);
    break;
  }
}
if (!clicked) { await page.keyboard.press('Enter'); console.log('Pressed Enter'); }

// Wait for login
console.log('⏳ Waiting for login to complete...');
await new Promise(r => setTimeout(r, 6000));
await page.screenshot({ path: path.join(__dirname, 'step3_post_login.png') });
console.log('URL after login:', page.url());

// Save cookies & localStorage
const cookies = await page.cookies();
fs.writeFileSync(path.join(__dirname, 'examgoal_cookies.json'), JSON.stringify(cookies, null, 2));

const ls = await page.evaluate(() => {
  const d = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    d[k] = localStorage.getItem(k);
  }
  return d;
});
fs.writeFileSync(path.join(__dirname, 'examgoal_localstorage.json'), JSON.stringify(ls, null, 2));
console.log('✅ Saved cookies & localStorage. Keys:', Object.keys(ls));

// Find token in localStorage
for (const [k, v] of Object.entries(ls)) {
  if (k.toLowerCase().includes('token') || k.toLowerCase().includes('auth') || k.toLowerCase().includes('jwt')) {
    console.log('🔑 Token-like key:', k, '=', String(v).substring(0, 80));
    if (!authToken) authToken = v;
  }
}

// ── STEP 2: Navigate to JEE Main Full Test Series ─────────────
console.log('\n📚 Going to JEE Main Full Test Series...');
await page.goto('https://examgoal.com/full-test-series/jee-main', { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 5000));
await page.screenshot({ path: path.join(__dirname, 'step4_jee_main.png') });
console.log('URL:', page.url());

const jeeMainHtml = await page.content();
fs.writeFileSync(path.join(__dirname, 'jee_main_page.html'), jeeMainHtml);

// Find all test/paper links on the page
const allLinks = await page.$$eval('a', links =>
  links.map(l => ({ href: l.href, text: l.textContent.trim().substring(0, 80) }))
);
const testLinks = allLinks.filter(l => l.href && (l.href.includes('test') || l.href.includes('paper') || l.href.includes('exam') || l.href.includes('series')));
console.log('🔗 Test links on JEE Main page:', testLinks.slice(0, 15));
fs.writeFileSync(path.join(__dirname, 'jee_main_links.json'), JSON.stringify(testLinks, null, 2));

// ── STEP 3: Navigate to JEE Advanced ─────────────────────────
console.log('\n📚 Going to JEE Advanced Full Test Series...');
await page.goto('https://examgoal.com/full-test-series/jee-advanced', { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 5000));
await page.screenshot({ path: path.join(__dirname, 'step5_jee_advanced.png') });

const jeeAdvHtml = await page.content();
fs.writeFileSync(path.join(__dirname, 'jee_advanced_page.html'), jeeAdvHtml);

const advLinks = await page.$$eval('a', links =>
  links.map(l => ({ href: l.href, text: l.textContent.trim().substring(0, 80) }))
);
const advTestLinks = advLinks.filter(l => l.href && (l.href.includes('test') || l.href.includes('paper') || l.href.includes('series')));
console.log('🔗 Test links on JEE Advanced page:', advTestLinks.slice(0, 15));
fs.writeFileSync(path.join(__dirname, 'jee_advanced_links.json'), JSON.stringify(advTestLinks, null, 2));

console.log('\n✅ All done! APIs intercepted:', Object.keys(interceptedData).length);
console.log('Auth token:', authToken ? authToken.substring(0, 60) : 'NOT FOUND');

console.log('\nKeeping browser open for 20 seconds...');
await new Promise(r => setTimeout(r, 20000));
await browser.close();
