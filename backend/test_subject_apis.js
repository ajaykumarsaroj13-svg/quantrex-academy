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
    
    // Test endpoints
    const examId = "cea4e815-231c-545e-a844-bb45b16b5ccb"; // JEE Main ID
    
    console.log("Testing API paths in browser context...");
    const results = await page.evaluate(async (id) => {
      const testPaths = [
        `/api/v1/metadata/subjects?examId=${id}`,
        `/api/v1/metadata/subjects?exam=${id}`,
        `/api/v1/metadata/subjects?examKey=jee-main`,
        `/api/v1/metadata/subjects?country=in&exam=${id}`,
        `/api/v1/past-question/subject?exam=${id}`,
        `/api/v1/past-question/subject/meta/${id}`,
        `/api/v1/past-question/subject/meta?exam=${id}`,
        `/api/v1/past-question/exam/subjects?exam=${id}`,
        `/api/v1/metadata/examSubjects?examId=${id}`,
        `/api/v1/metadata/examSubjects?exam=${id}`
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
    }, examId);
    
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
