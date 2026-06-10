import puppeteer from 'puppeteer';
import fs from 'fs';

const MOBILE = '7750858874';
const PASSWORD = '12345678';

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  let authToken = '';
  
  // Intercept all XHR/fetch and capture auth headers
  await page.setRequestInterception(true);
  page.on('request', req => {
      const headers = req.headers();
      if (headers['authorization']) {
          authToken = headers['authorization'];
          console.log('FOUND AUTH in request to:', req.url().substring(0, 80));
      }
      req.continue();
  });

  page.on('response', async res => {
      const url = res.url();
      if (url.includes('/api/v1/auth/login/phone') || url.includes('/api/v1/auth/profile')) {
          try {
              const json = await res.json();
              if (json.token) { authToken = 'Bearer ' + json.token; console.log('Got token from:', url); }
              if (json.data?.token) { authToken = 'Bearer ' + json.data.token; console.log('Got token.data from:', url); }
              fs.writeFileSync('login_resp_' + Date.now() + '.json', JSON.stringify(json, null, 2));
          } catch (e) {}
      }
  });

  console.log('Navigating to login...');
  await page.goto('https://accounts.examgoal.com/login', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  console.log('Looking for Phone button...');
  const btns = await page.$$('button');
  for (const btn of btns) {
    const text = await page.evaluate(el => el.textContent.trim().toLowerCase(), btn);
    console.log('Button:', text);
    if (text === 'phone') { await btn.click(); console.log('Clicked phone!'); break; }
  }
  await new Promise(r => setTimeout(r, 1500));
  
  console.log('Page URL:', page.url());
  
  await page.evaluate(() => {
    const inp = document.querySelector('input[type="number"], input[placeholder*="number"], input[placeholder*="mobile"], input[placeholder*="phone"]');
    if(inp) { inp.value = '7750858874'; inp.dispatchEvent(new Event('input', { bubbles: true })); console.log('Set phone'); }
    else console.log('No phone input found!');
  });
  
  await new Promise(r => setTimeout(r, 800));
  const passInput = await page.$('input[type="password"]');
  if (passInput) {
    await passInput.click({ clickCount: 3 });
    await page.keyboard.type(PASSWORD, { delay: 50 });
    console.log('Typed password');
  }
  
  const allBtns = await page.$$('button');
  for (const btn of allBtns) {
    const text = await page.evaluate(el => el.textContent.trim(), btn);
    if (/login|sign in|submit/i.test(text)) { await btn.click(); console.log('Clicked login:', text); break; }
  }
  
  await new Promise(r => setTimeout(r, 6000));
  
  console.log('\nCurrent URL after login:', page.url());
  console.log('Auth token captured:', authToken ? 'YES' : 'NO');
  if (authToken) fs.writeFileSync('auth_token.txt', authToken);
  
  // Navigate to PYQ to trigger more API calls
  await page.goto('https://room.examgoal.com/pyq/jee-main', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 6000));
  console.log('Auth token after PYQ page:', authToken ? 'YES' : 'NO');
  if (authToken) fs.writeFileSync('auth_token.txt', authToken);

  // Try localStorage for token
  const localStorageToken = await page.evaluate(() => {
      const keys = Object.keys(localStorage);
      const tokenKey = keys.find(k => k.includes('token') || k.includes('auth'));
      return tokenKey ? { key: tokenKey, value: localStorage[tokenKey] } : null;
  });
  console.log('LocalStorage token:', localStorageToken);

  await browser.close();
})();
