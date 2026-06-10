const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, 'public', 'data', 'questions', 'raw_adv_math');
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const chaptersList = JSON.parse(fs.readFileSync('adv_math_chapters.json', 'utf-8'));

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('https://room.examgoal.com/login', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  
  const tabs = await page.$$('button[role="tab"]');
  for (const tab of tabs) {
    const text = await page.evaluate(el => el.textContent, tab);
    if (text.includes('Phone')) {
      await tab.click();
      break;
    }
  }
  
  await page.waitForTimeout(1000);
  const phoneInput = await page.$('input[type="number"][name="phone"]');
  if (phoneInput) await phoneInput.type('7750858874');
  const passInput = await page.$('input[type="password"]');
  if (passInput) await passInput.type('12345678');
  const submitBtn = await page.$('button[type="submit"]');
  if (submitBtn) await submitBtn.click();
  
  await page.waitForTimeout(4000);
  
  console.log('Logged in successfully. Starting to scrape advanced chapters using fetch...');
  
  for (let i = 0; i < chaptersList.length; i++) {
    const ch = chaptersList[i];
    const metaId = ch.metaId || ch.id;
    const outputFile = path.join(OUTPUT_DIR, `raw_adv_math_${metaId}.json`);
    
    if (fs.existsSync(outputFile)) {
        console.log(`[${i+1}/${chaptersList.length}] Skipping ${ch.title || ch.name}, already scraped.`);
        continue;
    }
    
    console.log(`[${i+1}/${chaptersList.length}] Fetching ${ch.title || ch.name}...`);
    
    try {
        const data = await page.evaluate(async (id) => {
            const res = await fetch(`https://room.examgoal.com/api/v1/past-question/question/meta/${id}?from=pq`);
            if (!res.ok) throw new Error('Fetch failed: ' + res.status);
            return await res.json();
        }, metaId);
        
        fs.writeFileSync(outputFile, JSON.stringify(data, null, 2));
        console.log(`Saved ${ch.title || ch.name} data.`);
    } catch(err) {
        console.error(`Failed to capture data for ${ch.title || ch.name}:`, err.message);
    }
    
    // Add small delay to avoid rate limiting
    await page.waitForTimeout(1000);
  }
  
  await browser.close();
  console.log('Finished scraping advanced math!');
})();
