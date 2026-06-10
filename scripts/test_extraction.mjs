import puppeteer from 'puppeteer';

(async () => {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    
    console.log('Navigating to Sets & Relations...');
    await page.goto('https://questions.examside.com/past-years/jee/mathematics/sets-relations-and-functions', { waitUntil: 'networkidle2' });
    
    // Extract subtopics
    const subtopics = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a'));
        return links.filter(a => a.href.includes('/past-years/jee/mathematics/sets-relations-and-functions/'))
                    .map(a => ({ text: a.innerText.trim(), href: a.href }));
    });
    
    console.log('Subtopics found:', subtopics);
    
    if (subtopics.length > 0) {
        console.log(`Navigating to first subtopic: ${subtopics[0].href}`);
        await page.goto(subtopics[0].href, { waitUntil: 'networkidle2' });
        
        // Try to find questions
        const questions = await page.evaluate(() => {
            const items = Array.from(document.querySelectorAll('.question-block, .py-2, .card'));
            return items.length;
        });
        console.log('Question items found:', questions);
    }

    await browser.close();
})();
