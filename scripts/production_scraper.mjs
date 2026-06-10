/**
 * PRODUCTION SCRAPER: Extracts exact ExamGoal chapter data for JEE Main Math chapters 2 & 3
 * Mathematics Subject ID: 65f55b3f-ebcd-51b9-8d4f-ec4f7943e29a
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
const MATH_SUBJECT_ID = '65f55b3f-ebcd-51b9-8d4f-ec4f7943e29a';
const MATH_SUBJECT_URL = `https://room.examgoal.com/pyq/subject/${MATH_SUBJECT_ID}`;

async function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function loginAndGetPage(browser) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });
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
  return page;
}

async function scrapeChapterQuestions(page, chapterUrl, chapterId, chapterName, db) {
  console.log(`\n=== Scraping ${chapterName} ===`);
  console.log('URL:', chapterUrl);
  
  const chapterData = { topics: [], questions: {} };
  
  // Intercept API calls for this chapter
  const capturedTopics = [];
  const capturedQuestions = {};
  
  const responseHandler = async (res) => {
    const url = res.url();
    const ct = res.headers()['content-type'] || '';
    if (!url.includes('room.examgoal.com/api') || !ct.includes('json')) return;
    
    try {
      const json = await res.json();
      
      // Topics endpoint
      if (url.includes('/topics') && json?.results?.length > 0) {
        console.log(`Topics captured: ${json.results.length}`);
        capturedTopics.push(...json.results);
      }
      
      // Questions endpoint 
      if (url.includes('/questions') && json?.results?.length > 0) {
        console.log(`Questions captured: ${json.results.length} from: ${url.substring(0,80)}`);
        const topicMatch = url.match(/topics\/([^/]+)\/questions/);
        const topicId = topicMatch ? topicMatch[1] : 'general';
        if (!capturedQuestions[topicId]) capturedQuestions[topicId] = [];
        capturedQuestions[topicId].push(...json.results);
        
        // Save raw data
        const fname = `raw_${chapterId}_topic_${topicId}_${Date.now()}.json`;
        fs.writeFileSync(fname, JSON.stringify(json, null, 2));
      }
    } catch(e) {}
  };
  
  page.on('response', responseHandler);
  
  // Navigate to chapter topic view
  const topicUrl = chapterUrl + '?tab=topic';
  await page.goto(topicUrl, { waitUntil: 'networkidle2' });
  await delay(8000); // Wait for all API calls to load
  
  // Scroll to trigger lazy loading
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await delay(3000);
  await page.evaluate(() => window.scrollTo(0, 0));
  await delay(2000);
  
  // Get page text to see what topics are available
  const pageText = await page.evaluate(() => document.body.innerText.substring(0, 5000));
  console.log('Chapter page content:', pageText.substring(0, 1000));
  
  // Get topic links
  const topicLinks = await page.evaluate(() => 
    Array.from(document.querySelectorAll('a, button'))
      .filter(el => el.innerText?.trim().length > 0)
      .map(el => ({ text: el.innerText.trim().substring(0, 60), href: el.href || '', tag: el.tagName }))
  );
  console.log('Topic links:', JSON.stringify(topicLinks.slice(0, 30)));
  
  // Wait a bit more for the topics API to complete
  await delay(3000);
  
  page.off('response', responseHandler);
  
  console.log(`Captured topics: ${capturedTopics.length}`);
  console.log(`Captured question groups: ${Object.keys(capturedQuestions).length}`);
  
  return { capturedTopics, capturedQuestions };
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');
  const db = mongoose.connection.db;

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  
  try {
    await page.setRequestInterception(true);
    page.on('request', req => req.continue());
    const page = await loginAndGetPage(browser);
    
    // Step 1: Get all math chapter links
    console.log('\nGetting Mathematics chapters...');
    await page.goto(MATH_SUBJECT_URL, { waitUntil: 'networkidle2' });
    await delay(8000);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await delay(3000);
    
    const mathChapterLinks = await page.evaluate(() =>
      Array.from(document.querySelectorAll('a'))
        .filter(a => a.href.includes('/chapter/') && !a.href.includes('tab='))
        .map(a => ({ 
          text: a.innerText.trim().replace(/\n.*/s, '').trim(),
          href: a.href,
          chapterId: a.href.split('/chapter/')[1]?.split('?')[0],
          questionCount: parseInt(a.innerText.match(/(\d+)\s*Qs/)?.[1] || '0')
        }))
    );
    
    console.log('Math chapters found:', mathChapterLinks.length);
    mathChapterLinks.forEach((ch, i) => console.log(`  ${i+1}. ${ch.text} (${ch.questionCount} Qs) - ${ch.chapterId}`));
    
    fs.writeFileSync('math_chapters_list.json', JSON.stringify(mathChapterLinks, null, 2));
    
    // Step 2: Target chapters 2 and 3 (index 1 and 2)
    const targetChapters = [
      { localId: 'jm_math_2', chapter: mathChapterLinks[1] },
      { localId: 'jm_math_3', chapter: mathChapterLinks[2] }
    ].filter(x => x.chapter);
    
    for (const { localId, chapter } of targetChapters) {
      if (!chapter) { console.log('Chapter not found!'); continue; }
      
      const { capturedTopics, capturedQuestions } = await scrapeChapterQuestions(
        page, chapter.href, localId, chapter.text, db
      );
      
      // Save raw captured data
      const rawData = { topics: capturedTopics, questionsByTopic: capturedQuestions };
      fs.writeFileSync(`scraped_${localId}.json`, JSON.stringify(rawData, null, 2));
      console.log(`Saved scraped_${localId}.json`);
    }
    
  } catch (e) {
    console.error('Error:', e.message, e.stack);
  }
  
  await browser.close();
  process.exit(0);
}

run();
