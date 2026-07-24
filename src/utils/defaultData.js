import testsData2 from './testsData2.json';
import advancedTestsData from './advancedTestsData.json';

export const DEFAULT_TESTS = {
  mains: testsData2,
  advanced: advancedTestsData,
  cuet: [
    { id: 'cuet_mock_1', title: 'CUET General Test & Domain Subjects Mock 1', examType: 'CUET', duration: 180, durationMinutes: 180, totalMarks: 250, questionCount: 50, questions: testsData2[0]?.questions || [] },
    { id: 'cuet_mock_2', title: 'CUET Mathematics & Quantitative Aptitude Mock', examType: 'CUET', duration: 180, durationMinutes: 180, totalMarks: 250, questionCount: 50, questions: testsData2[1]?.questions || [] }
  ],
  neet: [
    { id: 'neet_mock_1', title: 'NEET Physics & Chemistry Full Mock Test', examType: 'NEET', duration: 200, durationMinutes: 200, totalMarks: 720, questionCount: 180, questions: testsData2[0]?.questions || [] }
  ],
  class12: [
    { id: 'class12_cbse_1', title: 'Class 12 Board & Competitive Practice Test', examType: 'Class 12', duration: 180, durationMinutes: 180, totalMarks: 100, questionCount: 30, questions: testsData2[0]?.questions || [] }
  ],
  class11: [
    { id: 'class11_cbse_1', title: 'Class 11 Physics & Math Foundations Test', examType: 'Class 11', duration: 180, durationMinutes: 180, totalMarks: 100, questionCount: 30, questions: testsData2[1]?.questions || [] }
  ]
};

export const DEFAULT_BOOKS = [
  {
    id: 'black-book-maths',
    title: 'Advanced Problems in Mathematics',
    description: 'Vikas Gupta & Pankaj Joshi (Black Book) - Chapter-wise Interactive Practice.',
    coverColor: 'from-gray-800 to-black',
    tag: 'Practice Book',
    pages: 'Interactive',
    type: 'interactive'
  }
];

export const DEFAULT_HOME_CONTENT = {
  heroTitle: 'Dominate JEE Math with',
  heroSubtitle: 'Quantrex Academy',
  heroDescription: 'Master JEE Main and Advanced Mathematics with A.K. Sir. Access premium video lectures, complete syllabus coverage, structured mock tests, and smart PYQ analytics.',
  features: [
    { id: 'f1', title: 'Interactive PYQs', desc: 'Chapter-wise past year questions with smart analytics.' },
    { id: 'f2', title: 'Structured Tests', desc: 'Real exam simulation with NTA & TCS iON interface.' },
    { id: 'f3', title: 'Expert Video Solutions', desc: 'Detailed explanations by A.K. Sir.' }
  ],
  faqs: [
    { question: 'What is Quantrex Academy?', answer: 'Quantrex Academy is a specialized portal for JEE aspirants focusing deeply on mastering Mathematics.' },
    { question: 'Are the mock tests pattern aligned?', answer: 'Yes, our testing platform exactly mimics the official NTA (JEE Main) and TCS iON (JEE Advanced) environments.' }
  ]
};
