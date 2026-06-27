import puppeteer from 'puppeteer';
(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({width: 1400, height: 900});
  
  try {
    // Go to app
    await page.goto('http://localhost:3000/quantrex-academy/', {waitUntil: 'networkidle0', timeout: 15000});
    await page.screenshot({path: 'ss_01_home.png'});
    console.log('home captured');
    
    // Find login form or enter directly via localstorage
    // Try phone login
    const phoneInput = await page.$('input[placeholder*="phone"], input[placeholder*="Phone"], input[type="tel"]');
    if (phoneInput) {
      await phoneInput.type('9999999999');
      await page.screenshot({path: 'ss_02_phone.png'});
      
      // Click next/continue
      const btns = await page.$$('button');
      for (const btn of btns) {
        const text = await btn.evaluate(el => el.textContent);
        if (text.includes('Continue') || text.includes('Next') || text.includes('Login')) {
          await btn.click();
          break;
        }
      }
      await new Promise(r => setTimeout(r, 2000));
      await page.screenshot({path: 'ss_03_after_phone.png'});
    } else {
      // Check for email login
      const emailInput = await page.$('input[type="email"], input[placeholder*="email"]');
      if (emailInput) {
        await emailInput.type('test@test.com');
        const passInput = await page.$('input[type="password"]');
        if (passInput) {
          await passInput.type('password123');
        }
        const submitBtn = await page.$('button[type="submit"]');
        if (submitBtn) await submitBtn.click();
        await new Promise(r => setTimeout(r, 3000));
        await page.screenshot({path: 'ss_03_after_login.png'});
      }
    }
    
    // Take screenshot of current page
    await page.screenshot({path: 'ss_04_current.png'});
    console.log('current state captured');
    
    // Try to inject user into localStorage 
    await page.evaluate(() => {
      const fakeUser = { name: 'Test User', email: 'test@test.com', phone: '9999999999', purchasedCourses: [] };
      localStorage.setItem('quantrex_user', JSON.stringify(fakeUser));
      localStorage.setItem('token', 'fake-token-123');
    });
    await page.reload({waitUntil: 'networkidle0'});
    await new Promise(r => setTimeout(r, 3000));
    await page.screenshot({path: 'ss_05_after_fake_login.png'});
    console.log('After fake login captured');
    
  } catch(e) {
    console.error('Error:', e.message);
  }
  
  await browser.close();
})();
