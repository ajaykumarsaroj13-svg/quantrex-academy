import puppeteer from 'puppeteer';
import fs from 'fs';

const PHONE = '7750858874';
const PASSWORD = '12345678';
const EXAM_ORIGIN = 'https://room.examgoal.com';
const TEST_ID = 'tst-19g61mnpzhlyq';

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1000 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  // Intercept to find Authorization headers
  let authToken = null;
  page.on('request', (req) => {
    const auth = req.headers()['authorization'];
    if (auth && auth.startsWith('Bearer ')) {
      authToken = auth.substring(7);
      console.log('Got Bearer token (first 60 chars):', authToken.substring(0, 60));
    }
  });

  // Login
  console.log('Logging in...');
  await page.goto('https://accounts.examgoal.com/login?redirect=https://room.examgoal.com', { waitUntil: 'networkidle2', timeout: 30000 });
  await delay(2000);
  const phoneBtns = await page.$$('button');
  for (const btn of phoneBtns) {
    const txt = await page.evaluate(el => el.textContent.trim(), btn);
    if (txt === 'Phone') { await btn.click(); break; }
  }
  await delay(2500);
  const numInput = await page.$('input[type="number"]');
  if (numInput) { await numInput.click({ clickCount: 3 }); await numInput.type(PHONE); }
  const passInput = await page.$('input[type="password"]');
  if (passInput) { await passInput.click({ clickCount: 3 }); await passInput.type(PASSWORD); }
  const submitBtn = await page.$('button[type="submit"]');
  if (submitBtn) await submitBtn.click();
  await delay(6000);
  console.log('After login:', page.url());

  // Navigate to room.examgoal.com and wait for Firebase to init
  console.log('Navigating to room to get Firebase token...');
  await page.goto(EXAM_ORIGIN, { waitUntil: 'networkidle2', timeout: 20000 });
  await delay(5000);

  // Try getting Firebase ID token from page context
  const tokenResult = await page.evaluate(async () => {
    // Method 1: window.__firebase__ 
    try {
      if (window.__firebase__) {
        const auth = window.__firebase__.auth();
        if (auth.currentUser) {
          return { method: 'window.__firebase__', token: await auth.currentUser.getIdToken() };
        }
      }
    } catch(e) {}

    // Method 2: Look for firebase in global scope
    try {
      const keys = Object.keys(window).filter(k => k.toLowerCase().includes('firebase'));
      console.log('Firebase-related window keys:', keys.join(', '));
    } catch(e) {}

    // Method 3: Try accessing firebase auth from the app's state
    try {
      // Nuxt apps often expose the firebase app as $fire or $firebase
      const nuxtApp = window.$nuxt;
      if (nuxtApp && nuxtApp.$fire && nuxtApp.$fire.auth) {
        const user = nuxtApp.$fire.auth.currentUser;
        if (user) return { method: 'nuxt.$fire', token: await user.getIdToken() };
      }
    } catch(e) {}

    // Method 4: Check localStorage for Firebase tokens
    try {
      const localKeys = Object.keys(localStorage).filter(k => k.includes('firebase') || k.includes('token'));
      const tokenData = {};
      for (const k of localKeys) {
        tokenData[k] = localStorage.getItem(k)?.substring(0, 100);
      }
      return { method: 'localStorage', keys: localKeys, data: tokenData };
    } catch(e) {}

    return { method: 'none', error: 'Could not find token' };
  });

  console.log('Token result:', JSON.stringify(tokenResult, null, 2).substring(0, 500));

  // Now navigate to test page and watch for auth token in requests
  console.log('\nNavigating to test page to watch for auth headers...');
  authToken = null;
  await page.goto(`${EXAM_ORIGIN}/tests/${TEST_ID}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await delay(10000);

  console.log('Auth token from requests:', authToken ? authToken.substring(0, 80) + '...' : 'NOT FOUND');

  // Try extracting token directly from the Firebase SDK
  if (!authToken) {
    const sdkToken = await page.evaluate(async () => {
      // Find any Firebase App instance
      const globalKeys = Object.getOwnPropertyNames(window);
      for (const key of globalKeys) {
        try {
          const val = window[key];
          if (val && typeof val === 'object') {
            if (val.auth && typeof val.auth === 'function') {
              const auth = val.auth();
              if (auth && auth.currentUser) {
                const token = await auth.currentUser.getIdToken(true);
                return { key, token: token.substring(0, 100) + '...', fullToken: token };
              }
            }
          }
        } catch(e) {}
      }
      
      // Try firebase/compat
      try {
        const apps = (window.firebase || {}).apps || [];
        if (apps.length > 0) {
          const auth = apps[0].auth();
          if (auth.currentUser) {
            const token = await auth.currentUser.getIdToken(true);
            return { method: 'firebase.apps[0]', fullToken: token };
          }
        }
      } catch(e) {}

      return null;
    });

    if (sdkToken) {
      authToken = sdkToken.fullToken;
      console.log('Found token via SDK:', JSON.stringify(sdkToken).substring(0, 200));
    }
  }

  if (authToken) {
    console.log('\n=== Testing session creation with Bearer token ===');
    const sessionResult = await page.evaluate(async (testId, origin, token) => {
      const bodies = [
        { testId, language: 'en' },
        { testId },
        { testId, language: 'en', platform: 'web' },
      ];
      const results = [];
      for (const body of bodies) {
        try {
          const r = await fetch(`${origin}/api/v1/test/user/session`, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(body),
          });
          const text = await r.text();
          results.push({ body, status: r.status, response: text.substring(0, 300) });
        } catch(e) {
          results.push({ body, error: e.message });
        }
      }
      return results;
    }, TEST_ID, EXAM_ORIGIN, authToken);

    console.log('Session results:');
    sessionResult.forEach(r => console.log(JSON.stringify(r)));
    fs.writeFileSync('debug_token_session.json', JSON.stringify({ authToken: authToken?.substring(0, 50) + '...', sessionResult }, null, 2));
  } else {
    console.log('Could not get auth token');
  }

  await browser.close();
}

main().catch(console.error);
