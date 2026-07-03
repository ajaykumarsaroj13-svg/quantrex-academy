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

  // Intercept responses to catch the submitted results API calls
  const captured = {};
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('/api/')) {
      try {
        const json = await response.json();
        captured[url] = json;
        console.log('Intercepted API:', url.replace(EXAM_ORIGIN, ''));
      } catch(e){}
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

  // Navigate to test
  await page.goto(`${EXAM_ORIGIN}/tests/tst-19g61moahy6ef`, { waitUntil: 'networkidle2' });
  await delay(4000);
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'I Understand');
    if (btn) btn.click();
  });
  await delay(1000);

  // Step 1: Click the outer "Submit Test" button (the one in the side panel)
  console.log('Clicking outer submit button...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    // Select the button with text containing 'Submit Test' that is in the right side panel
    const outerBtn = buttons.find(b => b.textContent.trim().includes('Submit Test') && !b.className.includes('bg-gradient-to-r'));
    if (outerBtn) outerBtn.click();
  });
  await delay(2500);

  // Step 2: Click the green confirmation "Submit Test" button inside the modal
  console.log('Clicking modal submit button...');
  const modalClicked = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    // Select the button inside the modal that is visible (offsetParent is not null) and has bg-gradient-to-r class
    const modalBtn = buttons.find(b => b.textContent.trim().includes('Submit Test') && b.className.includes('bg-gradient-to-r') && b.offsetParent !== null);
    if (modalBtn) {
      modalBtn.click();
      return 'Clicked!';
    }
    return 'Not found';
  });
  console.log('Modal clicked:', modalClicked);
  await delay(8000);

  console.log('URL after submit:', page.url());
  await page.screenshot({ path: 'after_successful_submit.png' });

  // Save captured APIs
  fs.writeFileSync('submit_apis.json', JSON.stringify(captured, null, 2));
  console.log('Saved captured APIs to submit_apis.json');

  await browser.close();
}

main().catch(console.error);
