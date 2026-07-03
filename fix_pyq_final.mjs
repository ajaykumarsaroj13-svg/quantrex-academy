import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const PHONE = '7750858874';
const PASSWORD = '12345678';
const EXAM_ORIGIN = 'https://room.examgoal.com';
const WEB_DIR = 'c:\\Users\\Admin\\.gemini\\antigravity\\scratch\\project_ajay2\\quantrex-academy\\public\\data\\tests';
const MOB_DIR = 'c:\\Users\\Admin\\.gemini\\antigravity\\scratch\\project_ajay2\\quantrex-mobile\\public\\data\\tests';

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// All 41 PYQ tests
const PYQ_TESTS = [
  'tst-19g61mnpzhlyq','tst-19g61mo679bu2','tst-19g61mo679ckt','tst-19g61mo679ed4','tst-19g61mo679g17',
  'tst-19g61mo679guf','tst-19g61mo67xffr','tst-19g61mo67xgdx','tst-19g61mo67xh8s',
  'tst-19g61mo7mnmbp','tst-19g61mo7mnmyv','tst-19g61mo7mnome','tst-19g61mo7mnqk9',
  'tst-19g61mo7n5hri','tst-19g61mpcxgwr2','tst-19g61mpcxgxjh','tst-19g71mnq2flzu',
  'tst-19g71mnq5nfun','tst-19g71mnq5nhom','tst-19g71mnq5nj9i','tst-19g71mnq5njxd',
  'tst-19g71mnq6875v','tst-19g71mnq688e5','tst-19g71mnq68900','tst-19g71mnq689ks',
  'tst-19g71mnq68bl1','tst-19g71mnq6jhz0','tst-19g71mnq6jifi','tst-19g71mnq6jj1w',
  'tst-19g71mnq6jjmy','tst-19g71mnq7q58s','tst-19g71mnq7q5rq','tst-19g71mnq7q6em',
  'tst-19g71mnq7q716','tst-19g71mnq8i8g3','tst-19g71mo0e07ti','tst-19g71mo0e08ml',
  'tst-19g71mo0e09m3','tst-19g71mo0e0af0','tst-19g71mo0e0f29','tst-19g71mo0e0isq',
];

function cleanHtml(html) { return html ? html.trim() : ''; }

function transformFromTestApi(rawQ, index, defaultSubject) {
  // This function handles the /test API format (no correct answers)
  const en = rawQ.question?.en || {};
  const questionText = cleanHtml(en.content || '');
  const options = (en.options || []).map(o => cleanHtml(typeof o === 'string' ? o : (o.content || '')));

  let questionType = 'MCQ';
  const typeStr = (rawQ.type || '').toLowerCase();
  if (typeStr === 'integer' || typeStr === 'numerical' || typeStr === 'nat' || options.length === 0) {
    questionType = 'NUMERICAL';
  }

  let subject = defaultSubject || 'Mathematics';
  const subj = (rawQ.subject || '').toLowerCase();
  if (subj.includes('physics')) subject = 'Physics';
  else if (subj.includes('chem')) subject = 'Chemistry';
  else if (subj.includes('math')) subject = 'Mathematics';

  const section = questionType === 'NUMERICAL' ? 'B' : 'A';

  return {
    id: rawQ.questionId || `q_${Math.random().toString(36).substring(2, 10)}`,
    questionNumber: index + 1,
    questionText,
    options,
    correctOption: 0,      // Unknown - no answers from this API
    correctAnswer: '',      // Unknown
    correctOptionsArray: [],
    questionType,
    marks: rawQ.marks ?? 4,
    negativeMarks: rawQ.negMarks ?? -1,
    subject,
    topic: rawQ.chapter || rawQ.topic || '',
    difficulty: rawQ.difficulty ? rawQ.difficulty.charAt(0).toUpperCase() + rawQ.difficulty.slice(1) : 'Medium',
    solution: '',           // Unknown
    section,
    instruction: questionType === 'NUMERICAL' ? 'Enter the correct numerical value.' : 'Select the correct option.',
    examSource: 'jee-main'
  };
}

function transformFromAnalysis(rawQ, index, defaultSubject) {
  // This function handles the analysis API format (has correct answers)
  const en = rawQ.question?.en || {};
  const questionText = cleanHtml(en.content || '');
  const options = (en.options || []).map(o => cleanHtml(o.content || ''));

  let correctOption = 0;
  let correctOptionsArray = [];
  const rawCorrect = en.correct_options || [];
  if (rawCorrect.length > 0) {
    const map = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
    correctOptionsArray = rawCorrect.map(l => map[l] ?? 0);
    correctOption = correctOptionsArray[0] ?? 0;
  }
  const correctAnswer = (en.answer !== undefined && en.answer !== null) ? String(en.answer).trim() : '';

  let questionType = 'MCQ';
  const typeStr = (rawQ.type || '').toLowerCase();
  if (typeStr === 'integer' || typeStr === 'numerical' || typeStr === 'nat' || options.length === 0) {
    questionType = 'NUMERICAL';
  } else if (rawCorrect.length > 1) {
    questionType = 'MULTI_CORRECT';
  }

  let subject = defaultSubject || 'Mathematics';
  const subj = (rawQ.subject || '').toLowerCase();
  if (subj.includes('physics')) subject = 'Physics';
  else if (subj.includes('chem')) subject = 'Chemistry';
  else if (subj.includes('math')) subject = 'Mathematics';

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
    subject,
    topic: rawQ.chapter || rawQ.topic || '',
    difficulty: rawQ.difficulty ? rawQ.difficulty.charAt(0).toUpperCase() + rawQ.difficulty.slice(1) : 'Medium',
    solution: cleanHtml(en.explanation || ''),
    section: questionType === 'NUMERICAL' ? 'B' : 'A',
    instruction: questionType === 'NUMERICAL' ? 'Enter the correct numerical value.' : 'Select the correct option.',
    examSource: 'jee-main'
  };
}

async function main() {
  console.log('=== Final Fix: Analysis page navigation + Test API fallback ===');

  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1000 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

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
  console.log('Logged in:', page.url());

  const successWithAnswers = [];
  const successNoAnswers = [];
  const failed = [];

  for (let i = 0; i < PYQ_TESTS.length; i++) {
    const testId = PYQ_TESTS[i];
    const webPath = path.join(WEB_DIR, `${testId}.json`);
    const mobPath = path.join(MOB_DIR, `${testId}.json`);

    console.log(`\n[${i+1}/${PYQ_TESTS.length}] ${testId}`);

    let existingTest;
    try {
      existingTest = JSON.parse(fs.readFileSync(webPath, 'utf8'));
    } catch(e) {
      console.log(`  ERROR: Can't read file`);
      failed.push(testId);
      continue;
    }

    // Set up analysis interceptor
    let capturedAnalysis = null;
    const handler = async (response) => {
      const url = response.url();
      if (url.includes('/api/v1/test/user/analysis/') && !url.includes('percentile')) {
        try {
          const json = await response.json();
          if (json?.data?.test) capturedAnalysis = json.data;
        } catch(e) {}
      }
    };
    page.on('response', handler);

    try {
      // Strategy 1: Navigate to analysis page directly
      await page.goto(`${EXAM_ORIGIN}/tests/${testId}/analysis`, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await delay(4000);

      if (!capturedAnalysis) {
        // Try direct API fetch  
        const direct = await page.evaluate(async (tid, origin) => {
          try {
            const r = await fetch(`${origin}/api/v1/test/user/analysis/${tid}`, { credentials: 'include' });
            if (r.ok) { const d = await r.json(); if (d?.data?.test) return d.data; }
          } catch(e) {}
          return null;
        }, testId, EXAM_ORIGIN);
        if (direct) capturedAnalysis = direct;
      }

      page.off('response', handler);

      if (capturedAnalysis?.test) {
        // Got analysis with answers!
        const sections = capturedAnalysis.test.sections || [];
        const flatQ = [];
        let idx = 0;
        const defaultSubject = existingTest.questions?.[0]?.subject || 'Mathematics';
        for (const sec of sections) {
          for (const q of (sec.questions || [])) {
            flatQ.push(transformFromAnalysis(q, idx++, defaultSubject));
          }
        }
        if (flatQ.length > 0) {
          const updated = { ...existingTest, questions: flatQ, totalQuestions: flatQ.length };
          fs.writeFileSync(webPath, JSON.stringify(updated, null, 2));
          if (fs.existsSync(mobPath)) fs.writeFileSync(mobPath, JSON.stringify(updated, null, 2));
          console.log(`  SUCCESS WITH ANSWERS: ${flatQ.length} questions`);
          successWithAnswers.push(testId);
          continue;
        }
      }

      // Strategy 2: Fallback - use test API (no answers)
      console.log(`  No analysis, using test API (questions without answers)...`);
      const testData = await page.evaluate(async (tid, origin) => {
        try {
          const r = await fetch(`${origin}/api/v1/test/user/test/${tid}?out_of_syllabus=false`, { credentials: 'include' });
          if (r.ok) return await r.json();
        } catch(e) {}
        return null;
      }, testId, EXAM_ORIGIN);

      if (testData?.data?.sections) {
        const sections = testData.data.sections;
        const flatQ = [];
        let idx = 0;
        const defaultSubject = existingTest.questions?.[0]?.subject || 'Mathematics';
        for (const sec of sections) {
          for (const q of (sec.questions || [])) {
            flatQ.push(transformFromTestApi(q, idx++, defaultSubject));
          }
        }
        if (flatQ.length > 0) {
          const updated = { ...existingTest, questions: flatQ, totalQuestions: flatQ.length };
          fs.writeFileSync(webPath, JSON.stringify(updated, null, 2));
          if (fs.existsSync(mobPath)) fs.writeFileSync(mobPath, JSON.stringify(updated, null, 2));
          console.log(`  SUCCESS (no answers): ${flatQ.length} questions`);
          successNoAnswers.push(testId);
          continue;
        }
      }

      console.log(`  FAILED: Could not get any data`);
      failed.push(testId);

    } catch(e) {
      page.off('response', handler);
      console.log(`  ERROR: ${e.message}`);
      failed.push(testId);
    }

    await delay(1500);
  }

  await browser.close();

  console.log('\n========== SUMMARY ==========');
  console.log(`With answers: ${successWithAnswers.length}`);
  console.log(`Questions only (no answers): ${successNoAnswers.length}`);
  console.log(`Failed: ${failed.length}`);
  if (failed.length > 0) console.log('Failed:', failed);
  if (successNoAnswers.length > 0) {
    console.log('\nTests needing answers (submit on ExamGoal to fix):');
    successNoAnswers.forEach(id => console.log(' ', id));
  }
}

main().catch(console.error);
