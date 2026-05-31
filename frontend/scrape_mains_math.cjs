const fs = require('fs');
const https = require('https');

function fetchHtml(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

function generateId() {
    return 'pdf_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
}

async function scrapeMainsMath() {
    console.log("Fetching chapter links...");
    const html = await fetchHtml('https://iitianacademy.com/jee-main-maths-study-materials-chapter-wise/');
    
    // Find chapter links
    const chapterRegex = /<a\s+href="([^"]+)">([^<]+)<\/a><\/h3>/gi;
    let chapters = [];
    let match;
    
    while ((match = chapterRegex.exec(html)) !== null) {
        let url = match[1];
        let title = match[2].trim().replace(/\s+/g, ' ');
        if (!url.startsWith('http')) url = 'https://iitianacademy.com' + url;
        
        // Exclude generic links
        if (title.toLowerCase().includes('jee main maths study materials') || title.length < 3) continue;
        
        chapters.push({ title, url, pdfs: [] });
    }
    
    console.log(`Found ${chapters.length} chapters. Fetching PDFs...`);
    
    let totalPdfs = 0;
    
    // Process sequentially to avoid getting blocked
    for (let i = 0; i < chapters.length; i++) {
        const ch = chapters[i];
        console.log(`[${i+1}/${chapters.length}] Scraping ${ch.title}...`);
        try {
            const chHtml = await fetchHtml(ch.url);
            
            // Extract Google Drive links
            const linkRegex = /<a[^>]+href="(https:\/\/drive\.google\.com\/file\/d\/[^"]+)"[^>]*>([^<]+)<\/a>/gi;
            let linkMatch;
            
            while ((linkMatch = linkRegex.exec(chHtml)) !== null) {
                let driveUrl = linkMatch[1];
                let pdfTitle = linkMatch[2].trim().replace(/\s+/g, ' ');
                
                // Convert to /preview format directly
                if (driveUrl.includes('/view')) {
                    driveUrl = driveUrl.replace('/view', '/preview');
                } else if (!driveUrl.includes('/preview')) {
                    driveUrl += '/preview';
                }
                
                ch.pdfs.push({
                    id: generateId(),
                    title: pdfTitle,
                    url: driveUrl,
                    size: "Unknown",
                    isFree: true
                });
                totalPdfs++;
            }
        } catch(e) {
            console.error(`Failed to scrape ${ch.url}`, e.message);
        }
        // Small delay
        await new Promise(r => setTimeout(r, 500));
    }
    
    fs.writeFileSync('./mainsMathPdfs.json', JSON.stringify(chapters, null, 2));
    console.log(`\n✅ Scraped ${totalPdfs} PDFs across ${chapters.length} chapters.`);
}

scrapeMainsMath();
