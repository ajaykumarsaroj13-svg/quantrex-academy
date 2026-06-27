import puppeteer from 'puppeteer';
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({width: 1280, height: 800});
  try {
    await page.goto('http://localhost:3000/quantrex-academy/', {waitUntil: 'networkidle2'});
    await page.waitForSelector('input[type="email"]');
    await page.type('input[type="email"]', 'test@test.com');
    await page.type('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForSelector('h2');
    
    // Click JEE Advanced
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const advBtn = btns.find(b => b.innerText && b.innerText.includes('JEE Advanced'));
      if (advBtn) advBtn.click();
    });
    await new Promise(r => setTimeout(r, 2000));
    
    // Click PYQs
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('button'));
      const pyqTab = tabs.find(b => b.innerText && b.innerText.includes('PYQs (Years)'));
      if (pyqTab) pyqTab.click();
    });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({path: 'adv_dashboard.png'});
    console.log("Saved adv_dashboard.png");

    // Click "Take Test" on the first topic
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const takeTest = btns.find(b => b.innerText && b.innerText.includes('Take Test'));
      if (takeTest) takeTest.click();
    });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({path: 'adv_practice.png'});
    console.log("Saved adv_practice.png");
    
  } catch (e) {
    console.error(e);
  }
  await browser.close();
})();
