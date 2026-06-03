const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'data', 'scraped_questions');
const dirs = ['jee-main', 'jee-advanced'];
const chapsBySubject = { physics: {}, chemistry: {}, mathematics: {} };
let totalQ = 0;
let paperCount = 0;

for (const dir of dirs) {
  const dirPath = path.join(baseDir, dir);
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json'));
  paperCount += files.length;
  
  for (const f of files) {
    const d = JSON.parse(fs.readFileSync(path.join(dirPath, f), 'utf8'));
    if (!d.results) continue;
    
    for (const sec of d.results) {
      for (const q of sec.questions) {
        totalQ++;
        const s = q.subject;
        const ch = q.chapter || 'unknown';
        const cg = q.chapterGroup || 'other';
        
        if (chapsBySubject[s]) {
          if (!chapsBySubject[s][ch]) {
            chapsBySubject[s][ch] = { count: 0, group: cg, topics: {}, exams: new Set() };
          }
          chapsBySubject[s][ch].count++;
          chapsBySubject[s][ch].exams.add(q.exam);
          
          const tp = q.topic || 'general';
          if (!chapsBySubject[s][ch].topics[tp]) chapsBySubject[s][ch].topics[tp] = 0;
          chapsBySubject[s][ch].topics[tp]++;
        }
      }
    }
  }
}

console.log(`Total Papers: ${paperCount}`);
console.log(`Total Questions: ${totalQ}\n`);

for (const [subj, chs] of Object.entries(chapsBySubject)) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ${subj.toUpperCase()} (${Object.keys(chs).length} chapters)`);
  console.log(`${'='.repeat(60)}`);
  
  // Group by chapterGroup
  const groups = {};
  for (const [ch, info] of Object.entries(chs)) {
    if (!groups[info.group]) groups[info.group] = [];
    groups[info.group].push({ name: ch, ...info, exams: [...info.exams] });
  }
  
  for (const [groupName, chapters] of Object.entries(groups)) {
    console.log(`\n  [${groupName}]`);
    const sorted = chapters.sort((a, b) => b.count - a.count);
    for (const ch of sorted) {
      const topicList = Object.entries(ch.topics)
        .sort((a, b) => b[1] - a[1])
        .map(([t, c]) => `${t}(${c})`)
        .join(', ');
      console.log(`    ${ch.name} (${ch.count}q) [${ch.exams.join(',')}]`);
      console.log(`      Topics: ${topicList}`);
    }
  }
}
