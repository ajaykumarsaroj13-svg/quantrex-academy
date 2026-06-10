import puppeteer from 'puppeteer';
import fs from 'fs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const PASSWORD = '12345678';
async function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// We want chapters 2 and 3 (index 1 and 2)
const TARGET_CHAPTERS = [
  { index: 1, ourId: 'jm_math_2', name: 'Complex Numbers and Quadratic Equations' },
  { index: 2, ourId: 'jm_math_3', name: 'Matrices and Determinants' }
];

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');
  const db = mongoose.connection.db;

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  const allChapterData = {};

  await page.setRequestInterception(true);
  page.on('request', req => req.continue());

  page.on('response', async res => {
    const url = res.url();
    const ct = res.headers()['content-type'] || '';
    if (url.includes('room.examgoal.com/api/v1/past-question') && ct.includes('json')) {
      try {
        const json = await res.json();
        const urlKey = url.replace(/.*\/past-question\//,'').split('?')[0];
        // Save topics (subtopics) data
        if (urlKey.includes('topics') || urlKey.includes('chapters')) {
          const fname = 'eg_data_' + urlKey.replace(/\//g,'_') + '_' + Date.now() + '.json';
          fs.writeFileSync(fname, JSON.stringify(json, null, 2));
          console.log('[TOPICS/CHAPTERS SAVED]', fname);
        }
        // Save actual questions data
        if (urlKey.includes('questions') || (json && json.results && json.results[0]?.question)) {
          const fname = 'eg_questions_' + urlKey.replace(/\//g,'_') + '_' + Date.now() + '.json';
          fs.writeFileSync(fname, JSON.stringify(json, null, 2));
          console.log('[QUESTIONS SAVED]', fname, '| Count:', json?.results?.length || 0);
        }
      } catch(e) {}
    }
  });

  // Login
  await page.goto('https://accounts.examgoal.com/login', { waitUntil: 'networkidle2' });
  await delay(2000);
  
  const btns1 = await page.$$('button');
  for (const b of btns1) {
    const t = await page.evaluate(el => el.textContent.trim().toLowerCase(), b);
    if (t === 'phone') { await b.click(); break; }
  }
  await delay(1500);
  
  await page.evaluate(() => {
    const inp = document.querySelector('input[type="number"]');
    if (inp) { inp.value = '7750858874'; inp.dispatchEvent(new Event('input', { bubbles: true })); }
  });
  await delay(600);
  
  const passField = await page.$('input[type="password"]');
  if (passField) { await passField.click({ clickCount: 3 }); await page.keyboard.type(PASSWORD, { delay: 50 }); }
  
  const btns2 = await page.$$('button');
  for (const b of btns2) {
    const t = await page.evaluate(el => el.textContent.trim(), b);
    if (/^Login$/i.test(t)) { await b.click(); break; }
  }
  await delay(6000);
  console.log('Logged in:', page.url());

  // Navigate to JEE Main home which has "Explore Chapters" buttons
  await page.goto('https://room.examgoal.com/', { waitUntil: 'networkidle2' });
  await delay(4000);

  // Click on Mathematics "Explore Chapters" 
  const clickedMath = await page.evaluate(() => {
    const allLinks = Array.from(document.querySelectorAll('a, button'));
    // Find the Explore Chapters link near Mathematics
    const mathSection = Array.from(document.querySelectorAll('h2, h3, p, span, div'))
      .find(el => el.innerText?.trim() === 'Mathematics');
    if (mathSection) {
      // Find nearby link
      const parent = mathSection.parentElement?.parentElement;
      const link = parent?.querySelector('a');
      if (link) { console.log('Math link:', link.href); link.click(); return link.href; }
    }
    return null;
  });
  console.log('Clicked math explore:', clickedMath);
  await delay(6000);
  
  const url1 = page.url();
  console.log('URL after math explore:', url1);
  await page.screenshot({ path: 'math_chapters.png' });
  
  const mathPageText = await page.evaluate(() => document.body.innerText.substring(0, 3000));
  console.log('Math chapters page:', mathPageText);

  // Now look for chapter links
  const chapterLinks = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a')).map(a => ({ text: a.innerText?.trim(), href: a.href }))
      .filter(x => x.text && x.href.includes('examgoal'))
  );
  console.log('Chapter links:', JSON.stringify(chapterLinks));

  await browser.close();
  process.exit(0);
})();
