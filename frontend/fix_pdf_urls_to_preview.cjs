const fs = require('fs');

function fixPdfUrlsToPreview() {
    const data = JSON.parse(fs.readFileSync('./src/utils/advancedSyllabus.json', 'utf8'));
    
    let fixCount = 0;
    data.subjects.mathematics.chapters.forEach(ch => {
        ch.pdfs.forEach(pdf => {
            if (pdf.url && pdf.url.includes('open?id=')) {
                const match = pdf.url.match(/open\?id=([^&]+)/);
                if (match && match[1]) {
                    pdf.url = `https://drive.google.com/file/d/${match[1]}/preview`;
                    fixCount++;
                }
            } else if (pdf.url && pdf.url.includes('/view')) {
                 pdf.url = pdf.url.replace('/view', '/preview');
                 fixCount++;
            }
        });
    });
    
    fs.writeFileSync('./src/utils/advancedSyllabus.json', JSON.stringify(data, null, 2));
    console.log(`✅ Fixed ${fixCount} PDF URLs to use /preview mode for inline iframes.`);
}

fixPdfUrlsToPreview();
