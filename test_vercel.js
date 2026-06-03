const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('request', r => {
    if (r.url().includes('/api/')) console.log('REQ:', r.url());
  });
  await page.goto('https://quantrexacademy.vercel.app');
  console.log('Navigated to site. Clicking "ExamGOAL Platform"...');
  await page.click('text=ExamGOAL Platform');
  await page.waitForTimeout(2000);
  console.log('Clicking "Permutations and Combinations"...');
  // Need to click on the chapter, let's just click any chapter that contains "Permutations"
  await page.click('text=Permutations');
  await page.waitForTimeout(3000);
  console.log('Taking screenshot...');
  await page.screenshot({ path: 'frontend/test_vercel.png' });
  await browser.close();
})();
