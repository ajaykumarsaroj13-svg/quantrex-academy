const fs = require('fs');

function generateSyllabus() {
    const pdfData = JSON.parse(fs.readFileSync('./src/utils/advancedPdfLinks.json', 'utf8'));
    
    const advancedSyllabus = {
        label: "JEE Advanced",
        subjects: {
            mathematics: {
                label: "Mathematics",
                chapters: []
            }
        }
    };
    
    pdfData.forEach((ch, index) => {
        // Clean title
        let cleanTitle = ch.chapterTitle.replace(/&amp;/g, '&');
        
        advancedSyllabus.subjects.mathematics.chapters.push({
            id: `ch_adv_math_${index}`,
            title: cleanTitle,
            url: "",
            videos: [],
            pdfs: ch.pdfs,
            formulas: [],
            pyqs: [],
            mockTests: []
        });
    });
    
    fs.writeFileSync('./src/utils/advancedSyllabus.json', JSON.stringify(advancedSyllabus, null, 2));
    console.log(`✅ Generated advancedSyllabus.json with ${advancedSyllabus.subjects.mathematics.chapters.length} chapters.`);
}

generateSyllabus();
