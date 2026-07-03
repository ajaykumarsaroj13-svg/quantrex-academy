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

  // Capture ALL POST API calls to find the submit endpoint
  page.on('request', async (request) => {
    const url = request.url();
    const method = request.method();
    if ((url.includes('/api/v1/') || url.includes('examgoal')) && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      const postData = request.postData() || '';
      console.log(`[${method}] ${url.replace(EXAM_ORIGIN, '')} body: ${postData.substring(0, 200)}`);
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

  // Navigate to test page to get session cookies
  await page.goto(`${EXAM_ORIGIN}/tests/${TEST_ID}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await delay(5000);
  console.log('Test page loaded');

  // Try direct API calls from page context to start session and submit
  console.log('\n=== Testing session creation ===');
  const result = await page.evaluate(async (testId, origin) => {
    const log = [];

    // 1. Try to start/create session
    const sessionEndpoints = [
      { url: `${origin}/api/v1/test/user/session`, method: 'POST', body: JSON.stringify({ testId }) },
      { url: `${origin}/api/v1/test/user/session/${testId}`, method: 'POST', body: '{}' },
      { url: `${origin}/api/v1/test/user/session/${testId}/start`, method: 'POST', body: '{}' },
      { url: `${origin}/api/v1/test/user/start`, method: 'POST', body: JSON.stringify({ testId }) },
      { url: `${origin}/api/v1/test/user/start/${testId}`, method: 'POST', body: '{}' },
    ];

    for (const ep of sessionEndpoints) {
      try {
        const r = await fetch(ep.url, {
          method: ep.method,
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: ep.body,
        });
        const text = await r.text();
        log.push({ url: ep.url, status: r.status, response: text.substring(0, 300) });
      } catch(e) {
        log.push({ url: ep.url, error: e.message });
      }
    }

    return log;
  }, TEST_ID, EXAM_ORIGIN);

  console.log('\nSession creation attempts:');
  result.forEach(r => console.log(JSON.stringify(r)));

  // Now try submit endpoints
  console.log('\n=== Testing submit endpoints ===');
  const submitResult = await page.evaluate(async (testId, origin) => {
    const log = [];
    const submitEndpoints = [
      { url: `${origin}/api/v1/test/user/submit/${testId}`, method: 'POST', body: '{}' },
      { url: `${origin}/api/v1/test/user/session/${testId}/submit`, method: 'POST', body: '{}' },
      { url: `${origin}/api/v1/test/user/session/${testId}`, method: 'PATCH', body: JSON.stringify({ status: 'submitted' }) },
    ];
    for (const ep of submitEndpoints) {
      try {
        const r = await fetch(ep.url, {
          method: ep.method,
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: ep.body,
        });
        const text = await r.text();
        log.push({ url: ep.url, method: ep.method, status: r.status, response: text.substring(0, 300) });
      } catch(e) {
        log.push({ url: ep.url, error: e.message });
      }
    }
    return log;
  }, TEST_ID, EXAM_ORIGIN);

  console.log('\nSubmit attempts:');
  submitResult.forEach(r => console.log(JSON.stringify(r)));

  fs.writeFileSync('debug_submit_apis.json', JSON.stringify({ result, submitResult }, null, 2));
  await browser.close();
}

main().catch(console.error);
