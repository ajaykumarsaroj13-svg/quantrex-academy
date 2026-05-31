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

  // Track API calls
  const apis = [];
  page.on('response', async (response) => {
    const url = response.url();
    const status = response.status();
    const ct = response.headers()['content-type'] || '';
    if (ct.includes('application/json') && status === 200) {
      try {
        const text = await response.text();
        apis.push({ url, length: text.length, preview: text.substring(0, 200) });
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
    
    // Let's find all cards that have text and click JEE Advanced
    const cards = await page.$$('div.cursor-pointer');
    console.log(`Found ${cards.length} clickable cards.`);
    
    let clickedAdv = false;
    for (const card of cards) {
      const text = await page.evaluate(el => el.innerText, card);
      console.log(`Card text: "${text.replace(/\s+/g, ' ')}"`);
      if (text.includes('JEE Advanced')) {
        console.log("Clicking JEE Advanced card...");
        await card.click();
        clickedAdv = true;
        break;
      }
    }
    
    if (clickedAdv) {
      console.log("Waiting 10 seconds for navigation/API load...");
      await new Promise(r => setTimeout(r, 10000));
      console.log("Current URL after clicking JEE Advanced:", page.url());
      
      // Let's print out all captured APIs
      console.log(`Captured ${apis.length} APIs:`);
      apis.forEach((api, idx) => {
        console.log(`  ${idx+1}. [${api.length}b] ${api.url.substring(0, 120)}`);
      });
      
      fs.writeFileSync('jee_advanced_page.html', await page.content());
    } else {
      console.log("JEE Advanced card not found.");
    }
    
  } catch(e) {
    console.error("Error:", e.message);
  } finally {
    await browser.close();
  }
})();
