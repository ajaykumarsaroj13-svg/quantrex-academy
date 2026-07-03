import puppeteer from 'puppeteer';

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
    if ((await page.evaluate(el => el.textContent.trim(), btn)) === 'Phone') { await btn.click(); break; }
  }
  await delay(2500);
  await (await page.$('input[type="number"]')).type(PHONE);
  await (await page.$('input[type="password"]')).type(PASSWORD);
  await (await page.$('button[type="submit"]')).click();
  await delay(5000);

  // Navigate to test page to get cookie context
  await page.goto(`${EXAM_ORIGIN}/tests/tst-19g61moahy6ef`, { waitUntil: 'networkidle2' }).catch(() => {});
  await delay(3000);

  // Attempt direct POST to start session
  const sessionResult = await page.evaluate(async (origin) => {
    try {
      const res = await fetch(`${origin}/api/v1/test/user/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testId: 'tst-19g61moahy6ef', language: 'en' }),
        credentials: 'include'
      });
      return { status: res.status, json: await res.json() };
    } catch(e) { return { error: e.toString() }; }
  }, EXAM_ORIGIN);
  console.log('Session POST result:', JSON.stringify(sessionResult, null, 2));

  // If session created or already exists, let's try direct POST to submit test!
  const submitResult = await page.evaluate(async (origin) => {
    try {
      const res = await fetch(`${origin}/api/v1/test/user/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testId: 'tst-19g61moahy6ef', timeSpent: 2000, state: {} }),
        credentials: 'include'
      });
      return { status: res.status, json: await res.json() };
    } catch(e) { return { error: e.toString() }; }
  }, EXAM_ORIGIN);
  console.log('Submit POST result:', JSON.stringify(submitResult, null, 2));

  await browser.close();
}

main().catch(console.error);
