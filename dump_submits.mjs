import puppeteer from 'puppeteer';

const PHONE = '7750858874';
const PASSWORD = '12345678';

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

  // Navigate
  await page.goto('https://room.examgoal.com/tests/tst-19g61moahy6ef', { waitUntil: 'networkidle2' });
  await delay(4000);
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'I Understand');
    if (btn) btn.click();
  });
  await delay(1000);

  // Click first submit test button
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim().includes('Submit Test'));
    if (btn) btn.click();
  });
  await delay(2000);

  // Print all elements containing 'Submit Test' inside the modal
  const htmls = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('*'))
      .filter(el => el.textContent.trim().includes('Submit Test') && el.childElementCount <= 4)
      .map(el => ({
        tagName: el.tagName,
        className: el.className,
        outerHTML: el.outerHTML.slice(0, 300)
      }));
  });
  console.log(htmls);

  await browser.close();
}

main().catch(console.error);
