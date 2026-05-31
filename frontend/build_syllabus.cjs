const fs = require('fs');
const path = require('path');
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

async function scrapeSubjectStructure(subjectUrl, subjectKey) {
    console.log(`Scraping structure for ${subjectKey}...`);
    const html = await fetchHtml(subjectUrl);
    const $ = cheerio.load(html);
    
    const subjectData = {
        label: subjectKey.charAt(0).toUpperCase() + subjectKey.slice(1),
        modules: []
    };

    // The structure usually is:
    // <h2>Module Name</h2>
    // <div class="rounded grid ..."> ... chapter links ... </div>
    
    // We can iterate over the <h2> tags inside the main container
    $('main h2').each((i, el) => {
        const moduleTitle = $(el).text().trim();
        const nextDiv = $(el).next('div.grid');
        
        const moduleData = {
            title: moduleTitle,
            chapters: []
        };
        
        nextDiv.find('a.card').each((j, card) => {
            const chapterTitle = $(card).find('div.text-lg').text().trim();
            const chapterHref = $(card).attr('href');
            
            // Generate a unique ID for the chapter
            const chapterId = `ch_${subjectKey}_${moduleTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${j}`;
            
            moduleData.chapters.push({
                id: chapterId,
                title: chapterTitle,
                url: `https://questions.examside.com${chapterHref}`,
                videos: [],
                pdfs: [],
                formulas: [],
                pyqs: [],
                mockTests: []
            });
        });
        
        subjectData.modules.push(moduleData);
    });

    return subjectData;
}

async function buildSyllabus() {
    const syllabus = {
        'jee-mains': {
            label: 'JEE Main',
            subjects: {}
        }
    };
    
    const subjectsToScrape = [
        { key: 'physics', url: 'https://questions.examside.com/past-years/jee/jee-main/physics' },
        { key: 'chemistry', url: 'https://questions.examside.com/past-years/jee/jee-main/chemistry' },
        { key: 'mathematics', url: 'https://questions.examside.com/past-years/jee/jee-main/mathematics' }
    ];
    
    for (const sub of subjectsToScrape) {
        const data = await scrapeSubjectStructure(sub.url, sub.key);
        // We will flatten it for the frontend to match the current 'chapters' array, 
        // or we can keep it nested. The current frontend expects:
        // syllabus[class].subjects[subject].chapters = [ {id, title, ...} ]
        
        // Let's create a flattened list but with a 'module' property so we can group them in UI
        let flatChapters = [];
        for (const mod of data.modules) {
            for (const ch of mod.chapters) {
                ch.module = mod.title;
                flatChapters.push(ch);
            }
        }
        
        syllabus['jee-mains'].subjects[sub.key] = {
            label: data.label,
            chapters: flatChapters
        };
    }
    
    const outPath = path.join(__dirname, '..', 'backend', 'data', 'syllabus.json');
    if (!fs.existsSync(path.dirname(outPath))) {
        fs.mkdirSync(path.dirname(outPath), { recursive: true });
    }
    fs.writeFileSync(outPath, JSON.stringify(syllabus, null, 2));
    console.log(`✅ Syllabus tree successfully saved to ${outPath}`);
}

buildSyllabus();
