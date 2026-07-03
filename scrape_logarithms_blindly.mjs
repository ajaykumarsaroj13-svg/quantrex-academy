import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const PHONE = '7750858874';
const PASSWORD = '12345678';
const EXAM_ORIGIN = 'https://room.examgoal.com';

const MOBILE_DIR = 'c:\\Users\\Admin\\.gemini\\antigravity\\scratch\\project_ajay2\\quantrex-mobile\\public\\data\\tests';
const WEB_DIR = 'c:\\Users\\Admin\\.gemini\\antigravity\\scratch\\project_ajay2\\quantrex-academy\\public\\data\\tests';

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

function transformQuestion(rawQ, index, subject, topic) {
  const en = rawQ.question?.en || {};
  const questionText = (en.content || '').trim();
  const options = (en.options || []).map(o => (o.content || '').trim());
  
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
    solution: (en.explanation || '').trim(),
    section,
    instruction,
    examSource: 'jee-main'
  };
}

async function scrapeTest(page, tid, title, groupName, sectionName, policy, type) {
  console.log(`\nScraping ${title} (${tid})...`);
  
  try {
    await page.goto(`${EXAM_ORIGIN}/tests/${tid}`, { waitUntil: 'networkidle2' });
    await delay(5000);

    let currentUrl = page.url();
    let analysisId = '';

    if (currentUrl.includes('/analysis/')) {
      analysisId = currentUrl.split('/').pop();
      console.log(`  Already on analysis page. ID: ${analysisId}`);
    } else {
      // Dismiss modal if present
      await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'I Understand');
        if (btn) btn.click();
      });
      await delay(1000);

      // Click outer submit
      console.log('  Clicking outer submit...');
      await page.evaluate(() => {
        const btn = document.querySelector('button.text-success');
        if (btn) btn.click();
      });
      await delay(2000);

      // Click modal submit
      console.log('  Clicking modal submit...');
      await page.evaluate(() => {
        const btn = document.querySelector('button.bg-gradient-to-r');
        if (btn) btn.click();
      });
      
      // Wait for URL to change to an analysis page
      console.log('  Waiting for redirect to analysis page...');
      let redirected = false;
      for (let attempt = 0; attempt < 30; attempt++) {
        await delay(500);
        if (page.url().includes('/analysis/')) {
          redirected = true;
          break;
        }
      }
      
      if (!redirected) {
        throw new Error('Timeout waiting for redirect to analysis page');
      }

      currentUrl = page.url();
      analysisId = currentUrl.split('/').pop();
      console.log(`  Redirected to analysis page. ID: ${analysisId}`);
    }

    // Fetch the analysis JSON directly from the page context
    console.log(`  Fetching analysis data for ID: ${analysisId}...`);
    const analysisData = await page.evaluate(async (origin, aid) => {
      try {
        const res = await fetch(`${origin}/api/v1/test/user/analysis/${aid}`, { credentials: 'include' });
        if (!res.ok) return null;
        const json = await res.json();
        return json.data;
      } catch(e) { return null; }
    }, EXAM_ORIGIN, analysisId);

    if (analysisData && analysisData.test) {
      const sections = analysisData.test.sections || [];
      const flatQuestions = [];
      let idx = 0;
      for (const sec of sections) {
        const qs = sec.questions || [];
        for (const q of qs) {
          flatQuestions.push(transformQuestion(q, idx, groupName, sectionName));
          idx++;
        }
      }

      const transformed = {
        id: tid,
        examType: policy === 'jee-main' ? 'JEE Main' : 'JEE Advanced',
        title,
        year: '2027',
        duration: 180,
        totalMarks: 300,
        totalQuestions: flatQuestions.length,
        isOfficial: false,
        questions: flatQuestions,
        category: 'Chapter and Topic Wise Tests',
        groupName,
        sectionName,
        type
      };

      const mobPath = path.join(MOBILE_DIR, `${tid}.json`);
      const webPath = path.join(WEB_DIR, `${tid}.json`);
      fs.writeFileSync(mobPath, JSON.stringify(transformed, null, 2));
      fs.writeFileSync(webPath, JSON.stringify(transformed, null, 2));
      console.log(`  ✓ Saved ${flatQuestions.length} questions successfully!`);
    } else {
      console.log(`  ✗ Failed to fetch analysis data.`);
    }
  } catch(e) {
    console.log(`  ✗ Error:`, e.message);
  }
}

async function main() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1000 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  // Login
  console.log('Logging in...');
  await page.goto('https://accounts.examgoal.com/login?redirect=https://room.examgoal.com', { waitUntil: 'networkidle2' });
  await delay(2000);
  const phoneBtns = await page.$$('button');
  for (const btn of phoneBtns) {
    if ((await page.evaluate(el => el.textContent.trim(), btn)) === 'Phone') { await btn.click(); break; }
  }
  await delay(2500);
  await (await page.$('input[type="number"]')).type(PHONE);
  await (await page.$('input[type="password"]')).type(PASSWORD);
  await (await page.$('button[type="submit"]')).click();
  await delay(5000);
  console.log('Logged in successfully!');

  // Scrape the 3 Logarithm tests
  await scrapeTest(page, 'tst-19g61moahy6ef', 'Logarithm Test - 1 (Topic Test)', 'Mathematics', 'Logarithm', 'jee-main', 'topic');
  await scrapeTest(page, 'tst-19g61moahy73a', 'Logarithm Test - 2 (Topic Test)', 'Mathematics', 'Logarithm', 'jee-main', 'topic');
  await scrapeTest(page, 'tst-19g61moahy7x6', 'Logarithm - Chapter Test', 'Mathematics', 'Logarithm', 'jee-main', 'chapter');

  await browser.close();
  console.log('\nFinished Logarithm scraping.');
}

main().catch(console.error);
