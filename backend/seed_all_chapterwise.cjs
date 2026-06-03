/**
 * COMPREHENSIVE JEE Main + Advanced Chapter-wise Question Seeder
 * 
 * Reads all scraped JSON papers from:
 *   data/scraped_questions/jee-main/*.json
 *   data/scraped_questions/jee-advanced/*.json
 * 
 * Extracts questions, groups by subject -> chapter -> topic,
 * and seeds them into MongoDB (PyqChapter + Pyq collections).
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// ============================================================
// SCHEMAS (inline to avoid ESM import issues)
// ============================================================
const pyqChapterSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  subject: String,
  questionCount: Number,
  topicCount: Number,
  topics: [String],
  chapterGroup: String,
  exams: [String],
});

const pyqSchema = new mongoose.Schema({
  question_id: { type: String, required: true },
  chapterId: { type: String, required: true, index: true },
  subject: String,
  chapter: String,
  chapterGroup: String,
  topic: String,
  exam: String,
  examGroup: String,
  paperId: String,
  paperTitle: String,
  year: Number,
  difficulty: String,
  type: String,
  marks: Number,
  negMarks: Number,
  isBonus: Boolean,
  isOutOfSyllabus: Boolean,
  permalink: String,
  question: mongoose.Schema.Types.Mixed,
  tags: [String],
});

pyqSchema.index({ chapterId: 1, exam: 1 });
pyqSchema.index({ subject: 1, chapter: 1 });
pyqSchema.index({ question_id: 1 }, { unique: true });

const PyqChapter = mongoose.model('PyqChapter', pyqChapterSchema);
const Pyq = mongoose.model('Pyq', pyqSchema);

// ============================================================
// MAIN PROCESSING
// ============================================================
async function main() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error('MONGODB_URI not set in .env');
    process.exit(1);
  }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 30000,
  });
  console.log('Connected!\n');

  const baseDir = path.join(__dirname, 'data', 'scraped_questions');
  const examDirs = [
    { dir: 'jee-main', exam: 'jee-main' },
    { dir: 'jee-advanced', exam: 'jee-advanced' },
  ];

  // Collect all questions
  const allQuestions = [];
  const chapterMap = {}; // chapterId -> { name, subject, group, topics, exams, count }
  let paperCount = 0;
  const seenIds = new Set();

  for (const { dir, exam } of examDirs) {
    const dirPath = path.join(baseDir, dir);
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json'));
    console.log(`Processing ${files.length} ${exam} papers...`);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (!data.results) continue;
      paperCount++;

      for (const section of data.results) {
        for (const q of section.questions) {
          // Skip duplicates (same question appearing in multiple files)
          if (seenIds.has(q.question_id)) continue;
          seenIds.add(q.question_id);

          const chapterId = q.chapter || 'unknown';
          const subject = q.subject || section.title.toLowerCase();
          const chapterGroup = q.chapterGroup || 'other';
          const topic = q.topic || 'general';
          
          // Build chapter metadata
          if (!chapterMap[chapterId]) {
            chapterMap[chapterId] = {
              name: formatChapterName(chapterId),
              subject,
              group: chapterGroup,
              topics: new Set(),
              exams: new Set(),
              count: 0,
            };
          }
          chapterMap[chapterId].topics.add(topic);
          chapterMap[chapterId].exams.add(q.exam || exam);
          chapterMap[chapterId].count++;

          // Build question document
          allQuestions.push({
            question_id: q.question_id,
            chapterId,
            subject,
            chapter: chapterId,
            chapterGroup,
            topic,
            exam: q.exam || exam,
            examGroup: q.examGroup || 'jee',
            paperId: q.paperId || file.replace('.json', ''),
            paperTitle: q.paperTitle || file.replace('.json', '').replace(/-/g, ' '),
            year: q.year || extractYear(file),
            difficulty: q.difficulty || 'medium',
            type: q.type || 'mcq',
            marks: q.marks || 4,
            negMarks: q.negMarks || 1,
            isBonus: q.isBonus || false,
            isOutOfSyllabus: q.isOutOfSyllabus || false,
            permalink: q.permalink || '',
            question: q.question,
            tags: q.tags || [],
          });
        }
      }
    }
  }

  console.log(`\nProcessed ${paperCount} papers`);
  console.log(`Total unique questions: ${allQuestions.length}`);
  console.log(`Total chapters: ${Object.keys(chapterMap).length}`);

  // ============================================================
  // CLEAR EXISTING DATA & SEED
  // ============================================================
  console.log('\nClearing existing PyqChapter and Pyq collections...');
  await PyqChapter.deleteMany({});
  await Pyq.deleteMany({});

  // Seed chapters
  console.log('Seeding chapters...');
  const chapterDocs = Object.entries(chapterMap).map(([id, info]) => ({
    id,
    name: info.name,
    subject: info.subject,
    questionCount: info.count,
    topicCount: info.topics.size,
    topics: [...info.topics].sort(),
    chapterGroup: info.group,
    exams: [...info.exams],
  }));
  
  await PyqChapter.insertMany(chapterDocs);
  console.log(`  Inserted ${chapterDocs.length} chapters`);

  // Seed questions in batches
  console.log('Seeding questions (in batches of 500)...');
  const BATCH_SIZE = 500;
  let inserted = 0;
  
  for (let i = 0; i < allQuestions.length; i += BATCH_SIZE) {
    const batch = allQuestions.slice(i, i + BATCH_SIZE);
    try {
      await Pyq.insertMany(batch, { ordered: false });
    } catch (err) {
      // Handle duplicate key errors gracefully
      if (err.code === 11000) {
        const successCount = err.result?.insertedCount || batch.length - (err.writeErrors?.length || 0);
        inserted += successCount;
        continue;
      }
      throw err;
    }
    inserted += batch.length;
    process.stdout.write(`\r  Inserted ${inserted}/${allQuestions.length} questions...`);
  }
  console.log(`\n  Done! Total inserted: ${inserted}`);

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('  SUMMARY');
  console.log('='.repeat(60));
  
  for (const subject of ['physics', 'chemistry', 'mathematics']) {
    const chapters = chapterDocs.filter(c => c.subject === subject);
    const totalQs = chapters.reduce((sum, c) => sum + c.questionCount, 0);
    console.log(`\n  ${subject.toUpperCase()}: ${chapters.length} chapters, ${totalQs} questions`);
    
    // Group by chapterGroup
    const groups = {};
    for (const ch of chapters) {
      if (!groups[ch.chapterGroup]) groups[ch.chapterGroup] = [];
      groups[ch.chapterGroup].push(ch);
    }
    
    for (const [group, chs] of Object.entries(groups)) {
      console.log(`    [${group}]`);
      for (const ch of chs.sort((a, b) => b.questionCount - a.questionCount)) {
        console.log(`      ${ch.name}: ${ch.questionCount}q (${ch.topicCount} topics) [${ch.exams.join(', ')}]`);
      }
    }
  }

  await mongoose.disconnect();
  console.log('\nDone! MongoDB seeded successfully.');
}

// ============================================================
// HELPERS
// ============================================================
function formatChapterName(slug) {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function extractYear(filename) {
  const match = filename.match(/(\d{4})/);
  return match ? parseInt(match[1]) : 2024;
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
