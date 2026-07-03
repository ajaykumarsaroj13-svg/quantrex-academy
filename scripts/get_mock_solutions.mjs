import puppeteer from 'puppeteer';
import fs from 'fs';

const PHONE = '7750858874';
const PASSWORD = '12345678';
const testId = 'tst-19g61mnpzhlyq'; 

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('response', async (res) => {
      const url = res.url();
      if (url.includes('/api/v1/test/user/analysis/') && url.includes('/questions')) {
          console.log('Intercepted analysis questions response!');
          try {
              const text = await res.text();
              fs.writeFileSync('solutions_dump.json', text);
              console.log('Dumped to solutions_dump.json');
          } catch(e) {
              console.error(e);
          }
      }
  });
  
  // Login
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
  
  const js_code = `
    (async (testId) => {
        console.log("Fetching test details...");
        const testDetailsRes = await fetch('/api/v1/test/user/test/' + testId + '?out_of_syllabus=false');
        const testDetails = await testDetailsRes.json();
        const qIds = [];
        const sections = testDetails.data.sections || [];
        for (const s of sections) {
            for (const q of (s.questions || [])) {
                qIds.push(q.questionId);
            }
        }
        console.log("Found question IDs: " + qIds.length);
        
        const sessionConfigRes = await fetch('/api/v1/test/user/session/' + testId);
        const sessionConfig = await sessionConfigRes.json();
        let sessionId = sessionConfig.data?.sessionId;
        if (!sessionId) {
            sessionId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }
        console.log("Session ID: " + sessionId);
        
        console.log("Fetching solutions...");
        const solutionsRes = await fetch('/api/v1/test/user/analysis/' + sessionId + '/questions', {
            method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ questionIds: qIds })
        });
        console.log("Done fetching solutions");
    })('${testId}')
  `;
  
  await page.evaluate(js_code);
  await new Promise(r => setTimeout(r, 3000));
  await browser.close();
})();
