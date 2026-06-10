const fs = require('fs');

function fixPdfUrlsToView() {
    const data = JSON.parse(fs.readFileSync('./src/utils/advancedSyllabus.json', 'utf8'));
    
    let fixCount = 0;
    data.subjects.mathematics.chapters.forEach(ch => {
        ch.pdfs.forEach(pdf => {
            if (pdf.url && pdf.url.endsWith('/preview')) {
                pdf.url = pdf.url.replace('/preview', '/view');
                fixCount++;
            }
        });
    });
    
    fs.writeFileSync('./src/utils/advancedSyllabus.json', JSON.stringify(data, null, 2));
    console.log(`✅ Fixed ${fixCount} PDF URLs to use /view mode for new tabs.`);
}

fixPdfUrlsToView();
