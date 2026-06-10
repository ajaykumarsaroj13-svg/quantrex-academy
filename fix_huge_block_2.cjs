const fs = require('fs');
let content = fs.readFileSync('C:/Users/Admin/.gemini/antigravity/scratch/quantrexacadmy/src/pages/StudentDashboard.jsx', 'utf8');

const s1 = `                                              {unlocked ? <PlayCircle className="h-3.5 w-3.5" /> : <Lock className="h-3 w-3" />} 
                                              {unlocked ? 'Play' : 'Locked'}`;
const startIdx = content.indexOf(s1);

const s2 = `                                {/* 5. Mock Tests */`;
const endIdx = content.indexOf(s2);

if (startIdx === -1 || endIdx === -1) {
  console.log('Not found!', startIdx, endIdx);
  process.exit(1);
}

const replacement = `                                              {unlocked ? <PlayCircle className="h-3.5 w-3.5" /> : <Lock className="h-3 w-3" />} 
                                              {unlocked ? 'Play' : 'Locked'}
                                            </button>
                                          </div>
                                        );
                                      })
                                    )}
                                  </div>
                                )}

                                {/* 2. Notes & DPPs */}
                                {chapterTab === 'pdfs' && (
                                  <div className="space-y-3">
                                    {(!chapter.pdfs || chapter.pdfs.length === 0) ? (
                                      <p className="text-gray-500 italic py-6 text-center">No PDF notes or handouts available.</p>
                                    ) : (
                                      chapter.pdfs.map(p => {
                                        const unlocked = isResourceUnlocked(p);
                                        return (
                                          <div key={p.id} className="space-y-2">
                                            <div className="flex justify-between items-center p-3 bg-cyberdark/60 border border-white/5 rounded-lg">
                                              <div>
                                                <div className="flex items-center gap-1.5">
                                                  <h5 className="text-white font-semibold text-xs">{p.title}</h5>
                                                  {p.isFree && <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded font-bold">FREE</span>}
                                                  {!unlocked && <span className="text-[8px] bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.2 rounded font-bold">LOCKED</span>}
                                                </div>
                                                <span className="text-[9px] text-gray-500 block mt-0.5">Size: {p.size || 'Unknown'}</span>
                                              </div>
                                              <button
                                                onClick={() => {
                                                  if (!unlocked) return;
                                                  setSelectedPdf(p);
                                                }}
                                                className={\`px-3.5 py-1.5 font-bold text-[9px] uppercase rounded-lg flex items-center gap-1.5 transition-colors \${
                                                  unlocked 
                                                    ? 'bg-blue-600/20 border border-blue-500 text-white'
                                                    : 'bg-red-950/20 border border-red-900 text-red-400 cursor-not-allowed'
                                                }\`}
                                              >
                                                {unlocked ? <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>} 
                                                {unlocked ? 'View' : 'Locked'}
                                              </button>
                                            </div>
                                          </div>
                                        );
                                      })
                                    )}
                                  </div>
                                )}

                                {/* 3. Formulas & Tricks */}
                                {chapterTab === 'formulas' && (
                                  <div className="grid grid-cols-1 gap-3">
                                    {(!chapter.formulas || chapter.formulas.length === 0) ? (
                                      <p className="text-gray-500 italic py-6 text-center">No formulas sheet or shortcut tricks uploaded yet.</p>
                                    ) : (
                                      chapter.formulas.map(f => {
                                         return (
                                           <div key={f.id} className="p-4 bg-cyberdark/40 border border-white/5 rounded-xl space-y-2">
                                             <h5 className="text-gold font-bold text-xs border-b border-white/5 pb-1 flex items-center justify-between gap-1.5">
                                               <span className="flex items-center gap-1.5">
                                                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 fill-current text-gold"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg> {f.title}
                                               </span>
                                               {f.url && (
                                                 <button
                                                   onClick={() => setSelectedPdf({ id: \`formula-\${f.id}\`, url: f.url, title: f.title })}
                                                   className="px-2.5 py-1 text-[9px] font-bold uppercase rounded-lg flex items-center gap-1 bg-electric/10 text-electric border border-electric/20 hover:bg-electric/20"
                                                 >
                                                   📄 View File
                                                 </button>
                                               )}
                                             </h5>
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

`;

content = content.substring(0, startIdx) + replacement + content.substring(endIdx);
fs.writeFileSync('C:/Users/Admin/.gemini/antigravity/scratch/quantrexacadmy/src/pages/StudentDashboard.jsx', content);
console.log('Fixed block correctly');
