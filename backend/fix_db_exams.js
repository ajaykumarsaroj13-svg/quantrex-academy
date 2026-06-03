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
    let res = await Pyq.updateMany({ exam: 'jee-main' }, { $set: { exam: 'JEE Main' } });
    console.log('Fixed jee-main in Pyqs:', res.modifiedCount);

    res = await Pyq.updateMany({ exam: 'jee-advanced' }, { $set: { exam: 'JEE Advanced' } });
    console.log('Fixed jee-advanced in Pyqs:', res.modifiedCount);

    res = await Pyq.updateMany({ exam: 'nda' }, { $set: { exam: 'NDA' } });
    console.log('Fixed nda in Pyqs:', res.modifiedCount);

    res = await Pyq.updateMany({ exam: 'bitsat' }, { $set: { exam: 'BITSAT' } });
    console.log('Fixed bitsat in Pyqs:', res.modifiedCount);

    // Fix PyqChapters
    const chapters = await PyqChapter.find();
    let chapterUpdateCount = 0;
    for (const ch of chapters) {
      if (ch.exams && ch.exams.length > 0) {
        let changed = false;
        const newExams = ch.exams.map(e => {
          if (e === 'jee-main') { changed = true; return 'JEE Main'; }
          if (e === 'jee-advanced') { changed = true; return 'JEE Advanced'; }
          if (e === 'nda') { changed = true; return 'NDA'; }
          if (e === 'bitsat') { changed = true; return 'BITSAT'; }
          return e;
        });
        if (changed) {
          ch.exams = newExams;
          await ch.save();
          chapterUpdateCount++;
        }
      }
    }
    console.log('Fixed PyqChapters:', chapterUpdateCount);

    console.log('Done fixing DB!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fixDB();
