const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({width: 1280, height: 800});
  
  console.log('Navigating to ExamGOAL...');
  await page.goto('https://examgoal.com/login', {waitUntil: 'networkidle2'});
  
  console.log('Logging in...');
  const selector = 'input[type="text"], input[name="mobile"], input[placeholder*="Mobile"]';
  await page.waitForSelector(selector, {timeout: 5000}).catch(e => console.log('no mobile input'));
  
  const inputs = await page.$$(selector);
  if(inputs.length > 0) {
    await inputs[0].type('7750858874');
  } else {
    const allInputs = await page.$$('input');
    await allInputs[0].type('7750858874');
  }

  const passSelector = 'input[type="password"]';
  const passInputs = await page.$$(passSelector);
  if(passInputs.length > 0) {
    await passInputs[0].type('12345678');
  } else {
    const allInputs = await page.$$('input');
    await allInputs[1].type('12345678');
  }

  await page.keyboard.press('Enter');
  
  await new Promise(r => setTimeout(r, 5000));
  await page.screenshot({path: 'examgoal_login.png'});
  console.log('Logged in. Saved examgoal_login.png');

  await browser.close();
})();
