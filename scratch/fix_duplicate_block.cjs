const fs = require('fs');
const file = 'src/components/ExamGoalTestInterface.jsx';
let content = fs.readFileSync(file, 'utf8');

const dupMarker = '<div className={`fixed inset-0 z-50 flex flex-col font-sans';
const firstIdx = content.indexOf(dupMarker);
const secondIdx = content.indexOf(dupMarker, firstIdx + 1);

if (secondIdx !== -1) {
  console.log('Found second duplicate block at index', secondIdx);
  
  // Extract up to secondIdx
  let head = content.substring(0, secondIdx);
  
  // Also clean up lines 479-484 inside head
  head = head.replace(
    `<span className="w-7 h-7 flex items-center justify-center bg-[#5a3286] border border-[#4a296e] text-white rounded-full relative shadow-sm font-bold">
                     <span className="absolute bottom-0 right-0 w-2 h-2 bg-[#28a745] rounded-full border border-white"></span>
                  </span>
                  Answered & Marked for Review
               </div>
            </div>`,
    `<span className="w-7 h-7 flex items-center justify-center bg-[#5a3286] border border-[#4a296e] text-white rounded-full relative shadow-sm font-bold">
                    {summary.markedAnswered}
                    <span className="absolute bottom-0 right-0 w-2 h-2 bg-[#28a745] rounded-full border border-white"></span>
                 </span>
                 Answered & Marked for Review
              </div>
           </div>`
  );

  // Extract instructions modal and countdown overlay from the tail
  const tailMarker = '{/* ─── INSTRUCTIONS MODAL / OVERLAY ─── */}';
  const tailIdx = content.indexOf(tailMarker, secondIdx);
  let tail = '';
  if (tailIdx !== -1) {
    tail = content.substring(tailIdx);
  }

  const finalContent = head + '\n\n      ' + tail;
  fs.writeFileSync(file, finalContent, 'utf8');
  console.log('Fixed duplicate block successfully!');
} else {
  console.log('No second duplicate block found.');
}
