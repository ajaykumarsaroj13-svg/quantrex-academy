const fs = require('fs');
let lines = fs.readFileSync('C:/Users/Admin/.gemini/antigravity/scratch/quantrexacadmy/src/pages/StudentDashboard.jsx', 'utf8').split('\n');

const replacement = `                                          </div>
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
                                )}`;

const startLineIndex = 346; // Line 347 (0-indexed 346), where <PdfViewer starts
const endLineIndex = lines.findIndex((l, i) => i > startLineIndex && l.includes('{/* 4. PYQs Tab */}'));

if (startLineIndex === -1 || endLineIndex === -1) {
  console.log('Failed to find indices');
  process.exit(1);
}

lines.splice(startLineIndex, endLineIndex - startLineIndex, replacement);
fs.writeFileSync('C:/Users/Admin/.gemini/antigravity/scratch/quantrexacadmy/src/pages/StudentDashboard.jsx', lines.join('\n'));
console.log('Fixed block via splice');
