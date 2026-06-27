const fs = require('fs');
const path = require('path');

function fixSyllabusJson() {
  try {
    const filePath = path.join(__dirname, 'public', 'syllabus.json');
    let content = fs.readFileSync(filePath, 'utf8');
    
    let syllabus = JSON.parse(content);
    
    let changed = false;
    if (syllabus.nda && syllabus.nda.subjects) {
      const subs = syllabus.nda.subjects;
      const subjectsToClean = ["english", "science", "general-studies"];
      
      for (const sub of subjectsToClean) {
        if (subs[sub] && subs[sub].chapters) {
          const originalLen = subs[sub].chapters.length;
          subs[sub].chapters = subs[sub].chapters.filter(ch => ch.title !== "Sets and Relations");
          if (subs[sub].chapters.length !== originalLen) {
            console.log(`Removed Sets and Relations from ${sub}`);
            changed = true;
          }
        }
      }
    }
    
    if (changed) {
      fs.writeFileSync(filePath, JSON.stringify(syllabus, null, 2), 'utf8');
      console.log("Successfully fixed public/syllabus.json");
    } else {
      console.log("No changes needed in public/syllabus.json");
    }
  } catch (err) {
    console.error(err);
  }
}

fixSyllabusJson();
