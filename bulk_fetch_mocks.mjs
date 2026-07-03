import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const PHONE = '7750858874';
const PASSWORD = '12345678';

const WEB_DIR = path.join(process.cwd(), 'public', 'data', 'tests');
const MOBILE_DIR = path.join(process.cwd(), '..', 'quantrex-mobile', 'assets', 'data', 'tests');

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

function cleanHtml(html) {
  if (typeof html !== 'string') return '';
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
    topic: topic || 'Topic',
    difficulty: rawQ.difficulty ? rawQ.difficulty.charAt(0).toUpperCase() + rawQ.difficulty.slice(1) : 'Medium',
    solution: cleanHtml(en.explanation || ''),
    section,
    instruction,
    examSource: 'jee-main'
  };
}

async function main() {
  const series = JSON.parse(fs.readFileSync('public/data/ultimate-series.json', 'utf8'));
  const validTests = series.filter(t => !t.isUpcoming);
  console.log('Total tests to fetch:', validTests.length);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  console.log('Logging in...');
  await page.goto('https://accounts.examgoal.com/login?redirect=https://room.examgoal.com', { waitUntil: 'networkidle2' });
  await delay(1000);
  const phoneBtns = await page.$$('button');
  for (const btn of phoneBtns) {
    const txt = await page.evaluate(el => el.textContent.trim(), btn);
    if (txt === 'Phone') { await btn.click(); break; }
  }
  await delay(1000);
  const numInput = await page.$('input[type="number"]');
  if (numInput) { await numInput.click({ clickCount: 3 }); await numInput.type(PHONE); }
  const passInput = await page.$('input[type="password"]');
  if (passInput) { await passInput.click({ clickCount: 3 }); await passInput.type(PASSWORD); }
  const submitBtn = await page.$('button[type="submit"]');
  if (submitBtn) await submitBtn.click();
  await delay(4000);

  // We will intercept the active test endpoint
  let capturedData = null;
  page.on('response', async (res) => {
    const url = res.url();
    if (url.includes('/api/v1/test/user/test/') && !url.includes('analysis')) {
      try {
        const json = await res.json();
        if (json && json.data) {
          capturedData = json.data;
        }
      } catch(e) {}
    }
  });

  for (let i = 0; i < validTests.length; i++) {
    const t = validTests[i];
    console.log(`[${i+1}/${validTests.length}] Fetching ${t.testId}...`);
    capturedData = null;

    try {
      await page.goto(`https://room.examgoal.com/tests/${t.testId}`, { waitUntil: 'networkidle2' });
      
      let attempts = 0;
      while (!capturedData && attempts < 20) {
        await delay(500);
        attempts++;
      }

      if (capturedData) {
        const data = capturedData;
        const qs = data.questions || (Array.isArray(data) ? data : null) || data.test?.questions || data.testSections?.flatMap(s => s.questions || []) || data.sections?.flatMap(s => s.questions || []);
        
        if (qs && qs.length > 0) {
          const flatQuestions = qs.map((q, idx) => transformQuestion(q, idx, t.groupName, t.sectionName));
          
          const transformedTest = {
            id: t.testId,
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

          fs.writeFileSync(path.join(WEB_DIR, `${t.testId}.json`), JSON.stringify(transformedTest, null, 2));
          try { fs.writeFileSync(path.join(MOBILE_DIR, `${t.testId}.json`), JSON.stringify(transformedTest, null, 2)); } catch(e){}
          console.log(`  -> Saved ${flatQuestions.length} questions for ${t.testId}`);
        } else {
          console.log(`  -> Failed to find questions array in data for ${t.testId}`);
        }
      } else {
        console.log(`  -> Timed out waiting for API for ${t.testId}`);
      }
    } catch(err) {
      console.log(`  -> Error: ${err.message}`);
    }
  }

  await browser.close();
  console.log('All done!');
}
main();
