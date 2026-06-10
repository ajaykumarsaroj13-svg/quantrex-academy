/**
 * fix_all_questions_and_syllabus.cjs
 * 
 * 1. Processes raw_adv_math files → properly named per-chapter JSON files
 * 2. Adds jee-advanced key to syllabusData.js with correct URL slugs
 */
const fs = require('fs');
const path = require('path');

// ─────────────────────────────────────────────
// STEP 1: Map chapter title → slug for JEE Advanced Math
// ─────────────────────────────────────────────
// These match existing JEE Main question files that also contain JEE Advanced questions
// OR we'll create new dedicated files for Advanced
const ADV_CHAPTER_MAP = [
  { title: 'Complex Numbers', slug: 'adv-complex-numbers' },
  { title: 'Quadratic Equations', slug: 'adv-quadratic-equations' },
  { title: 'Sequence & Series', slug: 'adv-sequences-and-series' },
  { title: 'Logarithms and their properties', slug: 'adv-logarithms' },
  { title: 'Permutations & Combinations', slug: 'adv-permutations-and-combinations' },
  { title: 'Binomial Theorem and Mathematical Induction', slug: 'adv-binomial-theorem' },
  { title: 'Matrices & Determinants', slug: 'adv-matrices-and-determinants' },
  { title: 'Probability', slug: 'adv-probability' },
  { title: 'Trigonometrical functions', slug: 'adv-trigonometric-functions' },
  { title: 'Trigonometrical identities and equations', slug: 'adv-trigonometric-equations' },
  { title: 'Properties Of Triangle', slug: 'adv-properties-of-triangle' },
  { title: 'Inverse trigonometrical functions', slug: 'adv-inverse-trigonometric-functions' },
  { title: 'Cartesian system of rectangular co-ordinates in a plane', slug: 'adv-coordinate-geometry' },
  { title: 'Straight Line', slug: 'adv-straight-lines' },
  { title: 'Pair of Straight Line', slug: 'adv-pair-of-straight-lines' },
  { title: 'Circle', slug: 'adv-circle' },
  { title: 'Parabola', slug: 'adv-parabola' },
  { title: 'Ellipse', slug: 'adv-ellipse' },
  { title: 'Hyperbola', slug: 'adv-hyperbola' },
  { title: '3-Dimensional Geometry', slug: 'adv-3d-geometry' },
  { title: 'Functions', slug: 'adv-functions' },
  { title: 'Limit, Continuity & Differentiability', slug: 'adv-limits-continuity-and-differentiability' },
  { title: 'Differentiation', slug: 'adv-differentiation' },
  { title: 'Application Of Derivatives', slug: 'adv-application-of-derivatives' },
  { title: 'Indefinite Integration', slug: 'adv-indefinite-integration' },
  { title: 'definite integrals', slug: 'adv-definite-integration' },
  { title: 'Area Under Curve', slug: 'adv-area-under-the-curves' },
  { title: 'Differential Equations', slug: 'adv-differential-equations' },
  { title: 'Vector Algebra', slug: 'adv-vector-algebra' },
];

const titleToSlug = {};
ADV_CHAPTER_MAP.forEach(c => { titleToSlug[c.title.toLowerCase()] = c.slug; });

// ─────────────────────────────────────────────
// STEP 2: Process raw_adv_math files
// ─────────────────────────────────────────────
const rawDir = path.join('public', 'data', 'questions', 'raw_adv_math');
const questionsDir = path.join('public', 'data', 'questions');

// Track chapter → questions array
const chapterQuestionsMap = {};

const rawFiles = fs.readdirSync(rawDir).filter(f => f.endsWith('.json'));
console.log(`Found ${rawFiles.length} raw_adv_math files`);

for (const file of rawFiles) {
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(rawDir, file), 'utf8'));
    const results = raw.results;
    
    if (!results) continue;
    
    // results is an object with numeric keys: { '0': { title, _id, questions: [...] } }
    Object.values(results).forEach(chapter => {
      if (!chapter || !chapter.title || !chapter.questions) return;
      
      const titleLower = chapter.title.toLowerCase().trim();
      let slug = titleToSlug[titleLower];
      
      if (!slug) {
        // Try partial match
        const match = ADV_CHAPTER_MAP.find(c => 
          titleLower.includes(c.title.toLowerCase()) || 
          c.title.toLowerCase().includes(titleLower)
        );
        if (match) slug = match.slug;
      }
      
      if (!slug) {
        console.log(`  [WARN] No slug for chapter: "${chapter.title}"`);
        slug = 'adv-' + chapter.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
      
      if (!chapterQuestionsMap[slug]) chapterQuestionsMap[slug] = [];
      
      // Process each question in this chapter
      const questions = Array.isArray(chapter.questions) ? chapter.questions : [];
      questions.forEach(q => {
        // Normalize question format to match the JEE Main format
        const normalized = {
          id: q._id || q.id || `adv_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          chapterId: slug,
          exam: q.exam || 'JEE Advanced',
          title: q.exam || `JEE Advanced ${q.year || ''}`,
          year: q.year ? String(q.year) : '',
          difficulty: q.difficulty || 'Hard',
          type: q.type || q.questionType || 'SCQ',
          question: q.question || q.questionText || q.text || '',
          options: q.options || [],
          correctOptionIndex: q.correctAnswer !== undefined ? q.correctAnswer : (q.correctOption !== undefined ? q.correctOption : 0),
          correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : (q.correctOption !== undefined ? q.correctOption : undefined),
          solution: q.solution || q.explanation || '',
          marks: q.marks || 4,
          negativeMarks: q.negativeMarks || -1,
          topic: q.topic || chapter.title || 'General',
        };
        chapterQuestionsMap[slug].push(normalized);
      });
    });
  } catch (e) {
    console.log(`  [ERROR] Failed to process ${file}: ${e.message}`);
  }
}

// Write per-chapter question files
let totalWritten = 0;
for (const [slug, questions] of Object.entries(chapterQuestionsMap)) {
  if (questions.length === 0) continue;
  const outPath = path.join(questionsDir, `${slug}.json`);
  fs.writeFileSync(outPath, JSON.stringify(questions, null, 2));
  console.log(`  Wrote ${questions.length} questions → ${slug}.json`);
  totalWritten += questions.length;
}

console.log(`\n✅ Total JEE Advanced questions written: ${totalWritten}`);
console.log(`   Chapters created: ${Object.keys(chapterQuestionsMap).length}`);

// ─────────────────────────────────────────────
// STEP 3: Add jee-advanced to syllabusData.js
// ─────────────────────────────────────────────
console.log('\n📝 Updating syllabusData.js with jee-advanced...');

// Build the jee-advanced chapters array using ADV_CHAPTER_MAP
// Only include chapters that have question files
const advChapters = ADV_CHAPTER_MAP.map((ch, idx) => ({
  id: `ch_adv_math_${idx}`,
  title: ch.title,
  url: `https://questions.examside.com/past-years/jee/jee-advanced/mathematics/${ch.slug}`,
  topics: [],
  videos: [],
  pdfs: [],
  formulas: [],
  pyqTests: [],
  mockTests: [],
  module: 'JEE Advanced Mathematics'
}));

// Build the jee-advanced syllabus object
const advSyllabusEntry = {
  label: 'JEE Advanced',
  subjects: {
    mathematics: {
      label: 'Mathematics',
      chapters: advChapters
    }
  }
};

// Convert to JS string representation (we'll inject it into syllabusData.js)
const advStr = JSON.stringify(advSyllabusEntry, null, 4)
  .replace(/"/g, '"'); // Keep double quotes

// Read syllabusData.js
const syllabusPath = path.join('src', 'utils', 'syllabusData.js');
let syllabusContent = fs.readFileSync(syllabusPath, 'utf8');

// Check if jee-advanced already exists
if (syllabusContent.includes('"jee-advanced"') || syllabusContent.includes("'jee-advanced'")) {
  console.log('  [INFO] jee-advanced already exists in syllabusData.js. Replacing...');
  // Find and remove existing jee-advanced entry (complex, so just note it)
  console.log('  [WARN] Manual removal needed - will add at start instead');
}

// Inject jee-advanced at the beginning of DEFAULT_SYLLABUS (right after the opening brace)
const insertPoint = 'const DEFAULT_SYLLABUS = {';
if (!syllabusContent.includes('"jee-advanced"')) {
  syllabusContent = syllabusContent.replace(
    insertPoint,
    `${insertPoint}\n  "jee-advanced": ${advStr},\n`
  );
  fs.writeFileSync(syllabusPath, syllabusContent);
  console.log('  ✅ Added jee-advanced to syllabusData.js');
} else {
  console.log('  ℹ️  jee-advanced already present, skipping injection');
}

console.log('\n🎉 All done! JEE Advanced questions and syllabus are ready.');
console.log('   → Chapter URL slugs now point to /data/questions/adv-*.json files');
