const fs = require('fs');
const path = 'C:/Users/Admin/.gemini/antigravity/scratch/quantrexacadmy/src/pages/StudentDashboard.jsx';
const lines = fs.readFileSync(path, 'utf8').split('\n');

let startIndex = lines.findIndex(l => l.includes('Start JEE Mock Exam'));
let endIndex = lines.findIndex(l => l.includes('LIVE CLASSES TAB'));

const top = lines.slice(0, startIndex + 1);
const bottom = lines.slice(endIndex - 1); // keep the empty line above it maybe

const middle = [
'                                            </button>',
'                                          )}',
'                                        </div>',
'                                      ))',
'                                    )}',
'                                  </div>',
'                                )}',
'                              </div>',
'                            </div>',
'                          );',
'                        })()',
'                      ) : (',
'                        <div className="flex flex-col items-center justify-center p-12 bg-obsidian/30 border border-white/5 rounded-2xl min-h-[40vh] text-center space-y-3">',
'                          <div className="h-12 w-12 bg-white/5 rounded-full flex items-center justify-center text-gray-500">',
'                            <BookOpen className="h-5 w-5" />',
'                          </div>',
'                          <p className="text-xs text-gray-500 font-mono">Select a chapter from the left menu to view contents.</p>',
'                        </div>',
'                      )}',
'                    </div>',
'                  </div>',
'              </div>',
'            )}'
];

fs.writeFileSync(path, [...top, ...middle, ...bottom].join('\n'));
console.log('Fixed! Top:', top.length, 'Middle:', middle.length, 'Bottom:', bottom.length);
