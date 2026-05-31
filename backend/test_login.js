import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
  console.log("Launching Puppeteer...");
  const browser = await puppeteer.launch({
    headless: true, // headless to avoid spawning a UI window
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  try {
    console.log("Navigating to ExamGoal login...");
    await page.goto('https://room.examgoal.com/login', { waitUntil: 'networkidle2', timeout: 60000 });
    
    // Switch to Phone tab
    const buttons = await page.$$('button');
    for(const btn of buttons) {
      const t = await page.evaluate(el => el.innerText, btn);
      if(t && t.trim() === 'Phone') {
        await btn.click();
        console.log("Clicked Phone tab");
        await new Promise(r => setTimeout(r, 2000));
        break;
      }
    }
    
    // Fill credentials
    const inputs = await page.$$('input');
    for (const input of inputs) {
      const type = await page.evaluate(el => el.getAttribute('type'), input);
      const ph = await page.evaluate(el => el.getAttribute('placeholder'), input);
      if (type === 'tel' || type === 'number' || (ph && ph.toLowerCase().includes('phone'))) {
        await input.click();
        await input.type('7750858874', {delay: 50});
      }
      if (type === 'password') {
        await input.click();
        await input.type('12345678', {delay: 50});
      }
    }
    
    // Submit
    const submitBtns = await page.$$('button[type="submit"]');
    if (submitBtns.length > 0) {
      await submitBtns[0].click();
      console.log("Submit button clicked");
    } else {
      await page.keyboard.press('Enter');
    }
    
    console.log("Waiting for login redirect...");
    await new Promise(r => setTimeout(r, 15000));
    
    const url = page.url();
    console.log("Current URL:", url);
    
    const body = await page.evaluate(() => document.body.innerText);
    console.log("Dashboard Preview (first 1000 chars):");
    console.log(body.substring(0, 1000));
    
    // Save page content
    fs.writeFileSync('examgoal_dashboard_test.html', await page.content());
    
  } catch(e) {
    console.error("Error:", e.message);
  } finally {
    await browser.close();
  }
})();
