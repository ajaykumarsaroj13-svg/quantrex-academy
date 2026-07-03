import puppeteer from 'puppeteer';
import fs from 'fs';

const PHONE = '7750858874';
const PASSWORD = '12345678';
const EXAM_ORIGIN = 'https://room.examgoal.com';

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1000 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  // Login
  await page.goto('https://accounts.examgoal.com/login?redirect=https://room.examgoal.com', { waitUntil: 'networkidle2' });
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
  console.log('Logged in:', !page.url().includes('/login'));

  // Go to Dashboard
  await page.goto(`${EXAM_ORIGIN}/dashboard`, { waitUntil: 'networkidle2' });
  await delay(4000);

  // Explicitly find and click "I Understand"
  const clickedResult = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.trim() === 'I Understand');
    if (btn) {
      btn.click();
      return 'Clicked I Understand button';
    }
    return 'Button not found';
  });
  console.log('Click result:', clickedResult);
  await delay(4000);
  await page.screenshot({ path: 'dashboard_after_dismiss.png' });

  // Let's get the list of links now!
  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a[href]')).map(a => ({
      text: a.textContent.trim().slice(0, 60),
      href: a.href
    }));
  });
  console.log('\nLinks after dismissing popup:');
  links.forEach(l => console.log(`  "${l.text}" => ${l.href}`));

  // Dump page text
  const text = await page.evaluate(() => document.body.innerText);
  fs.writeFileSync('dashboard_text_after.txt', text);

  await browser.close();
}

main().catch(e => { console.error(e); process.exit(1); });
