import puppeteer from 'puppeteer';
import fs from 'fs';
import { MongoClient } from 'mongodb';

const MOBILE = '7750858874';
const PASSWORD = '12345678';
const LOGIN_URL = 'https://accounts.examgoal.com/login';
const TARGET_URL = 'https://room.examgoal.com/pyq/jee-main/mathematics/sequence-and-series';

const MONGO_URI = "mongodb+srv://ajaykumarsaroj13_db_usar:quantrex2026@cluster0.jde6gri.mongodb.net/quantrex?retryWrites=true&w=majority&appName=Cluster0";

async function run() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,900'],
    defaultViewport: null
  });

  const page = await browser.newPage();
  
  // Intercept all API responses to catch questions
  let capturedQuestions = [];
  let capturedMeta = [];

  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('past-question/question/meta')) {
      try {
        const text = await response.text();
        const data = JSON.parse(text);
        if (data && data.data && Array.isArray(data.data)) {
            console.log(`Intercepted META with ${data.data.length} items`);
            capturedMeta.push(...data.data);
        }
      } catch(e) {}
    }
    if (url.includes('past-question/question') && !url.includes('/meta')) {
      try {
        const text = await response.text();
        const data = JSON.parse(text);
        if (data && data.data && data.data.id) {
            capturedQuestions.push(data.data);
        } else if (data && data.data && Array.isArray(data.data)) {
            capturedQuestions.push(...data.data);
        }
      } catch(e) {}
    }
  });

  console.log('Going to login page...');
  await page.goto(LOGIN_URL, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  const phoneBtns = await page.$$('button');
  for (const btn of phoneBtns) {
    const text = await page.evaluate(el => el.textContent.trim().toLowerCase(), btn);
    if (text === 'phone') {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1000));

  const phoneInput = await page.$('input[type="number"]') || await page.$('input[name="phone"]');
  if (phoneInput) {
    await phoneInput.click({ clickCount: 3 });
    await page.keyboard.type(MOBILE, { delay: 50 });
  }

  const passInput = await page.$('input[type="password"]');
  if (passInput) {
    await passInput.click({ clickCount: 3 });
    await page.keyboard.type(PASSWORD, { delay: 50 });
  }

  const btns = await page.$$('button');
  for (const btn of btns) {
    const text = await page.evaluate(el => el.textContent.trim(), btn);
    if (text === 'Login') {
      await btn.click();
      break;
    }
  }

  console.log('Waiting for login...');
  await new Promise(r => setTimeout(r, 8000));
  
  console.log('Going to Sequence and Series...');
  await page.goto(TARGET_URL, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 5000));

  // Try to click "Practice" or "View Questions" or just scroll
  console.log('Looking for Practice button...');
  const practiceBtns = await page.$$('button, a');
  let clicked = false;
  for (const btn of practiceBtns) {
      const text = await page.evaluate(el => el.textContent.trim().toLowerCase(), btn);
      if (text.includes('practice') || text.includes('questions') || text.includes('view') || text.includes('start')) {
          try {
              await btn.click();
              console.log(`Clicked: ${text}`);
              clicked = true;
              await new Promise(r => setTimeout(r, 5000));
          } catch(e) {}
      }
  }

  // Scroll to trigger lazy loads
  for(let i=0; i<5; i++) {
      await page.evaluate(() => window.scrollBy(0, 1000));
      await new Promise(r => setTimeout(r, 1000));
  }

  // Dump NUXT state just in case
  const nuxtState = await page.evaluate(() => window.__NUXT__);
  fs.writeFileSync('nuxt_state_seq.json', JSON.stringify(nuxtState || {}, null, 2));

  console.log(`Intercepted ${capturedMeta.length} metadata items and ${capturedQuestions.length} full questions.`);

  fs.writeFileSync('seq_meta.json', JSON.stringify(capturedMeta, null, 2));
  fs.writeFileSync('seq_questions.json', JSON.stringify(capturedQuestions, null, 2));

  // Connect to MongoDB and save
  if (capturedMeta.length > 0 || capturedQuestions.length > 0) {
      console.log("Connecting to MongoDB to save...");
      const client = new MongoClient(MONGO_URI);
      try {
          await client.connect();
          const db = client.db('quantrex');
          const pyqCol = db.collection('pyqs');
          const chapCol = db.collection('pyqchapters');
          
          const chapterId = "jee_main_math_progression_series";
          
          await chapCol.updateOne(
              { chapterId: chapterId },
              { $set: {
                  chapterId: chapterId,
                  title: "Sequence & Series",
                  subject: "mathematics",
                  exam: "jee-main",
                  topics: ["Arithmetic Progression", "Geometric Progression", "Harmonic Progression", "Special Series", "General"],
                  totalQuestions: capturedMeta.length || capturedQuestions.length || 309
              }},
              { upsert: true }
          );
          
          let saved = 0;
          for (let q of capturedQuestions) {
              if(!q.id) continue;
              
              let qType = q.type || "SCQ";
              if (qType.toUpperCase().includes("NUMERICAL") || qType === "int") qType = "NUMERICAL";
              else qType = "SCQ";
              
              let correctIdx = -1;
              if (qType === "SCQ" && q.answer) {
                  correctIdx = parseInt(q.answer);
              }
              
              let pyqDoc = {
                  examGoalId: q.id,
                  chapterId: chapterId,
                  title: `JEE Main ${q.year || ''}`,
                  year: String(q.year || ''),
                  difficulty: q.difficulty || "Medium",
                  type: qType,
                  question: q.question || q.excerpt || "",
                  options: q.options || [],
                  correctOptionIndex: correctIdx,
                  solution: q.solution || q.explanation || "",
                  marks: 4,
                  negativeMarks: qType === "SCQ" ? -1 : 0,
                  topic: "General",
                  rawData: q
              };
              
              if (qType === "NUMERICAL") {
                  pyqDoc.numericalAnswer = String(q.answer || "");
              }
              
              await pyqCol.updateOne(
                  { examGoalId: q.id },
                  { $set: pyqDoc },
                  { upsert: true }
              );
              saved++;
          }
          console.log(`Saved ${saved} questions to MongoDB!`);
      } catch (e) {
          console.error("MongoDB error", e);
      } finally {
          await client.close();
      }
  }

  await browser.close();
  console.log("Done.");
}

run().catch(console.error);
