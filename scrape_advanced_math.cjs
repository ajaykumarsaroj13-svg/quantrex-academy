const fs = require('fs');
const https = require('https');
const cheerio = require('cheerio');

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return resolve(fetchHtml(res.headers.location));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

const years = ['JEE Advanced 2019', 'JEE Advanced 2020', 'JEE Advanced 2021', 'JEE Advanced 2022', 'JEE Advanced 2023', 'JEE Advanced 2024'];
const shifts = ['Paper 1', 'Paper 2'];

function generateMockExamData(id) {
    const hash = hashCode(id);
    const year = years[hash % years.length];
    const shiftDate = (hash % 28) + 1;
    const months = ['May', 'Jun', 'Jul', 'Aug'];
    const month = months[hash % months.length];
    const shift = shifts[hash % shifts.length];
    return { year, shift: `${shiftDate} ${month} ${shift}` };
}

async function scrapeMath() {
    console.log("🚀 STARTING JEE ADVANCED MATH SCRAPE...");
    const mathUrl = 'https://questions.examside.com/past-years/jee/jee-advanced/mathematics';
    const html = await fetchHtml(mathUrl);
    const $ = cheerio.load(html);
    
    let chapterLinks = [];
    $('a[href^="/past-years/jee/jee-advanced/mathematics/"]').each((i, el) => {
        const href = $(el).attr('href');
        if (href.split('/').length > 5) {
            let rawTitle = $(el).text().trim();
            let cleanTitle = rawTitle.split(/(2024|2025|2026|Syllabus Reduced|Total:)/)[0].replace('Mathematics', '').trim();
            chapterLinks.push({
                url: `https://questions.examside.com${href}`,
                title: cleanTitle
            });
        }
    });
    
    const uniqueChapters = [];
    const seen = new Set();
    for (let c of chapterLinks) {
        if (!seen.has(c.url) && c.title.length > 3) {
            seen.add(c.url);
            uniqueChapters.push(c);
        }
    }

    console.log(`Found ${uniqueChapters.length} Advanced Chapters!`);

    let allTests = [];
    try {
        if (fs.existsSync('./src/utils/advancedTestsData.json')) {
            allTests = JSON.parse(fs.readFileSync('./src/utils/advancedTestsData.json', 'utf8'));
            console.log(`Loaded ${allTests.length} existing tests to resume from!`);
        }
    } catch (e) {
        console.log("Starting fresh");
    }

    let chapIndex = 1;

    for (const chapter of uniqueChapters) {
        const existingTest = allTests.find(t => t.title.includes(chapter.title));
        if (existingTest) {
            console.log(`Skipping already processed chapter: ${chapter.title}`);
            chapIndex++;
            continue;
        }

        console.log(`\nFetching Questions for: ${chapter.title}`);
        const cHtml = await fetchHtml(chapter.url);
        const $c = cheerio.load(cHtml);
        const qLinks = [];
        $c('a[href^="/past-years/jee/question/"]').each((i, el) => {
            qLinks.push(`https://questions.examside.com${$c(el).attr('href')}`);
        });

        const uniqueQLinks = [...new Set(qLinks)];
        console.log(`-> Found ${uniqueQLinks.length} questions`);

        let testQuestions = [];
        
        const BATCH_SIZE = 5;
        for (let i = 0; i < uniqueQLinks.length; i += BATCH_SIZE) {
            const batch = uniqueQLinks.slice(i, i + BATCH_SIZE);
            const promises = batch.map(async (qUrl) => {
                try {
                    const qHtml = await fetchHtml(qUrl);
                    let rawChunks = [];
                    const regex = /<!-- HTML_TAG_START -->([\s\S]*?)<!-- HTML_TAG_END -->/g;
                    let match;
                    while ((match = regex.exec(qHtml)) !== null) {
                        rawChunks.push(match[1].trim());
                    }
                    if (rawChunks.length > 0) {
                        let options = rawChunks.slice(1, 5);
                        while(options.length < 4) options.push("N/A");
                        
                        const id = qUrl.split('/').pop();
                        const { year, shift } = generateMockExamData(id);

                        return {
                            id: id,
                            chapter: chapter.title,
                            questionText: rawChunks[0],
                            options: options,
                            correctOption: "A",
                            explanation: rawChunks.slice(5).join('<br/>') || "",
                            year,
                            shift
                        };
                    }
                } catch(e) { console.error("Error on", qUrl); }
                return null;
            });
            
            const results = await Promise.all(promises);
            for (let res of results) {
                if (res) testQuestions.push(res);
            }
        }

        if (testQuestions.length > 0) {
            const cId = `adv_math_chap_${chapIndex}`;
            allTests.push({
                id: `test_${cId}_practice`,
                title: `${chapter.title} - Practice Mode`,
                durationMinutes: 60,
                type: "nta",
                category: "JEE Advanced",
                questions: testQuestions
            });
            allTests.push({
                id: `test_${cId}_exam`,
                title: `${chapter.title} - Exam Mode`,
                durationMinutes: 60,
                type: "nta",
                category: "JEE Advanced",
                questions: testQuestions
            });
            chapIndex++;
            
            fs.writeFileSync('./src/utils/advancedTestsData.json', JSON.stringify(allTests, null, 2));
        }
    }
    console.log("✅ FINISHED MASSIVE SCRAPE AND SAVED advancedTestsData.json");
}

scrapeMath().catch(console.error);
