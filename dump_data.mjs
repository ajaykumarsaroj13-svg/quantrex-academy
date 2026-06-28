import fs from 'fs';

const syllabusDataStr = fs.readFileSync('src/utils/syllabusData.js', 'utf8');
const defaultDataStr = fs.readFileSync('src/utils/defaultData.js', 'utf8');

const testsData2 = JSON.parse(fs.readFileSync('src/utils/testsData2.json', 'utf8'));
const advancedTestsData = JSON.parse(fs.readFileSync('src/utils/advancedTestsData.json', 'utf8'));

// Very simple eval trick
let DEFAULT_SYLLABUS, DEFAULT_TOPPERS, DEFAULT_BOOKS, DEFAULT_HOME_CONTENT;

const mockWindow = { DEFAULT_SYLLABUS: {} };
const evalScope1 = `
  const window = ${JSON.stringify(mockWindow)};
  ${syllabusDataStr.replace(/export const/g, 'const')}
  return { DEFAULT_SYLLABUS, DEFAULT_TOPPERS };
`;
const evalScope2 = `
  let testsData2 = {};
  let advancedTestsData = {};
  ${defaultDataStr.replace(/export const/g, 'const').replace(/import.*?;/g, '')}
  return { DEFAULT_BOOKS, DEFAULT_HOME_CONTENT };
`;

const res1 = new Function(evalScope1)();
const res2 = new Function(evalScope2)();

const allData = {
  testsData: {
    mains: testsData2,
    advanced: advancedTestsData
  },
  booksData: res2.DEFAULT_BOOKS,
  homeData: res2.DEFAULT_HOME_CONTENT,
  syllabusData: res1.DEFAULT_SYLLABUS,
  toppersData: res1.DEFAULT_TOPPERS
};

fs.writeFileSync('temp_export_for_firebase.json', JSON.stringify(allData, null, 2));
console.log('Successfully wrote temp_export_for_firebase.json');
