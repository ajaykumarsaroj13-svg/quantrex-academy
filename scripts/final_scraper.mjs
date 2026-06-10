/**
 * FINAL PRODUCTION SCRAPER
 * Scrapes topic data + questions for chapters 2 and 3 from ExamGoal
 * Chapters: Logarithm, Quadratic Equation and Inequalities
 */
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
const BASE = 'https://room.examgoal.com';
const MATH_SID = '65f55b3f-ebcd-51b9-8d4f-ec4f7943e29a';

// From math_chapters.json:
const TARGET_CHAPTERS = [
  {
    localId: 'jm_math_2',
    name: 'Logarithm',
    examgoalId: 'ad8d8660-8660-5034-b424-83b26d61b8b8',
    url: `${BASE}/pyq/subject/${MATH_SID}/chapter/ad8d8660-8660-5034-b424-83b26d61b8b8`
  },
  {
    localId: 'jm_math_3',
    name: 'Quadratic Equation and Inequalities',
    examgoalId: 'b7dbfb86-4ba6-5a2f-a2fe-ae64c381b38d',
    url: `${BASE}/pyq/subject/${MATH_SID}/chapter/b7dbfb86-4ba6-5a2f-a2fe-ae64c381b38d`
  }
];

async function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  console.log('Connected to MongoDB');

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  // Track ALL API calls
  const allCaptured = {};
  await page.setRequestInterception(true);
  
  page.on('request', req => req.continue());
  
  page.on('response', async (res) => {
    const url = res.url();
    const ct = res.headers()['content-type'] || '';
    if (!url.includes('examgoal.com/api') || !ct.includes('json')) return;
    try {
      const json = await res.json();
      if (!allCaptured[url]) {
        allCaptured[url] = json;
        const fname = 'cap_' + url.replace(/https?:\/\/[^/]+\//,'').replace(/[^a-zA-Z0-9]/g,'_').substring(0,70) + '_' + Date.now() + '.json';
        fs.writeFileSync(fname, JSON.stringify(json, null, 2));
        if (json?.results?.length > 0 || json?.data) {
          console.log(`[CAPTURED] ${fname} | ${url.substring(0, 80)}`);
        }
      }
    } catch(e) {}
  });

  // Login
  await page.goto('https://accounts.examgoal.com/login', { waitUntil: 'networkidle2' });
  await delay(2000);
  const btns1 = await page.$$('button');
  for (const b of btns1) {
    if ((await page.evaluate(el => el.textContent.trim().toLowerCase(), b)) === 'phone') { await b.click(); break; }
  }
  await delay(1500);
  await page.evaluate(() => { const i = document.querySelector('input[type="number"]'); if(i) { i.value='7750858874'; i.dispatchEvent(new Event('input',{bubbles:true})); } });
  await delay(600);
  const pf = await page.$('input[type="password"]');
  if (pf) { await pf.click({clickCount:3}); await page.keyboard.type(PASSWORD, {delay:50}); }
  const btns2 = await page.$$('button');
  for (const b of btns2) { if (/^Login$/i.test(await page.evaluate(el=>el.textContent.trim(),b))) { await b.click(); break; } }
  await delay(6000);
  console.log('Logged in:', page.url());

  for (const chapter of TARGET_CHAPTERS) {
    console.log(`\n========== ${chapter.name} ===========`);
    
    // Navigate to chapter page with topic tab
    const topicTabUrl = chapter.url + '?tab=topic';
    await page.goto(topicTabUrl, { waitUntil: 'networkidle2' });
    await delay(10000);
    
    await page.screenshot({ path: `chapter_${chapter.localId}.png` });
    const text = await page.evaluate(() => document.body.innerText.substring(0, 3000));
    console.log('Page text:', text.substring(0, 600));
    
    // Find and click Topic Wise button if not already active
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const topicWise = btns.find(b => b.textContent.trim() === 'Topic Wise');
      if (topicWise) topicWise.click();
    });
    await delay(5000);
    
    // Log what API calls happened
    const chapterApiCalls = Object.keys(allCaptured).filter(u => u.includes(chapter.examgoalId));
    console.log('API calls for this chapter:', chapterApiCalls);
    
    // Scroll to load more
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await delay(2000);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    
    // Get all topic sections on page
    const topics = await page.evaluate(() => {
      const topicEls = Array.from(document.querySelectorAll('[class*="topic"], [class*="section"], h2, h3, h4'));
      return topicEls.map(el => ({
        tag: el.tagName,
        cls: el.className.substring(0, 40),
        text: el.innerText?.trim().substring(0, 60)
      })).filter(x => x.text);
    });
    console.log('Topic elements on page:', JSON.stringify(topics.slice(0, 20)));
    
    // Full page screenshot
    await page.screenshot({ path: `chapter_${chapter.localId}_full.png`, fullPage: true });
    
    await delay(5000);
  }
  
  // Summary of ALL API calls
  const relevantCalls = Object.entries(allCaptured)
    .filter(([url]) => url.includes('past-question') && !url.includes('personalized') && !url.includes('user/statistic'))
    .map(([url, data]) => ({ url, resultCount: data?.results?.length || 0, keys: Object.keys(data || {}).join(',') }));
  
  console.log('\n===== RELEVANT API CALLS =====');
  relevantCalls.forEach(c => console.log(c.resultCount, c.url.substring(0, 100)));
  
  fs.writeFileSync('relevant_api_calls.json', JSON.stringify(relevantCalls, null, 2));
  
  await browser.close();
  process.exit(0);
}

run();
