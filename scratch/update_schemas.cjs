const fs = require('fs');
let content = fs.readFileSync('backend/models/schemas.js', 'utf8');

const newSchemas = `
// PYQ CHAPTER SCHEMA
const PyqChapterSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  subject: { type: String, required: true },
  count: { type: Number, default: 0 },
  weightage: { type: String, default: '5%' }
}, { timestamps: true });

// PYQ SCHEMA
const PyqSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  chapterId: { type: String, required: true },
  title: { type: String },
  year: { type: String },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  type: { type: String, enum: ['SCQ', 'NUMERICAL'], default: 'SCQ' },
  question: { type: String, required: true },
  options: [{ type: String }],
  correctOptionIndex: { type: Number },
  solution: { type: String },
  marks: { type: Number, default: 4 },
  negativeMarks: { type: Number, default: -1 },
  topic: { type: String, default: 'General' }
}, { timestamps: true });

export const PyqChapter = mongoose.model('PyqChapter', PyqChapterSchema);
export const Pyq = mongoose.model('Pyq', PyqSchema);
`;

content = content.replace('export const Syllabus = mongoose.model(\'Syllabus\', SyllabusSchema);', 'export const Syllabus = mongoose.model(\'Syllabus\', SyllabusSchema);\n' + newSchemas);

fs.writeFileSync('backend/models/schemas.js', content);
console.log('Added Pyq and PyqChapter schemas.');
