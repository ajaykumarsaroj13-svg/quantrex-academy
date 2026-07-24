const fs = require('fs');

let fileContent = fs.readFileSync('src/components/ExamGoalTestInterface.jsx', 'utf8');

// 1. Update font size
fileContent = fileContent.replace(
  `const [fontSize, setFontSize] = useState(1.25);`,
  `const [fontSize, setFontSize] = useState(1.0);`
);

// 2. Remove Shift Details Div
const shiftDetailsRegex = /\{\/\* Shift Details \(Green background from ExamGoal\) \*\/\}\s*<div className="px-4 py-2 bg-\[#e8f5e9\] border-b border-gray-200">\s*<span className="text-\[#2e7d32\] font-medium text-\[15px\]">\{currentQuestion\.shift \|\| currentQuestion\.title \|\| currentQuestion\.year\}<\/span>\s*<\/div>/g;
fileContent = fileContent.replace(shiftDetailsRegex, '');

// 3. Remove SCQ/MCQM Tag
const tagLogicRegex = /\{[^}]*const t = currentQuestion\.type[\s\S]*?\{label\}[\s\S]*?<\/div>\s*\);\s*\}\)\(\)\}/;
fileContent = fileContent.replace(tagLogicRegex, '');

// 4. Rebuild the bottom half of the file safely!
// We'll cut right at the start of Right Pane
const cutIndex = fileContent.indexOf('{/* Right Pane (NTA Palette) */}');
if (cutIndex === -1) {
  console.log("Could not find Right Pane start!");
  process.exit(1);
}

const safeTopHalf = fileContent.substring(0, cutIndex);

const newBottomHalf = `{/* Right Pane (NTA Palette) */}
        <div className="w-[320px] bg-[#e6edf4] flex flex-col h-full border-l border-gray-300 overflow-hidden shrink-0 hidden lg:flex">
           
           {/* Profile Section */}
           <div className="p-4 bg-white flex items-center gap-3 border-b border-gray-300 shadow-sm">
              <div className="w-14 h-14 bg-gray-200 border border-gray-400 p-1">
                 <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                 </div>
              </div>
              <div>
                <div className="font-bold text-[#3f51b5]">Student Name</div>
                <div className="text-xs font-semibold text-gray-600">John Doe</div>
              </div>
           </div>

           {/* Legend grid */}
           <div className="p-4 border-b border-gray-300 bg-white text-xs font-semibold text-gray-700 shadow-sm z-10">
              <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                 <div className="flex items-center gap-2">
                    <span className="w-7 h-7 flex items-center justify-center bg-gray-200 border border-gray-300 text-black shadow-sm font-bold">{summary.notVisited}</span> Not Visited
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="w-7 h-7 flex items-center justify-center bg-[#dc3545] border border-[#bd2130] text-white shadow-sm shape-not-answered font-bold" style={{clipPath: 'polygon(0% 0%, 100% 0%, 100% 80%, 80% 100%, 0% 100%)'}}>{summary.notAnswered}</span> Not Answered
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="w-7 h-7 flex items-center justify-center bg-[#28a745] border border-[#1e7e34] text-white shadow-sm shape-answered font-bold" style={{clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 20% 100%, 0% 80%)'}}>{summary.answered}</span> Answered
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="w-7 h-7 flex items-center justify-center bg-[#5a3286] border border-[#4a296e] text-white rounded-full shadow-sm font-bold">{summary.marked}</span> Marked for Review
                 </div>
              </div>
              <div className="flex items-center gap-2 mt-3 pl-1">
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

      {/* ─── INSTRUCTIONS MODAL / OVERLAY ─── */}
      {(!hasAcceptedInstructions || showInstructionsModal) && (
        <div className="fixed inset-0 z-[9999] flex flex-col bg-white overflow-hidden text-gray-900">
          
            {/* Modal Header */}
            <div className="px-6 py-4 border-b flex items-center justify-between bg-[#3f51b5] text-white">
              <div className="flex items-center gap-3">
                {getExamLogo(topic || pyqData)}
                <div>
                  <h3 className="font-extrabold text-lg uppercase tracking-wide">
                    {topic?.name || pyqData?.title || 'Official Examination Instructions'}
                  </h3>
                  <span className="text-xs font-semibold text-white/80">
                    Duration: {durationMinutes} Mins | Total Questions: {questions?.length || 75}
                  </span>
                </div>
              </div>
              {hasAcceptedInstructions && (
                <button 
                  onClick={() => setShowInstructionsModal(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm hover:bg-white/20 transition-colors"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Modal Content Scroll Area */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10 lg:px-32 space-y-8 text-base leading-relaxed bg-[#f8f9fa]">
              <div className="p-4 rounded border font-medium flex items-start gap-3 bg-blue-50 border-blue-200 text-blue-900">
                <span className="text-xl">ℹ</span>
                <span>Please read the instructions carefully before starting the test. The clock is set at the top right of your screen.</span>
              </div>

              {/* General Instructions */}
              <div>
                <h4 className="font-extrabold text-lg uppercase tracking-wider mb-4 border-b border-gray-300 pb-2 text-blue-800">
                  1. General Instructions:
                </h4>
                <ol className="list-decimal list-inside space-y-2 pl-1 text-gray-800">
                  <li>Total duration of examination is <strong>{durationMinutes} minutes</strong>.</li>
                  <li>The clock countdown is displayed on top right corner.</li>
                  <li>When timer reaches zero, test will submit automatically.</li>
                </ol>
              </div>

              {/* Question Status Symbols */}
              <div>
                <h4 className="font-extrabold text-lg uppercase tracking-wider mb-4 border-b border-gray-300 pb-2 text-blue-800">
                  2. Question Status Symbols:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-4 p-4 rounded border bg-white border-gray-200 shadow-sm">
                    <div className="w-10 h-10 rounded flex items-center justify-center font-bold shadow-sm bg-gray-200 text-gray-700 border border-gray-300">1</div>
                    <span className="text-gray-800 font-medium">Not Visited</span>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded border bg-white border-gray-200 shadow-sm">
                    <div className="w-10 h-10 rounded flex items-center justify-center font-bold shadow-sm bg-[#dc3545] text-white">2</div>
                    <span className="text-gray-800 font-medium">Not Answered</span>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded border bg-white border-gray-200 shadow-sm">
                    <div className="w-10 h-10 rounded flex items-center justify-center font-bold shadow-sm bg-[#28a745] text-white">3</div>
                    <span className="text-gray-800 font-medium">Answered</span>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded border bg-white border-gray-200 shadow-sm">
                    <div className="w-10 h-10 rounded flex items-center justify-center font-bold shadow-sm bg-[#5a3286] text-white">4</div>
                    <span className="text-gray-800 font-medium">Marked for Review</span>
                  </div>
                </div>
              </div>

              {/* Marking Scheme */}
              <div>
                <h4 className="font-extrabold text-lg uppercase tracking-wider mb-4 border-b border-gray-300 pb-2 text-blue-800">
                  3. Marking Scheme:
                </h4>
                <ul className="list-disc list-inside space-y-2 pl-1 text-gray-800">
                  <li><strong>Correct Answer:</strong> +4 Marks</li>
                  <li><strong>Incorrect Answer:</strong> -1 Mark</li>
                  <li><strong>Unattempted:</strong> 0 Marks</li>
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            {!hasAcceptedInstructions ? (
              <div className="px-6 md:px-10 lg:px-32 py-5 bg-white border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-6">
                <label className="flex items-center gap-3 cursor-pointer text-sm font-bold text-gray-800 select-none">
                  <input 
                    type="checkbox" 
                    checked={hasReadInstructions}
                    onChange={(e) => setHasReadInstructions(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-400 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span>
                    I have read and understood all instructions and am ready to start.
                  </span>
                </label>

                <button
                  disabled={!hasReadInstructions}
                  onClick={() => {
                    setShowCountdown(true);
                  }}
                  className={\`px-10 py-3.5 rounded-sm font-extrabold text-sm uppercase tracking-wider transition-all duration-200 shadow-md \${
                    hasReadInstructions
                      ? 'bg-[#28a745] hover:bg-[#218838] text-white cursor-pointer'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }\`}
                >
                  PROCEED TO TEST →
                </button>
              </div>
            ) : (
              <div className="px-6 py-4 bg-white border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setShowInstructionsModal(false)}
                  className="px-8 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-sm uppercase rounded transition-all cursor-pointer"
                >
                  Close Instructions ✕
                </button>
              </div>
            )}
        </div>
      )}

      {/* ── 3... 2... 1... GO! Countdown Overlay ── */}
      {showCountdown && (
        <CountdownOverlay
          examTitle={topic?.name || pyqData?.title || 'Official Exam Starting'}
          onComplete={() => {
            setShowCountdown(false);
            setHasAcceptedInstructions(true);
            setIsInitialized(true);
          }}
        />
      )}
    </div>
  );
}
`;

fs.writeFileSync('src/components/ExamGoalTestInterface.jsx', safeTopHalf + newBottomHalf);
console.log("Successfully rebuilt ExamGoalTestInterface!");
