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
    
    // Fetch JEE Advanced paper questions inside browser context
    const paperId = "882f2ae3-eccc-550c-828d-ed092a4807e8";
    console.log(`Fetching questions for paper ${paperId}...`);
    
    const data = await page.evaluate(async (id) => {
      const url = `/api/v1/past-question/question/meta/${id}?user_stats=t`;
      const res = await fetch(url, { credentials: 'include' });
      return res.ok ? await res.json() : { error: res.status };
    }, paperId);
    
    console.log("Saving to sample_jee_advanced_questions.json...");
    fs.writeFileSync('sample_jee_advanced_questions.json', JSON.stringify(data, null, 2));
    console.log("Saved successfully!");
    
    // Analyze keys
    if (data.results) {
      console.log(`Results contains ${data.results.length} subject entries.`);
      data.results.forEach(subj => {
        console.log(`- Subject: "${subj.title}" | Questions count: ${subj.questions ? subj.questions.length : 0}`);
        if (subj.questions && subj.questions.length > 0) {
          const q = subj.questions[0];
          console.log(`  * Sample question keys:`, Object.keys(q));
          console.log(`  * Sample question en keys:`, Object.keys(q.question?.en || {}));
        }
      });
    }
    
  } catch(e) {
    console.error("Error:", e.message);
  } finally {
    await browser.close();
  }
})();
