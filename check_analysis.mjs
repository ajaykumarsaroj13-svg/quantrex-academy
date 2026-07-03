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

  // Go to Logarithm Test - 1 page
  const TEST_ID = 'tst-19g61moahy6ef';
  await page.goto(`${EXAM_ORIGIN}/tests/${TEST_ID}`, { waitUntil: 'networkidle2' });
  await delay(4000);

  // Query analysis endpoint
  const analysisResult = await page.evaluate(async (origin, tid) => {
    try {
      const res = await fetch(`${origin}/api/v1/test/user/test/${tid}/analysis`, { credentials: 'include' });
      const json = await res.json();
      return json;
    } catch(e) { return { error: e.toString() }; }
  }, EXAM_ORIGIN, TEST_ID);

  fs.writeFileSync('analysis_response.json', JSON.stringify(analysisResult, null, 2));
  console.log('Saved analysis response keys:', Object.keys(analysisResult?.data || {}));
  
  if (analysisResult?.data) {
    const data = analysisResult.data;
    if (data.sections) {
      console.log('Sections count in analysis:', data.sections.length);
      const firstSec = data.sections[0];
      if (firstSec.questions && firstSec.questions.length > 0) {
        const firstQ = firstSec.questions[0];
        console.log('First question keys in analysis:', Object.keys(firstQ));
        console.log('First question en keys in analysis:', Object.keys(firstQ.question?.en || {}));
      }
    }
  }

  await browser.close();
}

main().catch(e => { console.error(e); process.exit(1); });
