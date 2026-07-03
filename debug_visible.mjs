import puppeteer from 'puppeteer';
import fs from 'fs';

const PHONE = '7750858874';
const PASSWORD = '12345678';
const EXAM_ORIGIN = 'https://room.examgoal.com';
const TEST_ID = 'tst-19g61mnpzhlyq';

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  // Run VISIBLE browser so Firebase auth can work properly
  const browser = await puppeteer.launch({
    headless: false,  // <-- VISIBLE MODE
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized'],
    defaultViewport: null
  });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  // Capture all API responses
  const captured = {};
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('/api/v1/test/user/')) {
      try {
        const json = await response.json();
        const key = url.replace(/.*examgoal\.com/, '');
        captured[key] = json;
        console.log(`API: ${key}`);
      } catch(e) {}
    }
  });

  page.on('request', (req) => {
    const url = req.url();
    const method = req.method();
    if (url.includes('/api/v1/test/user/') && method !== 'GET') {
      console.log(`[${method}] ${url.replace(EXAM_ORIGIN, '')} body: ${(req.postData()||'').substring(0, 200)}`);
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

  // Navigate to test
  console.log('Navigating to test...');
  await page.goto(`${EXAM_ORIGIN}/tests/${TEST_ID}`, { waitUntil: 'domcontentloaded', timeout: 25000 });

  // Wait up to 20 seconds for spinner to disappear
  console.log('Waiting for page to load (up to 20s)...');
  try {
    await page.waitForFunction(() => !document.body.innerText.includes('Please wait...'), { timeout: 20000 });
    console.log('Spinner gone!');
  } catch(e) {
    console.log('Spinner still showing after 20s');
  }

  const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 500));
  console.log('Page body text:', bodyText);

  const htmlSample = await page.evaluate(() => document.body.innerHTML.substring(0, 2000));
  console.log('HTML sample:', htmlSample);

  await page.screenshot({ path: 'visible_test_page.png' });

  // Try to get attempt count from page or API
  const attemptInfo = await page.evaluate(async (testId, origin) => {
    try {
      const r = await fetch(`${origin}/api/v1/test/user/test/${testId}?out_of_syllabus=false`, { credentials: 'include' });
      const d = await r.json();
      return {
        maxAttempt: d.data?.maxAttempt,
        status: r.status,
        testId: d.data?.testId
      };
    } catch(e) {
      return { error: e.message };
    }
  }, TEST_ID, EXAM_ORIGIN);
  console.log('Attempt info:', JSON.stringify(attemptInfo));

  // Check attempt count from analysis endpoint
  const analysisCheck = await page.evaluate(async (testId, origin) => {
    try {
      const r = await fetch(`${origin}/api/v1/test/user/analysis/${testId}`, { credentials: 'include' });
      const text = await r.text();
      return { status: r.status, response: text.substring(0, 500) };
    } catch(e) {
      return { error: e.message };
    }
  }, TEST_ID, EXAM_ORIGIN);
  console.log('Analysis check:', JSON.stringify(analysisCheck));

  fs.writeFileSync('visible_debug_result.json', JSON.stringify({ captured, attemptInfo, analysisCheck, bodyText }, null, 2));
  console.log('\nSaved to visible_debug_result.json');
  console.log('Browser will close in 5 seconds...');
  await delay(5000);

  await browser.close();
}

main().catch(console.error);
