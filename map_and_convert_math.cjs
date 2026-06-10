const fs = require('fs');
const path = require('path');

const MAP = {
  "Sets and Relations": "ch_mathematics_algebra_0",
  "Logarithm": "ch_mathematics_algebra_1",
  "Quadratic Equation and Inequalities": "ch_mathematics_algebra_2",
  "Sequences and Series": "ch_mathematics_algebra_3",
  "Mathematical Induction": "ch_mathematics_algebra_4",
  "Binomial Theorem": "ch_mathematics_algebra_5",
  "Matrices and Determinants": "ch_mathematics_algebra_6",
  "Permutations and Combinations": "ch_mathematics_algebra_7",
  "Probability": "ch_mathematics_algebra_8",
  "Vector Algebra": "ch_mathematics_algebra_9",
  "3D Geometry": "ch_mathematics_algebra_10",
  "Complex Numbers": "ch_mathematics_algebra_11",
  "Statistics": "ch_mathematics_algebra_12",
  "Mathematical Reasoning": "ch_mathematics_algebra_13",

  "Trigonometric Ratio and Identites": "ch_mathematics_trigonometry_0",
  "Trigonometric Equations": "ch_mathematics_trigonometry_1",
  "Inverse Trigonometric Functions": "ch_mathematics_trigonometry_2",
  "Properties of Triangle": "ch_mathematics_trigonometry_3",
  "Height and Distance": "ch_mathematics_trigonometry_4",

  "Straight Lines and Pair of Straight Lines": "ch_mathematics_coordinate_geometry_0",
  "Circle": "ch_mathematics_coordinate_geometry_1",
  "Parabola": "ch_mathematics_coordinate_geometry_2",
  "Ellipse": "ch_mathematics_coordinate_geometry_3",
  "Hyperbola": "ch_mathematics_coordinate_geometry_4",

  "Functions": "ch_mathematics_calculus_0",
  "Limits, Continuity and Differentiability": "ch_mathematics_calculus_1",
  "Differentiation": "ch_mathematics_calculus_2",
  "Application of Derivatives": "ch_mathematics_calculus_3",
  "Indefinite Integrals": "ch_mathematics_calculus_4",
  "Definite Integration": "ch_mathematics_calculus_5",
  "Area Under The Curves": "ch_mathematics_calculus_6",
  "Differential Equations": "ch_mathematics_calculus_7"
};

const chaptersList = require('./extracted_all_math_chapters.json');
const allQuestions = [];

const cleanText = (text) => {
    if(!text) return "";
    return text.trim(); 
};

function toTitleCase(str) {
  if (!str) return 'General';
  return str.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
}

for (const ch of chaptersList) {
    const quantrexId = MAP[ch.name];
    if (!quantrexId) continue;
    
    const filePath = path.join(__dirname, 'public', 'data', 'questions', 'raw_math', `raw_math_${ch.id}.json`);
    if (!fs.existsSync(filePath)) continue;
    
    let rawData;
    try {
        rawData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch(e) { continue; }
    
    if (!rawData.results || !rawData.results[0] || !rawData.results[0].questions) continue;
    const questions = rawData.results[0].questions;
    
    const formattedQuestions = questions.map((q, idx) => {
      const en = q.question.en;
      
      let type = "SCQ";
      if (q.type === 'mcq') type = "SCQ";
      if (q.type === 'integer') type = "NUMERICAL";
      
      let options = [];
      let correctOptionIndex = -1;
      
      if (en.options && en.options.length > 0) {
        options = en.options.map(opt => opt.content.trim());
        if (en.correct_options && en.correct_options.length > 0) {
          const correctId = en.correct_options[0];
          const correctOpt = en.options.find(o => o.identifier === correctId);
          if (correctOpt) {
            correctOptionIndex = en.options.indexOf(correctOpt);
          }
        }
      } else if (type === "NUMERICAL" && en.answer) {
        options = [en.answer];
        correctOptionIndex = 0;
      }

      let examYear = q.past_year ? parseInt(q.past_year) : 2024;

      return {
        question_id: q.id || `qm_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        exam: 'jee-main',
        chapterId: quantrexId,
        title: 'JEE Main Math PYQ',
        year: examYear,
        difficulty: "Medium",
        type: type,
        question: cleanText(en.content),
        options: options,
        correctOptionIndex: correctOptionIndex,
        solution: en.solution ? cleanText(en.solution) : "",
        marks: 4,
        negativeMarks: type === "NUMERICAL" ? 0 : -1, // in JEE numerical has no negative, or -1 in new pattern, let's use -1 for all just to be safe, or just stick to 0/ -1
        topic: toTitleCase(q.topic)
      };
    });
    
    // update negative marks if needed, standard is -1
    formattedQuestions.forEach(q => q.negativeMarks = -1);
    
    allQuestions.push(...formattedQuestions);
}

fs.writeFileSync('all_math_pyqs_fixed.json', JSON.stringify(allQuestions, null, 2));
console.log(`Successfully mapped and converted ${allQuestions.length} total questions to fixed schema.`);
