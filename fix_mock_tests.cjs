const fs = require('fs');
let lines = fs.readFileSync('C:/Users/Admin/.gemini/antigravity/scratch/quantrexacadmy/src/pages/StudentDashboard.jsx', 'utf8').split('\n');

const replacement = `                                {/* 5. Mock Tests */}
                                {chapterTab === 'mockTests' && (
                                  <div className="space-y-2">
                                    {(!chapter.mockTests || chapter.mockTests.length === 0) ? (
                                      <p className="text-gray-500 italic py-6 text-center">No mock exams uploaded yet.</p>
                                    ) : (
                                      chapter.mockTests.map(t => (
                                        <div key={t.id} className="p-4 bg-cyberdark/60 border border-white/5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                                          <div className="space-y-1">
                                            <h5 className="text-white font-bold text-xs">{t.title}</h5>
                                            <span className="text-[9px] text-gray-500 block">
                                              Duration: {t.durationMinutes} minutes • Type: {t.type === 'link' ? 'AI Quiz Embed Link' : 'Quantrex JEE Pattern'}
                                            </span>
                                          </div>
                                          {t.type === 'link' ? (
                                            <a
                                              href={t.linkUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="px-4 py-2 bg-gradient-to-r from-gold to-yellow-600 text-obsidian font-bold text-[9px] uppercase rounded-lg hover:shadow-lg transition-all"
                                            >
                                              Take External AI Quiz
                                            </a>
                                          ) : (
                                            <button
                                              onClick={() => handleLaunchTest(t)}
                                              className="px-4 py-2 bg-electric hover:bg-cyan-400 text-obsidian font-bold text-[9px] uppercase rounded-lg shadow-md hover:shadow-cyan-500/10 transition-colors"
                                            >
                                              Start JEE Mock Exam
                                            </button>
                                          )}
                                        </div>
                                      ))
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })()
                      ) : (`;

const startLineIndex = lines.findIndex(l => l.includes('{/* 5. Mock Tests */}'));
const endLineIndex = lines.findIndex((l, i) => i > startLineIndex && l.includes('</div>') && lines[i+1]?.includes('</div>') && lines[i+2]?.includes(');') && lines[i+3]?.includes('})()') && lines[i+4]?.includes(') : ('));

if (startLineIndex === -1 || endLineIndex === -1) {
  console.log('Failed to find indices', startLineIndex, endLineIndex);
  process.exit(1);
}

lines.splice(startLineIndex, (endLineIndex - startLineIndex) + 5, replacement);
fs.writeFileSync('C:/Users/Admin/.gemini/antigravity/scratch/quantrexacadmy/src/pages/StudentDashboard.jsx', lines.join('\n'));
console.log('Fixed mock tests');
