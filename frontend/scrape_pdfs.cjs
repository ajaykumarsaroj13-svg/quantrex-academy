const fs = require('fs');

async function extractPdfs() {
    console.log("Fetching main chapter links...");
    const r = await fetch('https://www.iitianacademy.com/iit-jee-advanced-maths-study-materials-chapter-wise/');
    const html = await r.text();
    
    const regex = /<a [^>]*href="(.*?)"[^>]*>(.*?)<\/a>/gi;
    let match;
    const chapterLinks = new Map();
    
    while ((match = regex.exec(html)) !== null) {
        const href = match[1];
        const text = match[2].replace(/<[^>]*>?/gm, '').trim();
        if (href && text && href.includes('iitianacademy.com') && !href.includes('ibdp') && (href.toLowerCase().includes('jee') || text.toLowerCase().includes('jee') || text.toLowerCase().includes('math'))) {
            // Filter to only Advanced math chapter links
            if (href.includes('advanced-maths') && href !== 'https://www.iitianacademy.com/iit-jee-advanced-maths-study-materials-chapter-wise/') {
                chapterLinks.set(href, text);
            }
        }
    }
    
    const chapters = Array.from(chapterLinks.entries()).map(([url, title]) => ({ url, title }));
    console.log(`Found ${chapters.length} Advanced Math Chapter URLs.`);
    
    const pdfDatabase = [];
    
    // Scrape each chapter sequentially to find drive links
    for (const chapter of chapters) {
        try {
            console.log(`Scraping: ${chapter.title}`);
            const cr = await fetch(chapter.url);
            const cHtml = await cr.text();
            
            const pdfRegex = /<a [^>]*href="(https:\/\/drive\.google\.com\/.*?)"[^>]*>(.*?)<\/a>/gi;
            let pMatch;
            const pdfs = [];
            while ((pMatch = pdfRegex.exec(cHtml)) !== null) {
                const pdfHref = pMatch[1];
                const pdfText = pMatch[2].replace(/<[^>]*>?/gm, '').trim();
                if (pdfText.length > 3) {
                    pdfs.push({ title: pdfText, url: pdfHref, id: `pdf_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`, size: "Unknown", isFree: true });
                }
            }
            
            // Deduplicate PDFs
            const uniquePdfs = [];
            const seenUrls = new Set();
            pdfs.forEach(p => {
                if(!seenUrls.has(p.url)) {
                    seenUrls.add(p.url);
                    uniquePdfs.push(p);
                }
            });
            
            if (uniquePdfs.length > 0) {
                pdfDatabase.push({
                    chapterTitle: chapter.title,
                    pdfs: uniquePdfs
                });
                console.log(` -> Found ${uniquePdfs.length} PDFs`);
            }
            
        } catch(e) {
            console.error(`Failed to scrape ${chapter.title}`);
        }
    }
    
    fs.writeFileSync('./src/utils/advancedPdfLinks.json', JSON.stringify(pdfDatabase, null, 2));
    console.log("✅ Saved to advancedPdfLinks.json");
}

extractPdfs();
