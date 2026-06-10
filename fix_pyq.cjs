const fs = require('fs');
const content = fs.readFileSync('C:/Users/Admin/.gemini/antigravity/scratch/quantrexacadmy/src/pages/StudentDashboard.jsx', 'utf8');
const lines = content.split('\n');

const correctBlock = `
                                             )}
                                           </div>
                                         );
                                       })
                                    )}
                                  </div>
                                )}

                                {/* 4. PYQs Tab */}
                                {chapterTab === 'pyqs' && (
                                  <div className="space-y-4">
                                     <div 
                                       onClick={() => setExamGoalOverviewConfig(chapter)}
                                       className="bg-white border-l-4 border-electric rounded-lg p-4 flex items-center justify-between cursor-pointer hover:shadow-lg transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                                     >
                                       <div className="flex items-center gap-4">
                                         <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                                           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-blue-600"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>
                                         </div>
                                         <div>
                                           <h4 className="text-gray-800 font-bold text-lg">{chapter.title || 'Sets and Relation'}</h4>
                                           <p className="text-gray-500 text-sm font-medium">Previous Year Questions</p>
                                         </div>
                                       </div>
                                       <div className="flex items-center gap-3">
                                         <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-bold">121 Questions</span>
                                         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-gray-400"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                                       </div>
                                     </div>
                                  </div>
                                )}

                                {/* 5. Mock Tests */}
                                {chapterTab === 'mockTests' && (
                                  <div className="space-y-2">
                                    {(!chapter.mockTests || chapter.mockTests.length === 0) ? (
                                      <p className="text-gray-500 italic py-6 text-center">No mock exams uploaded yet.</p>
                                    ) : (
                                      chapter.mockTests.map(t => (
`;

lines.splice(441, 2, ...correctBlock.split('\n'));
fs.writeFileSync('C:/Users/Admin/.gemini/antigravity/scratch/quantrexacadmy/src/pages/StudentDashboard.jsx', lines.join('\n'));
console.log('Fixed syntax correctly.');
