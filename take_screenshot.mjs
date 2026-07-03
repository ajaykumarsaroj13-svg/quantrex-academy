import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1000 });
  await page.goto('https://accounts.examgoal.com/login?redirect=https://room.examgoal.com');
  await new Promise(r => setTimeout(r, 2000));
  const btns = await page.$$('button');
  for (const b of btns) {
    const t = await page.evaluate(el => el.textContent.trim(), b);
    if (t === 'Phone') { await b.click(); break; }
  }
  await new Promise(r => setTimeout(r, 1000));
  await page.type('input[type="number"]', '7750858874');
  await page.type('input[type="password"]', '12345678');
  await page.click('button[type="submit"]');
  
  await page.waitForNavigation({ waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  
  await page.goto('https://room.examgoal.com/tests/tst-19g61mnpzhlyq');
  await new Promise(r => setTimeout(r, 8000));
  await page.screenshot({ path: 'new_test.png', fullPage: true });
  const html = await page.content();
  import('fs').then(fs => fs.writeFileSync('new_test.html', html));
  
  await browser.close();
  console.log('Saved new_dashboard.png');
})();
