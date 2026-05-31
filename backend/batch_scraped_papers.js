import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const outBaseDir = "C:/Users/Admin/.gemini/antigravity/scratch/quantrex-academy/backend/data/scraped_questions";

// Ensure output directories exist
function ensureDirs(examKey) {
  const dir = path.join(outBaseDir, examKey);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

(async () => {
  console.log("=== Starting Master Question Downloader ===");
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
    
    // Phone tab switch
    const buttons = await page.$$('button');
    for(const btn of buttons) {
      const t = await page.evaluate(el => el.innerText, btn);
      if(t && t.trim() === 'Phone') {
        await btn.click();
        await new Promise(r => setTimeout(r, 2000));
        break;
      }
    }
    
    // Credentials
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
    console.log("Logged in! Session verified.");
    
    // Load metadata file
    const metaPath = "C:/Users/Admin/.gemini/antigravity/scratch/quantrex-academy/backend/all_exams_metadata.json";
    if (!fs.existsSync(metaPath)) {
      console.error("all_exams_metadata.json not found! Run dump_all_metadata.js first.");
      process.exit(1);
    }
    
    const allExams = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
    
    // ----------------------------------------------------
    // PART 1: SCRAPE ALL PAPERS FOR ALL EXAMS
    // ----------------------------------------------------
    for (const examKey of Object.keys(allExams)) {
      ensureDirs(examKey);
      const papers = allExams[examKey].papers?.results || [];
      console.log(`\n--- Scraping ${examKey} (${papers.length} papers) ---`);
      
      let downloaded = 0;
      let skipped = 0;
      
      for (const paper of papers) {
        const paperKey = paper.key;
        const paperId = paper.metaId || paper.id;
        if (!paperKey || !paperId) continue;
        
        const savePath = path.join(outBaseDir, examKey, `${paperKey}.json`);
        
        // Skip if already exists
        if (fs.existsSync(savePath)) {
          skipped++;
          continue;
        }
        
        try {
          // Fetch questions payload in browser context
          const data = await page.evaluate(async (id) => {
            const res = await fetch(`/api/v1/past-question/question/meta/${id}?user_stats=t`, { credentials: 'include' });
            return res.ok ? await res.json() : { error: res.status };
          }, paperId);
          
          if (data.error) {
            console.log(`  ❌ Failed: ${paperKey} (HTTP ${data.error})`);
          } else {
            fs.writeFileSync(savePath, JSON.stringify(data, null, 2));
            downloaded++;
            if (downloaded % 5 === 0) {
              console.log(`  ✓ Downloaded ${downloaded}/${papers.length} papers for ${examKey}...`);
            }
            // Delay to avoid rate limiting
            await new Promise(r => setTimeout(r, 350));
          }
        } catch (err) {
          console.log(`  ❌ Error on paper ${paperKey}: ${err.message}`);
        }
      }
      console.log(`  🎉 Finished ${examKey}! Downloaded: ${downloaded} | Skipped: ${skipped}`);
    }
    
    // ----------------------------------------------------
    // PART 2: SCRAPE NCERT CLASS 11 & 12 BOOKS
    // ----------------------------------------------------
    console.log("\n=================== SCRAPING NCERT BOOKS ===================");
    ensureDirs('ncert');
    
    // Fetch books list
    console.log("Fetching list of all books...");
    const booksData = await page.evaluate(async () => {
      const res = await fetch('/api/v1/metadata/book/books?from=qs', { credentials: 'include' });
      return res.ok ? await res.json() : null;
    });
    
    if (booksData && booksData.results) {
      console.log(`Found ${booksData.results.length} books in system.`);
      
      for (const book of booksData.results) {
        const bookKey = book.key;
        const bookId = book.metaId;
        console.log(`\n- NCERT Book: ${book.title || book.name} (${bookKey})`);
        
        // Fetch chapterGroups for this book
        const cgData = await page.evaluate(async (id) => {
          const res = await fetch(`/api/v1/metadata/book/chapterGroups/${id}?from=qs`, { credentials: 'include' });
          return res.ok ? await res.json() : null;
        }, bookId);
        
        const chapterGroups = cgData?.results || [];
        for (const cg of chapterGroups) {
          // Fetch chapters in group
          const chData = await page.evaluate(async (id) => {
            const res = await fetch(`/api/v1/metadata/book/chapters/${id}?from=qs`, { credentials: 'include' });
            return res.ok ? await res.json() : null;
          }, cg.metaId);
          
          const chapters = chData?.results || [];
          for (const ch of chapters) {
            const chKey = ch.key;
            // Fetch sections for this chapter
            const secData = await page.evaluate(async (id) => {
              const res = await fetch(`/api/v1/metadata/book/sections/${id}?from=qs`, { credentials: 'include' });
              return res.ok ? await res.json() : null;
            }, ch.metaId);
            
            const sections = secData?.results || [];
            for (const sec of sections) {
              const secKey = sec.key;
              const secId = sec.metaId;
              
              const savePath = path.join(outBaseDir, 'ncert', `${bookKey}_${chKey}_${secKey}.json`);
              if (fs.existsSync(savePath)) continue;
              
              try {
                // Fetch exemplar questions payload
                const questions = await page.evaluate(async (chapterId, sectionId) => {
                  const res = await fetch(`/api/v1/theory/book/questions/${chapterId}?section=${sectionId}`, { credentials: 'include' });
                  return res.ok ? await res.json() : { error: res.status };
                }, ch.metaId, secId);
                
                if (questions.error) {
                  console.log(`  ❌ Failed NCERT section: ${bookKey} -> ${chKey} -> ${secKey} (HTTP ${questions.error})`);
                } else {
                  fs.writeFileSync(savePath, JSON.stringify(questions, null, 2));
                  console.log(`  ✓ Saved NCERT questions: ${bookKey} -> ${chKey} -> ${secKey}`);
                  await new Promise(r => setTimeout(r, 350));
                }
              } catch (err) {
                console.log(`  ❌ Error NCERT: ${bookKey} -> ${chKey} -> ${secKey}: ${err.message}`);
              }
            }
          }
        }
      }
    } else {
      console.log("Could not load books list.");
    }
    
    console.log("\n🎉 MASTER QUESTION DOWNLOADER COMPLETED SUCCESSFULLY!");
    
  } catch(e) {
    console.error("Fatal Error:", e.message);
  } finally {
    await browser.close();
  }
})();
