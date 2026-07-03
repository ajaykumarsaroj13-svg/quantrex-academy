import puppeteer from 'puppeteer';
import fs from 'fs';

const PHONE = '7750858874';
const PASSWORD = '12345678';
const EXAM_ORIGIN = 'https://room.examgoal.com';
const TEST_ID = 'tst-19g61mo679bu2'; // Has active session

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1000 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

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

  // Navigate to test
  await page.goto(`${EXAM_ORIGIN}/tests/${TEST_ID}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await delay(5000);

  // Now try every possible endpoint to get answers/analysis
  const results = await page.evaluate(async (testId, origin) => {
    const r = {};
    
    const tryEndpoint = async (url, method='GET', body=null) => {
      try {
        const opts = { method, credentials: 'include', headers: {} };
        if (body) { opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }
        const resp = await fetch(origin + url, opts);
        const text = await resp.text();
        return { status: resp.status, body: text.substring(0, 800) };
      } catch(e) { return { error: e.message }; }
    };

    // 1. Get session details for this test
    r.session_get = await tryEndpoint(`/api/v1/test/user/session/${testId}`);
    
    // 2. Try analysis endpoints
    r.analysis_get = await tryEndpoint(`/api/v1/test/user/analysis/${testId}`);
    r.analyses_plural = await tryEndpoint(`/api/v1/test/user/analyses/${testId}`);
    r.analysis_list = await tryEndpoint(`/api/v1/test/user/analysis?testId=${testId}`);
    r.analysis_history = await tryEndpoint(`/api/v1/test/user/analysis/${testId}/history`);
    
    // 3. Try to get full test with answers (review mode)
    r.test_review = await tryEndpoint(`/api/v1/test/user/test/${testId}?mode=review`);
    r.test_answers = await tryEndpoint(`/api/v1/test/user/test/${testId}/answers`);
    r.test_solution = await tryEndpoint(`/api/v1/test/user/test/${testId}/solution`);
    
    // 4. Try v2 endpoints
    r.v2_analysis = await tryEndpoint(`/api/v2/test/user/analysis/${testId}`);
    r.v2_session = await tryEndpoint(`/api/v2/test/user/session/${testId}`);
    
    // 5. Try question-level endpoints
    r.question_answers = await tryEndpoint(`/api/v1/test/${testId}/answers`);
    r.question_solutions = await tryEndpoint(`/api/v1/test/${testId}/solutions`);

    // 6. Try to get the current session with full data
    r.session_full = await tryEndpoint(`/api/v1/test/user/session/${testId}?full=true`);
    r.session_with_answers = await tryEndpoint(`/api/v1/test/user/session/${testId}?include=answers`);
    
    // 7. Try test series endpoint
    r.series_test = await tryEndpoint(`/api/v1/test/series/test/${testId}`);
    r.series_analysis = await tryEndpoint(`/api/v1/test/series/analysis/${testId}`);
    
    // 8. Try to get analysis by analysisId if we can find it in the session
    // First get session to find analysisId
    try {
      const sessResp = await fetch(`${origin}/api/v1/test/user/session/${testId}`, { credentials: 'include' });
      const sessData = await sessResp.json();
      r._session_raw = JSON.stringify(sessData).substring(0, 1000);
      
      if (sessData && sessData.data && sessData.data.analysisId) {
        const analysisId = sessData.data.analysisId;
        r.analysis_by_id = await tryEndpoint(`/api/v1/test/user/analysis/${testId}/${analysisId}`);
        r.analysis_direct = await tryEndpoint(`/api/v1/test/analysis/${analysisId}`);
      }
    } catch(e) {}
    
    return r;
  }, TEST_ID, EXAM_ORIGIN);

  console.log('\n=== ENDPOINT EXPLORATION RESULTS ===');
  for (const [key, val] of Object.entries(results)) {
    console.log(`\n--- ${key} ---`);
    console.log(JSON.stringify(val));
  }

  fs.writeFileSync('endpoint_explore.json', JSON.stringify(results, null, 2));
  await browser.close();
}

main().catch(console.error);
