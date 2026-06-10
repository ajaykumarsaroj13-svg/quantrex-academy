import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({width: 1280, height: 800});
  
  console.log('Navigating to ExamGOAL...');
  await page.goto('https://examgoal.com/login', {waitUntil: 'networkidle2'});
  
  await page.screenshot({path: 'step1_login_page.png'});

  const inputs = await page.$$('input');
  console.log('Found inputs:', inputs.length);
  
  if(inputs.length >= 2) {
    await inputs[0].type('7750858874');
    await inputs[1].type('12345678');
    await page.keyboard.press('Enter');
    console.log('Pressed enter');
  } else {
    console.log('Could not find enough inputs');
  }
  
  await new Promise(r => setTimeout(r, 5000));
  await page.screenshot({path: 'step2_after_login.png'});
  
  // Try to find the portal
  await page.goto('https://examgoal.com/dashboard', {waitUntil: 'networkidle2'});
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({path: 'step3_dashboard.png'});

  await browser.close();
})();
