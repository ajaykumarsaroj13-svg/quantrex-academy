import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const PHONE = '7750858874';
const PASSWORD = '12345678';
const EXAM_ORIGIN = 'https://room.examgoal.com';
const WEB_DIR = 'c:\\Users\\Admin\\.gemini\\antigravity\\scratch\\project_ajay2\\quantrex-academy\\public\\data\\tests';

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

/**
 * Transform an ExamGoal API question to our format.
 */
function transformQuestion(q, idx) {
  // Map option letters to indices
  const optionLetterToIndex = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };

  // Options array
  const options = [];
  if (q.option1) options.push({ id: 'opt_a', text: q.option1, label: 'A' });
  if (q.option2) options.push({ id: 'opt_b', text: q.option2, label: 'B' });
  if (q.option3) options.push({ id: 'opt_c', text: q.option3, label: 'C' });
  if (q.option4) options.push({ id: 'opt_d', text: q.option4, label: 'D' });

  // Correct option (convert letter to 1-based index)
  let correctOption = 1;
  let correctAnswer = '';
  let correctOptionsArray = [];
  let questionType = 'MCQ';

  if (q.qtype === 'numerical' || q.qtype === 'integer') {
    questionType = 'NUMERICAL';
    correctAnswer = String(q.correct_answer || q.answer || '');
    correctOption = 1;
  } else if (q.qtype === 'multi_correct' || q.qtype === 'multiple') {
    questionType = 'MULTI_CORRECT';
    if (q.correct_options && Array.isArray(q.correct_options)) {
      correctOptionsArray = q.correct_options.map(l => optionLetterToIndex[l] !== undefined ? optionLetterToIndex[l] : parseInt(l));
    } else if (q.answer) {
      // e.g., 'ACD'
      correctOptionsArray = q.answer.split('').map(l => optionLetterToIndex[l] !== undefined ? optionLetterToIndex[l] : 0);
    }
    correctOption = correctOptionsArray[0] + 1 || 1;
  } else {
    // Single MCQ
    questionType = 'MCQ';
    const ans = q.answer || q.correct_option || '';
    if (typeof ans === 'string' && optionLetterToIndex[ans.toUpperCase()] !== undefined) {
      correctOption = optionLetterToIndex[ans.toUpperCase()] + 1;
    } else if (typeof ans === 'number') {
      correctOption = ans;
    }
    correctAnswer = ans;
  }

  // Marks
  let marks = 4;
  let negativeMarks = 1;
  if (questionType === 'NUMERICAL') {
    marks = 4;
    negativeMarks = 0;
  }

  // Subject
  let subject = 'Mathematics';
  const subj = (q.subject || '').toLowerCase();
  if (subj.includes('physics') || subj.includes('phy')) subject = 'Physics';
  else if (subj.includes('chem')) subject = 'Chemistry';
  else if (subj.includes('math') || subj.includes('maths')) subject = 'Mathematics';

  return {
    id: q._id || q.id || `q_${idx}`,
    questionNumber: idx + 1,
    questionText: q.question || q.questionText || '',
    options,
    correctOption,
    correctAnswer,
    correctOptionsArray,
    questionType,
    marks,
    negativeMarks,
    subject,
    topic: q.chapter || q.topic || '',
    difficulty: q.difficulty || q.level || 'Medium',
    solution: q.solution || q.explanation || '',
    section: '',
    instruction: '',
    examSource: 'jee-main',
  };
}

async function login(page) {
  console.log('Logging in...');
  await page.goto('https://accounts.examgoal.com/', { waitUntil: 'networkidle2', timeout: 30000 });
  await delay(2000);

  // Fill phone
  const phoneInput = await page.$('input[type="tel"], input[name="phone"], input[placeholder*="phone"], input[placeholder*="Phone"], input[placeholder*="Mobile"]');
  if (phoneInput) {
    await phoneInput.click({ clickCount: 3 });
    await phoneInput.type(PHONE);
  }

  // Fill password
  const passInput = await page.$('input[type="password"]');
  if (passInput) {
    await passInput.click({ clickCount: 3 });
    await passInput.type(PASSWORD);
  }

  // Submit
  const submitBtn = await page.$('button[type="submit"], button.btn-primary, form button');
  if (submitBtn) {
    await submitBtn.click();
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 }).catch(() => {});
  }
  await delay(3000);
  console.log('Logged in, current URL:', page.url());
}

async function fetchTestData(page, testId) {
  return new Promise(async (resolve, reject) => {
    let captured = null;
    const timeout = setTimeout(() => {
      if (!captured) reject(new Error(`Timeout waiting for API response for ${testId}`));
    }, 45000);

    // Listen for the test data API response
    const handleResponse = async (response) => {
      const url = response.url();
      if (url.includes(`/api/v1/test/user/test/${testId}`) || 
          url.includes(`/api/v1/test/${testId}`) ||
          url.includes(`/api/v1/test/user/session/${testId}`)) {
        try {
          const status = response.status();
          if (status === 200) {
            const text = await response.text().catch(() => null);
            if (text) {
              const data = JSON.parse(text);
              if (data && !captured) {
                captured = data;
                clearTimeout(timeout);
                page.off('response', handleResponse);
                resolve(data);
              }
            }
          }
        } catch (e) {
          // continue
        }
      }
    };

    page.on('response', handleResponse);

    // Navigate to the test page
    await page.goto(`${EXAM_ORIGIN}/tests/${testId}`, { 
      waitUntil: 'domcontentloaded', 
      timeout: 30000 
    }).catch(() => {});

    // Wait a bit for any pending API calls
    await delay(10000);
    
    // If not captured yet, try to make direct API call using page.evaluate
    if (!captured) {
      console.log(`  Direct API call attempt for ${testId}...`);
      try {
        const result = await page.evaluate(async (tid, origin) => {
          const endpoints = [
            `${origin}/api/v1/test/user/test/${tid}`,
            `${origin}/api/v1/test/user/session/${tid}`,
            `${origin}/api/v1/test/${tid}`,
          ];
          for (const url of endpoints) {
            try {
              const r = await fetch(url, { credentials: 'include' });
              if (r.ok) {
                const d = await r.json();
                if (d) return { url, data: d };
              }
            } catch (e) {}
          }
          return null;
        }, testId, EXAM_ORIGIN);
        
        if (result) {
          captured = result.data;
          clearTimeout(timeout);
          page.off('response', handleResponse);
          resolve(captured);
          return;
        }
      } catch (e) {
        console.log(`  Evaluate failed: ${e.message}`);
      }
    }
  });
}

function extractQuestionsFromApiResponse(data, existingTest) {
  // Try different response structures
  let questions = null;
  let title = existingTest.title;
  
  if (data.data) {
    const d = data.data;
    questions = d.questions || d.test_questions || d.testQuestions;
    if (d.title || d.name) title = d.title || d.name;
    
    // If data.data has nested test
    if (!questions && d.test) {
      questions = d.test.questions || d.test.test_questions;
      if (d.test.title || d.test.name) title = d.test.title || d.test.name;
    }
  }
  
  if (!questions && data.questions) {
    questions = data.questions;
  }
  
  if (!questions && data.test) {
    questions = data.test.questions;
    if (data.test.title) title = data.test.title;
  }
  
  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    return null;
  }
  
  return { questions, title };
}

async function main() {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security', '--disable-features=IsolateOrigins,site-per-process']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  // Set a realistic user agent
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  try {
    await login(page);
    
    const successList = [];
    const failList = [];
    
    for (let i = 0; i < PYQ_TESTS.length; i++) {
      const testId = PYQ_TESTS[i];
      const testFile = path.join(WEB_DIR, `${testId}.json`);
      
      console.log(`\n[${i+1}/${PYQ_TESTS.length}] Processing ${testId}...`);
      
      // Load existing test data
      let existingTest;
      try {
        existingTest = JSON.parse(fs.readFileSync(testFile, 'utf8'));
      } catch (e) {
        console.log(`  ERROR: Could not read existing file: ${e.message}`);
        failList.push({ testId, reason: 'File read error' });
        continue;
      }
      
      try {
        const apiData = await fetchTestData(page, testId);
        console.log(`  Got API response, keys: ${JSON.stringify(Object.keys(apiData)).substring(0, 200)}`);
        
        const extracted = extractQuestionsFromApiResponse(apiData, existingTest);
        if (!extracted) {
          console.log(`  WARNING: Could not extract questions from API response`);
          console.log(`  API data sample: ${JSON.stringify(apiData).substring(0, 500)}`);
          failList.push({ testId, reason: 'Could not extract questions', dataSample: JSON.stringify(apiData).substring(0, 200) });
          continue;
        }
        
        const { questions: rawQuestions, title } = extracted;
        console.log(`  Found ${rawQuestions.length} questions`);
        
        // Transform questions
        const transformedQuestions = rawQuestions.map((q, idx) => transformQuestion(q, idx));
        
        // Update test file
        const updatedTest = {
          ...existingTest,
          title: title || existingTest.title,
          questions: transformedQuestions,
          totalQuestions: transformedQuestions.length,
        };
        
        fs.writeFileSync(testFile, JSON.stringify(updatedTest, null, 2));
        console.log(`  SUCCESS: Saved ${transformedQuestions.length} questions`);
        successList.push(testId);
        
      } catch (e) {
        console.log(`  ERROR: ${e.message}`);
        failList.push({ testId, reason: e.message });
      }
      
      // Small delay between tests
      await delay(2000);
    }
    
    console.log('\n========== SUMMARY ==========');
    console.log(`SUCCESS: ${successList.length}/${PYQ_TESTS.length}`);
    console.log(`FAILED: ${failList.length}/${PYQ_TESTS.length}`);
    if (failList.length > 0) {
      console.log('\nFailed tests:');
      failList.forEach(f => console.log(`  ${f.testId}: ${f.reason}`));
    }
    
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
