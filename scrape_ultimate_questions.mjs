import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const PHONE = '7750858874';
const PASSWORD = '12345678';

const TESTS_DIR = 'c:\\Users\\Admin\\.gemini\\antigravity\\scratch\\project_ajay2\\quantrex-mobile\\public\\data\\tests';
const WEB_TESTS_DIR = 'c:\\Users\\Admin\\.gemini\\antigravity\\scratch\\project_ajay2\\quantrex-academy\\public\\data\\tests';
const SERIES_JSON = 'c:\\Users\\Admin\\.gemini\\antigravity\\scratch\\project_ajay2\\quantrex-mobile\\public\\data\\jee_main_ultimate_series_2027.json';
const OUTPUT_FILE = 'scraped_ultimate_questions.json';
const EXAM_ORIGIN = 'https://room.examgoal.com';

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function loginToExamGoal(page) {
  console.log('Logging in to ExamGoal...');
  await page.goto('https://accounts.examgoal.com/login?redirect=https://room.examgoal.com', {
    waitUntil: 'networkidle2', timeout: 30000
  });
  await delay(2000);

  // Click Phone tab
  const phoneBtns = await page.$$('button');
  for (const btn of phoneBtns) {
    const txt = await page.evaluate(el => el.textContent.trim(), btn);
    if (txt === 'Phone') { await btn.click(); break; }
  }
  await delay(2500);

  // Fill phone number (type="number")
  const numberInput = await page.$('input[type="number"]');
  if (numberInput) {
    await numberInput.click({ clickCount: 3 });
    await numberInput.type(PHONE);
  }
  await delay(800);

  // Fill password
  const passInput = await page.$('input[type="password"]');
  if (passInput) {
    await passInput.click({ clickCount: 3 });
    await passInput.type(PASSWORD);
  }
  await delay(800);

  // Submit
  const submitBtn = await page.$('button[type="submit"]');
  if (submitBtn) await submitBtn.click();

  await delay(6000);
  const loggedIn = !page.url().includes('/login');
  console.log(`Login ${loggedIn ? '✓ success' : '✗ FAILED'} | URL: ${page.url()}`);
  return loggedIn;
}

function transformQuestion(rawQ, testMeta) {
  const content = rawQ.questionText || rawQ.content || rawQ.text || rawQ.question || '';
  const rawOptions = rawQ.options || [];
  const options = rawOptions.map(o => {
    if (typeof o === 'string') return o;
    return o.content || o.text || o.value || o.option || '';
  });

  let correctOptionIndex = rawQ.correctOption ?? rawQ.correctOptionIndex ?? 0;
  if (typeof correctOptionIndex === 'string') {
    const map = { 'A': 0, 'B': 1, 'C': 2, 'D': 3, 'a': 0, 'b': 1, 'c': 2, 'd': 3 };
    correctOptionIndex = map[correctOptionIndex] ?? parseInt(correctOptionIndex) ?? 0;
  }

  const qType = rawQ.questionType || rawQ.type || (options.length === 0 ? 'NUMERICAL' : 'MCQ');

  return {
    id: rawQ.id || rawQ._id || rawQ.questionId || `q_${Math.random().toString(36).slice(2, 10)}`,
    questionNumber: rawQ.questionNumber || rawQ.order || 0,
    questionText: content,
    options,
    correctOption: correctOptionIndex,
    correctAnswer: rawQ.correctAnswer || rawQ.numericalAnswer || rawQ.answer || '',
    questionType: qType,
    marks: rawQ.marks ?? 4,
    negativeMarks: rawQ.negativeMarks ?? -1,
    subject: rawQ.subject || testMeta?.groupName || '',
    topic: rawQ.topic || testMeta?.sectionName || '',
    section: rawQ.section || 'A',
    difficulty: rawQ.difficulty || 'Medium',
    solution: rawQ.solution || rawQ.explanation || '',
    instruction: rawQ.instruction || '',
    examSource: 'ultimate-series-2027'
  };
}

async function fetchTestQuestionsAPI(page, testId) {
  // Try multiple API endpoints
  const endpoints = [
    `/api/v1/test/test-id-series/${testId}?section=0`,
    `/api/v1/test/test-id-series/${testId}?section=0&page=1&limit=100`,
    `/api/v1/test/${testId}/questions`,
    `/api/v1/test/${testId}`,
    `/api/v1/test/session/${testId}`,
  ];

  for (const ep of endpoints) {
    const result = await page.evaluate(async (origin, apiPath) => {
      try {
        const res = await fetch(origin + apiPath, { credentials: 'include' });
        if (!res.ok) return null;
        const json = await res.json();
        return json;
      } catch(e) { return null; }
    }, EXAM_ORIGIN, ep);

    if (!result || result.statusCode !== 0 || !result.data) continue;

    const data = result.data;
    // Try all possible question locations
    const qs = data.questions ||
      (Array.isArray(data) ? data : null) ||
      data.test?.questions ||
      data.testSections?.flatMap(s => s.questions || []) ||
      null;

    if (qs && qs.length > 0) {
      return { questions: qs, endpoint: ep };
    }
  }
  return null;
}

async function main() {
  console.log('=== ExamGoal Ultimate Series Scraper v3 ===\n');

  const series = JSON.parse(fs.readFileSync(SERIES_JSON, 'utf8'));
  const availableTests = series.filter(t => !t.isUpcoming);
  console.log(`Total tests: ${series.length} | Available: ${availableTests.length}\n`);

  // Load existing scraped data if any
  let allScraped = {};
  if (fs.existsSync(OUTPUT_FILE)) {
    allScraped = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
    console.log(`Loaded ${Object.keys(allScraped).length} already scraped tests\n`);
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  // Intercept question API responses from network
  const netCaught = {};
  page.on('response', async (response) => {
    const url = response.url();
    if (!url.includes('examgoal.com/api')) return;
    if (!url.includes('/test/') && !url.includes('/session/')) return;

    try {
      const json = await response.json();
      if (json?.statusCode === 0 && json?.data) {
        const data = json.data;
        const qs = data.questions ||
          (Array.isArray(data) ? data : null) ||
          data.test?.questions;

        if (qs && qs.length > 0) {
          // Extract testId from URL
          const match = url.match(/tst-[a-z0-9]+/);
          const key = match ? match[0] : url;
          netCaught[key] = qs;
          console.log(`  [NET] ${key}: ${qs.length} questions from ${url.split('?')[0].split('/').slice(-2).join('/')}`);
        }
      }
    } catch(e) {}
  });

  // Login
  const loggedIn = await loginToExamGoal(page);
  if (!loggedIn) {
    console.error('LOGIN FAILED - stopping');
    await browser.close();
    return;
  }

  // Navigate to test series page first (loads cookies/session properly)
  console.log('\nNavigating to Ultimate Test Series page...');
  await page.goto(`${EXAM_ORIGIN}/test-series/ultimate/jee-main`, { waitUntil: 'networkidle2', timeout: 20000 }).catch(() => {});
  await delay(3000);

  let successCount = Object.keys(allScraped).length;
  let failCount = 0;
  const failures = [];
  let processed = 0;

  for (const test of availableTests) {
    const testId = test.testId;

    // Skip already scraped
    if (allScraped[testId] && allScraped[testId].questions?.length > 0 && allScraped[testId].examSource === 'ultimate-series-2027') {
      console.log(`[SKIP] ${testId} already done`);
      continue;
    }

    processed++;
    console.log(`\n[${processed}] ${testId} | ${test.title}`);

    // Try API call first
    let questions = null;
    const apiResult = await fetchTestQuestionsAPI(page, testId);

    if (apiResult) {
      questions = apiResult.questions;
      console.log(`  ✓ API: ${questions.length} questions (${apiResult.endpoint})`);
    } else {
      // Navigate to test page to trigger network requests
      const testUrl = `${EXAM_ORIGIN}/test-series/test/${testId}`;
      await page.goto(testUrl, { waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
      await delay(3000);

      if (netCaught[testId]) {
        questions = netCaught[testId];
        console.log(`  ✓ NET: ${questions.length} questions`);
      }
    }

    if (questions && questions.length > 0) {
      const transformed = questions.map(q => transformQuestion(q, test));
      allScraped[testId] = {
        examSource: 'ultimate-series-2027',
        title: test.title,
        groupName: test.groupName,
        sectionName: test.sectionName,
        type: test.type,
        questions: transformed
      };
      successCount++;
    } else {
      console.log(`  ✗ No questions found`);
      failures.push({ testId, title: test.title });
      failCount++;
    }

    // Save every 5 tests
    if (processed % 5 === 0) {
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allScraped, null, 2));
      console.log(`  [Saved ${Object.keys(allScraped).length} tests so far]`);
    }
  }

  // Final save
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allScraped, null, 2));
  fs.writeFileSync('scrape_failures.json', JSON.stringify(failures, null, 2));

  console.log(`\n${'='.repeat(40)}`);
  console.log(`SUCCESS: ${successCount}/${availableTests.length}`);
  console.log(`FAILURES: ${failCount}`);
  console.log(`Output: ${OUTPUT_FILE}`);

  await browser.close();
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
