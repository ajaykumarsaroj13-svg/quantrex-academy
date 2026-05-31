import puppeteer from 'puppeteer';

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
    
    // Activate JEE Main in drawer
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
    
    // Test endpoints
    const testId = "tst-19g71mnuno3s0"; // JEE Main Test ID from April 2026
    
    console.log("Testing API paths in browser context...");
    const results = await page.evaluate(async (id) => {
      const testPaths = [
        `/api/v1/test/questions/${id}`,
        `/api/v1/test/meta/${id}`,
        `/api/v1/past-question/test/${id}`,
        `/api/v1/test/start?testId=${id}`,
        `/api/v1/past-question/test/start/${id}`,
        `/api/v1/test/paper/questions/${id}`,
        `/api/v1/test/test-id-series/questions/${id}`,
        `/api/v1/test/questions?testId=${id}`
      ];
      
      const resList = [];
      for (const path of testPaths) {
        try {
          const res = await fetch(path, { credentials: 'include' });
          const text = await res.text();
          resList.push({ path, status: res.status, ok: res.ok, length: text.length, preview: text.substring(0, 300) });
        } catch (err) {
          resList.push({ path, error: err.message });
        }
      }
      return resList;
    }, testId);
    
    console.log("=== Probing Results ===");
    results.forEach((r, idx) => {
      console.log(`\n${idx+1}. Path: "${r.path}"`);
      if (r.error) {
        console.log(`   Error: ${r.error}`);
      } else {
        console.log(`   Status: ${r.status} | Ok: ${r.ok} | Length: ${r.length}`);
        console.log(`   Preview: ${r.preview}`);
      }
    });
    
  } catch(e) {
    console.error("Error:", e.message);
  } finally {
    await browser.close();
  }
})();
