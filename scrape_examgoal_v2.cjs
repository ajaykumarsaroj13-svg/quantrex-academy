const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const MOBILE = '7750858874';
const PASSWORD = '12345678';
const LOGIN_URL = 'https://accounts.examgoal.com/login';

const interceptedData = {};
let authToken = null;
let authCookies = null;

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: false, // visible so we can see what happens
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,900'],
    defaultViewport: null
  });

  const page = await browser.newPage();

  // Intercept ALL network requests to find API endpoints
  await page.setRequestInterception(true);
  page.on('request', req => {
    req.continue();
  });

  page.on('response', async (response) => {
    const url = response.url();
    const ct = response.headers()['content-type'] || '';
    
    // Capture auth token from any request
    const reqHeaders = response.request().headers();
    if (reqHeaders['authorization'] && !authToken) {
      authToken = reqHeaders['authorization'];
      console.log('✅ Auth token captured:', authToken.substring(0, 40) + '...');
    }

    // Capture JSON API responses
    if (ct.includes('application/json') || ct.includes('text/json')) {
      try {
        const text = await response.text();
        if (text && text.trim().startsWith('{') || text.trim().startsWith('[')) {
          const data = JSON.parse(text);
          
          // Look for test series data
          if (url.includes('test') || url.includes('exam') || url.includes('paper') || url.includes('question')) {
            console.log('📦 API Response:', url.substring(0, 100));
            interceptedData[url] = data;
            
            // Save immediately
            const safeKey = url.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 80);
            fs.writeFileSync(`api_response_${safeKey}.json`, JSON.stringify(data, null, 2));
          }
        }
      } catch (e) {}
    }
  });

  // ── STEP 1: LOGIN ────────────────────────────────────────────
  console.log('\n🔑 Going to login page...');
  await page.goto(LOGIN_URL, { waitUntil: 'networkidle2', timeout: 30000 });
  await page.screenshot({ path: 'step1_login.png' });
  console.log('Login page loaded. Screenshot saved.');
  await new Promise(r => setTimeout(r, 2000));

  // Find and fill phone number
  try {
    // Try various selectors
    const phoneSelectors = [
      'input[type="tel"]',
      'input[name="mobile"]',
      'input[name="phone"]',
      'input[placeholder*="Mobile"]',
      'input[placeholder*="Phone"]',
      'input[placeholder*="mobile"]',
      'input[id*="mobile"]',
      'input[id*="phone"]'
    ];
    
    let phoneInput = null;
    for (const sel of phoneSelectors) {
      phoneInput = await page.$(sel);
      if (phoneInput) { console.log('Found phone input with:', sel); break; }
    }
    
    if (!phoneInput) {
      // Get all inputs and log them
      const inputs = await page.$$eval('input', els => els.map(e => ({ type: e.type, name: e.name, placeholder: e.placeholder, id: e.id })));
      console.log('All inputs found:', JSON.stringify(inputs));
      // Try the first input
      phoneInput = await page.$('input');
    }

    if (phoneInput) {
      await phoneInput.click({ clickCount: 3 });
      await phoneInput.type(MOBILE, { delay: 50 });
      console.log('✅ Entered mobile number');
    }
  } catch (e) {
    console.error('Error entering phone:', e.message);
  }

  await page.screenshot({ path: 'step2_phone_entered.png' });
  await new Promise(r => setTimeout(r, 1000));

  // Enter password
  try {
    const passInput = await page.$('input[type="password"]');
    if (passInput) {
      await passInput.click({ clickCount: 3 });
      await passInput.type(PASSWORD, { delay: 50 });
      console.log('✅ Entered password');
    } else {
      console.log('⚠️ No password field found, might be multi-step login');
      // Click continue/next button
      await page.keyboard.press('Enter');
      await new Promise(r => setTimeout(r, 2000));
      const passInput2 = await page.$('input[type="password"]');
      if (passInput2) {
        await passInput2.type(PASSWORD, { delay: 50 });
        console.log('✅ Entered password (step 2)');
      }
    }
  } catch (e) {
    console.error('Error entering password:', e.message);
  }

  await page.screenshot({ path: 'step3_pass_entered.png' });

  // Click login button
  try {
    const loginBtns = await page.$$('button');
    let clicked = false;
    for (const btn of loginBtns) {
      const text = await page.evaluate(el => el.textContent.trim().toLowerCase(), btn);
      if (text.includes('login') || text.includes('sign in') || text.includes('submit') || text.includes('continue')) {
        await btn.click();
        clicked = true;
        console.log('✅ Clicked login button:', text);
        break;
      }
    }
    if (!clicked) {
      await page.keyboard.press('Enter');
      console.log('Pressed Enter to submit');
    }
  } catch (e) {
    console.error('Error clicking login:', e.message);
  }

  // Wait for navigation
  console.log('Waiting for post-login...');
  await new Promise(r => setTimeout(r, 5000));
  await page.screenshot({ path: 'step4_post_login.png' });
  console.log('Current URL after login:', page.url());

  // Save cookies
  authCookies = await page.cookies();
  fs.writeFileSync('examgoal_cookies.json', JSON.stringify(authCookies, null, 2));
  console.log('✅ Saved cookies');

  // Check localStorage for auth token
  try {
    const ls = await page.evaluate(() => {
      const data = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        data[key] = localStorage.getItem(key);
      }
      return data;
    });
    fs.writeFileSync('examgoal_localstorage.json', JSON.stringify(ls, null, 2));
    console.log('✅ Saved localStorage. Keys:', Object.keys(ls));
    
    // Find auth token in localStorage
    for (const [k, v] of Object.entries(ls)) {
      if (k.toLowerCase().includes('token') || k.toLowerCase().includes('auth')) {
        console.log('Found potential token key:', k, '=', String(v).substring(0, 60));
        authToken = v;
      }
    }
  } catch (e) {
    console.log('localStorage error:', e.message);
  }

  // ── STEP 2: Navigate to Full Test Series ──────────────────────
  console.log('\n📚 Navigating to JEE Main Full Test Series...');
  await page.goto('https://examgoal.com/full-test-series/jee-main', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 4000));
  await page.screenshot({ path: 'step5_jee_main_tests.png' });
  console.log('JEE Main page URL:', page.url());

  // Get page content
  const mainPageContent = await page.content();
  fs.writeFileSync('jee_main_page.html', mainPageContent);
  console.log('✅ Saved JEE Main page HTML');

  // Try to find test links
  const testLinks = await page.$$eval('a', links => 
    links.map(l => ({ href: l.href, text: l.textContent.trim().substring(0, 60) }))
    .filter(l => l.href && (l.href.includes('test') || l.href.includes('paper') || l.href.includes('exam')))
  );
  console.log('Test links found:', testLinks.slice(0, 10));
  fs.writeFileSync('test_links.json', JSON.stringify(testLinks, null, 2));

  await new Promise(r => setTimeout(r, 3000));

  // ── STEP 3: Navigate to JEE Advanced ─────────────────────────
  console.log('\n📚 Navigating to JEE Advanced Full Test Series...');
  await page.goto('https://examgoal.com/full-test-series/jee-advanced', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 4000));
  await page.screenshot({ path: 'step6_jee_advanced_tests.png' });

  const advPageContent = await page.content();
  fs.writeFileSync('jee_advanced_page.html', advPageContent);

  // Save all intercepted API data summary
  console.log('\n📊 Summary of intercepted API calls:', Object.keys(interceptedData).length);
  fs.writeFileSync('intercepted_apis.json', JSON.stringify(Object.keys(interceptedData), null, 2));

  console.log('\n✅ Done! Check the screenshots and JSON files.');
  console.log('Now keeping browser open for 30 seconds for manual inspection...');
  await new Promise(r => setTimeout(r, 30000));
  
  await browser.close();
})();
