import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

const MONGODB_URI = 'mongodb+srv://ajaykumarsaroj13_db_usar:quantrex2026@cluster0.jde6gri.mongodb.net/quantrex?retryWrites=true&w=majority&appName=Cluster0';

const PyqChapterSchema = new mongoose.Schema({
  id: String,
  name: String,
  subject: String,
  count: Number,
  weightage: String
});

const PyqChapter = mongoose.model('PyqChapter', PyqChapterSchema);

async function updateSyllabus() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const chapters = await PyqChapter.find({ id: { $regex: '^nda_' } }).lean();
  
  const subjectsMap = {};
  for (const ch of chapters) {
    if (!subjectsMap[ch.subject]) {
      subjectsMap[ch.subject] = {
        label: ch.subject.charAt(0).toUpperCase() + ch.subject.slice(1),
        chapters: []
      };
    }
    subjectsMap[ch.subject].chapters.push({
      id: ch.id,
      title: ch.name,
      url: '#',
      videos: [],
      pdfs: [],
      formulas: [],
      pyqs: [],
      mockTests: [],
      module: 'General'
    });
  }

  const ndaObj = {
    label: "NDA",
    subjects: subjectsMap
  };

  const ndaJson = JSON.stringify(ndaObj, null, 4);

  const syllabusPath = "C:/Users/Admin/.gemini/antigravity/scratch/quantrex-academy/frontend/src/utils/syllabusData.js";
  let content = fs.readFileSync(syllabusPath, 'utf8');

  if (content.includes('"nda": {')) {
    console.log('nda already exists in syllabusData.js');
    process.exit(0);
  }

  const endIdx = content.lastIndexOf('};');
  if (endIdx !== -1) {
    const before = content.substring(0, endIdx);
    const after = content.substring(endIdx);
    
    const lastBraceIdx = before.lastIndexOf('  }');
    const cleanBefore = before.substring(0, lastBraceIdx) + '  },\n';
    
    const newContent = cleanBefore + '  "nda": ' + ndaJson.split('\n').join('\n  ') + '\n' + after;
    fs.writeFileSync(syllabusPath, newContent, 'utf8');
    console.log('Updated syllabusData.js with NDA chapters');
  }

  process.exit(0);
}

updateSyllabus().catch(console.error);
