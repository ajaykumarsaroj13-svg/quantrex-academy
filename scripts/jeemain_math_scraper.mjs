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

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  console.log('Connected to MongoDB');

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  // Capture all API calls to past-question chapters/topics/questions
  const capturedData = {};
  await page.setRequestInterception(true);
  page.on('request', req => req.continue());

  page.on('response', async res => {
    const url = res.url();
    const ct = res.headers()['content-type'] || '';
    if (url.includes('room.examgoal.com/api') && ct.includes('json') && 
        (url.includes('past-question/chapters') || url.includes('past-question/topics') || url.includes('past-question/questions'))) {
      try {
        const json = await res.json();
        const key = url.replace(/.*examgoal\.com\/api\/v\d\//,'').replace(/\?.*$/,'');
        const fname = 'chapter_api_' + key.replace(/\//g,'_') + '_' + Date.now() + '.json';
        fs.writeFileSync(fname, JSON.stringify(json, null, 2));
        console.log('[CAPTURED]', fname, 'count:', json?.results?.length || json?.data?.length || '?');
        capturedData[key] = json;
      } catch(e) {}
    }
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

  // Dismiss notification popup first
  const dismissBtns = await page.$$('button');
  for (const b of dismissBtns) {
    const t = await page.evaluate(el => el.textContent.trim(), b);
    if (t === 'Never' || t === 'I Understand') { await b.click(); break; }
  }
  await delay(1000);

  // Click on JEE Main in exam list
  const jeeClicked = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('h2, h3, h4, div, span, button, a, p'));
    const el = els.find(e => e.textContent?.trim() === 'JEE Main' && e.tagName !== 'A');
    if (el) { el.click(); return 'JEE Main clicked'; }
    return 'not found';
  });
  console.log('JEE Main click:', jeeClicked);
  await delay(5000);
  await page.screenshot({ path: 'after_jee_main.png' });

  const afterJeeText = await page.evaluate(() => document.body.innerText.substring(0, 2000));
  console.log('After JEE Main click:', afterJeeText.substring(0, 800));
  
  // Look for "Explore Chapters" links now
  const exploreLinks = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a')).filter(a => a.innerText.includes('Explore Chapters')).map(a => ({text: a.innerText.trim(), href: a.href}))
  );
  console.log('Explore Chapter links:', JSON.stringify(exploreLinks));

  // Click Mathematics Explore Chapters
  const clickedLink = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a'));
    const mathLink = links.find(a => a.innerText.includes('Explore Chapters') && a.closest('[data-subject]')?.getAttribute('data-subject') === 'mathematics');
    if (!mathLink) {
      // Try to find the Explore Chapters after Mathematics text
      const mathSection = [...document.querySelectorAll('h2, h3, p, span')].find(el => el.textContent.trim() === 'Mathematics');
      if (mathSection) {
        const exploreLink = mathSection.parentElement?.parentElement?.querySelector('a');
        if (exploreLink) { exploreLink.click(); return exploreLink.href; }
      }
      // Click ANY Explore Chapters for now
      const anyExplore = links.find(a => a.innerText.includes('Explore Chapters'));
      if (anyExplore) { anyExplore.click(); return anyExplore.href; }
    } else { mathLink.click(); return mathLink.href; }
    return 'none clicked';
  });
  console.log('Clicked:', clickedLink);
  await delay(8000);
  
  const chapterPageUrl = page.url();
  console.log('Chapter page URL:', chapterPageUrl);
  await page.screenshot({ path: 'after_explore_chapters.png' });
  
  const chapterPageText = await page.evaluate(() => document.body.innerText.substring(0, 4000));
  console.log('Chapter page:', chapterPageText.substring(0, 1500));

  // Find chapter links
  const chapterLinks = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a')).map(a => ({text: a.innerText?.trim().substring(0,50), href: a.href}))
      .filter(x => x.text && x.href.includes('examgoal'))
  );
  console.log('Chapter links found:', JSON.stringify(chapterLinks.slice(0, 30)));

  await browser.close();
  process.exit(0);
})();
