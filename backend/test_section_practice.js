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
    
    // Navigate directly to the chapter list for Physics XI Part 1
    console.log("Navigating to room.examgoal.com/books/e4d8b045-a472-5039-9bec-6072e92095e8...");
    await page.goto('https://room.examgoal.com/books/e4d8b045-a472-5039-9bec-6072e92095e8', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 5000));
    
    // Click on the first "Exemplar Questions" link or button
    console.log("Finding and clicking 'Exemplar Questions' button...");
    const clicked = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('a, button'));
      for (const btn of btns) {
        if (btn.innerText.includes('Exemplar Questions')) {
          btn.click();
          return true;
        }
      }
      return false;
    });
    
    if (clicked) {
      console.log("Clicked successfully! Waiting 10 seconds for question API load...");
      apis.length = 0;
      await new Promise(r => setTimeout(r, 10000));
      
      console.log("Current URL:", page.url());
      console.log(`Captured ${apis.length} APIs:`);
      apis.forEach((api, idx) => {
        if (api.url.includes('/api/v1/')) {
          console.log(`  ${idx+1}. [${api.text.length}b] ${api.url.substring(0, 110)}`);
          if (api.url.includes('question') || api.url.includes('meta')) {
            console.log(`     Content: ${api.text.substring(0, 300)}`);
          }
        }
      });
      
      fs.writeFileSync('page_book_questions.html', await page.content());
    } else {
      console.log("Could not find 'Exemplar Questions' button on page.");
    }
    
  } catch(e) {
    console.error("Error:", e.message);
  } finally {
    await browser.close();
  }
})();
