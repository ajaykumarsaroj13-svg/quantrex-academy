import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: false, args: ['--window-size=1400,900'] });
  const page = await browser.newPage();
  
  await page.goto('https://accounts.examgoal.com/login', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  
  // Click Phone tab
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.trim().toLowerCase() === 'phone') {
      await btn.click(); break;
    }
  }
  await new Promise(r => setTimeout(r, 1000));
  
  // Login
  await page.evaluate(() => {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(inp => {
      if (inp.type === 'number') { inp.value = '7750858874'; inp.dispatchEvent(new Event('input', {bubbles: true})); }
      if (inp.type === 'password') { inp.value = '12345678'; inp.dispatchEvent(new Event('input', {bubbles: true})); }
    });
  });
  
  const loginBtns = await page.$$('button');
  for (const btn of loginBtns) {
    if ((await page.evaluate(el => el.textContent, btn)).trim().toLowerCase() === 'login') {
      await btn.click(); break;
    }
  }
  
  console.log('Waiting for login...');
  await new Promise(r => setTimeout(r, 5000));
  
  // Go to JEE Main full test series list
  console.log('Going to examgoal.com/full-test-series/jee-main...');
  await page.goto('https://examgoal.com/full-test-series/jee-main', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 3000));
  
  // Extract all test links
  const testLinks = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a'))
      .map(a => a.href)
      .filter(h => h.includes('room.examgoal.com/test/'));
  });
  
  console.log('Found Test Links:', testLinks.length);
  if (testLinks.length > 0) {
    fs.writeFileSync('extracted_test_links.json', JSON.stringify(testLinks, null, 2));
    
    // Process the first test
    const targetTest = testLinks[0];
    console.log('Testing first link:', targetTest);
    
    // We will intercept responses to catch the result payload
    let testDataCaptured = null;
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('/api/v1/past-question/') && !url.includes('OPTIONS') && response.request().method() !== 'OPTIONS') {
        try {
          const json = await response.json();
          // The result endpoint usually has questions
          if (json && json.questions && json.questions.length > 0) {
            console.log('✅ CAPTURED TEST JSON payload from:', url);
            testDataCaptured = json;
            fs.writeFileSync('sample_test_payload.json', JSON.stringify(json, null, 2));
          } else if (json && json.data && json.data.questions) {
             console.log('✅ CAPTURED TEST JSON (data.questions) from:', url);
             testDataCaptured = json.data;
             fs.writeFileSync('sample_test_payload.json', JSON.stringify(json.data, null, 2));
          }
        } catch(e) {}
      }
    });

    await page.goto(targetTest, { waitUntil: 'networkidle2' });
    console.log('Navigated to test. Waiting 5 seconds...');
    await new Promise(r => setTimeout(r, 5000));
    
    // Look for Submit button
    console.log('Attempting to submit test...');
    const submitBtns = await page.$$('button');
    for (const btn of submitBtns) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.toLowerCase().includes('submit')) {
         console.log('Clicking Submit button:', text.trim());
         await btn.click();
         break;
      }
    }
    
    await new Promise(r => setTimeout(r, 2000));
    // Confirm submit if there's a modal
    const confirmBtns = await page.$$('button');
    for (const btn of confirmBtns) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.toLowerCase().includes('yes') || text.toLowerCase().includes('submit')) {
         await btn.click().catch(()=> { /* ignore if not clickable */});
      }
    }
    
    console.log('Waiting for result network payload...');
    await new Promise(r => setTimeout(r, 10000));
    
    if (testDataCaptured) {
       console.log('SUCCESS: We got the exact ExamGoal test payload!');
    } else {
       console.log('Failed to capture payload.');
    }
  }

  await browser.close();
})();
