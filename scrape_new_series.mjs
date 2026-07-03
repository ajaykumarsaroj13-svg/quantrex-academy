import puppeteer from 'puppeteer';
import fs from 'fs';

const PHONE = '7750858874';
const PASSWORD = '12345678';
const EXAM_ORIGIN = 'https://room.examgoal.com';

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1000 });

  let capturedData = {};

  page.on('response', async res => {
    if (res.url().includes('api/v1')) {
       try {
         const json = await res.json();
         console.log('Intercepted:', res.url(), 'Size:', JSON.stringify(json).length);
         capturedData[res.url()] = json;
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
  await delay(2000);
  const numInput = await page.$('input[type="number"]');
  if (numInput) { await numInput.click({ clickCount: 3 }); await numInput.type(PHONE); }
  const passInput = await page.$('input[type="password"]');
  if (passInput) { await passInput.click({ clickCount: 3 }); await passInput.type(PASSWORD); }
  const submitBtn = await page.$('button[type="submit"]');
  if (submitBtn) await submitBtn.click();
  await delay(5000);

  console.log('Going to test series page...');
  await page.goto(`${EXAM_ORIGIN}/test-series/ultimate/jee-main`, { waitUntil: 'networkidle2', timeout: 20000 });
  await delay(5000);
  
  fs.writeFileSync('new_series_metadata.json', JSON.stringify(capturedData, null, 2));
  console.log('Saved new_series_metadata.json');
  
  await browser.close();
}

main().catch(console.error);
