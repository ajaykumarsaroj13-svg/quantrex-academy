import puppeteer from 'puppeteer';
import fs from 'fs';

const PHONE = '7750858874';
const PASSWORD = '12345678';
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 900 }
  });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  await page.goto('https://accounts.examgoal.com/login?redirect=https://room.examgoal.com', { waitUntil: 'networkidle2' });
  await delay(2000);

  // Native click on "Phone" tab
  const phoneBtns = await page.$$('button');
  for (const btn of phoneBtns) {
    const txt = await page.evaluate(el => el.textContent.trim(), btn);
    if (txt === 'Phone') { await btn.click(); break; }
  }
  await delay(2500);

  // Fill the number input (type="number", placeholder="Enter Phone Number")
  const numberInput = await page.$('input[type="number"][placeholder*="Phone" i]') ||
                      await page.$('input[type="number"][name="phone"]') ||
                      await page.$('input[type="number"]');

  if (numberInput) {
    await numberInput.click({ clickCount: 3 });
    await numberInput.type(PHONE);
    console.log('✓ Filled phone number field');
  } else {
    console.log('✗ Could not find number input');
  }
  await delay(800);

  // Fill password
  const passInput = await page.$('input[type="password"]');
  if (passInput) {
    await passInput.click({ clickCount: 3 });
    await passInput.type(PASSWORD);
    console.log('✓ Filled password');
  }
  await delay(800);

  // Submit
  const submitBtn = await page.$('button[type="submit"]');
  if (submitBtn) { await submitBtn.click(); console.log('✓ Clicked submit'); }

  await delay(6000);
  const finalUrl = page.url();
  console.log('Final URL:', finalUrl);
  const loggedIn = !finalUrl.includes('/login');
  console.log('Logged in:', loggedIn);

  if (!loggedIn) {
    const errs = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('[class*="toast"], [role="alert"]'))
        .map(e => e.textContent.trim()).filter(t => t).join(' | ');
    });
    console.log('Errors:', errs);
  } else {
    // Test a quick API call to verify session
    const profile = await page.evaluate(async () => {
      const res = await fetch('https://room.examgoal.com/api/v1/auth/profile/me', { credentials: 'include' });
      return res.ok ? await res.json() : null;
    });
    console.log('Profile:', profile?.data?.displayName || JSON.stringify(profile)?.slice(0, 100));
  }

  await browser.close();
}

main().catch(e => { console.error(e); process.exit(1); });
