import puppeteer from 'puppeteer';
import fs from 'fs';

const MOBILE = '7750858874';
const PASSWORD = '12345678';

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  let examGoalToken = '';
  const capturedAPIData = {};

  // Intercept all XHR/fetch responses  
  await page.setRequestInterception(true);
  page.on('request', req => {
      req.continue();
  });

  page.on('response', async res => {
      const url = res.url();
      const reqHeaders = res.request().headers();
      
      // Capture the ExamGoal JWT token (not Firebase)
      if (reqHeaders['authorization'] && url.includes('examgoal.com') && !url.includes('firebase')) {
          examGoalToken = reqHeaders['authorization'];
      }
      
      // Capture chapter listing API
      if (url.includes('/api/v1/past-question/chapters') || url.includes('/api/v1/past-question/topics')) {
          try {
              const json = await res.json();
              const fname = 'eg_' + url.replace(/https?:\/\/[^/]+/,'').replace(/\//g,'_').replace(/[?=&]/g,'_').substring(0,60) + '.json';
              fs.writeFileSync(fname, JSON.stringify(json, null, 2));
              console.log('[SAVED] ' + fname);
          } catch (e) {}
      }
      
      // Capture question data
      if (url.includes('/api/v1/past-question/questions') || url.includes('/api/v2/past-question/questions')) {
          try {
              const json = await res.json();
              const fname = 'eg_questions_' + Date.now() + '.json';
              fs.writeFileSync(fname, JSON.stringify(json, null, 2));
              console.log('[SAVED QUESTIONS] ' + fname + ' - url: ' + url.substring(0,80));
          } catch (e) {}
      }
  });

  // Login
  await page.goto('https://accounts.examgoal.com/login', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  
  const btns1 = await page.$$('button');
  for (const btn of btns1) {
    const text = await page.evaluate(el => el.textContent.trim().toLowerCase(), btn);
    if (text === 'phone') { await btn.click(); break; }
  }
  await new Promise(r => setTimeout(r, 1500));
  
  await page.evaluate(() => {
    const inp = document.querySelector('input[type="number"]');
    if(inp) { inp.value = '7750858874'; inp.dispatchEvent(new Event('input', { bubbles: true })); }
  });
  await new Promise(r => setTimeout(r, 500));
  
  const passInput = await page.$('input[type="password"]');
  if (passInput) {
    await passInput.click({ clickCount: 3 });
    await page.keyboard.type(PASSWORD, { delay: 50 });
  }
  
  const btns2 = await page.$$('button');
  for (const btn of btns2) {
    const text = await page.evaluate(el => el.textContent.trim(), btn);
    if (/^Login$/i.test(text)) { await btn.click(); break; }
  }
  
  await new Promise(r => setTimeout(r, 5000));
  console.log('Logged in. URL:', page.url());

  // Navigate to JEE Main math PYQ chapters listing
  await page.goto('https://room.examgoal.com/pyq/jee-main/mathematics', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 8000));
  
  // Log cookies and localStorage to find token
  const cookies = await page.cookies();
  const authCookie = cookies.find(c => c.name.toLowerCase().includes('token') || c.name.toLowerCase().includes('auth'));
  console.log('Auth cookie:', authCookie ? authCookie.name + '=' + authCookie.value.substring(0, 30) : 'none');
  
  const storage = await page.evaluate(() => {
      const all = {};
      for (let k of Object.keys(localStorage)) all[k] = localStorage[k];
      return all;
  });
  console.log('LocalStorage keys:', Object.keys(storage));
  
  const sessionStorage = await page.evaluate(() => {
      const all = {};
      for (let k of Object.keys(sessionStorage)) all[k] = sessionStorage[k];
      return all;
  });
  console.log('SessionStorage keys:', Object.keys(sessionStorage));
  
  fs.writeFileSync('all_storage.json', JSON.stringify({ localStorage: storage, sessionStorage }, null, 2));
  
  // Get chapter list from page
  const chapters = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('a, [class*="chapter"], [class*="subject"]'));
      return items.slice(0, 50).map(el => ({ 
          text: el.innerText?.trim().substring(0, 50), 
          href: el.href || '',
          cls: el.className.substring(0, 30)
      })).filter(x => x.text);
  });
  console.log('Page elements:', JSON.stringify(chapters.slice(0, 20), null, 2));
  
  console.log('ExamGoal token:', examGoalToken ? 'FOUND' : 'NOT FOUND');
  
  await browser.close();
})();
