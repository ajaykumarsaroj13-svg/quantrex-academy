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
    
    const targets = [
      { name: "JEE Main", examKey: "jee-main", groupKey: "jee" },
      { name: "JEE Advanced", examKey: "jee-advanced", groupKey: "jee" },
      { name: "BITSAT", examKey: "bitsat", groupKey: "jee" },
      { name: "NDA", examKey: "nda", groupKey: "defence" },
      { name: "Class 12", examKey: "class-12", groupKey: "cbse" }
    ];
    
    const allMetadata = {};
    
    for (const target of targets) {
      console.log(`\n=================== PROCESSING: ${target.name} ===================`);
      
      // 1. Activate exam in drawer
      console.log(`- Activating ${target.examKey} in drawer...`);
      const activated = await page.evaluate((examKey) => {
        const cards = Array.from(document.querySelectorAll('div.exam-card'));
        for (const card of cards) {
          if (card.innerText.includes(examKey) || (examKey === 'class-12' && card.innerText.includes('Class 12')) || (examKey === 'jee-main' && card.innerText.includes('JEE Main')) || (examKey === 'jee-advanced' && card.innerText.includes('JEE Advanced')) || (examKey === 'bitsat' && card.innerText.includes('BITSAT')) || (examKey === 'nda' && card.innerText.includes('NDA'))) {
            const btn = card.querySelector('button.add-btn');
            if (btn) {
              btn.click();
              return 'clicked-plus';
            }
            return 'already-active';
          }
        }
        return 'not-found';
      }, target.examKey);
      
      console.log(`  Activation status: ${activated}`);
      await new Promise(r => setTimeout(r, activated === 'clicked-plus' ? 5000 : 2000));
      
      // 2. Reload dashboard to apply
      console.log(`- Loading homepage for context...`);
      await page.goto('https://room.examgoal.com/', { waitUntil: 'networkidle2' });
      await new Promise(r => setTimeout(r, 5000));
      
      // 3. Fetch subjects, papers, and test series inside browser context
      console.log(`- Fetching metadata APIs for ${target.name}...`);
      const meta = await page.evaluate(async (group, exam) => {
        const fetchJson = async (url) => {
          try {
            const res = await fetch(url, { credentials: 'include' });
            return res.ok ? await res.json() : { error: res.status };
          } catch (e) {
            return { error: e.message };
          }
        };
        
        const subjectsUrl = `/api/v1/metadata/subjects?country=in&examGroup=${group}&exam=${exam}&from=pq`;
        const papersUrl = `/api/v1/metadata/papers?country=in&examGroup=${group}&exam=${exam}&from=pq`;
        const testSeriesUrl = `/api/v1/test/test-id-series/pyq-in-${group}-${exam}?section=0`;
        
        const subjects = await fetchJson(subjectsUrl);
        const papers = await fetchJson(papersUrl);
        const testSeries = await fetchJson(testSeriesUrl);
        
        return { subjects, papers, testSeries };
      }, target.groupKey, target.examKey);
      
      allMetadata[target.examKey] = meta;
      
      const numSubjects = meta.subjects?.results?.length || 0;
      const numPapers = meta.papers?.results?.length || 0;
      const numTests = meta.testSeries?.results?.length || meta.testSeries?.data?.length || 0;
      console.log(`  ✓ Subj count: ${numSubjects} | Papers count: ${numPapers} | Tests count: ${numTests}`);
    }
    
    console.log("\nSaving all metadata to all_exams_metadata.json...");
    fs.writeFileSync('all_exams_metadata.json', JSON.stringify(allMetadata, null, 2));
    console.log("Saved successfully!");
    
  } catch(e) {
    console.error("Error:", e.message);
  } finally {
    await browser.close();
  }
})();
