import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
  console.log("Launching Puppeteer...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  // Track API responses
  const apis = [];
  page.on('response', async (response) => {
    const url = response.url();
    const status = response.status();
    const ct = response.headers()['content-type'] || '';
    if (ct.includes('application/json') && status === 200) {
      try {
        const text = await response.text();
        apis.push({ url, text });
      } catch (e) {}
    }
  });

  try {
    console.log("Logging in...");
    await page.goto('https://accounts.examgoal.com/login?redirect=https://room.examgoal.com/dashboard', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    
    // Switch to Phone tab
    const buttons = await page.$$('button');
    for(const btn of buttons) {
      const t = await page.evaluate(el => el.innerText, btn);
      if(t && t.trim() === 'Phone') {
        await btn.click();
        await new Promise(r => setTimeout(r, 2000));
        break;
      }
    }
    
    // Fill credentials
    const inputs = await page.$$('input');
    for (const input of inputs) {
      const type = await page.evaluate(el => el.getAttribute('type'), input);
      if (type === 'tel' || type === 'number') {
        await input.type('7750858874');
      }
      if (type === 'password') {
        await input.type('12345678');
      }
    }
    
    // Submit
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) await submitBtn.click();
    else await page.keyboard.press('Enter');
    
    console.log("Waiting for dashboard...");
    await new Promise(r => setTimeout(r, 12000));
    
    // Select JEE Main in drawer (has most tests)
    console.log("Activating JEE Main in drawer...");
    await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('div.exam-card'));
      for (const card of cards) {
        if (card.innerText.includes('JEE Main')) {
          const btn = card.querySelector('button.add-btn');
          if (btn) btn.click();
          return;
        }
      }
    });
    await new Promise(r => setTimeout(r, 3000));
    
    // Navigate directly to room.examgoal.com/
    console.log("Navigating to room.examgoal.com/...");
    await page.goto('https://room.examgoal.com/', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 6000));
    
    // Click on the first "Practice" button under papers list
    console.log("Finding and clicking 'Practice' button...");
    const clicked = await page.evaluate(() => {
      // Find all buttons containing text 'Practice'
      const btns = Array.from(document.querySelectorAll('button, a'));
      for (const btn of btns) {
        if (btn.innerText.trim() === 'Practice') {
          btn.click();
          return true;
        }
      }
      return false;
    });
    
    if (clicked) {
      console.log("Practice button clicked! Waiting 10 seconds for question API load...");
      apis.length = 0; // Clear APIs
      await new Promise(r => setTimeout(r, 10000));
      
      console.log("Current URL:", page.url());
      console.log(`Captured ${apis.length} APIs:`);
      apis.forEach((api, idx) => {
        if (api.url.includes('/api/v1/')) {
          console.log(`  ${idx+1}. [${api.text.length}b] ${api.url.substring(0, 110)}`);
          if (api.url.includes('question') || api.url.includes('meta') || api.url.includes('test')) {
            console.log(`     Content: ${api.text.substring(0, 300)}`);
          }
        }
      });
      
      fs.writeFileSync('page_practice_intercept.html', await page.content());
    } else {
      console.log("Could not find 'Practice' button.");
    }
    
  } catch(e) {
    console.error("Error:", e.message);
  } finally {
    await browser.close();
  }
})();
