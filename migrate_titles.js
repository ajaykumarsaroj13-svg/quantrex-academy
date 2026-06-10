import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

const Pyq = mongoose.models.Pyq || mongoose.model('Pyq', new mongoose.Schema({}, { strict: false }), 'pyqs');

async function migrate() {
  await mongoose.connect('mongodb+srv://ajaykumarsaroj13_db_usar:quantrex2026@cluster0.jde6gri.mongodb.net/quantrex?retryWrites=true&w=majority&appName=Cluster0');
  
  const files = fs.readdirSync('quantrexacadmy/public/data/questions');
  let totalUpdated = 0;
  
  // Load all local questions into memory
  const localQuestions = [];
  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    const data = JSON.parse(fs.readFileSync(path.join('quantrexacadmy/public/data/questions', file), 'utf8'));
    for (const q of data) {
      if (q.question && q.title) {
        localQuestions.push({
          questionText: q.question.replace(/<[^>]+>/g, '').trim().substring(0, 80),
          title: q.title,
          year: q.year || ''
        });
      }
    }
  }
  
  console.log('Loaded ' + localQuestions.length + ' local questions.');
  
  const cursor = Pyq.find({ title: { $in: ['JEE Main Math PYQ', 'JEE Advanced Math PYQ'] } }).cursor();
  
  let count = 0;
  for await (const q of cursor) {
    count++;
    if (count % 1000 === 0) console.log('Processed ' + count + ' from DB...');
    
    if (!q.question) continue;
    const dbText = q.question.replace(/<[^>]+>/g, '').trim().substring(0, 80);
    
    // Find match
    const match = localQuestions.find(lq => lq.questionText === dbText);
    if (match) {
      if (q.title !== match.title) {
        await Pyq.updateOne({ _id: q._id }, { $set: { title: match.title, year: match.year } });
        totalUpdated++;
      }
    }
  }
  
  console.log('Migration complete. Updated ' + totalUpdated + ' questions.');
  process.exit(0);
}

migrate().catch(console.error);
