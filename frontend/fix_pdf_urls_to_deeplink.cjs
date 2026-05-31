const fs = require('fs');

function fixPdfUrlsToDeepLink() {
    const data = JSON.parse(fs.readFileSync('./src/utils/advancedSyllabus.json', 'utf8'));
    
    let fixCount = 0;
    data.subjects.mathematics.chapters.forEach(ch => {
        ch.pdfs.forEach(pdf => {
            if (pdf.url && pdf.url.includes('/file/d/') && pdf.url.includes('/view')) {
                const match = pdf.url.match(/\/file\/d\/([^\/]+)\/view/);
                if (match && match[1]) {
                    pdf.url = `https://drive.google.com/open?id=${match[1]}`;
                    fixCount++;
                }
            }
        });
    });
    
    fs.writeFileSync('./src/utils/advancedSyllabus.json', JSON.stringify(data, null, 2));
    console.log(`✅ Fixed ${fixCount} PDF URLs to use open?id= for native Drive app deep linking.`);
}

fixPdfUrlsToDeepLink();
