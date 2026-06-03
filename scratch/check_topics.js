const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../frontend/src/utils/dummyPyqsData.json');
if (!fs.existsSync(dataPath)) {
  console.error('File not found');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const db = data.PYQ_DATABASE || [];

// Filter questions for sets and relations chapter
// Let's find what chapter ids exist
const chapters = data.PYQ_CHAPTERS || {};
console.log('Chapters keys:', Object.keys(chapters));

const mathsChapters = chapters.mathematics || [];
console.log('Maths chapters count:', mathsChapters.length);

const setsRelationsCh = mathsChapters.find(c => c.name.toLowerCase().includes('sets'));
if (setsRelationsCh) {
  console.log('Found sets/relations chapter:', setsRelationsCh);
  const chQs = db.filter(q => q.chapterId === setsRelationsCh.id);
  console.log(`Total questions for ${setsRelationsCh.name}:`, chQs.length);
  
  // Extract unique topics
  const topics = [...new Set(chQs.map(q => q.topic || 'General'))];
  console.log('Unique topics in DB for Sets and Relations:', topics);
  
  // Sample question
  if (chQs.length > 0) {
    console.log('Sample question keys:', Object.keys(chQs[0]));
    console.log('Sample question topic:', chQs[0].topic);
  }
} else {
  console.log('Sets/relations chapter not found in JSON');
}
