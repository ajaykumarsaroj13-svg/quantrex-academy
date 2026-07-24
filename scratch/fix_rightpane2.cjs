const fs = require('fs');
const file = 'src/components/ExamGoalTestInterface.jsx';
let lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);

// The file currently at lines 478-484 closes the legend properly
// but then cuts straight to the INSTRUCTIONS MODAL at line 487
// We need to add: summary.markedAnswered content, then question palette, then submit button, then close the right pane and main container

// Insert the following after line 484 (0-indexed: 483) and before line 485 (0-indexed: 484)
const insertLines = [
``,
`            {/* Question Palette */}`,
`            <div className="flex-1 overflow-y-auto p-4">`,
`              <div className="grid grid-cols-5 gap-2">`,
`                {questions.map((q, idx) => {`,
`                  const stat = qStatus[q.id];`,
`                  const colorClass = getPaletteClass(stat);`,
`                  let shapeStyle = { borderRadius: '50%' };`,
`                  let extraElement = null;`,
`                  if (stat?.status === 'not_answered') {`,
`                    shapeStyle = { clipPath: 'polygon(0% 0%, 100% 0%, 100% 80%, 80% 100%, 0% 100%)' };`,
`                  } else if (stat?.status === 'answered') {`,
`                    shapeStyle = { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 20% 100%, 0% 80%)' };`,
`                  } else if (stat?.status === 'marked_answered') {`,
`                    extraElement = <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#2e7d32] rounded-full border border-white"></span>;`,
`                  } else {`,
`                    shapeStyle = { borderRadius: '2px' };`,
`                  }`,
`                  return (`,
`                    <button`,
`                      key={q.id || idx}`,
`                      onClick={() => {`,
`                        setQStatus(prev => ({ ...prev, [q.id]: { ...(prev[q.id] || {}), visited: true, status: prev[q.id]?.status || 'not_answered' } }));`,
`                        setCurrentQuestionIndex(idx);`,
`                      }}`,
`                      className={\`w-11 h-11 flex items-center justify-center font-bold text-sm shadow-sm transition-transform relative`,
`                        \${colorClass} \${currentQuestionIndex === idx ? 'ring-2 ring-offset-1 ring-[#3f51b5] transform scale-110 z-10' : 'hover:scale-105'}`,
`                      \`}`,
`                      style={shapeStyle}`,
`                    >`,
`                      {idx + 1}`,
`                      {extraElement}`,
`                    </button>`,
`                  );`,
`                })}`,
`              </div>`,
`            </div>`,
``,
`            {/* Submit Button */}`,
`            <div className="mt-auto bg-[#e6edf4] p-3 border-t border-gray-300 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">`,
`               <button `,
`                 onClick={() => {`,
`                    if (window.confirm("Are you sure you want to submit the test?")) {`,
`                       onClose();`,
`                    }`,
`                 }}`,
`                 className="w-full py-2.5 bg-white text-gray-800 border border-gray-400 font-bold rounded-sm shadow-sm hover:bg-gray-50 transition-colors"`,
`               >`,
`                 SUBMIT`,
`               </button>`,
`            </div>`,
`        </div>`,
``,
`      </div>`,
``
];

// Also fix markedAnswered value missing (line 479 - the span at index 478)
// Currently line 479 (0-indexed: 478) is:
// "                 <span ...>"
// followed by inner span. We need to add {summary.markedAnswered}
// Let's fix line 479 area by adding text between lines 479 and 480
insertLines.unshift(''); // placeholder

// First fix: add {summary.markedAnswered} text after the opening span at line 479
// lines[478] = '                 <span className="..." >'  
// lines[479] = '                     <span ... ></span>'
// We want to insert: lines[479_new] = '                     {summary.markedAnswered}'
// then the existing inner span

// Insert {summary.markedAnswered} at index 479 (between current line 479 and 480)
lines.splice(479, 0, '                     {summary.markedAnswered}');

// Now lines 485 was "    ", 486 was "", 487 was "{/* ─── INSTRUCTIONS MODAL..."
// After insert, those are now at 486, 487, 488
// Find the index of "    " (empty whitespace) before instructions modal
const emptyIdx = lines.findIndex((l, i) => i >= 484 && l.trim() === '' && lines[i+1]?.trim() === '' && lines[i+2]?.includes('INSTRUCTIONS MODAL'));
console.log('emptyIdx:', emptyIdx);

if (emptyIdx !== -1) {
  // Replace lines[emptyIdx] and [emptyIdx+1] with the palette and right-pane close
  const insertHere = [
    '',
    '            {/* Question Palette */}',
    '            <div className="flex-1 overflow-y-auto p-4">',
    '              <div className="grid grid-cols-5 gap-2">',
    '                {questions.map((q, idx) => {',
    '                  const stat = qStatus[q.id];',
    '                  const colorClass = getPaletteClass(stat);',
    '                  let shapeStyle = { borderRadius: \'50%\' };',
    '                  let extraElement = null;',
    '                  if (stat?.status === \'not_answered\') {',
    '                    shapeStyle = { clipPath: \'polygon(0% 0%, 100% 0%, 100% 80%, 80% 100%, 0% 100%)\' };',
    '                  } else if (stat?.status === \'answered\') {',
    '                    shapeStyle = { clipPath: \'polygon(0% 0%, 100% 0%, 100% 100%, 20% 100%, 0% 80%)\' };',
    '                  } else if (stat?.status === \'marked_answered\') {',
    '                    extraElement = <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#2e7d32] rounded-full border border-white"></span>;',
    '                  } else {',
    '                    shapeStyle = { borderRadius: \'2px\' };',
    '                  }',
    '                  return (',
    '                    <button',
    '                      key={q.id || idx}',
    '                      onClick={() => {',
    '                        setQStatus(prev => ({ ...prev, [q.id]: { ...(prev[q.id] || {}), visited: true, status: prev[q.id]?.status || \'not_answered\' } }));',
    '                        setCurrentQuestionIndex(idx);',
    '                      }}',
    '                      className={`w-11 h-11 flex items-center justify-center font-bold text-sm shadow-sm transition-transform relative',
    '                        ${colorClass} ${currentQuestionIndex === idx ? \'ring-2 ring-offset-1 ring-[#3f51b5] transform scale-110 z-10\' : \'hover:scale-105\'}',
    '                      `}',
    '                      style={shapeStyle}',
    '                    >',
    '                      {idx + 1}',
    '                      {extraElement}',
    '                    </button>',
    '                  );',
    '                })}',
    '              </div>',
    '            </div>',
    '',
    '            {/* Submit Button */}',
    '            <div className="mt-auto bg-[#e6edf4] p-3 border-t border-gray-300 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">',
    '               <button ',
    '                 onClick={() => {',
    '                    if (window.confirm("Are you sure you want to submit the test?")) {',
    '                       onClose();',
    '                    }',
    '                 }}',
    '                 className="w-full py-2.5 bg-white text-gray-800 border border-gray-400 font-bold rounded-sm shadow-sm hover:bg-gray-50 transition-colors"',
    '               >',
    '                 SUBMIT',
    '               </button>',
    '            </div>',
    '        </div>',
    '',
    '      </div>',
    '',
  ];
  lines.splice(emptyIdx, 2, ...insertHere);
  fs.writeFileSync(file, lines.join('\n'), 'utf8');
  console.log('Fixed successfully! Lines inserted at', emptyIdx);
} else {
  console.log('Could not find insertion point');
  // Show context
  for (let i = 482; i < 492; i++) {
    console.log(i, JSON.stringify(lines[i]));
  }
}
