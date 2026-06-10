import puppeteer from 'puppeteer';

const MOBILE = '7750858874';
const PASSWORD = '12345678';
const LOGIN_URL = 'https://accounts.examgoal.com/login';

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  await page.goto(LOGIN_URL, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  
  const phoneBtns = await page.$$('button');
  for (const btn of phoneBtns) {
    const text = await page.evaluate(el => el.textContent.trim().toLowerCase(), btn);
    if (text === 'phone') { await btn.click(); break; }
  }
  await new Promise(r => setTimeout(r, 1000));
  
  await page.evaluate(() => {
    const inp = document.querySelector('input[type="number"]');
    if(inp) { inp.value = '7750858874'; inp.dispatchEvent(new Event('input', { bubbles: true })); }
  });
  
  await new Promise(r => setTimeout(r, 500));
  const passInput = await page.$('input[type="password"]');
  if (passInput) {
    await passInput.click({ clickCount: 3 });
    await page.keyboard.type(PASSWORD, { delay: 50 });
  }
  
  const btns = await page.$$('button');
  for (const btn of btns) {
    const text = await page.evaluate(el => el.textContent.trim(), btn);
    if (text === 'Login') { await btn.click(); break; }
  }
  
  await new Promise(r => setTimeout(r, 4000));
  
  console.log('Navigating to PYQ Mathematics...');
  await page.goto('https://room.examgoal.com/pyq/jee-main/mathematics', { waitUntil: 'networkidle2' });
  
  await new Promise(r => setTimeout(r, 5000));
  
  const links = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a'))
          .map(a => ({ text: a.innerText.trim(), href: a.href }))
          .filter(x => x.href.includes('/pyq/jee-main/mathematics'));
  });
  
  console.log('Found Math Links:');
  links.forEach(l => console.log(l.text, '|', l.href));

  await browser.close();
})();
