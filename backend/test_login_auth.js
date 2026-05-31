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

  try {
    console.log("Navigating to login page...");
    await page.goto('https://accounts.examgoal.com/login?redirect=https://room.examgoal.com/dashboard', { waitUntil: 'networkidle2', timeout: 60000 });
    
    await new Promise(r => setTimeout(r, 2000));
    
    // Check if Phone button exists and click it
    const buttons = await page.$$('button');
    let clickedPhone = false;
    for(const btn of buttons) {
      const t = await page.evaluate(el => el.innerText, btn);
      if(t && t.trim() === 'Phone') {
        await btn.click();
        console.log("Clicked Phone tab");
        clickedPhone = true;
        await new Promise(r => setTimeout(r, 2000));
        break;
      }
    }
    
    if (!clickedPhone) {
      // Try to find any element with text 'Phone' and click it
      const elements = await page.$$('*');
      for (const el of elements) {
        const text = await page.evaluate(element => element.innerText, el);
        if (text && text.trim() === 'Phone') {
          await el.click();
          console.log("Clicked Phone element");
          clickedPhone = true;
          await new Promise(r => setTimeout(r, 2000));
          break;
        }
      }
    }

    // Fill credentials
    const inputs = await page.$$('input');
    console.log(`Found ${inputs.length} inputs.`);
    for (const input of inputs) {
      const type = await page.evaluate(el => el.getAttribute('type'), input);
      const ph = await page.evaluate(el => el.getAttribute('placeholder'), input);
      console.log(`Input type: ${type}, placeholder: ${ph}`);
      if (type === 'tel' || type === 'number' || (ph && ph.toLowerCase().includes('phone')) || (ph && ph.toLowerCase().includes('mobile'))) {
        await input.click();
        await input.type('7750858874', {delay: 50});
        console.log("Typed phone number");
      }
      if (type === 'password') {
        await input.click();
        await input.type('12345678', {delay: 50});
        console.log("Typed password");
      }
    }
    
    // Submit
    const submitBtns = await page.$$('button[type="submit"]');
    if (submitBtns.length > 0) {
      await submitBtns[0].click();
      console.log("Submit button clicked");
    } else {
      // Find buttons containing 'Login'
      let foundLogin = false;
      const btns = await page.$$('button');
      for (const btn of btns) {
        const text = await page.evaluate(el => el.innerText, btn);
        if (text && text.trim() === 'Login') {
          await btn.click();
          console.log("Clicked login button by text");
          foundLogin = true;
          break;
        }
      }
      if (!foundLogin) {
        await page.keyboard.press('Enter');
        console.log("Pressed Enter key");
      }
    }
    
    console.log("Waiting 15 seconds for login and redirects...");
    await new Promise(r => setTimeout(r, 15000));
    
    console.log("Current URL after login attempt:", page.url());
    
    const body = await page.evaluate(() => document.body.innerText);
    console.log("Dashboard Preview after login (first 1000 chars):");
    console.log(body.substring(0, 1000));
    
    fs.writeFileSync('examgoal_dashboard_after_login.html', await page.content());
    
  } catch(e) {
    console.error("Error:", e.message);
  } finally {
    await browser.close();
  }
})();
