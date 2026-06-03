import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const PyqSchema = new mongoose.Schema({
  exam: String,
}, { strict: false });

const PyqChapterSchema = new mongoose.Schema({
  exams: [String],
}, { strict: false });

const Pyq = mongoose.model('Pyq', PyqSchema);
const PyqChapter = mongoose.model('PyqChapter', PyqChapterSchema);

async function fixDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Fix Pyqs
    let res = await Pyq.updateMany({ exam: 'JEE Main' }, { $set: { exam: 'jee-main' } });
    console.log('Reverted JEE Main in Pyqs:', res.modifiedCount);

    res = await Pyq.updateMany({ exam: 'JEE Advanced' }, { $set: { exam: 'jee-advanced' } });
    console.log('Reverted JEE Advanced in Pyqs:', res.modifiedCount);

    res = await Pyq.updateMany({ exam: 'NDA' }, { $set: { exam: 'nda' } });
    console.log('Reverted NDA in Pyqs:', res.modifiedCount);

    res = await Pyq.updateMany({ exam: 'BITSAT' }, { $set: { exam: 'bitsat' } });
    console.log('Reverted BITSAT in Pyqs:', res.modifiedCount);

    // Fix PyqChapters
    const chapters = await PyqChapter.find();
    let chapterUpdateCount = 0;
    for (const ch of chapters) {
      if (ch.exams && ch.exams.length > 0) {
        let changed = false;
        const newExams = ch.exams.map(e => {
          if (e === 'JEE Main') { changed = true; return 'jee-main'; }
          if (e === 'JEE Advanced') { changed = true; return 'jee-advanced'; }
          if (e === 'NDA') { changed = true; return 'nda'; }
          if (e === 'BITSAT') { changed = true; return 'bitsat'; }
          return e;
        });
        if (changed) {
          ch.exams = newExams;
          await ch.save();
          chapterUpdateCount++;
        }
      }
    }
    console.log('Reverted PyqChapters:', chapterUpdateCount);

    console.log('Done fixing DB!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fixDB();
