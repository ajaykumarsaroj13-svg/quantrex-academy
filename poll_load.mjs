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

  // Navigate to test
  console.log('Navigating to test...');
  await page.goto(`${EXAM_ORIGIN}/tests/tst-19g61moahy6ef`, { waitUntil: 'networkidle2' });

  // Poll page status every 2 seconds for 20 seconds
  for (let s = 2; s <= 20; s += 2) {
    await delay(2000);
    const state = await page.evaluate(() => {
      const text = document.body.innerText;
      const hasWait = text.includes('Please wait...');
      const hasQText = text.includes('Simplify');
      const buttons = Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim()).filter(Boolean);
      return { hasWait, hasQText, buttons: buttons.slice(0, 8), textLength: text.length };
    });
    console.log(`At ${s}s | hasWait: ${state.hasWait} | hasQText: ${state.hasQText} | textLength: ${state.textLength} | buttons:`, state.buttons);
    if (!state.hasWait && state.hasQText) {
      console.log('Page loaded successfully!');
      break;
    }
  }

  await page.screenshot({ path: 'test_loaded_poll.png' });
  await browser.close();
}

main().catch(console.error);
