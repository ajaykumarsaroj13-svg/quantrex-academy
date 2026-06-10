/**
 * SEED CHAPTERS 2 & 3 INTO MONGODB
 * Data source: captured ExamGoal API files
 * - Logarithm (jm_math_2)
 * - Quadratic Equation and Inequalities (jm_math_3)
 */
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');
  const db = mongoose.connection.db;

  // ─── Chapter configs ────────────────────────────────────────────────────
  const CHAPTERS = [
    {
      localId: 'jm_math_2',
      name: 'Logarithm',
      examgoalId: 'ad8d8660-8660-5034-b424-83b26d61b8b8',
      questionMetaFile: path.join(__dirname, '../cap_api_v1_past_question_question_meta_ad8d8660_8660_5034_b424_83b26d61b8b_1780806666526.json'),
      topicsFile: path.join(__dirname, '../cap_api_v1_metadata_chapterTopics_ad8d8660_8660_5034_b424_83b26d61b8b8_fro_1780806667030.json'),
    },
    {
      localId: 'jm_math_3',
      name: 'Quadratic Equation and Inequalities',
      examgoalId: 'b7dbfb86-4ba6-5a2f-a2fe-ae64c381b38d',
      questionMetaFile: path.join(__dirname, '../cap_api_v1_past_question_question_meta_b7dbfb86_4ba6_5a2f_a2fe_ae64c381b38_1780806699591.json'),
      topicsFile: path.join(__dirname, '../cap_api_v1_metadata_chapterTopics_b7dbfb86_4ba6_5a2f_a2fe_ae64c381b38d_fro_1780806700073.json'),
    }
  ];

  for (const chap of CHAPTERS) {
    console.log(`\n═══════════════════════════════════════`);
    console.log(`Processing: ${chap.name} (${chap.localId})`);
    console.log(`═══════════════════════════════════════`);

    // ─── Load topics ────────────────────────────────────────────────────
    const topicsRaw = JSON.parse(fs.readFileSync(chap.topicsFile, 'utf8'));
    const topicsList = topicsRaw.results || [];
    // Build topic key → title map
    const topicKeyToTitle = {};
    for (const t of topicsList) {
      topicKeyToTitle[t.key] = t.title;
    }
    console.log(`Topics found: ${topicsList.length}`);
    topicsList.forEach(t => console.log(`  - ${t.key} => "${t.title}"`));

    // ─── Load questions ─────────────────────────────────────────────────
    const qMetaRaw = JSON.parse(fs.readFileSync(chap.questionMetaFile, 'utf8'));
    const qList = qMetaRaw.results?.[0]?.questions || [];
    console.log(`Questions found: ${qList.length}`);

    // ─── Upsert chapter doc ─────────────────────────────────────────────
    await db.collection('pyqchapters').updateOne(
      { id: chap.localId },
      {
        $set: {
          id: chap.localId,
          name: chap.name,
          subject: 'Mathematics',
          exam: 'jee-main',
          count: qList.length,
          weightage: '5%',
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );
    console.log(`✅ Chapter upserted: ${chap.name}`);

    // ─── Delete old questions for this chapter ──────────────────────────
    const deleted = await db.collection('pyqs').deleteMany({ chapterId: chap.localId });
    console.log(`🗑️  Deleted ${deleted.deletedCount} old questions`);

    // ─── Transform and insert questions ─────────────────────────────────
    const docs = [];
    let skipped = 0;

    for (const q of qList) {
      const enData = q.question?.en;
      if (!enData) { skipped++; continue; }

      const content = enData.content || '';
      if (!content) { skipped++; continue; }

      const topicTitle = topicKeyToTitle[q.topic] || q.topic || 'General';

      // Map options
      let options = [];
      let correctOptionIndex = null;
      if (enData.options && enData.options.length > 0) {
        options = enData.options.map(o => o.content || String(o));
        // correct_options are identifiers like "A","B","C","D"
        if (enData.correct_options && enData.correct_options.length > 0) {
          const correctId = enData.correct_options[0]; // e.g. "C"
          correctOptionIndex = ['A','B','C','D'].indexOf(correctId);
        }
      }

      // For integer-type, answer is a number
      const isInteger = q.type === 'integer';

      docs.push({
        question_id: q.question_id,
        exam: 'jee-main',
        chapterId: chap.localId,
        title: q.paperTitle || `JEE Main ${q.year}`,
        year: q.year || 2024,
        difficulty: q.difficulty || 'medium',
        type: isInteger ? 'NUMERICAL' : 'SCQ',
        question: content,
        options: options,
        correctOptionIndex: isInteger ? null : correctOptionIndex,
        answer: isInteger ? (enData.answer || null) : null,
        solution: enData.explanation || q.question?.hi?.explanation || '',
        marks: q.marks || 4,
        negativeMarks: -(q.negMarks || 1),
        topic: topicTitle,
        topicKey: q.topic || '',
        paperId: q.paperId || '',
        paperTitle: q.paperTitle || '',
        isOutOfSyllabus: q.isOutOfSyllabus || false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    console.log(`📝 Prepared ${docs.length} questions (skipped ${skipped})`);

    if (docs.length > 0) {
      const result = await db.collection('pyqs').insertMany(docs);
      console.log(`✅ Inserted ${result.insertedCount} questions for ${chap.name}`);
    }

    // ─── Update chapter count ────────────────────────────────────────────
    const actualCount = await db.collection('pyqs').countDocuments({ chapterId: chap.localId });
    await db.collection('pyqchapters').updateOne(
      { id: chap.localId },
      { $set: { count: actualCount } }
    );
    console.log(`📊 Chapter "${chap.name}" now has ${actualCount} questions in DB`);

    // ─── Print topic breakdown ───────────────────────────────────────────
    const byTopic = {};
    for (const d of docs) {
      byTopic[d.topic] = (byTopic[d.topic] || 0) + 1;
    }
    console.log('\nBreakdown by topic:');
    Object.entries(byTopic).forEach(([t, c]) => console.log(`  ${t}: ${c} questions`));
  }

  // ─── Also make sure Sets & Relations chapter is there ──────────────────
  const setsCount = await db.collection('pyqs').countDocuments({ chapterId: 'jm_math_1' });
  console.log(`\n📌 Sets & Relations (jm_math_1) has ${setsCount} questions in DB`);

  console.log('\n🎉 ALL DONE! Chapters 2 & 3 seeded successfully.');
  process.exit(0);
}

run().catch(e => { console.error('ERROR:', e); process.exit(1); });
