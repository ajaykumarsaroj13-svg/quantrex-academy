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

  // Intercept requests (NOT responses) to print postData
  page.on('request', (request) => {
    const url = request.url();
    const method = request.method();
    if (url.includes('/api/v1/test/user/') && method === 'POST') {
      console.log(`\n[POST Request] URL: ${url}`);
      console.log(`Payload: ${request.postData()}`);
    }
  });

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

  // Navigate to test
  await page.goto(`${EXAM_ORIGIN}/tests/tst-19g61moahy6ef`, { waitUntil: 'networkidle2' }).catch(() => {});
  await delay(4000);

  // Click Submit Test 1
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim().includes('Submit Test') && !b.className.includes('bg-gradient-to-r'));
    if (btn) btn.click();
  });
  await delay(2000);

  // Click Submit Test 2
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim().includes('Submit Test') && b.className.includes('bg-gradient-to-r') && b.offsetParent !== null);
    if (btn) btn.click();
  });
  await delay(4000);

  await browser.close();
}

main().catch(console.error);
