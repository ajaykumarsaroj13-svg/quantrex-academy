import fs from 'fs';
import puppeteer from 'puppeteer';

async function test() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36');
  
  // Set viewport to a desktop size
  await page.setViewport({ width: 1280, height: 800 });
  
  await page.goto('https://questions.examside.com/past-years/jee/question/pwfLihPyTnAl0mJy');
  
  // Wait for the main question card to render
  try {
    await page.waitForSelector('main', { timeout: 10000 });
    // Let's also wait a bit to ensure hydration is complete
    await new Promise(r => setTimeout(r, 2000));
  } catch(e) {
    console.log("main not found");
  }

  await page.screenshot({ path: 'scratch/q2.png' });
  const html = await page.content();
  fs.writeFileSync('scratch/q2_puppeteer.html', html);
  
  // Try to find the breadcrumb
  const breadcrumb = await page.evaluate(() => {
    return document.querySelector('nav') ? document.querySelector('nav').innerText : 'no nav';
  });
  console.log("Breadcrumb:", breadcrumb);
  
  // Try to find the correct answer
  const answerTxt = await page.evaluate(() => {
     return Array.from(document.querySelectorAll('div, span, p')).filter(el => el.innerText && el.innerText.includes('Correct Answer')).map(e => e.innerText).join('\n---\n');
  });
  console.log("Answer block:", answerTxt.substring(0, 500));
  
  await browser.close();
  console.log("Done");
}

test();
