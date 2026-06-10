import fs from 'fs';
import https from 'https';

const fileId = '1irSI-RSYTCpDoksorMuNl5tT2xach9kA';

const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

https.get(downloadUrl, (res) => {
    if (res.statusCode === 302 || res.statusCode === 303) {
        const cookie = res.headers['set-cookie'] ? res.headers['set-cookie'].map(c => c.split(';')[0]).join('; ') : '';
        https.get(res.headers.location, { headers: { Cookie: cookie } }, (res2) => {
            let data = '';
            res2.on('data', chunk => data += chunk);
            res2.on('end', () => {
                fs.writeFileSync('./drive_response.html', data);
                console.log("Response saved to drive_response.html");
                console.log("Status:", res2.statusCode);
            });
        });
    }
});
