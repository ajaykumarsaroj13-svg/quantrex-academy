import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const PHONE = '7750858874';
const PASSWORD = '12345678';
const TESTS_DIR = path.resolve('./public/data/tests');

function cleanHtmlLatex(text) {
    if (!text) return "";
    let clean = text.replace(/ExamGoal/g, "Quantrex Academy")
                    .replace(/examgoal/g, "quantrex academy")
                    .replace(/Examgoal/g, "Quantrex Academy");
    return clean;
}

(async () => {
  const allFiles = fs.readdirSync(TESTS_DIR).filter(f => f.startsWith('tst-') && f.endsWith('.json'));
  const testsToFix = [];
  
  for (const file of allFiles) {
      try {
          const filePath = path.join(TESTS_DIR, file);
          const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          if (data.questions && data.questions.length > 0) {
              // If the first question has no solution, we assume the test needs fixing
              if (!data.questions[0].solution || data.questions[0].solution.trim() === "") {
                  testsToFix.push({ file, testId: file.replace('.json', ''), data });
              }
          }
      } catch(e) {}
  }
  
  console.log(`Found ${testsToFix.length} tests needing solutions...`);
  if (testsToFix.length === 0) return;

  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  console.log('Logging in to ExamGoal...');
  await page.goto('https://accounts.examgoal.com/login?redirect=https://room.examgoal.com');
  await new Promise(r => setTimeout(r, 2000));
  const btns = await page.$$('button');
  for (const b of btns) {
    const t = await page.evaluate(el => el.textContent.trim(), b);
    if (t === 'Phone') { await b.click(); break; }
  }
  await new Promise(r => setTimeout(r, 1000));
  await page.type('input[type="number"]', PHONE);
  await page.type('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  
  await page.waitForNavigation({ waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  console.log('Logged in successfully!');
  
  // We will process in batches of 10 to avoid overwhelming the browser
  for (let i = 0; i < testsToFix.length; i++) {
      const test = testsToFix[i];
      console.log(`[${i+1}/${testsToFix.length}] Fetching solutions for ${test.testId}...`);
      
      const qIds = test.data.questions.map(q => q.id);
      
      const js_code = `
        async (testId, qIds) => {
            const sessionConfigRes = await fetch('/api/v1/test/user/session/' + testId);
            const sessionConfig = await sessionConfigRes.json();
            let sessionId = sessionConfig.data?.sessionId;
            if (!sessionId) {
                sessionId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
            }
            
            const nowIso = new Date().toISOString();
            const savePayload = {
                testId: testId, sessionId: sessionId, timeSpent: 5000, language: "en",
                lastQuestionId: qIds[0],
                state: { [qIds[0]]: { ir: false, si: [], ip: null, st: "seen", ts: 5000, ma: 0, nma: 0 } },
                layout: 1, lastAttempted: nowIso, metadata: { options: { outOfSyllabus: false } }
            };
            
            await fetch('/api/v1/test/user/session', {
                method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(savePayload)
            });
            
            await fetch('/api/v1/test/user/test', {
                method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ testId: testId })
            });
            
            const solutionsRes = await fetch('/api/v1/test/user/analysis/' + sessionId + '/questions', {
                method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ questionIds: qIds })
            });
            const solutionsData = await solutionsRes.json();
            
            return solutionsData;
        }
      `;
      
      try {
          const solData = await page.evaluate(js_code, test.testId, qIds);
          
          // Map solutions
          let updatedCount = 0;
          if (solData && solData.results) {
              const solMap = {};
              for (const section of solData.results) {
                  for (const q of (section.questions || [])) {
                      solMap[q.questionId] = q.question?.en?.explanation || "";
                  }
              }
              
              for (const q of test.data.questions) {
                  if (solMap[q.id]) {
                      q.solution = cleanHtmlLatex(solMap[q.id]);
                      updatedCount++;
                  }
              }
              
              if (updatedCount > 0) {
                  fs.writeFileSync(path.join(TESTS_DIR, test.file), JSON.stringify(test.data, null, 2));
                  console.log(`  -> Saved ${updatedCount} solutions for ${test.testId}`);
              } else {
                  console.log(`  -> No solutions found for ${test.testId}`);
              }
          }
      } catch(e) {
          console.error(`  -> Failed: ${e.message}`);
      }
      
      await new Promise(r => setTimeout(r, 1000));
  }
  
  await browser.close();
  console.log('All missing solutions fetched!');
})();
