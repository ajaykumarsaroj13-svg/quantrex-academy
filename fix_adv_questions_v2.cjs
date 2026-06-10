/**
 * fix_adv_questions_v2.cjs
 * 
 * Reads all raw_adv_math files, groups questions by their `chapter` field,
 * writes per-chapter JSON files for JEE Advanced Math.
 * Also adds jee-advanced to syllabusData.js with proper URL slugs.
 */
const fs = require('fs');
const path = require('path');

const rawDir = path.join('public', 'data', 'questions', 'raw_adv_math');
const questionsDir = path.join('public', 'data', 'questions');

// Map question chapter names (as they appear in raw data) → slug files
// These match the slug patterns used in question JSON files
const CHAPTER_SLUG_MAP = {
  // Algebra
  'sets-and-relations': 'sets-and-relations',
  'complex-numbers': 'complex-numbers',
  'quadratic-equations': 'quadratic-equation-and-inequalities',
  'sequences-and-series': 'sequences-and-series',
  'progressions': 'sequences-and-series',
  'logarithms': 'logarithms',
  'permutations-and-combinations': 'permutations-and-combinations',
  'binomial-theorem': 'binomial-theorem',
  'mathematical-induction': 'mathematical-induction',
  'matrices-and-determinants': 'matrices-and-determinants',
  'matrices': 'matrices-and-determinants',
  'determinants': 'matrices-and-determinants',
  'probability': 'probability',
  'statistics': 'statistics',
  'mathematical-reasoning': 'mathematical-reasoning',
  // Trigonometry
  'trigonometric-functions': 'trigonometric-functions-and-equations',
  'trigonometric-equations': 'trigonometric-functions-and-equations',
  'trigonometric-ratio': 'trigonometric-ratio-and-identites',
  'properties-of-triangle': 'properties-of-triangle',
  'inverse-trigonometric-functions': 'inverse-trigonometric-functions',
  // Coordinate Geometry
  'straight-lines': 'straight-lines-and-pair-of-straight-lines',
  'pair-of-straight-lines': 'straight-lines-and-pair-of-straight-lines',
  'circle': 'circle',
  'parabola': 'parabola',
  'ellipse': 'ellipse',
  'hyperbola': 'hyperbola',
  'conic-sections': 'parabola',
  // Calculus
  'functions': 'functions',
  'limits': 'limits-continuity-and-differentiability',
  'continuity': 'limits-continuity-and-differentiability',
  'differentiability': 'limits-continuity-and-differentiability',
  'differentiation': 'differentiation',
  'application-of-derivatives': 'application-of-derivatives',
  'indefinite-integration': 'indefinite-integrals',
  'definite-integration': 'definite-integration',
  'definite-integrals': 'definite-integration',
  'area': 'area-under-the-curves',
  'differential-equations': 'differential-equations',
  // 3D / Vectors
  'vector-algebra': 'vector-algebra',
  'vectors': 'vector-algebra',
  '3d-geometry': '3d-geometry',
  '3-dimensional-geometry': '3d-geometry',
};

// Normalize chapter name from raw data to slug
function toSlug(chapterName) {
  if (!chapterName) return null;
  const lc = chapterName.toLowerCase().trim().replace(/\s+/g, '-');
  // Direct match
  if (CHAPTER_SLUG_MAP[lc]) return CHAPTER_SLUG_MAP[lc];
  // Partial match
  for (const [key, val] of Object.entries(CHAPTER_SLUG_MAP)) {
    if (lc.includes(key) || key.includes(lc)) return val;
  }
  // Fallback: create a slug with adv- prefix
  return 'adv-' + lc.replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
}

// Track chapter → questions
const chapterMap = {};
let totalRaw = 0;
let skipped = 0;

const rawFiles = fs.readdirSync(rawDir).filter(f => f.endsWith('.json'));
console.log(`Processing ${rawFiles.length} raw_adv_math files...`);

for (const file of rawFiles) {
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(rawDir, file), 'utf8'));
    const results = raw.results;
    if (!results) continue;

    Object.values(results).forEach(group => {
      if (!group || !group.questions) return;
      const questions = Array.isArray(group.questions) ? group.questions : [];
      
      questions.forEach(q => {
        totalRaw++;
        // Use the question's own `chapter` field
        const rawChapter = q.chapter || q.chapterGroup || 'general';
        const slug = toSlug(rawChapter);
        
        if (!slug) { skipped++; return; }
        if (!chapterMap[slug]) chapterMap[slug] = [];
        
        // Normalize to standard format matching JEE Main files
        const normalized = {
          id: q.question_id || q._id || q.id || `adv_${Math.random().toString(36).slice(2)}`,
          chapterId: slug,
          exam: 'JEE Advanced',
          title: q.paperTitle || `JEE Advanced ${q.year || ''}`,
          year: q.year ? String(q.year) : '',
          difficulty: q.difficulty ? (q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1)) : 'Hard',
          type: (q.type || 'SCQ').toUpperCase(),
          question: q.question || '',
          options: q.options || [],
          correctOptionIndex: q.answer !== undefined ? q.answer : (q.correctOption !== undefined ? q.correctOption : 0),
          correctAnswer: q.answer !== undefined ? q.answer : (q.correctOption !== undefined ? q.correctOption : undefined),
          solution: q.solution || q.explanation || '',
          marks: q.marks || 4,
          negativeMarks: q.negMarks !== undefined ? q.negMarks : (q.negativeMarks || -1),
          topic: rawChapter || 'General',
        };
        
        chapterMap[slug].push(normalized);
      });
    });
  } catch (e) {
    console.log(`  [ERROR] ${file}: ${e.message}`);
  }
}

console.log(`\nTotal raw questions: ${totalRaw}, skipped: ${skipped}`);
console.log(`Chapters found: ${Object.keys(chapterMap).length}`);

// Deduplicate by id within each chapter
let totalWritten = 0;
for (const [slug, questions] of Object.entries(chapterMap)) {
  const seen = new Set();
  const deduped = questions.filter(q => {
    if (seen.has(q.id)) return false;
    seen.add(q.id);
    return true;
  });
  
  // If file already exists (JEE Main), MERGE advanced questions in
  const outPath = path.join(questionsDir, `${slug}.json`);
  let existing = [];
  if (fs.existsSync(outPath)) {
    try {
      const ex = JSON.parse(fs.readFileSync(outPath, 'utf8'));
      existing = Array.isArray(ex) ? ex : (ex.data || []);
    } catch (e) {}
  }
  
  // Add advanced questions that don't already exist
  const existingIds = new Set(existing.map(q => q.id));
  const newQuestions = deduped.filter(q => !existingIds.has(q.id));
  const merged = [...existing, ...newQuestions];
  
  fs.writeFileSync(outPath, JSON.stringify(merged, null, 2));
  console.log(`  ${slug}.json: ${existing.length} existing + ${newQuestions.length} new adv = ${merged.length} total`);
  totalWritten += newQuestions.length;
}

console.log(`\n✅ Written ${totalWritten} new JEE Advanced questions across ${Object.keys(chapterMap).length} chapters`);

// ─────────────────────────────────────────────
// Update syllabusData.js - replace jee-advanced key with proper chapter URLs
// ─────────────────────────────────────────────
console.log('\n📝 Updating syllabusData.js with corrected jee-advanced chapter URLs...');

// Build chapters using slug from chapterMap + ADV_CHAPTER_MAP titles
const ADV_CHAPTERS = [
  { title: 'Complex Numbers', slug: 'complex-numbers' },
  { title: 'Quadratic Equations', slug: 'quadratic-equation-and-inequalities' },
  { title: 'Sequence & Series', slug: 'sequences-and-series' },
  { title: 'Logarithms', slug: 'logarithms' },
  { title: 'Permutations & Combinations', slug: 'permutations-and-combinations' },
  { title: 'Binomial Theorem', slug: 'binomial-theorem' },
  { title: 'Matrices & Determinants', slug: 'matrices-and-determinants' },
  { title: 'Probability', slug: 'probability' },
  { title: 'Trigonometric Functions & Equations', slug: 'trigonometric-functions-and-equations' },
  { title: 'Trigonometric Ratio and Identities', slug: 'trigonometric-ratio-and-identites' },
  { title: 'Properties of Triangle', slug: 'properties-of-triangle' },
  { title: 'Inverse Trigonometric Functions', slug: 'inverse-trigonometric-functions' },
  { title: 'Straight Lines', slug: 'straight-lines-and-pair-of-straight-lines' },
  { title: 'Circle', slug: 'circle' },
  { title: 'Parabola', slug: 'parabola' },
  { title: 'Ellipse', slug: 'ellipse' },
  { title: 'Hyperbola', slug: 'hyperbola' },
  { title: '3D Geometry', slug: '3d-geometry' },
  { title: 'Functions', slug: 'functions' },
  { title: 'Limits, Continuity & Differentiability', slug: 'limits-continuity-and-differentiability' },
  { title: 'Differentiation', slug: 'differentiation' },
  { title: 'Application of Derivatives', slug: 'application-of-derivatives' },
  { title: 'Indefinite Integration', slug: 'indefinite-integrals' },
  { title: 'Definite Integration', slug: 'definite-integration' },
  { title: 'Area Under Curves', slug: 'area-under-the-curves' },
  { title: 'Differential Equations', slug: 'differential-equations' },
  { title: 'Vector Algebra', slug: 'vector-algebra' },
];

const advChaptersJson = ADV_CHAPTERS.map((ch, idx) => ({
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

const advSyllabus = {
  label: 'JEE Advanced',
  subjects: {
    mathematics: {
      label: 'Mathematics',
      chapters: advChaptersJson
    }
  }
};

const syllabusPath = path.join('src', 'utils', 'syllabusData.js');
let syllabusContent = fs.readFileSync(syllabusPath, 'utf8');

// Remove any previously added jee-advanced block and add fresh one
// Strategy: Look for the pattern we added and replace
const advJson = JSON.stringify(advSyllabus, null, 4);

if (syllabusContent.includes('"jee-advanced"')) {
  // Replace the entire jee-advanced block with updated one
  // The block starts at "jee-advanced": { and ends before "jee-mains": {
  const startMarker = '"jee-advanced":';
  const endMarker = '"jee-mains":';
  const startIdx = syllabusContent.indexOf(startMarker);
  const endIdx = syllabusContent.indexOf(endMarker, startIdx);
  
  if (startIdx !== -1 && endIdx !== -1) {
    syllabusContent = syllabusContent.substring(0, startIdx) +
      `"jee-advanced": ${advJson},\n  ` +
      syllabusContent.substring(endIdx);
    fs.writeFileSync(syllabusPath, syllabusContent);
    console.log('  ✅ Replaced jee-advanced section in syllabusData.js');
  } else {
    console.log('  [WARN] Could not find block boundaries, skipping update');
  }
} else {
  // Insert fresh at start of DEFAULT_SYLLABUS
  syllabusContent = syllabusContent.replace(
    'const DEFAULT_SYLLABUS = {',
    `const DEFAULT_SYLLABUS = {\n  "jee-advanced": ${advJson},\n`
  );
  fs.writeFileSync(syllabusPath, syllabusContent);
  console.log('  ✅ Added fresh jee-advanced to syllabusData.js');
}

console.log('\n🎉 All fixes applied!');
console.log('   JEE Main topics now use shared question files (mixed with Advanced questions)');
console.log('   JEE Advanced has its own chapters pointing to the same slug-based files');
