import puppeteer from 'puppeteer';
import fs from 'fs';

const PHONE = '7750858874';
const PASSWORD = '12345678';
const EXAM_ORIGIN = 'https://room.examgoal.com';

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1000 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  // Login
  await page.goto('https://accounts.examgoal.com/login?redirect=https://room.examgoal.com', { waitUntil: 'networkidle2' });
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
  await delay(5000);
  console.log('Logged in:', !page.url().includes('/login'));

  // Go to Logarithm Test - 1 page to establish session/auth
  const TEST_ID = 'tst-19g61moahy6ef';
  await page.goto(`${EXAM_ORIGIN}/tests/${TEST_ID}`, { waitUntil: 'networkidle2' });
  await delay(4000);

  // Click I Understand if present
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.trim() === 'I Understand');
    if (btn) btn.click();
  });
  await delay(1000);

  // Try different solution endpoints
  const endpoints = [
    `/api/v1/test/user/test/${TEST_ID}/solutions`,
    `/api/v1/test/user/test/${TEST_ID}/analysis`,
    `/api/v1/test/user/test/${TEST_ID}/result`,
    `/api/v1/test/user/test/${TEST_ID}/answer-key`,
    `/api/v1/test/user/session/${TEST_ID}/solutions`,
    `/api/v1/test/user/test/${TEST_ID}?solutions=true`,
    `/api/v1/test/user/test/${TEST_ID}?with_answers=true`,
    `/api/v1/test/user/test/${TEST_ID}?mode=solutions`,
  ];

  for (const ep of endpoints) {
    const result = await page.evaluate(async (origin, apiPath) => {
      try {
        const res = await fetch(origin + apiPath, { credentials: 'include' });
        if (!res.ok) return { ep: apiPath, ok: false, status: res.status };
        const json = await res.json();
        return { ep: apiPath, ok: true, keys: Object.keys(json?.data || {}) };
      } catch(e) { return { ep: apiPath, error: e.toString() }; }
    }, EXAM_ORIGIN, ep);
    console.log('Try endpoint:', result);
  }

  await browser.close();
}

main().catch(e => { console.error(e); process.exit(1); });
