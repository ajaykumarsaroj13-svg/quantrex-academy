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
    
    const exams = [
      { name: "JEE Main", id: "cea4e815-231c-545e-a844-bb45b16b5ccb" },
      { name: "JEE Advanced", id: "066f55b4-d2b7-5f8f-9534-4d8b4724cfc6" },
      { name: "NDA", id: "ae12242c-2043-5d12-97f1-4863e7f59180" },
      { name: "BITSAT", id: "927dc81f-cde0-5a78-a96a-65d8cea03711" },
      { name: "Class 12", id: "9990e3cc-d4c9-59c0-95cc-7c362f6d79f8" }
    ];
    
    for (const exam of exams) {
      console.log(`\nNavigating directly to ${exam.name} Page...`);
      apis.length = 0; // Clear APIs tracker
      
      const targetUrl = `https://room.examgoal.com/pyq/exam/${exam.id}`;
      await page.goto(targetUrl, { waitUntil: 'networkidle2' });
      await new Promise(r => setTimeout(r, 4000));
      
      const finalUrl = page.url();
      console.log(`- Final URL: ${finalUrl}`);
      
      const body = await page.evaluate(() => document.body.innerText);
      console.log(`- Body Text (first 300 chars):`);
      console.log(body.substring(0, 300).replace(/\s+/g, ' '));
      
      // Let's print out if any interesting API calls occurred
      console.log(`- Captured ${apis.length} APIs:`);
      apis.forEach((api, idx) => {
        if (api.url.includes('/api/v1/')) {
          console.log(`  * [${api.text.length}b] ${api.url.substring(0, 100)}`);
          if (api.url.includes('subject') || api.url.includes('meta')) {
            console.log(`    Content: ${api.text.substring(0, 200)}`);
          }
        }
      });
      
      fs.writeFileSync(`page_${exam.name.replace(/\s+/g, '_')}.html`, await page.content());
    }
    
  } catch(e) {
    console.error("Error:", e.message);
  } finally {
    await browser.close();
  }
})();
