import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cookiesPath = path.join(__dirname, 'examgoal_cookies.json');

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,900']
  });
  
  const page = await browser.newPage();
  
  // Set cookies if we have them
  if (fs.existsSync(cookiesPath)) {
    console.log('Loading cookies...');
    const cookies = JSON.parse(fs.readFileSync(cookiesPath, 'utf8'));
    await page.setCookie(...cookies);
  }
  
  // Go to Room
  console.log('Navigating to room.examgoal.com...');
  await page.goto('https://room.examgoal.com/', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 5000));
  
  // Check localStorage for token
  const ls = await page.evaluate(() => {
    const d = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      d[k] = localStorage.getItem(k);
    }
    return d;
  });
  
  fs.writeFileSync('room_ls.json', JSON.stringify(ls, null, 2));
  
  let token = null;
  // Common keys ExamGoal uses for auth token
  if (ls['userToken']) token = ls['userToken'];
  else if (ls['access_token']) token = ls['access_token'];
  else if (ls['auth']) {
    try {
      token = JSON.parse(ls['auth']).token;
    } catch(e) {}
  }
  
  for (const [k, v] of Object.entries(ls)) {
    if (k.toLowerCase().includes('token') || String(v).startsWith('eyJ')) {
      console.log('Potential token key:', k);
      if (!token) token = String(v);
    }
  }
  
  if (token) {
    console.log('✅ Found Room Token:', token.substring(0, 50) + '...');
    fs.writeFileSync('room_token.txt', token);
  } else {
    console.log('❌ Room token not found in localStorage. Checking API requests...');
    
    // Attempt login again via UI specifically on room.examgoal.com
    await page.goto('https://accounts.examgoal.com/login', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    // Click phone
    const phoneBtns = await page.$$('button');
    for (const btn of phoneBtns) {
      if ((await page.evaluate(el => el.textContent, btn)).trim().toLowerCase() === 'phone') {
        await btn.click(); break;
      }
    }
    await new Promise(r => setTimeout(r, 1000));
    // Enter phone and password
    await page.evaluate(() => {
      const inputs = document.querySelectorAll('input');
      inputs.forEach(inp => {
        if (inp.type === 'number') {
          inp.value = '7750858874';
          inp.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (inp.type === 'password') {
          inp.value = '12345678';
          inp.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });
    });
    // Submit
    const loginBtns = await page.$$('button');
    for (const btn of loginBtns) {
      if ((await page.evaluate(el => el.textContent, btn)).trim().toLowerCase() === 'login') {
        await btn.click(); break;
      }
    }
    await new Promise(r => setTimeout(r, 6000));
    console.log('Re-login complete. Going back to room...');
    await page.goto('https://room.examgoal.com/', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 4000));
    const newLs = await page.evaluate(() => {
      const d = {};
      for (let i = 0; i < localStorage.length; i++) {
        d[localStorage.key(i)] = localStorage.getItem(localStorage.key(i));
      }
      return d;
    });
    fs.writeFileSync('room_ls_after_relogin.json', JSON.stringify(newLs, null, 2));
    
    // ExamGoal uses 'firebase:authUser:...' keys! 
    for (const [k, v] of Object.entries(newLs)) {
      if (k.startsWith('firebase:authUser:')) {
        try {
          const authData = JSON.parse(v);
          token = authData.stsTokenManager?.accessToken;
          console.log('✅ Found Firebase auth token!');
        } catch(e) {}
      }
    }
    if (token) fs.writeFileSync('room_token.txt', token);
  }
  
  if (token) {
    console.log('\n--- FETCHING JEE MAIN TESTS LIST ---');
    // We can fetch tests using standard Fetch API in browser context
    const testsData = await page.evaluate(async (authToken) => {
      // room.examgoal.com uses an API endpoint for past questions
      // Let's try some known ones
      try {
        const res = await fetch('https://room.examgoal.com/api/v1/past-question/tests/country/in/examGroup/jee/exam/jee-main', {
          headers: { 'Authorization': 'Bearer ' + authToken }
        });
        if (res.ok) return await res.json();
      } catch(e) {}
      
      try {
        const res = await fetch('https://api.examgoal.com/v1/full-test-series/jee-main');
        if (res.ok) return await res.json();
      } catch(e) {}
      
      return null;
    }, token);
    
    if (testsData) {
      console.log('✅ Fetched JEE Main test list! Count:', testsData?.results?.length || testsData?.data?.length || '?');
      fs.writeFileSync('examgoal_jee_main_tests.json', JSON.stringify(testsData, null, 2));
    } else {
      console.log('❌ Failed to fetch test list using token.');
    }
  }

  await browser.close();
})();
