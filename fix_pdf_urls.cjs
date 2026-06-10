const fs = require('fs');

function fixPdfUrls() {
    const data = JSON.parse(fs.readFileSync('./src/utils/advancedSyllabus.json', 'utf8'));
    
    let fixCount = 0;
    data.subjects.mathematics.chapters.forEach(ch => {
        ch.pdfs.forEach(pdf => {
            if (pdf.url && pdf.url.includes('drive.google.com/open?id=')) {
                pdf.url = pdf.url.replace('open?id=', 'file/d/') + '/preview';
                fixCount++;
            } else if (pdf.url && pdf.url.includes('drive.google.com/file/d/') && !pdf.url.includes('/preview')) {
                // If it already has file/d/ but misses /preview
                if (pdf.url.endsWith('/view')) {
                    pdf.url = pdf.url.replace('/view', '/preview');
                    fixCount++;
                } else if (pdf.url.endsWith('/view?usp=sharing')) {
                    pdf.url = pdf.url.replace('/view?usp=sharing', '/preview');
                    fixCount++;
                } else {
                    pdf.url = pdf.url + '/preview';
                    fixCount++;
                }
            }
        });
    });
    
    fs.writeFileSync('./src/utils/advancedSyllabus.json', JSON.stringify(data, null, 2));
    console.log(`✅ Fixed ${fixCount} PDF URLs to use /preview mode for iframes.`);
}

fixPdfUrls();
