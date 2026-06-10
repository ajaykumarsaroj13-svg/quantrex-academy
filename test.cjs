const https = require('https');

https.get('https://questions.examside.com/past-years/jee/jee-main/mathematics/sets-relations-and-functions', res => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
        // Regex to find all hrefs in the html
        const regex = /href="([^"]+\/question\/[^"]+)"/g;
        let match;
        const urls = [];
        while((match = regex.exec(data)) !== null) {
            urls.push(match[1]);
        }
        console.log(`Found ${urls.length} URLs using HTML href match.`);
        if (urls.length > 0) {
            console.log(urls.slice(0, 3));
        }

        // What about JSON parsing?
        const startStr = '<script type="application/json" data-sveltekit-fetched data-url="">';
        const s = data.indexOf(startStr);
        if (s !== -1) {
            const start = s + startStr.length;
            const end = data.indexOf('</script>', start);
            const jsonStr = data.substring(start, end);
            const rx2 = /"url":"([^"]+\/question\/[^"]+)"/g;
            const urls2 = [];
            while((match = rx2.exec(jsonStr)) !== null) {
                urls2.push(match[1]);
            }
            console.log(`Found ${urls2.length} URLs using JSON match.`);
            if (urls2.length > 0) {
                console.log(urls2.slice(0, 3));
            }
        }
    });
});
