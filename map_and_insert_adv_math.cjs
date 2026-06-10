require('dotenv').config();
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const MAP = require('./adv_math_map.cjs');
const chaptersList = JSON.parse(fs.readFileSync('adv_math_chapters.json', 'utf-8'));

const allQuestions = [];

const cleanText = (text) => {
    if(!text) return "";
    return text.trim(); 
};

function toTitleCase(str) {
  if (!str) return 'General';
  return str.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
}

for (const ch of chaptersList) {
    const quantrexId = MAP[ch.title || ch.name];
    if (!quantrexId) continue;
    
    const filePath = path.join(__dirname, 'public', 'data', 'questions', 'raw_adv_math', `raw_adv_math_${ch.metaId || ch.id}.json`);
    if (!fs.existsSync(filePath)) continue;
    
    let rawData;
    try {
        rawData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch(e) { continue; }
    
    if (!rawData.results || !rawData.results[0] || !rawData.results[0].questions) continue;
    const questions = rawData.results[0].questions;
    
    const formattedQuestions = questions.map((q) => {
      const en = q.question.en;
      
      let type = "SCQ";
      if (q.type === 'mcq') type = "SCQ";
      if (q.type === 'integer') type = "NUMERICAL";
      if (q.type === 'msq' || q.type === 'multi_correct') type = "MCQ";
      
      let options = [];
      let correctOptionIndex = -1;
      
      if (en.options && en.options.length > 0) {
        options = en.options.map(opt => opt.content.trim());
        if (en.correct_options && en.correct_options.length > 0) {
          const correctId = en.correct_options[0];
          const correctOpt = en.options.find(o => o.identifier === correctId);
          if (correctOpt) {
            correctOptionIndex = en.options.indexOf(correctOpt);
          }
        }
      } else if (type === "NUMERICAL" && en.answer) {
        options = [en.answer];
        correctOptionIndex = 0;
      }

      let examYear = q.past_year ? parseInt(q.past_year) : 2024;

      return {
        question_id: q.id || `qm_adv_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        exam: 'jee-advanced',
        chapterId: quantrexId,
        title: 'JEE Advanced Math PYQ',
        year: examYear,
        difficulty: "Hard",
        type: type,
        question: cleanText(en.content),
        options: options,
        correctOptionIndex: correctOptionIndex,
        solution: en.solution ? cleanText(en.solution) : "",
        marks: 4, // Adv marks vary, but let's default to 4/-1 or 3/0 depending on type
        negativeMarks: -1,
        topic: toTitleCase(q.topic)
      };
    });
    
    allQuestions.push(...formattedQuestions);
}

fs.writeFileSync('all_adv_math_pyqs.json', JSON.stringify(allQuestions, null, 2));
console.log(`Mapped ${allQuestions.length} JEE Advanced questions.`);

// Now insert to MongoDB
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db('quantrex');
    const collection = db.collection('pyqs');

    const chapterIds = [...new Set(allQuestions.map(q => q.chapterId))];
    console.log(`Found ${chapterIds.length} unique chapter IDs.`);

    console.log('Deleting existing questions for these chapters in pyqs...');
    const deleteResult = await collection.deleteMany({ chapterId: { $in: chapterIds }, exam: 'jee-advanced' });
    console.log(`Deleted ${deleteResult.deletedCount} existing questions.`);

    const BATCH_SIZE = 500;
    let insertedCount = 0;
    console.log('Starting bulk insert...');

    for (let i = 0; i < allQuestions.length; i += BATCH_SIZE) {
        const batch = allQuestions.slice(i, i + BATCH_SIZE);
        const result = await collection.insertMany(batch);
        insertedCount += result.insertedCount;
        console.log(`Inserted batch ${i / BATCH_SIZE + 1}: +${result.insertedCount} questions (${insertedCount}/${allQuestions.length})`);
    }

    console.log('All JEE Advanced questions inserted successfully!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

run();
