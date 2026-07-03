import puppeteer from 'puppeteer';
import fs from 'fs';

const PHONE = '7750858874';
const PASSWORD = '12345678';
const EXAM_ORIGIN = 'https://room.examgoal.com';
const testId = 'tst-19g61mo67xi5r';

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1000 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');

  page.on('response', async res => {
    if (res.url().includes('examgoal') && res.url().includes('api')) {
       try {
         const json = await res.json();
         console.log('API Hit:', res.url(), '| len:', JSON.stringify(json).length);
       } catch(e) {}
    }
  });

  console.log('Logging in...');
  await page.goto('https://accounts.examgoal.com/login?redirect=https://room.examgoal.com', { waitUntil: 'networkidle2', timeout: 30000 });
  await delay(2000);
  const phoneBtns = await page.$$('button');
  for (const btn of phoneBtns) {
    const txt = await page.evaluate(el => el.textContent.trim(), btn);
    if (txt === 'Phone') { await btn.click(); break; }
  }
  await delay(2500);
  const numInput = await page.$('input[type="number"]');
  if (numInput) { await numInput.click({ clickCount: 3 }); await numInput.type(PHONE); }
  const passInput = await page.$('input[type="password"]');
  if (passInput) { await passInput.click({ clickCount: 3 }); await passInput.type(PASSWORD); }
  const submitBtn = await page.$('button[type="submit"]');
  if (submitBtn) await submitBtn.click();
  await delay(5000);

  console.log('Going to test page:', testId);
  await page.goto(`${EXAM_ORIGIN}/test-series/test/${testId}`, { waitUntil: 'networkidle2', timeout: 20000 });
  await delay(5000);
  
  await page.screenshot({ path: 'screenshot_testpage.png' });
  console.log('Saved screenshot_testpage.png');
  
  await browser.close();
}

main().catch(console.error);
