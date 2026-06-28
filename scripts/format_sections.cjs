const fs = require('fs');
const path = require('path');

const TESTS_DIR = path.join(__dirname, '../public/data/tests');

function processTestFiles() {
  let updatedCount = 0;
  
  if (!fs.existsSync(TESTS_DIR)) {
    console.error(`Tests directory not found: ${TESTS_DIR}`);
    return;
  }

  const files = fs.readdirSync(TESTS_DIR).filter(f => f.endsWith('.json'));

  for (const file of files) {
    const filePath = path.join(TESTS_DIR, file);
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      let modified = false;

      if (!data.questions || data.questions.length === 0) continue;

      // Group questions by subject
      const subjectMap = {};
      data.questions.forEach(q => {
        if (!subjectMap[q.subject]) subjectMap[q.subject] = [];
        subjectMap[q.subject].push(q);
      });

      // Process each subject
      for (const subject in subjectMap) {
        const questions = subjectMap[subject];
        
        // Count MCQs and Numerical
        const numCount = questions.filter(q => q.questionType === 'NUMERICAL').length;
        const nonNumCount = questions.length - numCount;

        // Only split into A and B if both types exist.
        if (numCount > 0 && nonNumCount > 0) {
          questions.forEach(q => {
            if (q.questionType === 'NUMERICAL') {
              if (q.section !== 'B') {
                q.section = 'B';
                modified = true;
              }
            } else {
              if (q.section !== 'A') {
                q.section = 'A';
                modified = true;
              }
            }
          });
        } else {
           // If only one type, put in section 'A' if not already
           questions.forEach(q => {
              if (q.section !== 'A') {
                  q.section = 'A';
                  modified = true;
              }
           });
        }
      }

      if (modified) {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        updatedCount++;
      }
    } catch (e) {
      console.error(`Error processing ${file}: ${e.message}`);
    }
  }
  
  console.log(`Successfully partitioned Section A/B in ${updatedCount} test files.`);
}

processTestFiles();
