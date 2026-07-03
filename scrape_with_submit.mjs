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

  const capturedApis = {};
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('/api/')) {
      try {
        const json = await response.json();
        capturedApis[url] = json;
        console.log(`Captured API: ${url.replace(EXAM_ORIGIN, '')}`);
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

  // Navigate to the test page
  const TEST_ID = 'tst-19g61moahy6ef';
  await page.goto(`${EXAM_ORIGIN}/tests/${TEST_ID}`, { waitUntil: 'networkidle2' });
  await delay(4000);

  // Dismiss modal if present
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.trim() === 'I Understand');
    if (btn) btn.click();
  });
  await delay(1000);

  // Step 1: Click "Submit Test" button
  console.log('Clicking first Submit Test...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const submit = btns.find(b => b.textContent.trim().includes('Submit Test'));
    if (submit) submit.click();
  });
  await delay(2000);
  await page.screenshot({ path: 'step1_after_submit_click.png' });

  // Step 2: Click the second "Submit Test" button in the modal
  console.log('Clicking confirmation Submit Test...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    // Find the one inside the modal card.
    const modalBtn = btns.find(b => b.textContent.trim().includes('Submit Test') && b.className.includes('bg-'));
    if (modalBtn) {
      modalBtn.click();
    } else {
      // Fallback: click any submit test button
      const allSubmits = btns.filter(b => b.textContent.trim().includes('Submit Test'));
      if (allSubmits.length > 0) {
        allSubmits[allSubmits.length - 1].click();
      }
    }
  });
  await delay(6000);
  console.log('Current URL after submit:', page.url());
  await page.screenshot({ path: 'step2_after_confirm.png' });

  // Step 3: We should be on results. Let's look for any button containing "Solutions" or "Analysis" and click it
  console.log('Searching for Solutions/Analysis button...');
  const solText = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll('button, a'));
    const sol = elements.find(el => {
      const txt = el.textContent.toLowerCase();
      return txt.includes('solution') || txt.includes('analysis') || txt.includes('view');
    });
    if (sol) {
      sol.click();
      return sol.textContent.trim();
    }
    return null;
  });
  console.log('Solutions button clicked:', solText);
  await delay(6000);
  console.log('Solutions Page URL:', page.url());
  await page.screenshot({ path: 'step3_solutions_page.png' });

  // Save all captured APIs
  fs.writeFileSync('submit_apis.json', JSON.stringify(capturedApis, null, 2));
  console.log('Saved all captured APIs to submit_apis.json');

  await browser.close();
}

main().catch(e => { console.error(e); process.exit(1); });
