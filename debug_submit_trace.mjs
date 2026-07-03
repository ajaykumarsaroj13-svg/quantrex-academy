import puppeteer from 'puppeteer';
import fs from 'fs';

const PHONE = '7750858874';
const PASSWORD = '12345678';
const EXAM_ORIGIN = 'https://room.examgoal.com';
// Use test #2 which had active session (SECTION A | SECTION B)
const TEST_ID = 'tst-19g61mo679bu2';

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1000 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  // Capture ALL API calls - requests AND responses
  const allRequests = [];
  const allResponses = [];

  page.on('request', (req) => {
    const url = req.url();
    if (url.includes('examgoal') && url.includes('/api/')) {
      allRequests.push({
        method: req.method(),
        url: url.replace(EXAM_ORIGIN, ''),
        body: (req.postData() || '').substring(0, 200)
      });
    }
  });

  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('examgoal') && url.includes('/api/')) {
      try {
        const text = await response.text();
        allResponses.push({
          url: url.replace(EXAM_ORIGIN, ''),
          status: response.status(),
          body: text.substring(0, 500)
        });
      } catch(e) {}
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

  // Clear captured data
  allRequests.length = 0;
  allResponses.length = 0;

  // Navigate to test
  console.log('\nNavigating to test...');
  await page.goto(`${EXAM_ORIGIN}/tests/${TEST_ID}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await delay(5000);

  const state1 = await page.evaluate(() => ({
    url: location.href,
    buttons: Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim().substring(0, 30)).filter(t => t.length > 0),
    bodyText: document.body.innerText.substring(0, 300)
  }));
  console.log('State after load:', JSON.stringify(state1, null, 2));
  await page.screenshot({ path: 'submit_debug_1.png' });

  // Clear captured again
  allRequests.length = 0;
  allResponses.length = 0;

  // Click outer Submit Test
  console.log('\nClicking outer Submit Test...');
  const outerClicked = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.trim().includes('Submit Test') && !b.className.includes('bg-gradient'));
    if (btn) {
      console.log('Found outer btn class:', btn.className.substring(0, 100));
      btn.click();
      return true;
    }
    return false;
  });
  console.log('Outer click result:', outerClicked);
  await delay(2500);
  await page.screenshot({ path: 'submit_debug_2.png' });

  const state2 = await page.evaluate(() => ({
    url: location.href,
    buttons: Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim().substring(0, 40)).filter(t => t.length > 0 && t.length < 40),
    bodyText: document.body.innerText.substring(0, 500)
  }));
  console.log('State after outer click:', JSON.stringify(state2, null, 2));

  // Click confirm Submit Test in modal
  console.log('\nClicking confirm Submit Test...');
  const innerClicked = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    // Log all buttons for debugging
    const allBtns = btns.map(b => ({
      text: b.textContent.trim().substring(0, 50),
      class: b.className.substring(0, 80),
      visible: b.offsetParent !== null,
      disabled: b.disabled
    }));
    console.log('All buttons:', JSON.stringify(allBtns));

    // Try gradient button
    let btn = btns.find(b => b.textContent.trim().includes('Submit Test') && b.className.includes('bg-gradient') && b.offsetParent !== null);
    if (!btn) btn = btns.find(b => b.textContent.trim().includes('Submit Test') && !b.disabled && b.offsetParent !== null);
    if (btn) { btn.click(); return { clicked: true, class: btn.className.substring(0, 100) }; }
    return { clicked: false };
  });
  console.log('Inner click result:', JSON.stringify(innerClicked));
  await delay(3000);
  await page.screenshot({ path: 'submit_debug_3.png' });

  const state3 = await page.evaluate(() => ({
    url: location.href,
    bodyText: document.body.innerText.substring(0, 300)
  }));
  console.log('State after inner click:', JSON.stringify(state3));

  // Wait more and check
  await delay(8000);
  const state4 = await page.evaluate(() => ({
    url: location.href,
    bodyText: document.body.innerText.substring(0, 500)
  }));
  console.log('State after waiting:', JSON.stringify(state4));

  console.log('\n=== ALL API REQUESTS AFTER SUBMIT ===');
  allRequests.forEach(r => console.log(JSON.stringify(r)));

  console.log('\n=== ALL API RESPONSES AFTER SUBMIT ===');
  allResponses.forEach(r => console.log(JSON.stringify(r)));

  fs.writeFileSync('submit_debug_result.json', JSON.stringify({ allRequests, allResponses, state1, state2, state3, state4 }, null, 2));
  console.log('\nSaved to submit_debug_result.json');

  await browser.close();
}

main().catch(console.error);
