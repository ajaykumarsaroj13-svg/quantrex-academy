const fs = require('fs');
const path = require('path');
const https = require('https');
const cheerio = require('cheerio'); // Since we installed it in quantrex-academy/frontend, wait, we might need to point there or run it from there.

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
          return resolve(fetchHtml(res.headers.location));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

const subjects = [
    'https://questions.examside.com/past-years/jee/jee-main/physics',
    'https://questions.examside.com/past-years/jee/jee-main/chemistry',
    'https://questions.examside.com/past-years/jee/jee-main/mathematics'
];

async function getChapters(subjectUrl) {
    console.log(`[Scraper] Fetching chapters for ${subjectUrl}`);
    const html = await fetchHtml(subjectUrl);
    const $ = cheerio.load(html);
    const chapterLinks = [];
    // Looking at previous HTML, chapter links look like <a href="/past-years/jee/jee-main/physics/units-and-measurements" ...>
    $('a[href^="/past-years/jee/jee-main/"]').each((i, el) => {
        const href = $(el).attr('href');
        if (href.split('/').length > 5) { // Ensure it's a chapter link, not just subject
            chapterLinks.push(`https://questions.examside.com${href}`);
        }
    });
    return [...new Set(chapterLinks)];
}

async function getQuestionsFromChapter(chapterUrl) {
    console.log(`[Scraper] Fetching questions from chapter ${chapterUrl}`);
    const html = await fetchHtml(chapterUrl);
    const $ = cheerio.load(html);
    const questionLinks = [];
    $('a[href^="/past-years/jee/question/"]').each((i, el) => {
        questionLinks.push(`https://questions.examside.com${$(el).attr('href')}`);
    });
    return [...new Set(questionLinks)];
}

async function scrapeQuestion(questionUrl) {
    const html = await fetchHtml(questionUrl);
    let rawContentChunks = [];
    const regex = /<!-- HTML_TAG_START -->([\s\S]*?)<!-- HTML_TAG_END -->/g;
    let match;
    while ((match = regex.exec(html)) !== null) {
      rawContentChunks.push(match[1].trim());
    }
    
    let questionText = rawContentChunks.length > 0 ? rawContentChunks[0] : "Failed to parse question";
    let options = rawContentChunks.slice(1, 5);
    while(options.length < 4) options.push("N/A");

    return {
        url: questionUrl,
        questionText: questionText,
        options: options,
        correctOption: "A", // Placeholder
        explanation: rawContentChunks.slice(5).join('<br/>') || ""
    };
}

async function run() {
    console.log("🚀 STARTING MASSIVE BACKGROUND SCRAPE...");
    const outputPath = path.join(__dirname, '..', 'quantrex-academy', 'backend', 'data', 'jee_mains_scraped.jsonl');
    
    // Create dir if not exists
    if (!fs.existsSync(path.dirname(outputPath))) {
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    }

    try {
        for (const subject of subjects) {
            const chapters = await getChapters(subject);
            console.log(`Found ${chapters.length} chapters in ${subject}`);
            
            for (const chapter of chapters) {
                const questionUrls = await getQuestionsFromChapter(chapter);
                console.log(`Found ${questionUrls.length} questions in ${chapter}`);
                
                const limit = questionUrls.length; // Scraping ALL questions as per /goal

                
                for (let i = 0; i < limit; i++) {
                    try {
                        const qData = await scrapeQuestion(questionUrls[i]);
                        fs.appendFileSync(outputPath, JSON.stringify(qData) + '\n');
                        console.log(`   -> Scraped: ${questionUrls[i]}`);
                    } catch(e) {
                        console.error(`   -> Failed: ${questionUrls[i]}`);
                    }
                    await new Promise(r => setTimeout(r, 1000)); // 1s delay
                }
            }
        }
        console.log("✅ MASSIVE SCRAPE COMPLETED. Data saved to:", outputPath);
    } catch(err) {
        console.error("Fatal Scraper Error:", err);
    }
}

run();
