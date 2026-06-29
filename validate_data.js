import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI;
const QuestionSchema = new mongoose.Schema({}, { strict: false });
const Question = mongoose.model('Question', QuestionSchema, 'pyqs');

async function validate() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB.");
    
    const questions = await Question.find({});
    console.log(`Found ${questions.length} questions in pyqs collection.`);
    
    let missingOptions = 0;
    let missingAnswer = 0;
    let malformedMath = 0;
    let emptyQuestion = 0;
    
    for (let q of questions) {
      let qText = q.question || '';
      if (typeof qText === 'object') {
          qText = qText.en?.questionText || qText.content || '';
      }
      qText = String(qText);
      
      if (!qText || qText.trim() === '') {
        emptyQuestion++;
      }
      
      const isNat = q.type === 'NAT';
      const opts = q.options || [];
      if (!isNat && (!opts || opts.length < 2)) {
        missingOptions++;
      }
      
      if (q.correctOptionIndex === undefined && q.correctAnswer === undefined) {
        missingAnswer++;
      }
      
      const checkMath = (text) => {
        if (!text) return false;
        if (text.includes('\\begin') && !text.includes('\\end')) return true;
        return false;
      };
      
      let mathIssue = false;
      if (checkMath(qText)) mathIssue = true;
      if (opts) {
        opts.forEach(opt => {
          if (checkMath(opt.content || opt)) mathIssue = true;
        });
      }
      
      if (mathIssue) malformedMath++;
    }
    
    console.log("Validation Results:");
    console.log(`- Empty Questions: ${emptyQuestion}`);
    console.log(`- Missing Options (MCQ): ${missingOptions}`);
    console.log(`- Missing Answers: ${missingAnswer}`);
    console.log(`- Malformed Math (unclosed begin): ${malformedMath}`);
    
  } catch(e) {
    console.error(e);
  } finally {
    mongoose.disconnect();
  }
}
validate();
