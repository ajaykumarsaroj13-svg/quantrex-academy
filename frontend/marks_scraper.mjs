import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  
  let authToken = null;

  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('/login') || url.includes('auth')) {
      console.log(`[API] Auth response from: ${url}`);
      try {
        const json = await response.json();
        console.log("Auth Response JSON:", JSON.stringify(json).substring(0, 200));
        
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
    
    await new Promise(r => setTimeout(r, 3000));
    
    const pageHtml = await page.content();
    if (pageHtml.includes('Login') || pageHtml.includes('Sign In')) {
      console.log("Finding login form...");
      
      const inputs = await page.$$('input');
      console.log(`Found ${inputs.length} input fields.`);
      
      if (inputs.length >= 2) {
        await inputs[0].type(EMAIL);
        await inputs[1].type(PASSWORD);
        console.log("Entered credentials.");
        
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

    console.log("Waiting 10 seconds for login to process...");
    await new Promise(r => setTimeout(r, 10000));

    await page.screenshot({ path: path.join(__dirname, 'marks_dashboard.png') });
    fs.writeFileSync(path.join(__dirname, 'marks_after_login.html'), await page.content());
    
    console.log("Scraping finished. Check marks_after_login.html");
  } catch (err) {
    console.error("Error during scraping:", err);
  } finally {
    await browser.close();
  }
}

scrapeMarks();
