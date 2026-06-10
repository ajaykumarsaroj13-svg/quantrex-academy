import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const PyqChapterSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  exam: { type: String, default: 'JEE Main' },
  name: { type: String, required: true },
  subject: { type: String, required: true },
  count: { type: Number, default: 0 },
  weightage: { type: String, default: '5%' }
}, { timestamps: true });

const PyqChapter = mongoose.models.PyqChapter || mongoose.model('PyqChapter', PyqChapterSchema);

async function seedData() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI not found');
    
    await mongoose.connect(uri);
    console.log('Connected to MongoDB.');

    // We only want to seed if they don't already exist
    const chaptersToSeed = [
      { id: 'bitsat_math_1', exam: 'BITSAT', name: 'Algebra and Complex Numbers', subject: 'Mathematics', count: 0, weightage: '10%' },
      { id: 'bitsat_phy_1', exam: 'BITSAT', name: 'Mechanics', subject: 'Physics', count: 0, weightage: '15%' },
      
      { id: 'nda_math_1', exam: 'NDA', name: 'Trigonometry', subject: 'Mathematics', count: 0, weightage: '20%' },
      { id: 'nda_gat_1', exam: 'NDA', name: 'General Science', subject: 'GAT', count: 0, weightage: '30%' },
      
      { id: 'iat_bio_1', exam: 'IAT', name: 'Cell Biology', subject: 'Biology', count: 0, weightage: '25%' },
      { id: 'iat_chem_1', exam: 'IAT', name: 'Organic Chemistry Basic Principles', subject: 'Chemistry', count: 0, weightage: '15%' },
      
      { id: 'ncert11_math_1', exam: 'NCERT Class 11', name: 'Sets', subject: 'Mathematics', count: 0, weightage: '5%' },
      { id: 'ncert12_phy_1', exam: 'NCERT Class 12', name: 'Electrostatics', subject: 'Physics', count: 0, weightage: '12%' }
    ];

    let seededCount = 0;
    for (const ch of chaptersToSeed) {
      const exists = await PyqChapter.findOne({ id: ch.id });
      if (!exists) {
        await PyqChapter.create(ch);
        seededCount++;
      }
    }

    console.log(`Seeded ${seededCount} new ExamGoal chapters!`);
    console.log('Use ExamGoal scraper or admin panel to add actual questions to these chapters.');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
}

seedData();
