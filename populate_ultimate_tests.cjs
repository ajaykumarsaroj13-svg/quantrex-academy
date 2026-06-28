const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, 'public/data/jee_main_ultimate_series_2027.json');
const testsDir = path.join(__dirname, 'public/data/tests');

const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));

const allTests = [
  ...data.topic_tests,
  ...data.chapter_tests,
  ...data.full_tests,
  ...data.part_tests
];

function sanitizeStr(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

const availableFiles = fs.readdirSync(testsDir).filter(f => f.endsWith('.json') && !f.startsWith('tst-'));
const chapterQuestions = {};
const availableBasenames = availableFiles.map(f => f.replace('.json', ''));

availableFiles.forEach(file => {
  try {
    const fData = JSON.parse(fs.readFileSync(path.join(testsDir, file), 'utf8'));
    if (fData.questions && fData.questions.length > 0) {
      chapterQuestions[file] = fData.questions;
    }
  } catch (e) {
  }
});

const subjectPools = {
  'Physics': [],
  'Chemistry': [],
  'Mathematics': []
};

Object.keys(chapterQuestions).forEach(file => {
  if (file.startsWith('physics_')) subjectPools['Physics'].push(...chapterQuestions[file]);
  if (file.startsWith('chemistry_')) subjectPools['Chemistry'].push(...chapterQuestions[file]);
  if (file.startsWith('mathematics_')) subjectPools['Mathematics'].push(...chapterQuestions[file]);
});

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

let updatedCount = 0;
let notFoundCount = 0;
const usageIndex = {};

// Custom mapping overrides
const mappings = {
  'mathematics_straight-line': 'mathematics_straight-lines-and-pair-of-straight-lines',
  'chemistry_some-basic-concept-of-chemistry': 'chemistry_some-basic-concepts-of-chemistry',
  'chemistry_liquid-solution': 'chemistry_solutions',
  'chemistry_periodic-table-periodicity': 'chemistry_classification-of-elements-and-periodicity-in-properties',
  'chemistry_chemical-bonding-molecular-structure': 'chemistry_chemical-bonding-and-molecular-structure',
  'chemistry_general-organic-chemistry-goc': 'chemistry_basics-of-organic-chemistry',
  'chemistry_hydrocarbon': 'chemistry_hydrocarbons',
  'chemistry_aldehydes-and-ketones': 'chemistry_aldehydes-ketones-and-carboxylic-acids',
  'chemistry_carboxylic-acids-and-their-darivatives': 'chemistry_aldehydes-ketones-and-carboxylic-acids',
  'physics_work-energy-and-power': 'physics_work-power-and-energy',
  'physics_elasticity': 'physics_properties-of-matter',
  'physics_fluid-mechanics': 'physics_properties-of-matter',
  'physics_magnetic-effect-of-current': 'physics_magnetics',
  'physics_semiconductors': 'physics_electronic-devices',
  'chemistry_iupac-nomenclature': 'chemistry_basics-of-organic-chemistry',
  'chemistry_isomerism': 'chemistry_basics-of-organic-chemistry',
  'mathematics_permutation-and-combination': 'mathematics_permutations-and-combinations',
  'physics_kinetic-theory-of-gases': 'physics_heat-and-thermodynamics',
  'chemistry_purification-of-organic-compounds': 'chemistry_principles-related-to-practical-chemistry'
};

function findBestMatch(groupName, sectionName) {
  let baseName = `${sanitizeStr(groupName)}_${sanitizeStr(sectionName)}`;
  if (mappings[baseName]) return mappings[baseName] + '.json';
  
  if (availableBasenames.includes(baseName)) return baseName + '.json';
  
  const sectionSan = sanitizeStr(sectionName);
  for (const b of availableBasenames) {
    if (b.startsWith(sanitizeStr(groupName) + '_') && (b.includes(sectionSan) || sectionSan.includes(b.split('_')[1]))) {
      return b + '.json';
    }
  }
  return null;
}

allTests.forEach(test => {
  const testId = test.testId || test.id;
  if (!testId) return;

  const testFile = path.join(testsDir, testId + '.json');
  if (!fs.existsSync(testFile)) return;

  let testJson = JSON.parse(fs.readFileSync(testFile, 'utf8'));

  let selectedQuestions = [];

  if (test.type === 'topic' || test.type === 'chapter') {
    const filename = findBestMatch(test.groupName, test.sectionName);
    
    if (filename && chapterQuestions[filename]) {
      const qList = chapterQuestions[filename];
      const key = filename;
      if (!usageIndex[key]) usageIndex[key] = 0;
      
      const count = test.totalQuestions || 25;
      if (usageIndex[key] + count > qList.length) {
         usageIndex[key] = 0;
      }
      
      selectedQuestions = qList.slice(usageIndex[key], usageIndex[key] + count);
      usageIndex[key] += count;
    } else {
      notFoundCount++;
      console.log(`Could not find questions for ${test.groupName} - ${test.sectionName} (${test.title})`);
    }
  } else if (test.type === 'full' || test.type === 'part') {
    const perSubject = (test.totalQuestions || 90) / 3;
    
    ['Physics', 'Chemistry', 'Mathematics'].forEach(sub => {
      const pool = subjectPools[sub];
      if (pool && pool.length > 0) {
        const shuffled = shuffle([...pool]);
        selectedQuestions.push(...shuffled.slice(0, perSubject));
      }
    });
  }

  if (selectedQuestions.length > 0) {
    testJson.questions = selectedQuestions;
    fs.writeFileSync(testFile, JSON.stringify(testJson, null, 2));
    updatedCount++;
  }
});

console.log(`Updated ${updatedCount} tests. Not found chapter files for ${notFoundCount} tests.`);
