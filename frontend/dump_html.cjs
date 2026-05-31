const fs = require('fs');
const https = require('https');

https.get('https://iitianacademy.com/jee-main-maths-study-materials-chapter-wise/', { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        fs.writeFileSync('./mainsHtml.txt', data);
        console.log("HTML dumped to mainsHtml.txt");
        
        // Find 5 sample links
        const matches = data.match(/<a\s+href="([^"]+)">([^<]+)<\/a>/gi);
        if (matches) {
            console.log(matches.slice(0, 15));
        }
    });
});
