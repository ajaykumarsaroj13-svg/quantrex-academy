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

  // Intercept all API responses
  const capturedApis = {};
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('examgoal.com/api') || url.includes('/api/')) {
      try {
        const json = await response.json();
        capturedApis[url] = json;
        console.log(`Captured API: ${url.replace(EXAM_ORIGIN, '')} | status: ${json?.statusCode}`);
      } catch(e) {}
    }
  });

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

  // Go to Logarithm Test - 1
  const TEST_ID = 'tst-19g61moahy6ef';
  console.log(`\nNavigating to: ${EXAM_ORIGIN}/tests/${TEST_ID}`);
  await page.goto(`${EXAM_ORIGIN}/tests/${TEST_ID}`, { waitUntil: 'networkidle2', timeout: 30000 }).catch(e => console.log('Navigation error:', e));
  await delay(6000);
  await page.screenshot({ path: 'log_test_page.png' });

  // Save captured APIs to a JSON file
  fs.writeFileSync('log_test_apis.json', JSON.stringify(capturedApis, null, 2));
  console.log('\nSaved captured APIs to log_test_apis.json');

  await browser.close();
}

main().catch(e => { console.error(e); process.exit(1); });
