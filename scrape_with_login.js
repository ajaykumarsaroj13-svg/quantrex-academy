import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  // Intercept API calls
  const apiCalls = [];
  page.on('response', async (response) => {
    const url = response.url();
    try {
      const contentType = response.headers()['content-type'] || '';
      if (contentType.includes('json')) {
        const text = await response.text();
        if (text.length > 10 && text.length < 500000) {
          apiCalls.push({ url, size: text.length, preview: text.substring(0, 300) });
        }
      }
    } catch(e) {}
  });

  // Step 1: Go to login page
  console.log('Step 1: Go to accounts.examgoal.com/login...');
  await page.goto('https://accounts.examgoal.com/login', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 3000));
  
  // Step 2: Click Phone tab - need to look at actual DOM structure
  console.log('Step 2: Click Phone button...');
  // Let's dump all clickable elements text
  const clickableTexts = await page.evaluate(() => {
    const elements = document.querySelectorAll('button, a, [role="tab"], label');
    return Array.from(elements).map(e => ({ tag: e.tagName, text: e.textContent.trim().substring(0,50), classes: e.className.substring(0,100) }));
  });
  console.log('Clickable elements:', JSON.stringify(clickableTexts));
  
  // Click the Phone button using page.click with text selector
  await page.evaluate(() => {
    const allElements = document.querySelectorAll('*');
    for (const el of allElements) {
      if (el.childNodes.length === 1 && el.childNodes[0].nodeType === 3 && el.textContent.trim() === 'Phone') {
        el.click();
        break;
      }
    }
  });
  await new Promise(r => setTimeout(r, 2000));
  
  // Check what changed
  const inputs2 = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input')).map(i => ({
      type: i.type, name: i.name, placeholder: i.placeholder, visible: getComputedStyle(i).display !== 'none'
    }));
  });
  console.log('Inputs after phone:', JSON.stringify(inputs2));
  await page.screenshot({ path: 'eg2_phone_tab.png' });
  
  // Step 3: Try typing phone in the text input
  console.log('Step 3: Enter phone number...');
  // First clear and type in the text input
  const textInput = await page.$('input[type="text"]');
  if (textInput) {
    await textInput.click({ clickCount: 3 });
    await textInput.type('7750858874', { delay: 30 });
  }
  
  const pwdInput = await page.$('input[type="password"]');
  if (pwdInput) {
    await pwdInput.click({ clickCount: 3 });
    await pwdInput.type('12345678', { delay: 30 });
  }
  
  await page.screenshot({ path: 'eg2_creds.png' });
  
  // Step 4: Click Login
  console.log('Step 4: Submit login...');
  await page.evaluate(() => {
    const btns = document.querySelectorAll('button');
    for (const btn of btns) {
      if (btn.textContent.trim() === 'Login') {
        btn.click();
        break;
      }
    }
  });
  
  // Wait for response and possible redirect
  await new Promise(r => setTimeout(r, 8000));
  
  const currentUrl = page.url();
  console.log('URL after login:', currentUrl);
  await page.screenshot({ path: 'eg2_post_login.png' });
  
  // Check if login succeeded
  const cookies = await page.cookies();
  console.log('Cookies count:', cookies.length);
  console.log('Cookie names:', cookies.map(c => c.name).join(', '));
  
  // Step 5: Navigate to room.examgoal.com (the test series dashboard)
  console.log('Step 5: Navigate to room.examgoal.com...');
  await page.goto('https://room.examgoal.com/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 5000));
  
  const roomUrl = page.url();
  console.log('Room URL:', roomUrl);
  const roomText = await page.evaluate(() => document.body.innerText.substring(0, 500));
  console.log('Room text:', roomText.substring(0, 300));
  await page.screenshot({ path: 'eg2_room.png' });
  
  // Step 6: Try test series
  console.log('Step 6: Navigate to test series...');
  await page.goto('https://room.examgoal.com/tests/series/tsr-19g61mnpryz1v', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 10000));
  
  const tsText = await page.evaluate(() => document.body.innerText);
  fs.writeFileSync('examgoal_scraped.txt', tsText);
  console.log('Test series text length:', tsText.length);
  console.log('First 1000 chars:', tsText.substring(0, 1000));
  
  await page.screenshot({ path: 'eg2_test_series.png' });
  
  fs.writeFileSync('examgoal_api_calls.json', JSON.stringify(apiCalls, null, 2));
  
  console.log('Done!');
  await browser.close();
})();
