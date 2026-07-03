import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const PHONE = '7750858874';
const PASSWORD = '12345678';
const EXAM_ORIGIN = 'https://room.examgoal.com';

const MOBILE_DIR = 'c:\\Users\\Admin\\.gemini\\antigravity\\scratch\\project_ajay2\\quantrex-mobile\\public\\data\\tests';
const WEB_DIR = 'c:\\Users\\Admin\\.gemini\\antigravity\\scratch\\project_ajay2\\quantrex-academy\\public\\data\\tests';
const SERIES_JSON = 'c:\\Users\\Admin\\.gemini\\antigravity\\scratch\\project_ajay2\\quantrex-mobile\\public\\data\\jee_main_ultimate_series_2027.json';

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

function cleanHtml(html) {
  if (!html) return '';
  return html.trim();
}

function transformQuestion(rawQ, index, subject, topic) {
  const en = rawQ.question?.en || {};
  const questionText = cleanHtml(en.content || '');
  const options = (en.options || []).map(o => cleanHtml(o.content || ''));
  
  // Parse correct Option (0-indexed integer)
  let correctOption = 0;
  let correctOptionsArray = [];
  const rawCorrect = en.correct_options || [];
  
  if (rawCorrect.length > 0) {
    const map = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
    correctOptionsArray = rawCorrect.map(letter => map[letter] ?? 0);
    correctOption = correctOptionsArray[0] ?? 0;
  }

  // Answer for integer/numerical questions
  const correctAnswer = en.answer !== undefined && en.answer !== null ? String(en.answer).trim() : '';

  // Determine question type
  let questionType = 'MCQ';
  const typeStr = (rawQ.type || '').toLowerCase();
  if (typeStr === 'integer' || typeStr === 'numerical' || typeStr === 'nat' || options.length === 0) {
    questionType = 'NUMERICAL';
  } else if (rawCorrect.length > 1) {
    questionType = 'MULTI_CORRECT';
  }

  // Determine section (A for MCQ, B for Numerical)
  const section = questionType === 'NUMERICAL' ? 'B' : 'A';
  const instruction = questionType === 'NUMERICAL' ? 'Enter the correct numerical value.' : 'Select the correct option.';

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
    subject: subject || 'Mathematics',
    topic: topic || 'Logarithm',
    difficulty: rawQ.difficulty ? rawQ.difficulty.charAt(0).toUpperCase() + rawQ.difficulty.slice(1) : 'Medium',
    solution: cleanHtml(en.explanation || ''),
    section,
    instruction,
    examSource: 'jee-main'
  };
}

async function main() {
  console.log('=== ExamGoal Full Test Scraper ===');
  
  const series = JSON.parse(fs.readFileSync(SERIES_JSON, 'utf8'));
  const availableTests = series.filter(t => !t.isUpcoming);
  console.log(`Total tests in series: ${series.length}`);
  console.log(`Available to scrape: ${availableTests.length}`);

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
    if (url.includes('/api/v1/test/user/analysis/') && !url.includes('percentile')) {
      try {
        const json = await response.json();
        if (json && json.data) {
          capturedAnalysis = json.data;
        }
      } catch(e) {}
    }
  });

  // Login
  console.log('Logging in...');
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
  console.log('Logged in successfully!');

  // Scrape each test
  for (let i = 0; i < availableTests.length; i++) {
    const t = availableTests[i];
    const tid = t.testId;
    
    const mobPath = path.join(MOBILE_DIR, `${tid}.json`);
    const webPath = path.join(WEB_DIR, `${tid}.json`);

    // Check if both files already exist and contain actual scraped questions (not templates)
    let shouldSkip = false;
    if (fs.existsSync(mobPath) && fs.existsSync(webPath)) {
      try {
        const testData = JSON.parse(fs.readFileSync(mobPath, 'utf8'));
        if (testData.questions && testData.questions.length > 0 && testData.questions[0].questionText.includes('9 - 2^{x}')) {
          shouldSkip = true;
        }
      } catch(e) {}
    }

    if (shouldSkip) {
      console.log(`[${i+1}/${availableTests.length}] Skipping ${t.title} (${tid}) - Already scraped.`);
      continue;
    }

    console.log(`[${i+1}/${availableTests.length}] Scraping ${t.title} (${tid})...`);
    capturedAnalysis = null;

    try {
      await page.goto(`${EXAM_ORIGIN}/tests/${tid}`, { waitUntil: 'networkidle2' });
      
      // Wait for "Please wait..." loading overlay to disappear
      await page.waitForFunction(() => !document.body.innerText.includes('Please wait...'), { timeout: 20000 }).catch(() => {});
      await delay(2000); // extra wait for state to bind fully

      const currentUrl = page.url();
      if (!currentUrl.includes('/analysis/')) {
        // Dismiss "I Understand" popup if present
        await page.evaluate(() => {
          const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'I Understand');
          if (btn) btn.click();
        });
        await delay(1000);

        // Click outer submit button
        await page.evaluate(() => {
          const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim().includes('Submit Test') && !b.className.includes('bg-gradient-to-r'));
          if (btn) btn.click();
        });
        await delay(2000);

        // Click inner modal submit button
        await page.evaluate(() => {
          const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim().includes('Submit Test') && b.className.includes('bg-gradient-to-r') && b.offsetParent !== null);
          if (btn) btn.click();
        });
        await delay(6000);
      }

      // Wait for analysis details to load (polling loop)
      let waitAttempts = 0;
      while (!capturedAnalysis && waitAttempts < 40) {
        await delay(500);
        waitAttempts++;
      }

      if (capturedAnalysis && capturedAnalysis.test) {
        const sections = capturedAnalysis.test.sections || [];
        const flatQuestions = [];
        let index = 0;

        for (const sec of sections) {
          const qs = sec.questions || [];
          for (const q of qs) {
            flatQuestions.push(transformQuestion(q, index, t.groupName, t.sectionName));
            index++;
          }
        }

        const transformedTest = {
          id: tid,
          examType: t.policy === 'jee-main' ? 'JEE Main' : 'JEE Advanced',
          title: t.title,
          year: '2027',
          duration: t.durationMinutes || 180,
          totalMarks: t.maxMarks || 300,
          totalQuestions: flatQuestions.length,
          isOfficial: false,
          questions: flatQuestions,
          category: t.category,
          groupName: t.groupName,
          sectionName: t.sectionName,
          type: t.type
        };

        // Write to both directories
        fs.writeFileSync(mobPath, JSON.stringify(transformedTest, null, 2));
        fs.writeFileSync(webPath, JSON.stringify(transformedTest, null, 2));
        console.log(`  ✓ Successfully scraped & saved ${flatQuestions.length} questions.`);
      } else {
        console.log(`  ✗ Failed to capture analysis response.`);
      }
    } catch(err) {
      console.log(`  ✗ Error occurred:`, err.message);
    }
  }

  await browser.close();
  console.log('\nAll done!');
}

main().catch(console.error);
