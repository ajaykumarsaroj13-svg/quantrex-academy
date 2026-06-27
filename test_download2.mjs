import fs from 'fs';
import https from 'https';
import path from 'path';

function downloadFile(fileId, destPath) {
    return new Promise((resolve, reject) => {
        const url = `https://drive.google.com/uc?export=download&id=${fileId}`;
        
        https.get(url, (res) => {
            if (res.statusCode === 302 || res.statusCode === 303) {
                const cookie = res.headers['set-cookie'] ? res.headers['set-cookie'].map(c => c.split(';')[0]).join('; ') : '';
                https.get(res.headers.location, { headers: { Cookie: cookie } }, (res2) => {
                    let data = '';
                    res2.on('data', chunk => data += chunk);
                    res2.on('end', () => {
                        // Check if it's the virus scan warning
                        if (res2.headers['content-type'] && res2.headers['content-type'].includes('text/html')) {
                            const match = data.match(/confirm=([a-zA-Z0-9_-]+)/);
                            if (match) {
                                const confirmToken = match[1];
                                const finalUrl = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=${confirmToken}`;
                                https.get(finalUrl, { headers: { Cookie: cookie } }, (res3) => {
                                    const file = fs.createWriteStream(destPath);
                                    res3.pipe(file);
                                    file.on('finish', () => {
                                        file.close();
                                        resolve();
                                    });
                                }).on('error', reject);
                            } else {
                                reject(new Error("Could not find confirm token in HTML response."));
                            }
                        } else {
                            // Direct download
                            const file = fs.createWriteStream(destPath);
                            res2.pipe(file);
                            file.on('finish', () => {
                                file.close();
                                resolve();
                            });
                        }
                    });
                }).on('error', reject);
            } else {
                reject(new Error(`Unexpected status code: ${res.statusCode}`));
            }
        }).on('error', reject);
    });
}

const fileId = '1irSI-RSYTCpDoksorMuNl5tT2xach9kA';
console.log(`Downloading ${fileId}...`);
downloadFile(fileId, './test_pdf.pdf')
    .then(() => console.log('Download complete! Size:', fs.statSync('./test_pdf.pdf').size))
    .catch(err => console.error(err));
