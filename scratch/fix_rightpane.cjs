const fs = require('fs');
const file = 'src/components/ExamGoalTestInterface.jsx';
let content = fs.readFileSync(file, 'utf8');

// The issue is the legend div and markedAnswered section is missing the count
// and there's a missing closing for palette div + right pane div
// Looking at lines 478-484, then 487 is instructions modal at wrong nesting level

// We need to:
// 1. Add {summary.markedAnswered} text to the span at line 479
// 2. Restore closing tags for the entire Right Pane and Main Container before instructions modal

const broken = `               <div className="flex items-center gap-2 mt-3 pl-1">
                  <span className="w-7 h-7 flex items-center justify-center bg-[#5a3286] border border-[#4a296e] text-white rounded-full relative shadow-sm font-bold">
                      <span className="absolute bottom-0 right-0 w-2 h-2 bg-[#28a745] rounded-full border border-white"></span>
                   </span>
                   Answered & Marked for Review
                </div>
             </div>
     

      {/* ─── INSTRUCTIONS MODAL / OVERLAY ─── */}`;

const fixed = `               <div className="flex items-center gap-2 mt-3 pl-1">
                  <span className="w-7 h-7 flex items-center justify-center bg-[#5a3286] border border-[#4a296e] text-white rounded-full relative shadow-sm font-bold">
                     {summary.markedAnswered}
                     <span className="absolute bottom-0 right-0 w-2 h-2 bg-[#28a745] rounded-full border border-white"></span>
                  </span>
                  Answered & Marked for Review
               </div>
            </div>

            {/* Question Palette */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, idx) => {
                  const stat = qStatus[q.id];
                  const colorClass = getPaletteClass(stat);
                  let shapeStyle = { borderRadius: '50%' };
                  let extraElement = null;
                  if (stat?.status === 'not_answered') {
                    shapeStyle = { clipPath: 'polygon(0% 0%, 100% 0%, 100% 80%, 80% 100%, 0% 100%)' };
                  } else if (stat?.status === 'answered') {
                    shapeStyle = { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 20% 100%, 0% 80%)' };
                  } else if (stat?.status === 'marked_answered') {
                    extraElement = <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#2e7d32] rounded-full border border-white"></span>;
                  } else {
                    shapeStyle = { borderRadius: '2px' };
                  }
                  return (
                    <button
                      key={q.id || idx}
                      onClick={() => {
                        setQStatus(prev => ({ ...prev, [q.id]: { ...(prev[q.id] || {}), visited: true, status: prev[q.id]?.status || 'not_answered' } }));
                        setCurrentQuestionIndex(idx);
                      }}
                      className={\`w-11 h-11 flex items-center justify-center font-bold text-sm shadow-sm transition-transform relative
                        \${colorClass} \${currentQuestionIndex === idx ? 'ring-2 ring-offset-1 ring-[#3f51b5] transform scale-110 z-10' : 'hover:scale-105'}
                      \`}
                      style={shapeStyle}
                    >
                      {idx + 1}
                      {extraElement}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-auto bg-[#e6edf4] p-3 border-t border-gray-300 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
              <button 
                onClick={() => {
                   if (window.confirm("Are you sure you want to submit the test?")) {
                      onClose();
                   }
                }}
                className="w-full py-2.5 bg-white text-gray-800 border border-gray-400 font-bold rounded-sm shadow-sm hover:bg-gray-50 transition-colors"
              >
                SUBMIT
              </button>
           </div>
        </div>

      </div>

      {/* ─── INSTRUCTIONS MODAL / OVERLAY ─── */}`;

if (content.includes(broken)) {
  content = content.replace(broken, fixed);
  fs.writeFileSync(file, content, 'utf8');
  console.log('Fixed successfully!');
} else {
  console.log('String not found. Trying normalize...');
  // Try with CRLF normalization
  const brokenNorm = broken.replace(/\n/g, '\r\n');
  if (content.includes(brokenNorm)) {
    content = content.replace(brokenNorm, fixed);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed with CRLF!');
  } else {
    console.log('Still not found. Showing file bytes around 478-490...');
    const lines = content.split(/\r?\n/);
    for (let i = 476; i < 492; i++) {
      console.log(i+1, JSON.stringify(lines[i]));
    }
  }
}
