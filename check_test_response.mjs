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

  // Intercept the test load API response
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('test/user/test') || url.includes('test/user/session')) {
      try {
        const status = response.status();
        const json = await response.json();
        console.log(`\nURL: ${url}`);
        console.log(`HTTP Status: ${status}`);
        console.log('Response JSON:', JSON.stringify(json, null, 2));
      } catch(e) {
        console.log(`Failed to parse JSON for URL: ${url}`);
      }
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
  console.log('Navigating to test...');
  await page.goto(`${EXAM_ORIGIN}/tests/tst-19g61moahy6ef`, { waitUntil: 'networkidle2' }).catch(() => {});
  await delay(5000);

  await browser.close();
}

main().catch(console.error);
