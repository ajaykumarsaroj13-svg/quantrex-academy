const fs = require('fs');
const mongoose = require('mongoose');
const URI = "mongodb+srv://ajaykumarsaroj13_db_usar:quantrex2026@cluster0.jde6gri.mongodb.net/quantrex?retryWrites=true&w=majority&appName=Cluster0";

async function main() {
  await mongoose.connect(URI);
  const db = mongoose.connection.db;

  const syllabusUrl = 'https://9fpwnwwgz32ufqdo.public.blob.vercel-storage.com/db/syllabusData.json';
  const res = await fetch(syllabusUrl);
  const syllabus = await res.json();
  
  if (!fs.existsSync('public/data/questions')) {
    fs.mkdirSync('public/data/questions', { recursive: true });
  }

  for (const [classKey, classObj] of Object.entries(syllabus)) {
    if (!classObj.subjects) continue;
    for (const [subKey, subObj] of Object.entries(classObj.subjects)) {
      if (!subObj.chapters) continue;
      for (const ch of subObj.chapters) {
        let slug = ch.url ? ch.url.split('/').pop() : ch.id;
        let fetchSlug = classKey === 'jee-advanced' ? 'adv-' + slug : slug;
        let filePath = `public/data/questions/${fetchSlug}.json`;
        
        if (!fs.existsSync(filePath)) {
          console.log(`Missing file: ${filePath}`);
          let rawId = ch.id;
          if (classKey === 'nda') {
             rawId = rawId.replace(`nda_${subKey}_`, '');
             rawId = rawId.replace(`nda_general-science_`, '');
             rawId = rawId.replace(`nda_general-studies_`, '');
          }
          
          let qQuery = {};
          if (classKey === 'nda') {
             qQuery = { exam: 'NDA', chapterId: rawId };
          } else {
             qQuery = { chapterId: rawId }; 
          }
          
          const questions = await db.collection('pyqs').find(qQuery).toArray();
          if (questions.length > 0) {
             console.log(`Found ${questions.length} questions for ${fetchSlug} in Mongo. Saving...`);
             fs.writeFileSync(filePath, JSON.stringify(questions, null, 2));
          } else {
             console.log(`No questions found in Mongo for ${fetchSlug} (raw: ${rawId})`);
             fs.writeFileSync(filePath, JSON.stringify([], null, 2));
          }
        }
      }
    }
  }

  await mongoose.disconnect();
}
main();
