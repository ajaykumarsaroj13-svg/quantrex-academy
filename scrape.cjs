const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({headless: true});
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Intercept API requests
  let questionsData = [];
  page.on('response', async (res) => {
    if (res.url().includes('getSubjectChapterQuestions') || res.url().includes('questions') || res.url().includes('examgoal')) {
      try {
        const json = await res.json();
        if (json) {
           questionsData.push({url: res.url(), data: json});
        }
      } catch(e) {}
    }
  });

  await page.goto('https://accounts.examgoal.com/login');
  
  // Wait for network to be idle so React can render the inputs
  await page.waitForLoadState('networkidle');

  const inputs = await page.$$eval('input', els => els.map(e => ({type: e.type, id: e.id, placeholder: e.placeholder})));
  console.log('Inputs found:', inputs);

  // Click Phone tab
  await page.click('text="Phone"');
  await page.waitForTimeout(500);

  // Fill by placeholder or generic input
  const phoneInput = await page.$('input[placeholder*="Phone"]');
  if (phoneInput) await phoneInput.fill('7750858874');

  const pwdInput = await page.$('input[type="password"]');
  if (pwdInput) await pwdInput.fill('12345678');

  await page.screenshot({ path: 'login_filled.png' });

  await page.click('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")');
  await page.waitForTimeout(5000);
  
  console.log('Logged in. Current URL:', page.url());
  await page.screenshot({ path: 'logged_in.png' });

  // Go to JEE Advanced Complex Numbers chapter
  await page.goto('https://room.examgoal.com/pyq/subject/a8314b18-4eed-59d3-a7c5-cb0e3efe15d5/chapter/4ce2be34-559a-5ac2-85af-9c69e84c1fe2');
  
  // Dismiss any popups
  await page.keyboard.press('Escape');
  await page.waitForTimeout(2000);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'questions_page_after_esc.png' });
  
  // Extract questions from DOM
  await page.click('text="Resume Practice", text="Take Test"');
  await page.waitForTimeout(10000);

  fs.writeFileSync('complex_adv_api.json', JSON.stringify(questionsData, null, 2));

  await browser.close();
})();
