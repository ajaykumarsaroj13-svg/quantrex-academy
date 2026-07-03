import puppeteer from 'puppeteer';

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
    if ((await page.evaluate(el => el.textContent.trim(), btn)) === 'Phone') { await btn.click(); break; }
  }
  await delay(2500);
  await (await page.$('input[type="number"]')).type(PHONE);
  await (await page.$('input[type="password"]')).type(PASSWORD);
  await (await page.$('button[type="submit"]')).click();
  await delay(5000);

  // Navigate to logarithm test 1
  await page.goto(`${EXAM_ORIGIN}/tests/tst-19g61moahy6ef`, { waitUntil: 'networkidle2' });
  await delay(5000);

  // Dismiss modal if present
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'I Understand');
    if (btn) btn.click();
  });
  await delay(1000);

  // Get coordinates of outer Submit Test button
  const outerCoords = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Submit Test' && !b.className.includes('bg-gradient-to-r'));
    if (!btn) return null;
    const rect = btn.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  });
  console.log('Outer Button Coordinates:', outerCoords);

  if (outerCoords) {
    console.log('Clicking outer submit using mouse coordinates...');
    await page.mouse.click(outerCoords.x, outerCoords.y);
  }
  await delay(3000);
  await page.screenshot({ path: 'log1_after_outer_physical.png' });

  // Get coordinates of modal Submit Test button
  const modalCoords = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Submit Test' && b.className.includes('bg-gradient-to-r'));
    if (!btn) return null;
    const rect = btn.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  });
  console.log('Modal Button Coordinates:', modalCoords);

  if (modalCoords) {
    console.log('Clicking modal submit using mouse coordinates...');
    await page.mouse.click(modalCoords.x, modalCoords.y);
  }
  await delay(8000);
  await page.screenshot({ path: 'log1_final_physical.png' });
  console.log('Final URL after submit:', page.url());

  await browser.close();
}

main().catch(console.error);
