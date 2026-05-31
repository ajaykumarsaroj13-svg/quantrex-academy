import fs from 'fs';
import path from 'path';

const utilsDir = "C:\\Users\\Admin\\.gemini\\antigravity\\scratch\\quantrex-academy\\frontend\\src\\utils";

function inspectFile(filename) {
  const filePath = path.join(utilsDir, filename);
  if (!fs.existsSync(filePath)) {
    console.log(`${filename} does not exist.`);
    return;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const parsed = JSON.parse(content);
  console.log(`\n=================== INSPECTING ${filename} ===================`);
  console.log(`Total tests: ${parsed.length}`);
  
  // List first 10 tests
  console.log('First 10 tests:');
  parsed.slice(0, 10).forEach((t, i) => {
    console.log(`  ${i+1}. Title: "${t.title}" | Questions: ${t.questions ? t.questions.length : 0} | Category: ${t.category || 'N/A'}`);
  });
}

inspectFile('testsData.json');
inspectFile('advancedTestsData.json');
