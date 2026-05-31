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
    
    // Click Phone tab
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
    
    // Now, call the APIs inside the browser context
    console.log("Fetching metadata from browser context...");
    const metadata = await page.evaluate(async () => {
      const fetchJson = async (url) => {
        const res = await fetch(url, { credentials: 'include' });
        return res.ok ? await res.json() : null;
      };
      
      const examGroups = await fetchJson('/api/v1/metadata/examGroups?country=in&from=pq');
      const jeeExams = await fetchJson('/api/v1/metadata/exams?country=in&examGroup=jee&from=pq');
      const defenceExams = await fetchJson('/api/v1/metadata/exams?country=in&examGroup=defence&from=pq');
      const cbseExams = await fetchJson('/api/v1/metadata/exams?country=in&examGroup=cbse&from=pq');
      
      return { examGroups, jeeExams, defenceExams, cbseExams };
    });
    
    console.log("Saving metadata to metadata.json...");
    fs.writeFileSync('metadata.json', JSON.stringify(metadata, null, 2));
    console.log("Saved successfully!");
    
    console.log("Summary of exams found:");
    if (metadata.jeeExams) {
      console.log("- JEE Group Exams:");
      metadata.jeeExams.forEach(e => console.log(`  * ${e.name} (${e.id || e._id})`));
    }
    if (metadata.defenceExams) {
      console.log("- Defence Group Exams:");
      metadata.defenceExams.forEach(e => console.log(`  * ${e.name} (${e.id || e._id})`));
    }
    if (metadata.cbseExams) {
      console.log("- CBSE/NCERT Group Exams:");
      metadata.cbseExams.forEach(e => console.log(`  * ${e.name} (${e.id || e._id})`));
    }
    
  } catch(e) {
    console.error("Error:", e.message);
  } finally {
    await browser.close();
  }
})();
