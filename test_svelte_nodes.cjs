const https = require('https');

https.get('https://questions.examside.com/past-years/jee/question/let-a-1-2-3-and-r-1-2-2-3-1-4-be-a-relation-on-a-let-jee-main-mathematics-sets-and-relations-p9q3xksr/__data.json', { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
        const obj = JSON.parse(data);
        const strings = [];
        function traverse(o) {
            if (typeof o === 'string') strings.push(o);
            else if (Array.isArray(o)) o.forEach(traverse);
            else if (o !== null && typeof o === 'object') Object.values(o).forEach(traverse);
        }
        traverse(obj);
        const tags = strings.filter(s => s.includes('JEE') || s.includes('Shift') || /20\d\d/.test(s) || /1st|2nd|3rd|4th/.test(s));
        console.log("Found Strings:", tags);
    });
});
