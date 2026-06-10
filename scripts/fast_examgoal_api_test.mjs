import puppeteer from 'puppeteer';
import fs from 'fs';

const MOBILE = '7750858874';
const PASSWORD = '12345678';
const LOGIN_URL = 'https://accounts.examgoal.com/login';

(async () => {
  console.log('Launching browser to find Auth Token...');
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--window-size=1280,800'] });
  const page = await browser.newPage();
  
  let authToken = '';

  page.on('request', req => {
      const headers = req.headers();
      if (headers['authorization']) {
          authToken = headers['authorization'];
      }
  });

  console.log('Logging in...');
  await page.goto(LOGIN_URL, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  
  const phoneBtns = await page.$$('button');
  for (const btn of phoneBtns) {
    const text = await page.evaluate(el => el.textContent.trim().toLowerCase(), btn);
    if (text === 'phone') { await btn.click(); break; }
  }
  await new Promise(r => setTimeout(r, 1000));
  
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
  
  const btns = await page.$$('button');
  for (const btn of btns) {
    const text = await page.evaluate(el => el.textContent.trim(), btn);
    if (text === 'Login') { await btn.click(); break; }
  }
  
  await new Promise(r => setTimeout(r, 5000));
  console.log('Auth Token:', authToken ? 'Found!' : 'Not Found');
  
  if (authToken) {
      console.log('Testing fast API fetch for chapters...');
      try {
          const res = await fetch('https://room.examgoal.com/api/v1/metadata/multi/by-id?keys=jee-main-mathematics-chapters', {
              headers: { 'Authorization': authToken }
          });
          const data = await res.json();
          fs.writeFileSync('fast_api_test.json', JSON.stringify(data, null, 2));
          console.log('Saved API data!');
      } catch (e) {
          console.log('Fetch error:', e.message);
      }
  }

  await browser.close();
})();
