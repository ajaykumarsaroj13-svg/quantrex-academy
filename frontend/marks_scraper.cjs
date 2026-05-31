const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const EMAIL = "ajaykumarsaroj13@gmail.com";
const PASSWORD = "Saroj13@";

async function scrapeMarks() {
  console.log("Starting Puppeteer to scrape Marks App...");
  const browser = await puppeteer.launch({
    headless: "new",
    defaultViewport: null,
    args: ['--window-size=1200,800', '--no-sandbox']
  });

  const page = await browser.newPage();
  
  // Track tokens and endpoints
  let authToken = null;
  let apiBaseUrl = null;

  // Intercept network requests
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('/login') || url.includes('auth')) {
      console.log(`[API] Auth response from: ${url}`);
      try {
        const json = await response.json();
        console.log("Auth Response JSON:", JSON.stringify(json).substring(0, 200));
        
        // Try to find a token
        if (json.token || json.access_token || json.data?.token) {
          authToken = json.token || json.access_token || json.data?.token;
          console.log("Found Auth Token:", authToken);
        }
      } catch (e) {}
    }
  });

  try {
    await page.goto('https://web.getmarks.app/', { waitUntil: 'networkidle2' });
    console.log("Navigated to getmarks.app");
    
    // Wait for a few seconds to let any initial animations finish
    await new Promise(r => setTimeout(r, 3000));
    
    // Look for login button or inputs
    // Marks app might require clicking a "Login" button first
    const pageHtml = await page.content();
    if (pageHtml.includes('Login') || pageHtml.includes('Sign In')) {
      console.log("Finding login form...");
      
      // Let's try typing into inputs directly if they exist
      const inputs = await page.$$('input');
      console.log(`Found ${inputs.length} input fields.`);
      
      if (inputs.length >= 2) {
        // Assume first is email, second is password
        await inputs[0].type(EMAIL);
        await inputs[1].type(PASSWORD);
        console.log("Entered credentials.");
        
        // Find submit button
        const buttons = await page.$$('button');
        for (const btn of buttons) {
          const text = await page.evaluate(el => el.textContent, btn);
          if (text && (text.toLowerCase().includes('login') || text.toLowerCase().includes('sign in') || text.toLowerCase().includes('continue'))) {
            console.log(`Clicking button: ${text}`);
            await btn.click();
            break;
          }
        }
      } else {
        console.log("Could not find standard email/password inputs on homepage. Might need to click 'Login' first.");
        // Try to click a login button to open modal
        const buttons = await page.$$('button, a, div[role="button"]');
        let clickedLogin = false;
        for (const btn of buttons) {
          const text = await page.evaluate(el => el.textContent, btn);
          if (text && (text.trim() === 'Login' || text.trim() === 'Sign In')) {
            console.log(`Clicking pre-login button: ${text}`);
            await btn.click();
            clickedLogin = true;
            break;
          }
        }
        
        if (clickedLogin) {
          await new Promise(r => setTimeout(r, 2000));
          const newInputs = await page.$$('input');
          if (newInputs.length >= 1) {
            console.log(`Found ${newInputs.length} inputs in modal.`);
            await newInputs[0].type(EMAIL);
            // If it's a 2-step (Email -> Next -> Password), we handle that
            // Just hit Enter and see
            await page.keyboard.press('Enter');
            await new Promise(r => setTimeout(r, 2000));
            
            const passInputs = await page.$$('input[type="password"]');
            if (passInputs.length > 0) {
              await passInputs[0].type(PASSWORD);
              await page.keyboard.press('Enter');
            }
          }
        }
      }
    }

    // Wait for login to process
    console.log("Waiting 10 seconds for login to process...");
    await new Promise(r => setTimeout(r, 10000));

    console.log("Saving screenshot...");
    await page.screenshot({ path: path.join(__dirname, 'marks_dashboard.png') });
    
    // Dump current HTML to analyze structure
    fs.writeFileSync(path.join(__dirname, 'marks_after_login.html'), await page.content());
    
    console.log("Scraping finished. Check marks_after_login.html");
  } catch (err) {
    console.error("Error during scraping:", err);
  } finally {
    // Keep browser open for manual debugging if needed, but close it here for automated run
    await browser.close();
  }
}

scrapeMarks();
