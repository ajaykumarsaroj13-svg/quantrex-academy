const cheerio = require('cheerio');
const https = require('https');

https.get('https://questions.examside.com/past-years/jee/jee-main/physics/motion-in-a-plane', { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
    let data = '';
    res.on('data', c => data+=c);
    res.on('end', () => {
        const $ = cheerio.load(data);
        const links = [];
        $('a').each((i, el) => {
            links.push($(el).attr('href'));
        });
        console.log("All Links on Chapter Page:");
        console.log(links.slice(0, 15));
    });
});
