import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto('https://quantrex-academy.vercel.app/test-series');
  
  // Wait for tests to load
  await page.waitForTimeout(2000);
  
  // Find a practice button and click it
  const practiceBtn = await page.$('.tsp-btn-practice');
  if (practiceBtn) {
    await practiceBtn.click();
    await page.waitForTimeout(2000); // Wait for navigation and error rendering
  } else {
    console.log('No practice button found');
  }
  
  await page.screenshot({ path: 'test_error.png' });
  console.log('Screenshot saved to test_error.png');
  await browser.close();
})();
