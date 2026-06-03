const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const path = require('path');
const fs = require('fs');

puppeteer.use(StealthPlugin());

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ 
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });
  
  try {
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1280, height: 800 });
    
    console.log('Navigating to ExamGOAL login...');
    await page.goto('https://room.examgoal.com/login', { waitUntil: 'networkidle2' });
    
    // Take initial screenshot
    await page.screenshot({ path: path.join(__dirname, 'login_page.png') });
    console.log('Saved login_page.png');
    
    // Wait for phone number input
    // The selector might be an input with type="tel" or placeholder containing "Phone"
    await page.waitForSelector('input[type="tel"], input[placeholder*="Phone"], input[placeholder*="Mobile"]', { timeout: 10000 });
    const phoneInput = await page.$('input[type="tel"], input[placeholder*="Phone"], input[placeholder*="Mobile"]');
    await phoneInput.type('7750858874');
    console.log('Entered phone number.');
    
    // Find password input
    const passInput = await page.$('input[type="password"]');
    if (passInput) {
      await passInput.type('12345678');
      console.log('Entered password.');
    } else {
      console.log('Password input not found, might need to click next first.');
      // Click next/continue button if exists
      const btns = await page.$$('button');
      for (const btn of btns) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text.toLowerCase().includes('continue') || text.toLowerCase().includes('next') || text.toLowerCase().includes('login')) {
          await btn.click();
          break;
        }
      }
      // wait a bit
      await page.waitForTimeout(2000);
      const passInput2 = await page.$('input[type="password"]');
      if (passInput2) {
        await passInput2.type('12345678');
        console.log('Entered password after continue.');
      }
    }
    
    // Click submit/login
    const loginBtns = await page.$$('button');
    let clicked = false;
    for (const btn of loginBtns) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.toLowerCase().includes('login') || text.toLowerCase().includes('submit') || text.toLowerCase().includes('continue')) {
        await btn.click();
        clicked = true;
        console.log('Clicked login button:', text);
        break;
      }
    }
    
    if (!clicked) {
      // try pressing Enter
      await page.keyboard.press('Enter');
      console.log('Pressed Enter to login.');
    }
    
    console.log('Waiting for navigation...');
    // wait for navigation or timeout
    await Promise.race([
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }),
      new Promise(resolve => setTimeout(resolve, 15000))
    ]);
    
    await page.screenshot({ path: path.join(__dirname, 'post_login.png') });
    console.log('Saved post_login.png');
    
    // Get cookies
    const cookies = await page.cookies();
    fs.writeFileSync(path.join(__dirname, 'cookies.json'), JSON.stringify(cookies, null, 2));
    
    // Print page title and URL
    console.log('Current URL:', page.url());
    console.log('Page Title:', await page.title());
    
    // Try to extract some local storage data which might have user info or test formats
    const ls = await page.evaluate(() => JSON.stringify(localStorage));
    fs.writeFileSync(path.join(__dirname, 'localstorage.json'), ls);
    console.log('Saved local storage data.');
    
  } catch (err) {
    console.error('Error during scraping:', err);
  } finally {
    await browser.close();
  }
})();
