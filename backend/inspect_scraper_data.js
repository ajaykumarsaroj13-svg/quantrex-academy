import fs from 'fs';
import path from 'path';

const scraperDir = "C:\\Users\\Admin\\.gemini\\antigravity\\scratch\\scraper";

function inspectFile(filename) {
  const filePath = path.join(scraperDir, filename);
  if (!fs.existsSync(filePath)) {
    console.log(`${filename} does not exist.`);
    return;
  }
  const stats = fs.statSync(filePath);
  console.log(`\n=================== ${filename} (${(stats.size/1024/1024).toFixed(2)} MB) ===================`);
  const content = fs.readFileSync(filePath, 'utf8');
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      console.log(`Array of ${parsed.length} items.`);
      if (parsed.length > 0) {
        console.log('Sample item keys:', Object.keys(parsed[0]));
        console.log('Sample item:', JSON.stringify(parsed[0]).substring(0, 300));
      }
    } else {
      console.log('Object keys:', Object.keys(parsed));
      const keys = Object.keys(parsed);
      if (keys.length > 0) {
        const firstVal = parsed[keys[0]];
        console.log(`First key '${keys[0]}' type:`, typeof firstVal);
        if (Array.isArray(firstVal)) {
          console.log(`First key val is array of length ${firstVal.length}`);
          if (firstVal.length > 0) {
            console.log(`  Sample keys:`, Object.keys(firstVal[0]));
          }
        }
      }
    }
  } catch (err) {
    console.log(`Parse error: ${err.message}`);
  }
}

inspectFile('all_chapters_raw.json');
inspectFile('math_links.json');
inspectFile('links.json');
