import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const PHONE = '7750858874';
const PASSWORD = '12345678';
const EXAM_ORIGIN = 'https://room.examgoal.com';
const WEB_DIR = 'c:\\Users\\Admin\\.gemini\\antigravity\\scratch\\project_ajay2\\quantrex-academy\\public\\data\\tests';
const MOB_DIR = 'c:\\Users\\Admin\\.gemini\\antigravity\\scratch\\project_ajay2\\quantrex-mobile\\public\\data\\tests';

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

function getTestsToUpdate() {
  const files = fs.readdirSync(WEB_DIR).filter(f => f.endsWith('.json') && f.startsWith('tst-'));
  const testsToUpdate = [];
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  
  for (const f of files) {
    const stat = fs.statSync(path.join(WEB_DIR, f));
    if (now - stat.mtimeMs > oneDay) {
      testsToUpdate.push(f.replace('.json', ''));
    }
  }
  return testsToUpdate;
}

function cleanHtml(html) { return html ? html.trim() : ''; }

function transformQuestion(rawQ, index, defaultSubject) {
  const content = rawQ.questionText || rawQ.content || rawQ.text || rawQ.question || '';
  const rawOptions = rawQ.options || [];
  const options = rawOptions.map(o => cleanHtml(typeof o === 'string' ? o : (o.content || o.text || o.value || o.option || '')));

  let correctOptionIndex = rawQ.correctOption ?? rawQ.correctOptionIndex ?? 0;
  if (typeof correctOptionIndex === 'string') {
    const map = { 'A': 0, 'B': 1, 'C': 2, 'D': 3, 'a': 0, 'b': 1, 'c': 2, 'd': 3 };
    correctOptionIndex = map[correctOptionIndex] ?? parseInt(correctOptionIndex) ?? 0;
  }

  const qType = rawQ.questionType || rawQ.type || (options.length === 0 ? 'NUMERICAL' : 'MCQ');
  
  let subject = defaultSubject || 'Mathematics';
  const subj = (rawQ.subject || '').toLowerCase();
  if (subj.includes('physics')) subject = 'Physics';
  else if (subj.includes('chem')) subject = 'Chemistry';
  else if (subj.includes('math')) subject = 'Mathematics';

  const section = qType === 'NUMERICAL' ? 'B' : 'A';

  return {
    id: rawQ.id || rawQ._id || rawQ.questionId || `q_${Math.random().toString(36).slice(2, 10)}`,
    questionNumber: index + 1,
    questionText: cleanHtml(content),
    options,
    correctOption: correctOptionIndex,
    correctAnswer: rawQ.correctAnswer || rawQ.numericalAnswer || rawQ.answer || '',
    questionType: qType,
    marks: rawQ.marks ?? 4,
    negativeMarks: rawQ.negativeMarks ?? -1,
    subject,
    topic: rawQ.topic || rawQ.chapter || '',
    difficulty: rawQ.difficulty || 'Medium',
    solution: rawQ.solution || rawQ.explanation || '',
    section,
    instruction: rawQ.instruction || (qType === 'NUMERICAL' ? 'Enter the correct numerical value.' : 'Select the correct option.'),
    examSource: 'ultimate-series-2027'
  };
}

async function main() {
  const TESTS = getTestsToUpdate();
  console.log(`=== Updating ${TESTS.length} untouched tests via network intercept ===`);
  if (TESTS.length === 0) return;

  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1000 });
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
          const match = url.match(/tst-[a-z0-9]+/);
          const key = match ? match[0] : url;
          if (!netCaught[key]) {
             netCaught[key] = qs;
             console.log(`  [NET] Cached ${qs.length} qs for ${key}`);
          }
        }
      }
    } catch(e) {}
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
  console.log('Logged in:', page.url());

  let successCount = 0;
  let failedCount = 0;

  for (let i = 0; i < TESTS.length; i++) {
    const testId = TESTS[i];
    const webPath = path.join(WEB_DIR, `${testId}.json`);
    const mobPath = path.join(MOB_DIR, `${testId}.json`);

    let existingTest;
    try { existingTest = JSON.parse(fs.readFileSync(webPath, 'utf8')); } 
    catch(e) { failedCount++; continue; }

    try {
      // Clear previous cache for safety
      delete netCaught[testId];

      // Navigate to the test page to trigger API calls
      await page.goto(`${EXAM_ORIGIN}/test-series/test/${testId}`, { waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
      await delay(3500);

      const qs = netCaught[testId];
      if (qs && qs.length > 0) {
        const defaultSubject = existingTest.questions?.[0]?.subject || 'Mathematics';
        const flatQ = qs.map((q, idx) => transformQuestion(q, idx, defaultSubject));
        
        const updated = { ...existingTest, questions: flatQ, totalQuestions: flatQ.length };
        fs.writeFileSync(webPath, JSON.stringify(updated, null, 2));
        if (fs.existsSync(mobPath)) fs.writeFileSync(mobPath, JSON.stringify(updated, null, 2));
        
        successCount++;
        if (i % 10 === 0) console.log(`  [${i+1}/${TESTS.length}] Updated ${testId} - ${flatQ.length} qs`);
      } else {
        console.log(`  [${i+1}/${TESTS.length}] FAILED ${testId} - No data intercepted`);
        failedCount++;
      }
    } catch(e) {
      console.log(`  [${i+1}/${TESTS.length}] ERROR ${testId}: ${e.message}`);
      failedCount++;
    }
  }

  await browser.close();
  console.log(`\nDONE. Success: ${successCount}, Failed: ${failedCount}`);
}

main().catch(console.error);
