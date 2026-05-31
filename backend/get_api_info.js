import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
  console.log("Launching Puppeteer...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  try {
    console.log("Navigating to login page...");
    await page.goto('https://accounts.examgoal.com/login?redirect=https://room.examgoal.com/dashboard', { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(r => setTimeout(r, 2000));
    
    // Switch to Phone tab
    const buttons = await page.$$('button');
    for(const btn of buttons) {
      const t = await page.evaluate(el => el.innerText, btn);
      if(t && t.trim() === 'Phone') {
        await btn.click();
        await new Promise(r => setTimeout(r, 2000));
        break;
      }
    }
    
    // Fill credentials
    const inputs = await page.$$('input');
    for (const input of inputs) {
      const type = await page.evaluate(el => el.getAttribute('type'), input);
      const ph = await page.evaluate(el => el.getAttribute('placeholder'), input);
      if (type === 'tel' || type === 'number' || (ph && ph.toLowerCase().includes('phone'))) {
        await input.click();
        await input.type('7750858874', {delay: 20});
      }
      if (type === 'password') {
        await input.click();
        await input.type('12345678', {delay: 20});
      }
    }
    
    // Submit
    const submitBtns = await page.$$('button[type="submit"]');
    if (submitBtns.length > 0) {
      await submitBtns[0].click();
    } else {
      await page.keyboard.press('Enter');
    }
    
    console.log("Waiting for dashboard redirect...");
    await new Promise(r => setTimeout(r, 12000));
    
    console.log("Extracting Nuxt state...");
    const nuxtState = await page.evaluate(() => {
      return window.__NUXT__ ? JSON.stringify(window.__NUXT__) : null;
    });
    
    if (nuxtState) {
      console.log("Successfully extracted Nuxt state!");
      fs.writeFileSync('nuxt_state.json', nuxtState);
      console.log("Saved to nuxt_state.json");
    } else {
      console.log("window.__NUXT__ is not defined.");
      const html = await page.content();
      fs.writeFileSync('dashboard_content.html', html);
    }
    
    // Let's also look for links to subjects or exams on the page
    const links = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a')).map(a => ({
        text: a.innerText.trim(),
        href: a.getAttribute('href')
      })).filter(l => l.href && (l.href.includes('pyq') || l.href.includes('subject') || l.href.includes('exam')));
    });
    
    console.log("Links found:", links.length);
    fs.writeFileSync('dashboard_links.json', JSON.stringify(links, null, 2));
    
  } catch(e) {
    console.error("Error:", e.message);
  } finally {
    await browser.close();
  }
})();
