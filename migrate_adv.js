import mongoose from 'mongoose';

const Pyq = mongoose.models.Pyq || mongoose.model('Pyq', new mongoose.Schema({}, { strict: false }), 'pyqs');

async function migrate() {
  await mongoose.connect('mongodb+srv://ajaykumarsaroj13_db_usar:quantrex2026@cluster0.jde6gri.mongodb.net/quantrex?retryWrites=true&w=majority&appName=Cluster0');
  
  const cursor = Pyq.find({ exam: 'jee-advanced', paperTitle: { $exists: true } }).cursor();
  
  let bulkOps = [];
  let totalUpdated = 0;
  
  for await (const q of cursor) {
    if (q.title === 'JEE Advanced Math PYQ') {
      bulkOps.push({
        updateOne: {
          filter: { _id: q._id },
          update: { $set: { title: q.paperTitle } }
        }
      });
    }
    
    if (bulkOps.length >= 1000) {
      await Pyq.bulkWrite(bulkOps);
      totalUpdated += bulkOps.length;
      bulkOps = [];
    }
  }
  
  if (bulkOps.length > 0) {
    await Pyq.bulkWrite(bulkOps);
    totalUpdated += bulkOps.length;
  }
  
  console.log('Migration complete. Updated ' + totalUpdated + ' JEE Advanced questions.');
  process.exit(0);
}

migrate().catch(console.error);
