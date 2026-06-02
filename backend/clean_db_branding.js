import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { FullTestSeries } from './models/schemas.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function cleanBranding() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB Atlas...');

  const tests = await FullTestSeries.find({});
  console.log(`Found ${tests.length} tests in MongoDB. Scanning for third-party branding...`);

  let modifiedTestsCount = 0;
  let totalReplacedCount = 0;

  const replacePatterns = [
    { regex: /examgoal/gi, replacement: 'Quantrex Academy' },
    { regex: /mathongo/gi, replacement: 'Quantrex Academy' },
    { regex: /iitian academy/gi, replacement: 'Quantrex Academy' },
    { regex: /quizrr/gi, replacement: 'Quantrex Academy' }
  ];

  for (const test of tests) {
    let testModified = false;

    // 1. Clean test description
    let description = test.description || '';
    for (const pattern of replacePatterns) {
      if (pattern.regex.test(description)) {
        description = description.replace(pattern.regex, pattern.replacement);
        testModified = true;
        totalReplacedCount++;
      }
    }
    test.description = description;

    // 2. Clean questions
    if (test.questions && test.questions.length > 0) {
      test.questions = test.questions.map(q => {
        let qModified = false;
        
        // Clean question text
        let qText = q.questionText || '';
        for (const pattern of replacePatterns) {
          if (pattern.regex.test(qText)) {
            qText = qText.replace(pattern.regex, pattern.replacement);
            qModified = true;
            totalReplacedCount++;
          }
        }
        q.questionText = qText;

        // Clean options
        if (q.options && q.options.length > 0) {
          q.options = q.options.map(opt => {
            let optText = String(opt || '');
            for (const pattern of replacePatterns) {
              if (pattern.regex.test(optText)) {
                optText = optText.replace(pattern.regex, pattern.replacement);
                qModified = true;
                totalReplacedCount++;
              }
            }
            return optText;
          });
        }

        // Clean solution
        let sol = q.solution || '';
        for (const pattern of replacePatterns) {
          if (pattern.regex.test(sol)) {
            sol = sol.replace(pattern.regex, pattern.replacement);
            qModified = true;
            totalReplacedCount++;
          }
        }
        q.solution = sol;

        if (qModified) testModified = true;
        return q;
      });
    }

    if (testModified) {
      // Use markModified for nested mongoose subdocuments
      test.markModified('questions');
      await test.save();
      modifiedTestsCount++;
      console.log(`✅ Cleaned branding in test: ${test.title} (${test.id})`);
    }
  }

  console.log(`\n🎉 SCAN & CLEAN COMPLETED!`);
  console.log(`📊 Modified Tests: ${modifiedTestsCount} papers.`);
  console.log(`🏷️  Mentions Replaced: ${totalReplacedCount} instances.`);
  
  process.exit(0);
}

cleanBranding().catch(err => {
  console.error('Branding cleaner failed:', err);
  process.exit(1);
});
