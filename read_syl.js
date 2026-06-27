import { syllabusData } from './src/utils/temp_syl.js';
let q;
for(const s of syllabusData) {
  for(const b of s.branches) {
    for(const u of b.units) {
      for(const c of u.chapters) {
        if(c.title.includes('Sequence') && c.questions && c.questions.length > 0) {
          q = c.questions[0];
          break;
        }
      }
      if(q) break;
    }
    if(q) break;
  }
  if(q) break;
}
console.log(JSON.stringify(q, null, 2));
