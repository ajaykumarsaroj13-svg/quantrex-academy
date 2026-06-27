const fs = require('fs');
const path = require('path');

function fixDataScript() {
  try {
    const filePath = path.join(__dirname, 'public', 'data-script.js');
    let content = fs.readFileSync(filePath, 'utf8');
    
    // It's a JS file with `window.DEFAULT_SYLLABUS = { ... }`
    // We can extract the object, parse it (or evaluate it), modify it, and write it back
    // However, evaluating arbitrary JS is dangerous.
    // Instead, I can just use a regex to remove the specific JSON object for "Sets and Relations".
    // Or, I can extract the string between `window.DEFAULT_SYLLABUS = ` and the first `window.` or end of file, parse it if it's pure JSON, modify it, then stringify.
    
    const prefix = "window.DEFAULT_SYLLABUS = ";
    const startIndex = content.indexOf(prefix);
    if (startIndex === -1) {
      console.error("Could not find window.DEFAULT_SYLLABUS");
      return;
    }
    
    const startData = startIndex + prefix.length;
    // Assuming there are other window. variables after it
    let endData = content.indexOf("\nwindow.", startData);
    if (endData === -1) endData = content.lastIndexOf(";");
    if (endData === -1) endData = content.length;
    
    let jsonStr = content.substring(startData, endData).trim();
    if (jsonStr.endsWith(";")) {
      jsonStr = jsonStr.slice(0, -1);
    }
    
    let syllabus;
    try {
      syllabus = JSON.parse(jsonStr);
    } catch(e) {
      // If it's not pure JSON, use Function
      syllabus = new Function(`return ${jsonStr}`)();
    }
    
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
      const newJsonStr = JSON.stringify(syllabus, null, 2);
      const newContent = content.substring(0, startData) + newJsonStr + ";\n" + content.substring(endData + (content[endData]===";"?1:0));
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log("Successfully fixed public/data-script.js");
    } else {
      console.log("No changes needed in public/data-script.js");
    }
  } catch (err) {
    console.error(err);
  }
}

fixDataScript();
