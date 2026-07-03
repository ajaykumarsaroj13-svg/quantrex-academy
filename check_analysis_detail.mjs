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

  // Go to Logarithm Test - 1 page to establish session
  const TEST_ID = 'tst-19g61moahy6ef';
  await page.goto(`${EXAM_ORIGIN}/tests/${TEST_ID}`, { waitUntil: 'networkidle2' });
  await delay(4000);

  const ANALYSIS_ID = '712bfdb7-8929-44f1-b1f8-00e86c7a9e82';
  const urls = [
    `/api/v1/test/user/analysis/${ANALYSIS_ID}`,
    `/api/v1/test/user/test/${TEST_ID}/analysis/${ANALYSIS_ID}`,
    `/api/v1/test/user/analysis/${ANALYSIS_ID}?out_of_syllabus=false`,
  ];

  for (const u of urls) {
    const result = await page.evaluate(async (origin, apiPath) => {
      try {
        const res = await fetch(origin + apiPath, { credentials: 'include' });
        if (!res.ok) return { ep: apiPath, ok: false, status: res.status };
        const json = await res.json();
        return { ep: apiPath, ok: true, keys: Object.keys(json?.data || {}), data: json.data };
      } catch(e) { return { ep: apiPath, error: e.toString() }; }
    }, EXAM_ORIGIN, u);
    
    console.log('Result for:', result.ep, 'ok:', result.ok);
    if (result.ok && result.data) {
      fs.writeFileSync(`analysis_detail_${urls.indexOf(u)}.json`, JSON.stringify(result.data, null, 2));
      console.log('Saved detail keys:', Object.keys(result.data));
      if (result.data.sections) {
        console.log('  Sections count:', result.data.sections.length);
        const firstSec = result.data.sections[0];
        if (firstSec.questions && firstSec.questions.length > 0) {
          const firstQ = firstSec.questions[0];
          console.log('  First question keys:', Object.keys(firstQ));
          // Look for correct answer fields inside the question or languages or en
          console.log('  First question representation:');
          const cleanQ = JSON.parse(JSON.stringify(firstQ));
          if (cleanQ.question) cleanQ.question = '...';
          console.log(JSON.stringify(cleanQ, null, 2));
        }
      }
    }
  }

  await browser.close();
}

main().catch(e => { console.error(e); process.exit(1); });
