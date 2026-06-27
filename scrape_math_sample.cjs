const fs = require('fs');
const https = require('https');
const cheerio = require('cheerio');

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

async function main() {
    const chapters = [
        { title: 'Sets, Relations and Functions', url: 'https://questions.examside.com/past-years/jee/jee-main/mathematics/sets-relations-and-functions' },
        { title: 'Complex Numbers and Quadratic Equations', url: 'https://questions.examside.com/past-years/jee/jee-main/mathematics/complex-numbers-and-quadratic-equations' }
    ];

    const outStream = fs.createWriteStream('./math_sample.jsonl', { flags: 'w' });

    for(const chapter of chapters) {
        console.log(`[Scraper] Fetching chapter: ${chapter.title}`);
        const html = await fetchHtml(chapter.url);
        console.log("HTML Start:", html.substring(0, 2000));
        
        const $ = cheerio.load(html);
        const qUrls = [];
        $('a[href^="/past-years/jee/question/"]').each((i, el) => {
            qUrls.push(`https://questions.examside.com${$(el).attr('href')}`);
        });

        // Filter out unique
        const uniqueUrls = [...new Set(qUrls)];
        console.log(`Found ${uniqueUrls.length} questions in ${chapter.title}`);

        for(const qUrl of uniqueUrls) {
            try {
                const qHtml = await fetchHtml(qUrl);
                
                // Get Year Tag
                let year = 'Unknown Year';
                const yearMatch = qHtml.match(/JEE Main (\d{4})/i);
                if (yearMatch) {
                    year = yearMatch[0];
                }

                let rawContentChunks = [];
                const regex = /<!-- HTML_TAG_START -->([\s\S]*?)<!-- HTML_TAG_END -->/g;
                let match;
                while ((match = regex.exec(qHtml)) !== null) {
                  rawContentChunks.push(match[1].trim());
                }
                
                let questionText = rawContentChunks.length > 0 ? rawContentChunks[0] : null;
                let options = rawContentChunks.slice(1, 5);
                while(options.length < 4) options.push("N/A");
            
                if(!questionText) continue;

                const qObj = {
                    id: 'math_' + Math.random().toString(36).substring(2, 9),
                    chapter: chapter.title,
                    questionText: questionText,
                    options: options,
                    explanation: rawContentChunks.slice(5).join('<br/>') || "Detailed explanation will be updated.",
                    year: year
                };

                outStream.write(JSON.stringify(qObj) + '\n');
                console.log(` -> Scraped: ${year} | ${qUrl.split('/').pop()}`);
                
                await new Promise(r => setTimeout(r, 200));
            } catch(e) {
                console.log(` -> Error fetching ${qUrl}`);
            }
        }
    }
    
    outStream.end();
    console.log('[Scraper] Sample scraping complete!');
}

main();
