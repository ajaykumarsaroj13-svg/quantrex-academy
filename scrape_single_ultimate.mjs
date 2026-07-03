import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const PHONE = '7750858874';
const PASSWORD = '12345678';
const EXAM_ORIGIN = 'https://room.examgoal.com';
const SERIES_JSON = 'c:\\Users\\Admin\\.gemini\\antigravity\\scratch\\project_ajay2\\quantrex-mobile\\public\\data\\jee_main_ultimate_series_2027.json';
const OUTPUT_FILE = 'scraped_ultimate_questions.json';

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const series = JSON.parse(fs.readFileSync(SERIES_JSON, 'utf8'));
  const availableTests = series.filter(t => !t.isUpcoming);
  console.log(`Loaded ${series.length} tests. Available to scrape: ${availableTests.length}`);

  let scrapedData = {};
  if (fs.existsSync(OUTPUT_FILE)) {
    try {
      scrapedData = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
      console.log(`Loaded ${Object.keys(scrapedData).length} tests already scraped.`);
    } catch(e) {}
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1000 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  // Intercept analysis response
  let capturedAnalysis = null;
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('/api/v1/test/user/analysis/')) {
      try {
        const json = await response.url().includes('percentile') ? null : await response.json();
        if (json && json.data) {
          capturedAnalysis = json.data;
          console.log(`  ✓ Intercepted Analysis details for test`);
        }
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

  // Scrape one test as a proof of concept (Logarithm Test 1: tst-19g61moahy6ef)
  const targetTest = availableTests.find(t => t.testId === 'tst-19g61moahy6ef');
  if (!targetTest) {
    console.log('Target test not found in metadata!');
    await browser.close();
    return;
  }

  const tid = targetTest.testId;
  console.log(`\nScraping test: ${targetTest.title} (${tid})`);
  capturedAnalysis = null;

  // Go to test page
  await page.goto(`${EXAM_ORIGIN}/tests/${tid}`, { waitUntil: 'networkidle2' });
  await delay(4000);

  // Check if we are already redirected to analysis/solutions page
  let currentUrl = page.url();
  console.log('Current URL:', currentUrl);

  if (currentUrl.includes('/analysis/')) {
    // Already submitted in the past, analysis should have loaded
    console.log('Already on analysis page.');
  } else {
    // Not submitted yet, dismiss modal if present
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'I Understand');
      if (btn) btn.click();
    });
    await delay(1000);

    // Click submit
    console.log('Clicking outer submit...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim().includes('Submit Test') && !b.className.includes('bg-gradient-to-r'));
      if (btn) btn.click();
    });
    await delay(2500);

    // Click modal confirm submit
    console.log('Clicking inner modal submit...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim().includes('Submit Test') && b.className.includes('bg-gradient-to-r') && b.offsetParent !== null);
      if (btn) btn.click();
    });
    await delay(8000);
  }

  if (capturedAnalysis && capturedAnalysis.test) {
    console.log(`Success! Captured test data with sections.`);
    scrapedData[tid] = capturedAnalysis;
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(scrapedData, null, 2));
    console.log(`Saved scraped data to ${OUTPUT_FILE}`);
  } else {
    console.log(`Failed to capture analysis details.`);
  }

  await browser.close();
}

main().catch(console.error);
