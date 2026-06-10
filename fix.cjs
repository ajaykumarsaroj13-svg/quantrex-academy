const fs = require('fs');
const file = 'src/pages/StudentDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

// Find the start of the return statement
content = content.replace('  return (\n    <div className="flex h-screen bg-[#f4f5f8] font-sans overflow-hidden">', '  return (\n    <>\n    <div className="flex h-screen bg-[#f4f5f8] font-sans overflow-hidden">');

// Find the end where we added the practice modal
content = content.replace('    </div>\n    \n      {/* PRACTICE CONFIGURATION MODAL */}', '    </div>\n    \n      {/* PRACTICE CONFIGURATION MODAL */}');

// The file currently looks like:
/*
      </div>
    </div>
    
      {/* PRACTICE CONFIGURATION MODAL *}
      {practiceModalConfig && ( ... )}
  );
}
*/
// We just need to replace `  );\n}` at the very end with `    </>\n  );\n}`
content = content.replace(/  \);\n}\n*$/, '    </>\n  );\n}\n');

fs.writeFileSync(file, content);
