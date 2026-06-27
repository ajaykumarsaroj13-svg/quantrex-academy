const mongoose = require('mongoose');
const URI = "mongodb+srv://ajaykumarsaroj13_db_usar:quantrex2026@cluster0.jde6gri.mongodb.net/quantrex?retryWrites=true&w=majority&appName=Cluster0";
async function checkMongo() {
  await mongoose.connect(URI);
  const db = mongoose.connection.db;
  const pyqchapters = await db.collection('pyqchapters').find({ exams: 'NDA' }).toArray();
  console.log("NDA PyqChapters:", pyqchapters.length);
  if(pyqchapters.length > 0) {
      console.log(pyqchapters[0]);
  }
  const pyqs = await db.collection('pyqs').countDocuments({ exam: 'NDA' });
  console.log("NDA Pyqs count:", pyqs);
  await mongoose.disconnect();
}
checkMongo();
