import puppeteer from 'puppeteer';
import fs from 'fs';

async function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
    const browser = await puppeteer.launch({ 
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    const page = await browser.newPage();
    
    try {
        console.log('Logging in...');
        await page.goto('https://accounts.examgoal.com/login', { waitUntil: 'networkidle2' });
        await delay(2000);
        
        const buttons = await page.$$('button');
        for (const btn of buttons) {
            const text = await page.evaluate(el => el.textContent, btn);
            if (text.trim() === 'Phone') { await btn.click(); break; }
        }
        await delay(1000);

        const inputs = await page.$$('input');
        if (inputs.length >= 2) {
            await inputs[inputs.length - 2].type('7750858874');
            await inputs[inputs.length - 1].type('12345678');
        }
        
        const loginBtns = await page.$$('button');
        for (const btn of loginBtns) {
            const text = await page.evaluate(el => el.textContent, btn);
            if (text.trim() === 'Login') { await btn.click(); break; }
        }

        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
        await delay(5000);

        const token = await page.evaluate(() => localStorage.getItem('auth.token'));
        const userId = 'cea4e815-231c-545e-a844-bb45b16b5ccb';

        const res = await page.evaluate(async (token, userId) => {
            try {
                // Fetch the statistics to get the sessions
                const statReq = await fetch(`https://room.examgoal.com/api/v1/past-question/user/statistics/${userId}?fetch=papers`, {
                    headers: { 'Authorization': token }
                });
                const statJson = await statReq.json();
                
                if (!statJson.data || !statJson.data.papers) return { error: 'No papers found' };
                
                // The sessions are an object in statJson.data.papers[0]
                const sessionsObj = statJson.data.papers[0];
                const sessionIds = Object.keys(sessionsObj);
                
                // Find the session that corresponds to our premium test 'tst-19g61mnpzhlyq'
                let targetSessionId = null;
                for (const sid of sessionIds) {
                    if (sessionsObj[sid].paperId === 'tst-19g61mnpzhlyq') {
                        targetSessionId = sid;
                        break;
                    }
                }
                
                if (!targetSessionId) {
                    // Try the free test instead
                    for (const sid of sessionIds) {
                        if (sessionsObj[sid].paperId === 'tst-19g71mnq5nfun') {
                            targetSessionId = sid;
                            break;
                        }
                    }
                }

                if (!targetSessionId) return { error: 'Session not found for test', sessions: sessionsObj };

                // Fetch the questions for this session!
                const qReq = await fetch(`https://room.examgoal.com/api/v1/past-question/session/${targetSessionId}/load-question`, {
                    headers: { 'Authorization': token }
                });
                const qJson = await qReq.json();

                return { sessionId: targetSessionId, questions: qJson };
            } catch(e) {
                return { error: e.toString() };
            }
        }, token, userId);

        console.log('Fetch Result:', res.sessionId);
        fs.writeFileSync('fetch_questions_result.json', JSON.stringify(res, null, 2));

        await browser.close();
    } catch (e) {
        console.error(e);
        await browser.close();
    }
}
run();
