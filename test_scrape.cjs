const cheerio = require('cheerio');
const https = require('https');

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return resolve(fetchHtml(res.headers.location));
      }
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function test() {
    const mathHtml = await fetchHtml('https://questions.examside.com/past-years/jee/jee-main/mathematics');
    const $ = cheerio.load(mathHtml);
    let chapters = [];
    $('a[href^="/past-years/jee/jee-main/mathematics/"]').each((i, el) => {
        chapters.push($(el).attr('href'));
    });
    console.log(`Found ${chapters.length} Math chapters`);
    if(chapters.length > 0) {
        const chapUrl = 'https://questions.examside.com' + chapters[0];
        console.log("Fetching chapter:", chapUrl);
        const chapHtml = await fetchHtml(chapUrl);
        const $2 = cheerio.load(chapHtml);
        let qLinks = [];
        $2('a[href^="/past-years/jee/question/"]').each((i, el) => {
            qLinks.push($2(el).attr('href'));
        });
        console.log(`Found ${qLinks.length} Questions in first chapter!`);
    }
}
test();
