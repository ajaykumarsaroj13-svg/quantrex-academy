import fs from 'fs';
import https from 'https';

const advData = JSON.parse(fs.readFileSync('./src/utils/advancedSyllabus.json', 'utf8'));
const firstPdf = advData.subjects.mathematics.chapters[0].pdfs[0];

console.log("Testing download for:", firstPdf.url);

// Convert /preview or /view back to export download link
let fileId = '';
if (firstPdf.url.includes('/d/')) {
    fileId = firstPdf.url.split('/d/')[1].split('/')[0];
}

if (!fileId) {
    console.error("Could not parse file ID");
    process.exit(1);
}

const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
console.log("Download URL:", downloadUrl);

https.get(downloadUrl, (res) => {
    console.log("Status Code:", res.statusCode);
    console.log("Headers:", res.headers);
    
    // Handle redirect
    if (res.statusCode === 302 || res.statusCode === 303) {
        console.log("Following redirect to:", res.headers.location);
        https.get(res.headers.location, (res2) => {
             console.log("Final Status Code:", res2.statusCode);
             console.log("Content-Type:", res2.headers['content-type']);
             console.log("Content-Length:", res2.headers['content-length']);
             // We won't actually save it yet, just check size.
        });
    } else {
        console.log("Content-Type:", res.headers['content-type']);
        console.log("Content-Length:", res.headers['content-length']);
    }
});
