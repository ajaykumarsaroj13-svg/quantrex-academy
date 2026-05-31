import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGODB_URI = "mongodb+srv://ajaykumarsaroj13_db_usar:quantrex2026@cluster0.jde6gri.mongodb.net/quantrex?retryWrites=true&w=majority&appName=Cluster0";

// Define schemas locally for inspection
const TestSeriesQuestionSchema = new mongoose.Schema({
  questionNumber: Number,
  subject: String,
  section: String,
  questionText: String,
  options: [String],
  correctOption: Number,
  correctAnswer: String,
  questionType: String,
  marks: Number,
  negativeMarks: Number,
  solution: String,
  topic: String,
  difficulty: String
});

const FullTestSeriesSchema = new mongoose.Schema({
  id: String,
  title: String,
  exam: String,
  year: Number,
  session: String,
  shift: Number,
  date: String,
  paperType: String,
  durationMinutes: Number,
  totalMarks: Number,
  totalQuestions: Number,
  isOfficial: Boolean,
  description: String,
  isFree: Boolean,
  questions: [TestSeriesQuestionSchema]
}, { collection: 'fulltestseries' });

const FullTestSeries = mongoose.model('FullTestSeries', FullTestSeriesSchema);

async function run() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected!');

  // Check database count
  const count = await FullTestSeries.countDocuments();
  console.log(`Total tests in MongoDB FullTestSeries: ${count}`);

  const exams = await FullTestSeries.distinct('exam');
  console.log('Exams present in DB:', exams);

  for (const exam of exams) {
    const examCount = await FullTestSeries.countDocuments({ exam });
    const sample = await FullTestSeries.findOne({ exam }, { title: 1, id: 1 });
    console.log(`- ${exam}: ${examCount} tests (sample: ${sample ? sample.title : 'none'})`);
  }

  // Inspect local files
  console.log('\n--- LOCAL FILE INSPECTION ---');
  const utilsDir = "C:\\Users\\Admin\\.gemini\\antigravity\\scratch\\quantrex-academy\\frontend\\src\\utils";
  
  const filesToCheck = [
    'testsData.json',
    'advancedTestsData.json',
    'dummyPyqsData.json'
  ];

  for (const file of filesToCheck) {
    const filePath = path.join(utilsDir, file);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      console.log(`${file}: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        console.log(`  Preview: ${content.substring(0, 300)}...`);
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          console.log(`  It is an array of ${parsed.length} items`);
          if (parsed.length > 0) {
            console.log(`  First item keys:`, Object.keys(parsed[0]));
            if (parsed[0].questions) {
              console.log(`  First item has ${parsed[0].questions.length} questions`);
            }
          }
        } else {
          console.log(`  It is an object. Keys:`, Object.keys(parsed));
          const keys = Object.keys(parsed);
          if (keys.length > 0) {
            const firstVal = parsed[keys[0]];
            console.log(`  First key '${keys[0]}' type:`, typeof firstVal);
            if (Array.isArray(firstVal)) {
              console.log(`  First key value is an array of length ${firstVal.length}`);
              if (firstVal.length > 0) {
                console.log(`  First array item keys:`, Object.keys(firstVal[0]));
              }
            }
          }
        }
      } catch (err) {
        console.log(`  Error parsing: ${err.message}`);
      }
    } else {
      console.log(`${file}: DOES NOT EXIST`);
    }
  }

  await mongoose.disconnect();
  console.log('Disconnected from DB');
}

run().catch(console.error);
