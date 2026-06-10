import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MOBILE = '7750858874';
const PASSWORD = '12345678';
const LOGIN_URL = 'https://accounts.examgoal.com/login';

let capturedToken = null;
let capturedCookieStr = null;
const allResponses = {};

console.log('Launching browser...');
const browser = await puppeteer.launch({
  headless: false,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,900'],
  defaultViewport: null
});

const page = await browser.newPage();
await page.setRequestInterception(true);

page.on('request', req => {
  const headers = req.headers();
  if (headers['authorization'] && !capturedToken) {
    capturedToken = headers['authorization'];
    console.log('🔑 Auth token from request:', capturedToken.substring(0, 80));
    fs.writeFileSync(path.join(__dirname, 'auth_token.txt'), capturedToken);
  }
  req.continue();
});

page.on('response', async (response) => {
  const url = response.url();
  const ct = response.headers()['content-type'] || '';
  const reqHeaders = response.request().headers();
  
  if (reqHeaders['authorization'] && !capturedToken) {
    capturedToken = reqHeaders['authorization'];
    console.log('🔑 Token from response header:', capturedToken.substring(0, 80));
    fs.writeFileSync(path.join(__dirname, 'auth_token.txt'), capturedToken);
  }

  if (ct.includes('application/json') || ct.includes('text/json')) {
    try {
      const text = await response.text().catch(() => '');
      if (!text || (!text.trim().startsWith('{') && !text.trim().startsWith('['))) return;
      const data = JSON.parse(text);
      allResponses[url] = data;
      
      // Log important ones
      if (url.includes('auth') || url.includes('login') || url.includes('test') || url.includes('series') || url.includes('paper') || url.includes('question') || url.includes('profile') || url.includes('session')) {
        console.log('📦 API:', url.substring(0, 100));
        const safeKey = url.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 120);
        fs.writeFileSync(path.join(__dirname, `api_${safeKey}.json`), JSON.stringify(data, null, 2));
        
        // Try to extract token from login response
        if (url.includes('login')) {
          const t = data?.data?.token || data?.token || data?.accessToken || data?.access_token;
          if (t && !capturedToken) {
            capturedToken = `Bearer ${t}`;
            console.log('🔑 Token from login response:', capturedToken.substring(0, 80));
            fs.writeFileSync(path.join(__dirname, 'auth_token.txt'), capturedToken);
          }
        }
      }
    } catch (e) {}
  }
  
  // Capture cookies from set-cookie header
  const setCookie = response.headers()['set-cookie'];
  if (setCookie && (url.includes('auth') || url.includes('login'))) {
    console.log('🍪 Set-Cookie from:', url.substring(0, 60), ':', setCookie.substring(0, 100));
  }
});

// ── Login Page ────────────────────────────────────────────────
console.log('Going to login page...');
await page.goto(LOGIN_URL, { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 2000));

// Click "Phone" tab
console.log('Clicking Phone tab...');
const phoneBtns = await page.$$('button');
for (const btn of phoneBtns) {
  const text = await page.evaluate(el => el.textContent.trim().toLowerCase(), btn);
  if (text === 'phone') {
    await btn.click();
    console.log('✅ Clicked Phone tab');
    break;
  }
}
await new Promise(r => setTimeout(r, 1500));

// Enter phone in input[type="number"] (the visible one)
console.log('Entering phone number in number input...');
const phoneInput = await page.$('input[type="number"][placeholder="Enter Phone Number"]') 
  || await page.$('input[type="number"][name="phone"]')
  || await page.$('input[placeholder="Enter Phone Number"]');

if (phoneInput) {
  await phoneInput.click({ clickCount: 3 });
  // Use keyboard to type each digit
  await page.keyboard.type(MOBILE, { delay: 80 });
  console.log('✅ Entered mobile via keyboard');
} else {
  // Try clicking on the visible phone area and typing
  await page.evaluate(() => {
    const inputs = document.querySelectorAll('input[name="phone"]');
    inputs.forEach(inp => {
      if (inp.type === 'number') {
        inp.value = '7750858874';
        inp.dispatchEvent(new Event('input', { bubbles: true }));
        inp.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
  });
  console.log('✅ Set phone via evaluate');
}

await new Promise(r => setTimeout(r, 800));
await page.screenshot({ path: path.join(__dirname, 'phone_entered.png') });

// Enter password
const passInput = await page.$('input[type="password"]');
if (passInput) {
  await passInput.click({ clickCount: 3 });
  await page.keyboard.type(PASSWORD, { delay: 80 });
  console.log('✅ Entered password');
}

await page.screenshot({ path: path.join(__dirname, 'both_entered.png') });

// Click Login button
const btns = await page.$$('button');
for (const btn of btns) {
  const text = await page.evaluate(el => el.textContent.trim(), btn);
  if (text === 'Login') {
    await btn.click();
    console.log('✅ Clicked Login button');
    break;
  }
}

console.log('⏳ Waiting for login result...');
await new Promise(r => setTimeout(r, 8000));
await page.screenshot({ path: path.join(__dirname, 'post_login.png') });
console.log('Post-login URL:', page.url());

// Save all cookies
const allCookies = await page.cookies();
fs.writeFileSync(path.join(__dirname, 'examgoal_cookies.json'), JSON.stringify(allCookies, null, 2));
capturedCookieStr = allCookies.map(c => `${c.name}=${c.value}`).join('; ');

const ls = await page.evaluate(() => {
  const d = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    d[k] = localStorage.getItem(k);
  }
  return d;
});
fs.writeFileSync(path.join(__dirname, 'examgoal_ls.json'), JSON.stringify(ls, null, 2));
console.log('LocalStorage keys:', Object.keys(ls));
for (const [k, v] of Object.entries(ls)) {
  const val = String(v);
  if (k.includes('token') || k.includes('auth') || k.includes('jwt') || val.startsWith('eyJ')) {
    console.log('🔑 Token key:', k, '=', val.substring(0, 80));
    if (!capturedToken) capturedToken = val.startsWith('Bearer ') ? val : `Bearer ${val}`;
  }
}

const loginSuccess = page.url() !== LOGIN_URL && !page.url().includes('login');
console.log(loginSuccess ? '✅ LOGIN SUCCESS!' : '❌ Login failed, still on login page');

if (!loginSuccess) {
  // Even if page says failed, we might have got the token from API response
  console.log('Checking if token was captured from APIs...');
  const tokenFile = path.join(__dirname, 'auth_token.txt');
  if (fs.existsSync(tokenFile)) {
    capturedToken = fs.readFileSync(tokenFile, 'utf8').trim();
    console.log('Token from file:', capturedToken.substring(0, 80));
  }
}

// Now fetch test series data using the token
if (capturedToken) {
  console.log('\n📡 Fetching JEE Main + Advanced tests via API with token...');
  
  // Navigate to test series and intercept API calls
  await page.goto('https://examgoal.com/full-test-series/jee-main', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 5000));
  await page.screenshot({ path: path.join(__dirname, 'jee_main_series.png') });
  fs.writeFileSync(path.join(__dirname, 'jee_main.html'), await page.content());
  
  await page.goto('https://examgoal.com/full-test-series/jee-advanced', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 5000));
  await page.screenshot({ path: path.join(__dirname, 'jee_adv_series.png') });
  fs.writeFileSync(path.join(__dirname, 'jee_adv.html'), await page.content());
}

console.log('\n📊 Total APIs intercepted:', Object.keys(allResponses).length);
console.log('All API URLs:');
Object.keys(allResponses).forEach(u => console.log(' -', u.substring(0, 100)));
fs.writeFileSync(path.join(__dirname, 'all_api_urls.json'), JSON.stringify(Object.keys(allResponses), null, 2));

console.log('\nToken captured:', capturedToken ? capturedToken.substring(0, 80) : 'NONE');
console.log('Keeping browser open 30 sec...');
await new Promise(r => setTimeout(r, 30000));
await browser.close();
