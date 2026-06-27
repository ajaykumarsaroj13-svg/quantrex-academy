import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MOBILE = '7750858874';
const PASSWORD = '12345678';
const LOGIN_URL = 'https://accounts.examgoal.com/login';

const allIntercepted = {};

console.log('Launching browser...');
const browser = await puppeteer.launch({
  headless: false,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,900'],
  defaultViewport: null
});

const page = await browser.newPage();
await page.setRequestInterception(true);

page.on('request', req => req.continue());

page.on('response', async (response) => {
  const url = response.url();
  const ct = response.headers()['content-type'] || '';
  const reqHeaders = response.request().headers();

  if (ct.includes('application/json') || ct.includes('text/json')) {
    try {
      const text = await response.text().catch(() => '');
      if (text && (text.trim().startsWith('{') || text.trim().startsWith('['))) {
        const data = JSON.parse(text);
        allIntercepted[url] = data;
        const safeKey = url.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 120);
        fs.writeFileSync(path.join(__dirname, `api_${safeKey}.json`), JSON.stringify(data, null, 2));
        if (url.includes('auth') || url.includes('login') || url.includes('token') || url.includes('test') || url.includes('series') || url.includes('paper') || url.includes('question')) {
          console.log('📦 JSON API:', url.substring(0, 100));
        }
      }
    } catch (e) {}
  }
});

// ── STEP 1: Go to login page ─────────────────────────────────
console.log('Going to login page...');
await page.goto(LOGIN_URL, { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 2000));
await page.screenshot({ path: path.join(__dirname, 'login_s1.png') });

// ── STEP 2: Click on "Mobile" tab/option ─────────────────────
console.log('Looking for Mobile tab/button to click...');

// Print all buttons and links text to find the mobile option
const allBtns = await page.$$eval('button, a, [role="tab"], li', els =>
  els.map(el => ({ tag: el.tagName, text: el.textContent.trim().substring(0, 40), class: el.className.substring(0, 50) }))
);
console.log('All clickable elements:', JSON.stringify(allBtns.filter(b => b.text.length > 0 && b.text.length < 30), null, 2));

// Try to find and click Mobile option
const mobileKeywords = ['mobile', 'phone', 'number', 'otp'];
let mobileTabClicked = false;

// Try buttons first
const buttons = await page.$$('button, [role="tab"], li, a');
for (const el of buttons) {
  const text = await page.evaluate(e => e.textContent.trim().toLowerCase(), el);
  if (mobileKeywords.some(kw => text.includes(kw))) {
    console.log('✅ Found mobile tab:', text);
    await el.click();
    mobileTabClicked = true;
    await new Promise(r => setTimeout(r, 1500));
    break;
  }
}

if (!mobileTabClicked) {
  // Try by text content using XPath
  try {
    const mobileEl = await page.$x('//*[contains(translate(text(), "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"), "mobile") or contains(translate(text(), "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"), "phone")]');
    if (mobileEl.length > 0) {
      console.log('✅ Found mobile element via XPath, clicking...');
      await mobileEl[0].click();
      mobileTabClicked = true;
      await new Promise(r => setTimeout(r, 1500));
    }
  } catch(e) {}
}

await page.screenshot({ path: path.join(__dirname, 'login_s2_after_mobile_click.png') });
console.log('After mobile click, URL:', page.url());

// Print inputs after clicking mobile tab
const inputsAfter = await page.$$eval('input', els => els.map(e => ({
  type: e.type, name: e.name, placeholder: e.placeholder, id: e.id
})));
console.log('Inputs after mobile click:', JSON.stringify(inputsAfter, null, 2));

// ── STEP 3: Enter Mobile Number ───────────────────────────────
const phoneSelectors = [
  'input[type="tel"]', 'input[name="mobile"]', 'input[name="phone"]',
  'input[placeholder*="Mobile"]', 'input[placeholder*="Phone"]',
  'input[placeholder*="mobile"]', 'input[id*="mobile"]', 'input[id*="phone"]',
  'input[type="number"]'
];
let phoneInput = null;
for (const sel of phoneSelectors) {
  phoneInput = await page.$(sel);
  if (phoneInput) { console.log('Phone input selector:', sel); break; }
}
if (!phoneInput) {
  const allInputs = await page.$$('input');
  if (allInputs.length > 0) {
    phoneInput = allInputs[0];
    console.log('Using first input for phone');
  }
}
if (phoneInput) {
  await phoneInput.click({ clickCount: 3 });
  await phoneInput.type(MOBILE, { delay: 80 });
  console.log('✅ Entered mobile:', MOBILE);
}

await new Promise(r => setTimeout(r, 800));
await page.screenshot({ path: path.join(__dirname, 'login_s3_phone.png') });

// ── STEP 4: Enter Password ─────────────────────────────────────
let passInput = await page.$('input[type="password"]');
if (!passInput) {
  await page.keyboard.press('Enter');
  await new Promise(r => setTimeout(r, 2000));
  passInput = await page.$('input[type="password"]');
}
if (passInput) {
  await passInput.click({ clickCount: 3 });
  await passInput.type(PASSWORD, { delay: 80 });
  console.log('✅ Entered password');
} else {
  console.log('⚠️ No password field - might be OTP-based');
}

await page.screenshot({ path: path.join(__dirname, 'login_s4_pass.png') });

// ── STEP 5: Click Login ────────────────────────────────────────
const loginBtns = await page.$$('button');
let clicked = false;
for (const btn of loginBtns) {
  const text = await page.evaluate(el => el.textContent.trim().toLowerCase(), btn);
  if (text.includes('login') || text.includes('sign in') || text.includes('continue') || text.includes('next') || text.includes('submit')) {
    await btn.click();
    clicked = true;
    console.log('✅ Clicked:', text);
    break;
  }
}
if (!clicked) {
  await page.keyboard.press('Enter');
  console.log('Pressed Enter');
}

console.log('⏳ Waiting for login (8 sec)...');
await new Promise(r => setTimeout(r, 8000));
await page.screenshot({ path: path.join(__dirname, 'login_s5_result.png') });
console.log('Post-login URL:', page.url());

// Save localStorage and cookies
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
console.log('LocalStorage keys:', Object.keys(ls));

// Look for token
let foundToken = null;
for (const [k, v] of Object.entries(ls)) {
  console.log('  LS key:', k, '=', String(v).substring(0, 80));
  if (k.toLowerCase().includes('token') || k.toLowerCase().includes('auth') || k.toLowerCase().includes('jwt') || k.toLowerCase().includes('access')) {
    foundToken = v;
    console.log('🔑 TOKEN FOUND in localStorage key:', k);
  }
}

// ── STEP 6: Go to Full Test Series pages ─────────────────────
if (page.url() !== LOGIN_URL && !page.url().includes('login')) {
  console.log('\n✅ Login SUCCESS! Now fetching test series...');

  await page.goto('https://examgoal.com/full-test-series/jee-main', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 5000));
  await page.screenshot({ path: path.join(__dirname, 'jee_main_tests.png') });
  fs.writeFileSync(path.join(__dirname, 'jee_main_page.html'), await page.content());
  console.log('JEE Main page saved');

  await page.goto('https://examgoal.com/full-test-series/jee-advanced', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 5000));
  await page.screenshot({ path: path.join(__dirname, 'jee_advanced_tests.png') });
  fs.writeFileSync(path.join(__dirname, 'jee_advanced_page.html'), await page.content());
  console.log('JEE Advanced page saved');
} else {
  console.log('\n❌ Login FAILED. Still on login page.');
  console.log('Screenshots saved. Check login_s*.png files for what happened.');
}

fs.writeFileSync(path.join(__dirname, 'all_intercepted_apis.json'), JSON.stringify(Object.keys(allIntercepted), null, 2));
console.log('\nTotal APIs intercepted:', Object.keys(allIntercepted).length);

console.log('Keeping browser open 30 sec for manual inspection...');
await new Promise(r => setTimeout(r, 30000));
await browser.close();
