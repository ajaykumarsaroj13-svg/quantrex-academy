const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  // Set a realistic user agent
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
  
  console.log('Navigating to ExamGoal login...');
  await page.goto('https://www.examgoal.com/login', { waitUntil: 'networkidle2' });
  
  console.log('Attempting to log in...');
  try {
    // Wait for the login form elements (we'll need to guess the selectors or try common ones)
    // ExamGoal login might use input[type="text"] or input[name="mobile"]
    await page.waitForSelector('input[type="text"], input[type="tel"], input[name="email"]', { timeout: 5000 });
    
    // We will dump the page HTML to see the structure if this fails
    console.log('Login form found, but we need to know the exact selectors.');
    
    // As a first attempt, we'll just save the HTML to inspect the login page structure
    const html = await page.content();
    fs.writeFileSync('examgoal_login.html', html);
    console.log('Saved examgoal_login.html for inspection.');

  } catch (err) {
    console.error('Failed to find login form:', err.message);
    const html = await page.content();
    fs.writeFileSync('examgoal_error.html', html);
  }

  await browser.close();
})();
