import re

with open('src/pages/TestSeriesPage.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

replacement = """
      {/* Grid */}
      <div className="max-w-7xl mx-auto">
        {activeTab === 'NDA' && !activeNdaFolder ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-10">
            <div onClick={() => setActiveNdaFolder('Mathematics')} className="bg-cyberdark border border-white/10 rounded-2xl p-8 hover:border-blue-500 hover:-translate-y-2 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[200px]">
              <div className="bg-blue-500/20 p-4 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-1.22-1.82A2 2 0 0 0 8.53 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"></path></svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Mathematics</h2>
              <p className="text-gray-400">{tests.filter(t => t.examType === 'NDA' && t.id && t.id.includes('math')).length} Tests</p>
            </div>
            
            <div onClick={() => setActiveNdaFolder('General Ability')} className="bg-cyberdark border border-white/10 rounded-2xl p-8 hover:border-purple-500 hover:-translate-y-2 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[200px]">
              <div className="bg-purple-500/20 p-4 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-1.22-1.82A2 2 0 0 0 8.53 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"></path></svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">General Ability</h2>
              <p className="text-gray-400">{tests.filter(t => t.examType === 'NDA' && t.id && t.id.includes('gat')).length} Tests</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? ("""

content = content.replace('      {/* Grid */}\n      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">\n        {loading ? (', replacement)

end_replacement = """                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        )}
      </div>"""

content = content.replace('                  </button>\n                </div>\n              </div>\n            ))\n          )}\n        </div>', end_replacement)

with open('src/pages/TestSeriesPage.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
