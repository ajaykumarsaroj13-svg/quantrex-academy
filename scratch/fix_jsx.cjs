const fs = require('fs');

const path = 'src/components/ExamGoalTestInterface.jsx';
let content = fs.readFileSync(path, 'utf8');
let lines = content.split('\n');

// Find line starting with '   };' around 480
const idx = lines.findIndex((l, i) => i > 470 && l.trim() === '};');
if (idx !== -1) {
  console.log('Found malformed }; at line', idx + 1);
  // Find where return ( occurs after idx
  const retIdx = lines.findIndex((l, i) => i >= idx && l.includes('return ('));
  if (retIdx !== -1) {
    console.log('Found duplicate return at line', retIdx + 1);
    // Replace lines from idx - 1 to retIdx with proper closing tags
    const replacement = [
      '                     <span className="absolute bottom-0 right-0 w-2 h-2 bg-[#28a745] rounded-full border border-white"></span>',
      '                  </span>',
      '                  Answered & Marked for Review',
      '               </div>',
      '            </div>'
    ];
    lines.splice(idx - 1, retIdx - idx + 2, ...replacement);
    fs.writeFileSync(path, lines.join('\n'), 'utf8');
    console.log('Successfully fixed file!');
  }
}
