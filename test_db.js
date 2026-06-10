import mongoose from 'mongoose';
const Pyq = mongoose.models.Pyq || mongoose.model('Pyq', new mongoose.Schema({}, { strict: false }), 'pyqs');
async function test() {
  await mongoose.connect('mongodb+srv://ajaykumarsaroj13_db_usar:quantrex2026@cluster0.jde6gri.mongodb.net/quantrex?retryWrites=true&w=majority&appName=Cluster0');
  
  const totalAdv = await Pyq.countDocuments({ exam: 'jee-advanced' });
  const hasPaperTitle = await Pyq.countDocuments({ exam: 'jee-advanced', paperTitle: { $exists: true } });
  
  console.log('Total Advanced:', totalAdv);
  console.log('Has paperTitle:', hasPaperTitle);
  
  const sample = await Pyq.findOne({ exam: 'jee-advanced', paperTitle: { $exists: false } });
  if (sample) console.log('Sample without paperTitle year:', sample.year);
  
  process.exit(0);
}
test().catch(console.error);
