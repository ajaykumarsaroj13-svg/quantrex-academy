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
    if (ct.includes('application/json')) {
      try {
        const text = await response.text();
        apis.push({ url, status, text });
      } catch (e) {}
    }
  });

  try {
    console.log("Logging in...");
    await page.goto('https://accounts.examgoal.com/login?redirect=https://room.examgoal.com/dashboard', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    
    // Phone click
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
    
    // Find JEE Advanced card inside drawer and click the add button using DOM click
    console.log("Locating add button for JEE Advanced...");
    const clicked = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('div.exam-card'));
      for (const card of cards) {
        if (card.innerText.includes('JEE Advanced')) {
          const btn = card.querySelector('button.add-btn');
          if (btn) {
            btn.click();
            return true;
          }
        }
      }
      return false;
    });
    
    if (clicked) {
      console.log("Clicked add button via DOM click successfully!");
      console.log("Waiting 10 seconds for API calls...");
      await new Promise(r => setTimeout(r, 10000));
      
      console.log(`Captured ${apis.length} APIs:`);
      apis.forEach((api, idx) => {
        console.log(`  ${idx+1}. [Status ${api.status}] ${api.url.substring(0, 110)}`);
        console.log(`     Response: ${api.text.substring(0, 300)}`);
      });
      
      // Dump page content to check if exam is added or what happened
      const isStillPlus = await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('div.exam-card'));
        for (const card of cards) {
          if (card.innerText.includes('JEE Advanced')) {
            const btn = card.querySelector('button.add-btn');
            return btn ? true : false;
          }
        }
        return null;
      });
      
      console.log(`JEE Advanced card add-btn status: is it still a plus button? ${isStillPlus}`);
      fs.writeFileSync('after_dom_click_adv.html', await page.content());
    } else {
      console.log("Could not find JEE Advanced card add button in DOM.");
    }
    
  } catch(e) {
    console.error("Error:", e.message);
  } finally {
    await browser.close();
  }
})();
