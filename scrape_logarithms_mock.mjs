import puppeteer from 'puppeteer';

const PHONE = '7750858874';
const PASSWORD = '12345678';
const EXAM_ORIGIN = 'https://room.examgoal.com';

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1000 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  // Mock google.accounts to prevent TypeError crash
  await page.evaluateOnNewDocument(() => {
    window.google = {
      accounts: {
        id: {
          initialize: () => {},
          prompt: () => {},
          renderButton: () => {},
          disableAutoSelect: () => {},
          storeCredential: () => {},
          cancel: () => {},
          revoke: () => {}
        },
        oauth2: {
          initTokenClient: () => {},
          initCodeClient: () => {},
          hasGrantedAllScopes: () => {},
          hasGrantedAnyScope: () => {},
          revokeToken: () => {}
        }
      }
    };
  });

  page.on('console', msg => console.log(`[Browser Console] ${msg.type().toUpperCase()}: ${msg.text()}`));

  // Login
  await page.goto('https://accounts.examgoal.com/login?redirect=https://room.examgoal.com', { waitUntil: 'networkidle2' });
  await delay(2000);
  const phoneBtns = await page.$$('button');
  for (const btn of phoneBtns) {
    if ((await page.evaluate(el => el.textContent.trim(), btn)) === 'Phone') { await btn.click(); break; }
  }
  await delay(2500);
  await (await page.$('input[type="number"]')).type(PHONE);
  await (await page.$('input[type="password"]')).type(PASSWORD);
  await (await page.$('button[type="submit"]')).click();
  await delay(5000);

  // Navigate to logarithm test 1
  console.log('Navigating to test page...');
  await page.goto(`${EXAM_ORIGIN}/tests/tst-19g61moahy6ef`, { waitUntil: 'networkidle2' });

  // Poll for 15 seconds to see if spinner disappears and questions load
  for (let s = 1; s <= 15; s++) {
    await delay(1000);
    const data = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasWait: text.includes('Please wait...'),
        hasQText: text.includes('Simplify') || text.includes('Roots') || text.includes('root') || text.includes('value'),
        textLength: text.length
      };
    });
    console.log(`Second ${s} | hasWait: ${data.hasWait} | hasQText: ${data.hasQText} | length: ${data.textLength}`);
    if (!data.hasWait && data.hasQText) {
      console.log('Success! Questions loaded.');
      break;
    }
  }

  await page.screenshot({ path: 'mock_test_loaded.png' });
  await browser.close();
}

main().catch(console.error);
