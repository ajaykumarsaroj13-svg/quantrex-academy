const fs = require('fs');
let data = fs.readFileSync('public/data-script.js', 'utf8');

const ndaSyllabus = `
  nda: {
    subjects: {
      mathematics: {
        id: 'mathematics',
        name: 'Mathematics',
        chapters: [
          { id: 'nda_mathematics_sets-relations-and-functions', name: 'Sets, Relations and Functions', slug: 'sets-relations-and-functions' },
          { id: 'nda_mathematics_trigonometry', name: 'Trigonometry', slug: 'trigonometry' },
          { id: 'nda_mathematics_algebra', name: 'Algebra', slug: 'algebra' },
          { id: 'nda_mathematics_differential-calculus', name: 'Differential Calculus', slug: 'differential-calculus' },
          { id: 'nda_mathematics_integral-calculus-and-differential-equations', name: 'Integral Calculus and Differential Equations', slug: 'integral-calculus-and-differential-equations' }
        ]
      },
      science: {
        id: 'science',
        name: 'Science',
        chapters: [
          { id: 'nda_science_physics', name: 'Physics', slug: 'physics' },
          { id: 'nda_science_chemistry', name: 'Chemistry', slug: 'chemistry' },
          { id: 'nda_science_biology', name: 'Biology', slug: 'biology' }
        ]
      }
    }
  },`;

if (!data.includes('nda: {')) {
  data = data.replace('\'jee-mains\': {', ndaSyllabus + '\n  \'jee-mains\': {');
  // fallback if it uses unquoted key
  data = data.replace('jee-mains: {', ndaSyllabus + '\n  \'jee-mains\': {');
  fs.writeFileSync('public/data-script.js', data);
  console.log('patched data-script.js');
} else {
  console.log('nda already exists in data-script.js');
}
