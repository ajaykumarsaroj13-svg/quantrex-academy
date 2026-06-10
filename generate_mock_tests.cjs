const fs = require('fs');
const path = require('path');

const METADATA_FILE = path.join(__dirname, 'intercepted_1781071325326.json');
const QUESTIONS_DIR = path.join(__dirname, 'public', 'data', 'questions');
const TESTS_OUT_DIR = path.join(__dirname, 'public', 'data', 'tests');
const SERIES_OUT_FILE = path.join(__dirname, 'public', 'data', 'mock-test-series.json');

// Ensure output dir exists
if (!fs.existsSync(TESTS_OUT_DIR)) {
  fs.mkdirSync(TESTS_OUT_DIR, { recursive: true });
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const questionsCache = {};

function getQuestionsForSubject(subjectOrChapterStr) {
  const slug = slugify(subjectOrChapterStr);
  if (questionsCache[slug]) return questionsCache[slug];
  
  const possiblePaths = [
    path.join(QUESTIONS_DIR, `${slug}.json`),
    path.join(QUESTIONS_DIR, `${slug}s.json`),
    path.join(QUESTIONS_DIR, `${slug.replace('and', 'and')}.json`)
  ];

  for (let p of possiblePaths) {
    if (fs.existsSync(p)) {
      try {
        const data = JSON.parse(fs.readFileSync(p, 'utf8'));
        questionsCache[slug] = data;
        return data;
      } catch (e) { }
    }
  }

  const allFiles = fs.readdirSync(QUESTIONS_DIR);
  const matched = allFiles.find(f => f.includes(slug) || slug.includes(f.replace('.json','')));
  if (matched) {
     const data = JSON.parse(fs.readFileSync(path.join(QUESTIONS_DIR, matched), 'utf8'));
     questionsCache[slug] = data;
     return data;
  }
  return [];
}

function getRandom(arr, n) {
  const result = new Array(n);
  let len = arr.length;
  const taken = new Array(len);
  if (n > len) n = len;
  while (n--) {
    const x = Math.floor(Math.random() * len);
    result[n] = arr[x in taken ? taken[x] : x];
    taken[x] = --len in taken ? taken[len] : len;
  }
  return result;
}

async function run() {
  console.log('Loading metadata...');
  const metadata = JSON.parse(fs.readFileSync(METADATA_FILE, 'utf8'));
  const mockSeriesMetadata = [];
  let totalTests = 0;
  let totalQGenerated = 0;

  for (const cat of metadata.data.category) {
    for (const group of cat.groups) {
      for (const section of group.sections) {
        for (const test of section.tests) {
          let selectedQuestions = [];
          const isFullTest = group.title.includes('Full') || group.title.includes('Part');
          const numQs = test.totalQuestions || 75;

          if (isFullTest) {
             let subQs = [];
             ['physics', 'chemistry', 'mathematics'].forEach(subj => {
                let pool = getQuestionsForSubject(subj);
                // Assign subject name to questions
                pool = pool.map(q => ({...q, assignedSubject: subj.charAt(0).toUpperCase() + subj.slice(1)}));
                subQs = subQs.concat(getRandom(pool, Math.floor(numQs/3)));
             });
             selectedQuestions = subQs;
             
             // If we need more to reach exactly numQs
             while(selectedQuestions.length < numQs) {
                let pool = getQuestionsForSubject('physics');
                let q = pool[Math.floor(Math.random()*pool.length)];
                selectedQuestions.push({...q, assignedSubject: 'Physics'});
             }
          } else {
             let pool = getQuestionsForSubject(section.title);
             if (pool.length < numQs && test.syllabus) {
                 pool = pool.concat(getQuestionsForSubject(test.syllabus));
             }
             if (pool.length === 0) pool = getQuestionsForSubject('physics'); // fallback

             // Deduplicate by question text
             const uniquePool = [];
             const seen = new Set();
             for(let q of pool) {
                 const text = q.question || q.questionText;
                 if(!seen.has(text)) {
                     seen.add(text);
                     uniquePool.push(q);
                 }
             }

             selectedQuestions = getRandom(uniquePool, numQs);
             const subjMatch = ['Physics', 'Chemistry', 'Mathematics'].find(s => group.title.includes(s)) || 'Physics';
             selectedQuestions = selectedQuestions.map(q => ({...q, assignedSubject: subjMatch}));
          }

          // Format questions to EXACTLY match TestSeriesExam.jsx expectations
          const finalQuestions = selectedQuestions.map((q, idx) => {
             return {
                id: q.id || q._id || `gen_q_${idx}`,
                questionNumber: idx + 1,
                subject: q.assignedSubject || 'Physics',
                section: 'A', // For simplicity, we make all section A since we only have SCQ
                questionType: 'MCQ', // Our scraped questions are SCQ
                questionText: q.question || q.questionText,
                options: q.options || [],
                correctOption: q.correctOptionIndex,
                solution: q.solution,
                marks: q.marks || 4,
                negativeMarks: q.negativeMarks || -1,
                topic: section.title || ''
             };
          });

          const testObj = {
              testId: test.testId,
              title: test.title,
              examType: 'JEE Main',
              durationMinutes: test.timeAllotted / 60000,
              totalMarks: test.maxMarks,
              totalQuestions: test.totalQuestions,
              questions: finalQuestions
          };

          fs.writeFileSync(path.join(TESTS_OUT_DIR, `${test.testId}.json`), JSON.stringify(testObj, null, 2));

          mockSeriesMetadata.push({
             id: test.testId,
             examType: "JEE Main",
             title: test.title,
             year: "2027",
             duration: test.timeAllotted / 60000,
             totalMarks: test.maxMarks,
             totalQuestions: test.totalQuestions,
             isOfficial: false,
             type: "mock",
             syllabus: test.syllabus,
             group: group.title
          });

          totalTests++;
          totalQGenerated += finalQuestions.length;
        }
      }
    }
  }

  fs.writeFileSync(SERIES_OUT_FILE, JSON.stringify(mockSeriesMetadata, null, 2));
  console.log(`Generated ${totalTests} tests containing ${totalQGenerated} questions!`);
}

run().catch(console.error);
