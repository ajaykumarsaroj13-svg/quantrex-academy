import puppeteer from 'puppeteer';
import fs from 'fs';

const PHONE = '7750858874';
const PASSWORD = '12345678';
const EXAM_ORIGIN = 'https://room.examgoal.com';
const TEST_ID = 'tst-19g61mo679bu2';

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1000 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  // Intercept the test_review response directly (no truncation)
  let reviewData = null;
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('/api/v1/test/user/test/') && url.includes('mode=review')) {
      try {
        const json = await response.json();
        reviewData = json;
        console.log('Intercepted review response!');
      } catch(e) {}
    }
  });

  // Login
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
  console.log('Logged in:', page.url());

  // Navigate to test first to set up session
  await page.goto(`${EXAM_ORIGIN}/tests/${TEST_ID}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await delay(3000);

  // Call the review endpoint from page context - capture FULL response
  const fullResult = await page.evaluate(async (testId, origin) => {
    try {
      const r = await fetch(`${origin}/api/v1/test/user/test/${testId}?mode=review`, { credentials: 'include' });
      const data = await r.json();
      return { status: r.status, data };
    } catch(e) { return { error: e.message }; }
  }, TEST_ID, EXAM_ORIGIN);

  console.log('Status:', fullResult.status);

  if (fullResult.data) {
    const d = fullResult.data.data;
    if (d && d.sections) {
      d.sections.forEach((sec, si) => {
        const qs = sec.questions || [];
        console.log(`\nSection ${si}: ${sec.title} - ${qs.length} questions`);
        qs.slice(0, 3).forEach((q, qi) => {
          const en = q.question?.en || {};
          console.log(`  Q${qi}: correct_options=${JSON.stringify(en.correct_options)}, answer=${en.answer}`);
          console.log(`       content[:60]: ${(en.content||'').substring(0, 60)}`);
          console.log(`       options count: ${(en.options||[]).length}`);
          console.log(`       en keys: ${Object.keys(en).join(', ')}`);
        });
      });
    }
    fs.writeFileSync('test_review_full.json', JSON.stringify(fullResult.data, null, 2));
    console.log('\nSaved full review data to test_review_full.json');
  } else {
    console.log('No data:', JSON.stringify(fullResult));
  }

  await browser.close();
}

main().catch(console.error);
