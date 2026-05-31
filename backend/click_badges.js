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
    console.log("Current URL on dashboard:", page.url());
    
    // Find all divs with text "JEE Advanced"
    const divs = await page.$$('div');
    let targetCard = null;
    for (const div of divs) {
      const text = await page.evaluate(el => el.innerText, div);
      if (text && text.trim() === 'JEE Advanced') {
        // Get the parent card (contains the badge)
        targetCard = await page.evaluateHandle(el => el.closest('.cursor-pointer'), div);
        break;
      }
    }
    
    if (targetCard) {
      console.log("Found JEE Advanced card! Now finding the PYQ Topic Wise badge inside it...");
      // Find badge inside targetCard
      const badge = await targetCard.$('.badge');
      if (badge) {
        const badgeText = await page.evaluate(el => el.innerText, badge);
        console.log(`Found badge with text: "${badgeText}". Clicking it...`);
        
        // Intercept navigation or click
        apis.length = 0;
        await badge.click();
        
        console.log("Waiting 8 seconds for page redirect...");
        await new Promise(r => setTimeout(r, 8000));
        
        console.log("Current URL after click:", page.url());
        console.log(`Captured ${apis.length} APIs:`);
        apis.forEach((api, idx) => {
          if (api.url.includes('/api/v1/')) {
            console.log(`  ${idx+1}. [${api.text.length}b] ${api.url.substring(0, 100)}`);
          }
        });
        
        fs.writeFileSync('after_click_adv.html', await page.content());
      } else {
        console.log("Badge not found inside JEE Advanced card.");
      }
    } else {
      console.log("JEE Advanced card not found.");
    }
    
  } catch(e) {
    console.error("Error:", e.message);
  } finally {
    await browser.close();
  }
})();
