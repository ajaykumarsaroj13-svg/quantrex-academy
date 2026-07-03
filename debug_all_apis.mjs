import puppeteer from 'puppeteer';
import fs from 'fs';

const PHONE = '7750858874';
const PASSWORD = '12345678';
const EXAM_ORIGIN = 'https://room.examgoal.com';
const TEST_ID = 'tst-19g61mnpzhlyq'; // Units and Measurement Test-1

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1000 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  // Capture ALL API responses
  const captured = {};
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('/api/v1/') || url.includes('examgoal.com/api')) {
      try {
        const text = await response.text();
        const json = JSON.parse(text);
        const key = url.replace(/.*examgoal\.com/, '');
        captured[key] = json;
        console.log(`CAPTURED: ${key} (keys: ${JSON.stringify(Object.keys(json)).substring(0,100)})`);
      } catch(e) {}
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
  console.log('After login URL:', page.url());

  // Navigate to test page
  console.log('Navigating to test page...');
  await page.goto(`${EXAM_ORIGIN}/tests/${TEST_ID}`, { waitUntil: 'domcontentloaded', timeout: 25000 });
  console.log('Page loaded, waiting 10s for API calls...');
  await delay(10000);

  console.log('\n=== All captured API endpoints ===');
  const keys = Object.keys(captured);
  console.log('Total endpoints:', keys.length);
  for (const k of keys) {
    const d = captured[k];
    console.log(`\n--- ${k} ---`);
    console.log(JSON.stringify(d).substring(0, 500));
  }

  // Also try direct fetch from page context
  console.log('\n=== Direct API fetch from page ===');
  const directResult = await page.evaluate(async (testId, origin) => {
    const results = {};
    const endpoints = [
      `/api/v1/test/user/session/${testId}`,
      `/api/v1/test/user/test/${testId}`,
      `/api/v1/test/${testId}`,
      `/api/v1/test/user/start/${testId}`,
    ];
    for (const ep of endpoints) {
      try {
        const r = await fetch(`${origin}${ep}`, { credentials: 'include' });
        const text = await r.text();
        results[ep] = { status: r.status, data: text.substring(0, 500) };
      } catch(e) {
        results[ep] = { error: e.message };
      }
    }
    return results;
  }, TEST_ID, EXAM_ORIGIN);

  console.log(JSON.stringify(directResult, null, 2).substring(0, 3000));

  // Save all captured data
  fs.writeFileSync('debug_all_apis.json', JSON.stringify({ captured, directResult }, null, 2));
  console.log('\nSaved to debug_all_apis.json');

  await browser.close();
}

main().catch(console.error);
