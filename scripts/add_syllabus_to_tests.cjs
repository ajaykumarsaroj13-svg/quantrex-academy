const fs = require('fs');
const path = require('path');

const INDEX_PATH = path.join(__dirname, '../public/data/jee_main_ultimate_series_2027.json');

const data = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf8'));

// Exact ExamGoal mapping for Sets and Relations
const setsAndRelationsMapping = {
  'Sets and Relation Test - 1 (Topic Test )': 'Number of Sets and Relations, Domain and Range of a Relation',
  'Sets and Relation Test - 2 (Topic Test )': 'Number of Sets and Relations, Venn Diagram, Inverse of a Relation',
  'Sets and Relation Test - 3 (Topic Test )': 'Symmetric, Transitive and Reflexive Properties'
};

function assignSyllabus(testList) {
  for (const test of testList) {
    if (setsAndRelationsMapping[test.title]) {
      test.syllabus = setsAndRelationsMapping[test.title];
    } else {
      if (test.type === 'topic') {
        test.syllabus = test.sectionName || test.title;
      } else if (test.type === 'chapter') {
        test.syllabus = `Complete Chapter: ${test.sectionName || test.title.replace(' Chapter Test', '')}`;
      } else if (test.type === 'part') {
        test.syllabus = `Part Syllabus of ${test.groupName || 'JEE Main'}`;
      } else if (test.type === 'full') {
        test.syllabus = 'Complete JEE Main Syllabus (Physics, Chemistry, Mathematics)';
      } else {
        test.syllabus = test.sectionName || test.title;
      }
    }
  }
}

if (data.topic_tests) assignSyllabus(data.topic_tests);
if (data.chapter_tests) assignSyllabus(data.chapter_tests);
if (data.part_tests) assignSyllabus(data.part_tests);
if (data.full_tests) assignSyllabus(data.full_tests);

fs.writeFileSync(INDEX_PATH, JSON.stringify(data, null, 2), 'utf8');
console.log('Successfully added syllabus field to all tests in index.');
