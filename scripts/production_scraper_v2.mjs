/**
 * PRODUCTION SCRAPER V2: Extracts exact ExamGoal chapter data for JEE Main Math chapters 2 & 3
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

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');
  const db = mongoose.connection.db;

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  // Global API capturer
  const allTopics = {}; // chapterId -> [topics]
  const allQuestions = {}; // topicId -> [questions]

  await page.setRequestInterception(true);
  page.on('request', req => req.continue());

  page.on('response', async (res) => {
    const url = res.url();
    const ct = res.headers()['content-type'] || '';
    if (!url.includes('room.examgoal.com/api') || !ct.includes('json')) return;
    
    try {
      const json = await res.json();
      if (!json?.results) return;
      
      if (url.includes('/topics') && json.results[0]?.name) {
        const chapMatch = url.match(/chapters\/([^/]+)\/topics/);
        const chapId = chapMatch?.[1] || 'unknown';
        allTopics[chapId] = json.results;
        console.log(`[TOPICS] chapId=${chapId} count=${json.results.length}`);
        fs.writeFileSync(`topics_${chapId}.json`, JSON.stringify(json.results, null, 2));
      }
      
      if ((url.includes('/questions') || url.includes('/bucket')) && json.results[0]?.question) {
        const topicMatch = url.match(/topics\/([^/]+)/);
        const topicId = topicMatch?.[1] || ('gen_' + Date.now());
        if (!allQuestions[topicId]) allQuestions[topicId] = [];
        const newQs = json.results.filter(q => !allQuestions[topicId].find(x => x.id === q.id));
        allQuestions[topicId].push(...newQs);
        console.log(`[QUESTIONS] topicId=${topicId} new=${newQs.length} total=${allQuestions[topicId].length}`);
        fs.writeFileSync(`questions_${topicId}_${Date.now()}.json`, JSON.stringify(json.results, null, 2));
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

  // Get math chapters
  console.log('\nNavigating to Math subject page...');
  await page.goto(MATH_SUBJECT_URL, { waitUntil: 'networkidle2' });
  await delay(8000);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await delay(3000);
  
  const mathChapters = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a'))
      .filter(a => a.href.includes('/chapter/') && !a.href.includes('tab='))
      .map(a => ({
        name: a.innerText.trim().split('\n').find(l => /[a-zA-Z]/.test(l) && !/Qs$/.test(l.trim()) && !/Topic|Bucket/.test(l))?.trim() || '',
        href: a.href,
        chapterId: a.href.split('/chapter/')[1]?.split('?')[0],
        questionCount: parseInt(a.innerText.match(/(\d+)\s*Qs/)?.[1] || '0')
      }))
      .filter(c => c.chapterId && c.questionCount > 0)
  );
  
  console.log('\nMath chapters found:', mathChapters.length);
  mathChapters.forEach((ch, i) => console.log(`  ${i+1}. "${ch.name}" (${ch.questionCount} Qs) - ${ch.chapterId}`));
  fs.writeFileSync('math_chapters.json', JSON.stringify(mathChapters, null, 2));
  
  // Get chapters 2 and 3 (index 1 and 2)
  const chapters = [
    { localId: 'jm_math_2', egChapter: mathChapters[1] },
    { localId: 'jm_math_3', egChapter: mathChapters[2] }
  ];
  
  for (const { localId, egChapter } of chapters) {
    if (!egChapter) { console.log(`Chapter not found for ${localId}`); continue; }
    
    console.log(`\n=== Processing ${egChapter.name} (${localId}) ===`);
    const topicUrl = egChapter.href + '?tab=topic';
    
    await page.goto(topicUrl, { waitUntil: 'networkidle2' });
    await delay(10000);
    
    // Scroll to load everything
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await delay(2000);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await delay(2000);
    
    const pageText = await page.evaluate(() => document.body.innerText.substring(0, 3000));
    console.log('Chapter page text:', pageText.substring(0, 800));
    
    // Get topic links
    const topicLinks = await page.evaluate(() =>
      Array.from(document.querySelectorAll('a, button'))
        .filter(el => el.innerText?.trim().length > 0 && el.tagName !== 'BODY')
        .map(el => ({ text: el.innerText.trim().substring(0, 50), href: el.href || '', tag: el.tagName }))
    );
    console.log('Topic elements:', JSON.stringify(topicLinks.slice(0, 20)));
    
    // Click each topic and capture questions
    const clickableTopics = topicLinks.filter(t => /questions|topic|bucket|practice/i.test(t.text) || 
                                                      (t.href.includes('examgoal') && t.href.includes('topic')));
    console.log('Clickable topics:', clickableTopics);
    
    await delay(3000);
    
    // Now look at topics in our allTopics  
    console.log('All captured topics:', JSON.stringify(Object.keys(allTopics)));
    console.log('All captured questions:', JSON.stringify(Object.keys(allQuestions).map(k => k + ': ' + allQuestions[k].length)));
  }
  
  // Summary
  console.log('\n=== FINAL SUMMARY ===');
  console.log('Topics captured:', Object.keys(allTopics).length, 'chapters');
  console.log('Questions captured:', Object.keys(allQuestions).length, 'topic groups');
  for (const [k, v] of Object.entries(allQuestions)) {
    console.log(`  Topic ${k}: ${v.length} questions`);
  }
  
  await browser.close();
  process.exit(0);
}

run();
