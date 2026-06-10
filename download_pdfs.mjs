import fs from 'fs';
import path from 'path';
import gdown from 'gdown';

const advData = JSON.parse(fs.readFileSync('./src/utils/advancedSyllabus.json', 'utf8'));

// Also need to get mains mapped PDFs? Wait, they use the SAME URLs! 
// We only need to download each unique URL once.
// Then we update `advancedSyllabus.json` and `syllabusData.js` to point to the local paths.

// 1. Collect all unique PDFs
const allPdfs = new Map(); // id -> pdf_object

function extractPdfs(chapters) {
    chapters.forEach(ch => {
        if (ch.pdfs) {
            ch.pdfs.forEach(p => {
                allPdfs.set(p.id, p);
            });
        }
    });
}

extractPdfs(advData.subjects.mathematics.chapters);

// Also extract from Mains just in case
let syllabusStr = fs.readFileSync('./src/utils/syllabusData.js', 'utf8');
let codeToEval = syllabusStr.replace('export const DEFAULT_SYLLABUS =', 'const DEFAULT_SYLLABUS =').replace('export const DEFAULT_TOPPERS =', 'const DEFAULT_TOPPERS =') + '\nreturn { DEFAULT_SYLLABUS };';
const { DEFAULT_SYLLABUS } = new Function(codeToEval)();
extractPdfs(DEFAULT_SYLLABUS['jee-mains'].subjects.mathematics.chapters);

console.log(`Found ${allPdfs.size} total PDFs to process.`);

const outDir = path.join(process.cwd(), 'public', 'pdfs');
if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

// Convert unique URLs to their local filenames
const urlToFilename = new Map();

const pdfList = Array.from(allPdfs.values());

async function downloadAll() {
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < pdfList.length; i++) {
        const p = pdfList[i];
        
        // Skip non-Drive URLs
        if (!p.url.includes('drive.google.com')) continue;
        
        let fileId = '';
        if (p.url.includes('/d/')) {
            fileId = p.url.split('/d/')[1].split('/')[0];
        } else if (p.url.includes('id=')) {
            fileId = new URL(p.url).searchParams.get('id');
        }
        
        if (!fileId) continue;
        
        // Use a safe filename
        const safeTitle = p.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const filename = `${fileId}_${safeTitle}.pdf`;
        const dest = path.join(outDir, filename);
        
        urlToFilename.set(p.url, `/pdfs/${filename}`);
        
        if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
            console.log(`[${i+1}/${pdfList.length}] Already downloaded: ${filename}`);
            successCount++;
            continue;
        }
        
        console.log(`[${i+1}/${pdfList.length}] Downloading ${p.title}...`);
        try {
            await gdown.download(fileId, dest);
            successCount++;
            // Small delay to avoid rate limit
            await new Promise(r => setTimeout(r, 1000));
        } catch (e) {
            console.error(`Failed to download ${p.title}:`, e.message);
            failCount++;
        }
    }
    
    console.log(`Done! Success: ${successCount}, Fail: ${failCount}`);
    
    // Now replace URLs in the JSONs
    console.log("Updating advancedSyllabus.json...");
    advData.subjects.mathematics.chapters.forEach(ch => {
        if (ch.pdfs) {
            ch.pdfs.forEach(p => {
                if (urlToFilename.has(p.url)) {
                    p.url = urlToFilename.get(p.url);
                }
            });
        }
    });
    fs.writeFileSync('./src/utils/advancedSyllabus.json', JSON.stringify(advData, null, 2));
    
    console.log("Updating syllabusData.js...");
    DEFAULT_SYLLABUS['jee-mains'].subjects.mathematics.chapters.forEach(ch => {
        if (ch.pdfs) {
            ch.pdfs.forEach(p => {
                if (urlToFilename.has(p.url)) {
                    p.url = urlToFilename.get(p.url);
                }
            });
        }
    });
    
    // Reconstruct syllabusData.js
    let newSyllabusStr = fs.readFileSync('./src/utils/syllabusData.js', 'utf8');
    // It's dangerous to stringify the entire file and replace because of formatting.
    // Instead, I'll just write a script that uploads DEFAULT_SYLLABUS to the Blob directly!
    // But we still need to save it locally for future builds.
    
    fs.writeFileSync('./mains_updated.json', JSON.stringify(DEFAULT_SYLLABUS['jee-mains'].subjects.mathematics.chapters, null, 2));
    console.log("Wrote mains_updated.json so we can manually patch syllabusData.js safely if needed.");
}

downloadAll();
