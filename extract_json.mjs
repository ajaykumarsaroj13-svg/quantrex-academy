
import fs from 'fs';
import { DEFAULT_SYLLABUS, DEFAULT_TOPPERS } from './src/utils/syllabusData.js';

fs.writeFileSync('src/utils/syllabus.json', JSON.stringify(DEFAULT_SYLLABUS, null, 2));
fs.writeFileSync('src/utils/toppers.json', JSON.stringify(DEFAULT_TOPPERS, null, 2));
console.log('done extraction');

