import { saveDbToBlob } from './src/blob.js';
import fs from 'fs';

const data = JSON.parse(fs.readFileSync('correctedSyllabus.json', 'utf8'));

saveDbToBlob('syllabusData', data).then(url => {
  console.log('Saved corrected syllabus to blob!', url);
}).catch(console.error);
