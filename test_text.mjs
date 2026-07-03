import puppeteer from 'puppeteer';

const PHONE = '7750858874';
const PASSWORD = '12345678';
const EXAM_ORIGIN = 'https://room.examgoal.com';

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const browser = await puppeteer.launch({
    headless: false,
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

  // Navigate to test
  await page.goto(`${EXAM_ORIGIN}/tests/tst-19g61moahy6ef`, { waitUntil: 'networkidle2' });
  await delay(15000);

  const data = await page.evaluate(() => {
    return {
      url: window.location.href,
      text: document.body.innerText,
      hasSpinner: !!document.querySelector('.animate-spin') || document.body.innerHTML.includes('Please wait...')
    };
  });
  console.log('Final URL:', data.url);
  console.log('Final Text Length:', data.text.length);
  console.log('Has Spinner / Please wait:', data.hasSpinner);
  console.log('Page Text snippet:');
  console.log(data.text.slice(0, 1000));

  await browser.close();
}

main().catch(console.error);
