import puppeteer from 'puppeteer';
import fs from 'fs';

const MOBILE = '7750858874';
const PASSWORD = '12345678';
const LOGIN_URL = 'https://accounts.examgoal.com/login';

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  let authToken = '';
  let userId = '';
  
  page.on('request', req => {
      const headers = req.headers();
      if (headers['authorization'] && headers['authorization'].startsWith('Bearer')) {
          authToken = headers['authorization'];
      }
  });

  page.on('response', async (res) => {
      const url = res.url();
      if (url.includes('/api/v1/auth/login/phone')) {
          try {
              const json = await res.json();
              if (json.token) authToken = 'Bearer ' + json.token;
              console.log('Got token from login response!');
          } catch (e) {}
      }
      if (url.includes('/api/v1/auth/profile/me')) {
          try {
              const json = await res.json();
              userId = json?.data?.id || '';
              console.log('Got userId:', userId);
          } catch (e) {}
      }
  });

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
  
  console.log('Auth Token found:', !!authToken);
  
  if (!authToken) {
      console.log('No token found. Trying to navigate to get it...');
      await page.goto('https://room.examgoal.com/pyq', { waitUntil: 'networkidle2' });
      await new Promise(r => setTimeout(r, 5000));
      console.log('Auth Token after navigation:', !!authToken);
  }

  fs.writeFileSync('auth_token.txt', authToken || '');
  console.log('Saved auth token to auth_token.txt');
  
  await browser.close();
})();
