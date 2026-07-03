import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const PHONE = '7750858874';
const PASSWORD = '12345678';
const EXAM_ORIGIN = 'https://room.examgoal.com';
const API_ORIGIN = 'https://api.examgoal.com';
const WEB_DIR = 'c:\\Users\\Admin\\.gemini\\antigravity\\scratch\\project_ajay2\\quantrex-academy\\public\\data\\tests';
const MOB_DIR = 'c:\\Users\\Admin\\.gemini\\antigravity\\scratch\\project_ajay2\\quantrex-mobile\\public\\data\\tests';

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// 41 tests with PYQ questions that need to be fixed
const PYQ_TESTS = [
  'tst-19g61mnpzhlyq',
  'tst-19g61mo679bu2',
  'tst-19g61mo679ckt',
  'tst-19g61mo679ed4',
  'tst-19g61mo679g17',
  'tst-19g61mo679guf',
  'tst-19g61mo67xffr',
  'tst-19g61mo67xgdx',
  'tst-19g61mo67xh8s',
  'tst-19g61mo7mnmbp',
  'tst-19g61mo7mnmyv',
  'tst-19g61mo7mnome',
  'tst-19g61mo7mnqk9',
  'tst-19g61mo7n5hri',
  'tst-19g61mpcxgwr2',
  'tst-19g61mpcxgxjh',
  'tst-19g71mnq2flzu',
  'tst-19g71mnq5nfun',
  'tst-19g71mnq5nhom',
  'tst-19g71mnq5nj9i',
  'tst-19g71mnq5njxd',
  'tst-19g71mnq6875v',
  'tst-19g71mnq688e5',
  'tst-19g71mnq68900',
  'tst-19g71mnq689ks',
  'tst-19g71mnq68bl1',
  'tst-19g71mnq6jhz0',
  'tst-19g71mnq6jifi',
  'tst-19g71mnq6jj1w',
  'tst-19g71mnq6jjmy',
  'tst-19g71mnq7q58s',
  'tst-19g71mnq7q5rq',
  'tst-19g71mnq7q6em',
  'tst-19g71mnq7q716',
  'tst-19g71mnq8i8g3',
  'tst-19g71mo0e07ti',
  'tst-19g71mo0e08ml',
  'tst-19g71mo0e09m3',
  'tst-19g71mo0e0af0',
  'tst-19g71mo0e0f29',
  'tst-19g71mo0e0isq',
];

function cleanHtml(html) {
  if (!html) return '';
  return html.trim();
}

function transformQuestion(rawQ, index, subject, topic) {
  const en = rawQ.question?.en || {};
  const questionText = cleanHtml(en.content || '');
  const options = (en.options || []).map(o => cleanHtml(o.content || ''));

  let correctOption = 0;
  let correctOptionsArray = [];
  const rawCorrect = en.correct_options || [];

  if (rawCorrect.length > 0) {
    const map = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
    correctOptionsArray = rawCorrect.map(letter => map[letter] ?? 0);
    correctOption = correctOptionsArray[0] ?? 0;
  }

  const correctAnswer = en.answer !== undefined && en.answer !== null ? String(en.answer).trim() : '';

  let questionType = 'MCQ';
  const typeStr = (rawQ.type || '').toLowerCase();
  if (typeStr === 'integer' || typeStr === 'numerical' || typeStr === 'nat' || options.length === 0) {
    questionType = 'NUMERICAL';
  } else if (rawCorrect.length > 1) {
    questionType = 'MULTI_CORRECT';
  }

  const section = questionType === 'NUMERICAL' ? 'B' : 'A';
  const instruction = questionType === 'NUMERICAL' ? 'Enter the correct numerical value.' : 'Select the correct option.';

  // Use subject from question itself if available
  let qSubject = subject || 'Mathematics';
  const subj = (rawQ.subject || '').toLowerCase();
  if (subj.includes('physics')) qSubject = 'Physics';
  else if (subj.includes('chem')) qSubject = 'Chemistry';
  else if (subj.includes('math')) qSubject = 'Mathematics';

  return {
    id: rawQ.questionId || `q_${Math.random().toString(36).substring(2, 10)}`,
    questionNumber: index + 1,
    questionText,
    options,
    correctOption,
    correctAnswer,
    correctOptionsArray,
    questionType,
    marks: rawQ.marks ?? 4,
    negativeMarks: rawQ.negMarks ?? -1,
    subject: qSubject,
    topic: rawQ.chapter || rawQ.topic || topic || '',
    difficulty: rawQ.difficulty ? rawQ.difficulty.charAt(0).toUpperCase() + rawQ.difficulty.slice(1) : 'Medium',
    solution: cleanHtml(en.explanation || ''),
    section,
    instruction,
    examSource: 'jee-main'
  };
}

async function main() {
  console.log('=== ExamGoal PYQ Fix Scraper (Analysis API) ===');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1000 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  // === LOGIN ===
  console.log('Logging in...');
  await page.goto('https://accounts.examgoal.com/login?redirect=https://room.examgoal.com', { waitUntil: 'networkidle2', timeout: 30000 });
  await delay(2000);

  // Click Phone tab
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

  const currentUrl = page.url();
  console.log('After login URL:', currentUrl);
  if (currentUrl.includes('login')) {
    console.log('WARNING: Still on login page - may not be fully logged in');
  } else {
    console.log('Login successful!');
  }

  // Navigate to room.examgoal.com to ensure cookies are set
  if (!currentUrl.includes('room.examgoal.com')) {
    await page.goto(EXAM_ORIGIN, { waitUntil: 'networkidle2', timeout: 20000 });
    await delay(3000);
  }

  const successList = [];
  const failList = [];

  for (let i = 0; i < PYQ_TESTS.length; i++) {
    const testId = PYQ_TESTS[i];
    const webPath = path.join(WEB_DIR, `${testId}.json`);
    const mobPath = path.join(MOB_DIR, `${testId}.json`);

    console.log(`\n[${i+1}/${PYQ_TESTS.length}] Processing ${testId}...`);

    // Load existing test data
    let existingTest;
    try {
      existingTest = JSON.parse(fs.readFileSync(webPath, 'utf8'));
    } catch (e) {
      console.log(`  ERROR: Could not read existing file: ${e.message}`);
      failList.push({ testId, reason: 'File read error' });
      continue;
    }

    // Intercept the analysis API response when we navigate there
    let captured = null;

    const handler = async (response) => {
      const url = response.url();
      if (url.includes('/api/v1/test/user/analysis/') && !url.includes('percentile')) {
        try {
          const text = await response.text();
          const json = JSON.parse(text);
          if (json && json.data && json.data.test) {
            captured = json.data;
          }
        } catch (e) {}
      }
    };

    page.on('response', handler);

    try {
      // Go to the test analysis page
      await page.goto(`${EXAM_ORIGIN}/tests/${testId}/analysis`, { waitUntil: 'domcontentloaded', timeout: 25000 });
      await delay(5000);

      // If not captured via interception, try direct fetch from page context
      if (!captured) {
        console.log(`  Trying direct API fetch for analysis...`);
        const apiResult = await page.evaluate(async (tid, origin) => {
          try {
            const r = await fetch(`${origin}/api/v1/test/user/analysis/${tid}`, { credentials: 'include' });
            if (r.ok) {
              const d = await r.json();
              return d;
            }
          } catch (e) {}
          return null;
        }, testId, EXAM_ORIGIN);

        if (apiResult && apiResult.data && apiResult.data.test) {
          captured = apiResult.data;
        }
      }

      // If analysis not available, try to navigate to test and submit it
      if (!captured) {
        console.log(`  Analysis not found, trying test page approach...`);

        // Intercept test session response  
        let testData = null;
        const testHandler = async (response) => {
          const url = response.url();
          if (url.includes('/api/v1/test/user/analysis/') && !url.includes('percentile')) {
            try {
              const text = await response.text();
              const json = JSON.parse(text);
              if (json && json.data && json.data.test) {
                captured = json.data;
              }
            } catch (e) {}
          }
        };
        page.on('response', testHandler);

        await page.goto(`${EXAM_ORIGIN}/tests/${testId}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await delay(3000);

        // Try clicking I Understand
        await page.evaluate(() => {
          const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'I Understand');
          if (btn) btn.click();
        });
        await delay(1500);

        // Try Submit Test
        await page.evaluate(() => {
          const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim().includes('Submit Test') && !b.className.includes('bg-gradient-to-r'));
          if (btn) btn.click();
        });
        await delay(2000);

        // Confirm submit
        await page.evaluate(() => {
          const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim().includes('Submit Test') && b.className.includes('bg-gradient-to-r') && b.offsetParent !== null);
          if (btn) btn.click();
        });

        // Wait for analysis capture
        let attempts = 0;
        while (!captured && attempts < 20) {
          await delay(500);
          attempts++;
        }

        page.off('response', testHandler);
      }

      page.off('response', handler);

      if (captured && captured.test) {
        const sections = captured.test.sections || [];
        const flatQuestions = [];
        let index = 0;

        for (const sec of sections) {
          const qs = sec.questions || [];
          for (const q of qs) {
            flatQuestions.push(transformQuestion(q, index, existingTest.groupName, existingTest.sectionName));
            index++;
          }
        }

        if (flatQuestions.length === 0) {
          console.log(`  WARNING: Got 0 questions from analysis`);
          failList.push({ testId, reason: 'Zero questions in analysis' });
          continue;
        }

        const updatedTest = {
          ...existingTest,
          questions: flatQuestions,
          totalQuestions: flatQuestions.length,
        };

        fs.writeFileSync(webPath, JSON.stringify(updatedTest, null, 2));
        if (fs.existsSync(mobPath)) {
          fs.writeFileSync(mobPath, JSON.stringify(updatedTest, null, 2));
        }
        console.log(`  ✓ SUCCESS: Saved ${flatQuestions.length} questions`);
        successList.push(testId);

      } else {
        console.log(`  ✗ Could not get analysis data`);
        failList.push({ testId, reason: 'No analysis data captured' });
      }

    } catch (e) {
      page.off('response', handler);
      console.log(`  ✗ ERROR: ${e.message}`);
      failList.push({ testId, reason: e.message });
    }

    await delay(1500);
  }

  await browser.close();

  console.log('\n========== SUMMARY ==========');
  console.log(`SUCCESS: ${successList.length}/${PYQ_TESTS.length}`);
  console.log(`FAILED: ${failList.length}/${PYQ_TESTS.length}`);
  if (failList.length > 0) {
    console.log('\nFailed tests:');
    failList.forEach(f => console.log(`  ${f.testId}: ${f.reason}`));
  }
  if (successList.length > 0) {
    console.log('\nSucceeded:');
    successList.forEach(id => console.log(`  ${id}`));
  }
}

main().catch(console.error);
