const mongoose = require('mongoose');
const URI = "mongodb+srv://ajaykumarsaroj13_db_usar:quantrex2026@cluster0.jde6gri.mongodb.net/quantrex?retryWrites=true&w=majority&appName=Cluster0";
async function check() {
  await mongoose.connect(URI);
  const db = mongoose.connection.db;
  const sample = await db.collection('pyqs').findOne({ exam: 'NDA' });
  console.log("Sample NDA PYQ:", sample);
  
  const distinctChapterIds = await db.collection('pyqs').distinct('chapterId', { exam: 'NDA' });
  console.log("Distinct chapterIds for NDA:", distinctChapterIds);
  await mongoose.disconnect();
}
check();
