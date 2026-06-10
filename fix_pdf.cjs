const fs = require('fs');
let content = fs.readFileSync('C:/Users/Admin/.gemini/antigravity/scratch/quantrexacadmy/src/pages/StudentDashboard.jsx', 'utf8');

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
                                                {unlocked ? <FileText className="h-3.5 w-3.5" /> : <Lock className="h-3 w-3" />} 
                                                {unlocked ? 'View' : 'Locked'}
                                              </button>
                                            </div>
                                          </div>
                                        );
                                      })
                                    )}
                                  </div>
                                )}`;

const search = `                                              {unlocked ? <PlayCircle className="h-3.5 w-3.5" /> : <Lock className="h-3 w-3" />} 
                                              {unlocked ? 'Play' : 'Locked'}
                                            </button>
                                                 <PdfViewer
                                                   pdfUrl={p.url}
                                                   pdfTitle={p.title}
                                                   studentInfo={user}
                                                 />
                                               </div>
                                             )}
                                          </div>
                                        );
                                      })
                                    )}
                                  </div>
                                )}`;

content = content.replace(search, replacement);
fs.writeFileSync('C:/Users/Admin/.gemini/antigravity/scratch/quantrexacadmy/src/pages/StudentDashboard.jsx', content);
console.log('Fixed PDF tab');
