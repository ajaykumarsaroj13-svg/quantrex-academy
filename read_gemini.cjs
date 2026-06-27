(async () => {
  const puppeteer = (await import('puppeteer')).default;
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto('https://gemini.google.com/share/6d5957dbde60', { waitUntil: 'networkidle2' });
  
  // Wait a few seconds for the page to fully render
  await new Promise(r => setTimeout(r, 5000));
  
  // Extract text from the main conversation container
  const content = await page.evaluate(() => {
    return document.body.innerText;
  });
  
  const fs = require('fs');
  fs.writeFileSync('gemini_link_content.txt', content);
  
  await browser.close();
})();
