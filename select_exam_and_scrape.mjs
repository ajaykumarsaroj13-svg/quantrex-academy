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

  // Navigate to Dashboard
  await page.goto(`${EXAM_ORIGIN}/dashboard`, { waitUntil: 'networkidle2' });
  await delay(4000);

  // Dismiss "I Understand" popup if present
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'I Understand');
    if (btn) btn.click();
  });
  await delay(2000);
  await page.screenshot({ path: 'dashboard_before_select.png' });

  // Print all clickable elements containing "JEE Main"
  const clickJEE = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll('*'));
    // Look for cards, buttons, or divs containing "JEE Main"
    const jee = elements.find(el => {
      const txt = el.textContent.trim();
      return (txt === 'JEE Main' || txt === 'JEE Main 2027' || txt === 'JEE Main/Advanced') && el.childElementCount === 0;
    });
    if (jee) {
      // Click the element or its parent
      const clickable = jee.closest('button') || jee.closest('a') || jee;
      clickable.click();
      return `Clicked element: ${jee.tagName} with text ${jee.textContent.trim()}`;
    }
    return 'JEE Main element not found';
  });
  console.log('JEE Main Click result:', clickJEE);
  await delay(4000);
  await page.screenshot({ path: 'dashboard_after_select.png' });

  // Let's dump all text to verify if goal is set
  const text = await page.evaluate(() => document.body.innerText);
  console.log('Dashboard Text after select:', text.slice(0, 500));

  // Navigate to test
  console.log('Navigating to test...');
  await page.goto(`${EXAM_ORIGIN}/tests/tst-19g61moahy6ef`, { waitUntil: 'networkidle2' });
  await delay(5000);

  const testState = await page.evaluate(() => {
    const txt = document.body.innerText;
    return {
      url: window.location.href,
      hasWait: txt.includes('Please wait...'),
      hasQText: txt.includes('Simplify'),
      textLength: txt.length
    };
  });
  console.log('Test Page poll state:', testState);
  await page.screenshot({ path: 'test_page_after_select.png' });

  await browser.close();
}

main().catch(console.error);
