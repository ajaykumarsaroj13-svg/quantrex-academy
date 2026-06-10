/**
 * EXAMGOAL FULL SCRAPER - Clicks Practice button for each topic
 * then captures the actual question HTML from the practice session
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

  const allCaptured = {};
  
  await page.setRequestInterception(true);
  page.on('request', req => req.continue());
  
  page.on('response', async (res) => {
    const url = res.url();
    const ct = res.headers()['content-type'] || '';
    if (!url.includes('examgoal.com/api') || !ct.includes('json')) return;
    try {
      const json = await res.json();
      if (!allCaptured[url] && json?.results?.length > 0) {
        allCaptured[url] = json;
        const fname = 'final_' + url.replace(/https?:\/\/[^/]+\//,'').replace(/[^a-zA-Z0-9]/g,'_').substring(0,70) + '_' + Date.now() + '.json';
        fs.writeFileSync(fname, JSON.stringify(json, null, 2));
        console.log(`[CAPTURED] ${json.results.length} items | ${url.substring(0, 90)}`);
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

  const finalData = {};

  for (const chapter of TARGET_CHAPTERS) {
    console.log(`\n=== ${chapter.name} ===`);
    finalData[chapter.localId] = { name: chapter.name, topics: [], questionsByTopic: {} };

    // Navigate to topic view
    await page.goto(chapter.url + '?tab=topic', { waitUntil: 'networkidle2' });
    await delay(8000);
    
    // Get topic names from page
    const pageText = await page.evaluate(() => document.body.innerText);
    const lines = pageText.split('\n').map(l => l.trim()).filter(l => l);
    
    // Extract topic names (they appear before "Take Test" / "Practice" buttons)
    const topicNames = [];
    for (let i = 0; i < lines.length; i++) {
      if (lines[i] === 'Take Test' || lines[i] === 'Practice') {
        // Check if previous line is a topic name
        const prev = lines[i-1];
        if (prev && !['ExamGOAL', 'All Questions', 'Mistakes', 'Topic Wise', 'Buckets', 'Analytics', 'More', 'Take Test', 'Practice'].includes(prev) && 
            !/\d+:/.test(prev) && !/Total|Avg|Weightage/.test(prev) && !/^\d+$/.test(prev) &&
            !prev.includes('%') && !topicNames.includes(prev)) {
          // This is likely a topic name
          let isYearLine = /^(2020|2021|2022|2023|2024|2025|2026):/.test(prev);
          if (!isYearLine) {
            topicNames.push(prev);
          }
        }
      }
    }
    console.log('Topic names found:', topicNames);
    finalData[chapter.localId].topics = topicNames;
    
    // Get Practice buttons with their associated topic names
    const topicsWithButtons = await page.evaluate(() => {
      const result = [];
      const allEls = Array.from(document.querySelectorAll('*'));
      
      for (const el of allEls) {
        if (el.tagName === 'BUTTON' && el.textContent.trim() === 'Practice') {
          // Look for topic name in the surrounding context
          let parent = el.parentElement;
          let topicName = '';
          for (let depth = 0; depth < 8; depth++) {
            if (!parent) break;
            const headings = parent.querySelectorAll('h1,h2,h3,h4,h5,h6,p,span,div');
            for (const h of headings) {
              const t = h.textContent?.trim();
              if (t && t.length > 5 && t.length < 60 && !t.includes('\n') && 
                  !/take test|practice|topic wise|bucket|analytics|examgoal/i.test(t) &&
                  !/^\d+$/.test(t) && !t.includes('2020') && !t.includes('Total')) {
                topicName = t;
                break;
              }
            }
            if (topicName) break;
            parent = parent.parentElement;
          }
          result.push({ topicName, buttonIndex: result.length });
        }
      }
      return result;
    });
    
    console.log('Topics with buttons:', JSON.stringify(topicsWithButtons.slice(0, 20)));
    
    // Click each Practice button and capture questions
    for (let i = 0; i < topicsWithButtons.length; i++) {
      const topic = topicsWithButtons[i];
      console.log(`\nClicking Practice for topic: "${topic.topicName}" (index ${i})`);
      
      // Re-navigate to chapter page (to ensure clean state)
      await page.goto(chapter.url + '?tab=topic', { waitUntil: 'networkidle2' });
      await delay(5000);
      
      // Click the i-th Practice button
      const clicked = await page.evaluate((idx) => {
        const btns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent.trim() === 'Practice');
        if (btns[idx]) { btns[idx].click(); return true; }
        return false;
      }, i);
      
      if (!clicked) { console.log('Button not found, skipping'); continue; }
      
      await delay(8000); // Wait for questions to load
      
      // Get the question content
      const practicePageText = await page.evaluate(() => document.body.innerText.substring(0, 2000));
      console.log('Practice page:', practicePageText.substring(0, 400));
      
      // Check URL
      const practiceUrl = page.url();
      console.log('Practice URL:', practiceUrl);
      
      // Check if it's on a practice page
      if (practiceUrl.includes('/practice') || practiceUrl.includes('/test')) {
        // We're on a practice session - need to navigate through questions
        // Get the question data
        const questionHTML = await page.evaluate(() => {
          const qs = document.querySelectorAll('[class*="question"], .question, [data-question]');
          return Array.from(qs).map(q => q.innerHTML).join('|||');
        });
        console.log('Question HTML length:', questionHTML.length);
        await page.screenshot({ path: `practice_${chapter.localId}_topic${i}.png` });
      } else {
        // Questions shown inline
        const questions = await page.evaluate(() => {
          return Array.from(document.querySelectorAll('[class*="question"]')).map(q => q.innerText);
        });
        console.log('Inline questions:', questions.length);
      }
      
      await delay(2000);
    }
    
    // Capture questions from API intercepts so far
    const chapterApiData = Object.entries(allCaptured)
      .filter(([url]) => url.includes(chapter.examgoalId) || url.includes('past-question'))
      .map(([url, data]) => ({ url, count: data?.results?.length || 0 }));
    
    console.log('Chapter API data captured:', chapterApiData);
  }
  
  fs.writeFileSync('final_chapter_data.json', JSON.stringify(finalData, null, 2));
  console.log('\nFinal data saved to final_chapter_data.json');
  
  // Show relevant API captures
  console.log('\n=== API Captures ===');
  Object.entries(allCaptured).filter(([u]) => u.includes('past-question')).forEach(([u, d]) => {
    console.log(`${d?.results?.length || 0} results - ${u.substring(0, 100)}`);
  });
  
  await browser.close();
  process.exit(0);
}

run();
