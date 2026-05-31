import fs from 'fs';
import path from 'path';

const scraperDir = "C:/Users/Admin/.gemini/antigravity/scratch/scraper";

if (!fs.existsSync(scraperDir)) {
  console.log('Directory does not exist:', scraperDir);
  process.exit(0);
}

const files = fs.readdirSync(scraperDir).filter(f => f.endsWith('.html'));

files.forEach(file => {
  const content = fs.readFileSync(path.join(scraperDir, file), 'utf8');
  console.log(`\n=== File: ${file} ===`);
  
  // Search for links containing '/pyq/subject/' or '/pyq/' or '/api/'
  const matches = [];
  const regex = /href="([^"]+)"/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const url = match[1];
    if (url.includes('subject') || url.includes('chapter') || url.includes('room.examgoal.com') || url.includes('exam')) {
      matches.push(url);
    }
  }
  
  // Remove duplicates and show unique matches
  const uniqueMatches = [...new Set(matches)];
  console.log(`Found ${uniqueMatches.length} matching URLs. Sample:`);
  uniqueMatches.slice(0, 20).forEach(u => console.log('  ', u));
});
