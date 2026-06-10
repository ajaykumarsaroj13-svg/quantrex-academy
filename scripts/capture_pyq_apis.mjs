import puppeteer from 'puppeteer';
import fs from 'fs';

const PASSWORD = '12345678';

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  const capturedRequests = [];
  
  await page.setRequestInterception(true);
  page.on('request', req => {
      const url = req.url();
      const headers = req.headers();
      if (url.includes('room.examgoal.com/api') && headers['authorization']) {
          capturedRequests.push({ url, auth: headers['authorization'], method: req.method() });
          console.log('[API REQ] ' + req.method() + ' ' + url.substring(0, 100));
      }
      req.continue();
  });

  page.on('response', async res => {
      const url = res.url();
      if (url.includes('room.examgoal.com/api/v1/past-question')) {
          try {
              const json = await res.json();
              const fname = 'pyq_' + url.replace(/https?:\/\/[^/]+\/api\/v1\/past-question\//,'').replace(/[/?=&]/g,'_').substring(0,80) + '_' + Date.now() + '.json';
              fs.writeFileSync(fname, JSON.stringify(json, null, 2));
              console.log('[SAVED] ' + fname + ' - keys: ' + Object.keys(json || {}).join(','));
          } catch (e) {
              console.log('[API RESP PARSE ERR]', e.message);
          }
      }
  });

  // Login
  await page.goto('https://accounts.examgoal.com/login', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  
  const btns1 = await page.$$('button');
  for (const btn of btns1) {
    const t = await page.evaluate(el => el.textContent.trim().toLowerCase(), btn);
    if (t === 'phone') { await btn.click(); break; }
  }
  await new Promise(r => setTimeout(r, 1500));
  
  await page.evaluate(() => {
    const inp = document.querySelector('input[type="number"]');
    if(inp) { inp.value = '7750858874'; inp.dispatchEvent(new Event('input', { bubbles: true })); }
  });
  await new Promise(r => setTimeout(r, 600));
  
  const passInput = await page.$('input[type="password"]');
  if (passInput) {
    await passInput.click({ clickCount: 3 });
    await page.keyboard.type(PASSWORD, { delay: 50 });
  }
  
  const btns2 = await page.$$('button');
  for (const btn of btns2) {
    const t = await page.evaluate(el => el.textContent.trim(), btn);
    if (/^Login$/i.test(t)) { await btn.click(); break; }
  }
  await new Promise(r => setTimeout(r, 5000));
  console.log('Login done. URL:', page.url());

  // Navigate to the Sets and Relations page - we KNOW this works from the existing data
  // Let's find what URLs the app uses
  await page.goto('https://room.examgoal.com/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 3000));
  
  // Get all links
  const allLinks = await page.evaluate(() => 
      Array.from(document.querySelectorAll('a')).map(a => a.href).filter(h => h.includes('examgoal'))
  );
  console.log('All links on home:', JSON.stringify(allLinks.slice(0, 20)));

  // Try to navigate to PYQ section
  const pyqLinks = allLinks.filter(l => l.includes('/pyq'));
  console.log('PYQ links:', JSON.stringify(pyqLinks));
  
  // Navigate to first pyq link found
  if (pyqLinks.length > 0) {
      await page.goto(pyqLinks[0], { waitUntil: 'networkidle2' });
      await new Promise(r => setTimeout(r, 5000));
      console.log('Navigated to:', page.url());
      
      const subjectLinks = await page.evaluate(() =>
          Array.from(document.querySelectorAll('a')).map(a => ({ text: a.innerText, href: a.href })).filter(x => x.href.includes('examgoal'))
      );
      console.log('Subject links:', JSON.stringify(subjectLinks.slice(0, 20)));
  }

  await browser.close();
  
  // Save all captured requests
  fs.writeFileSync('captured_api_requests.json', JSON.stringify(capturedRequests, null, 2));
  console.log('Saved', capturedRequests.length, 'API requests');
})();
