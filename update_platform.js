const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/ExamGoalPlatform.jsx', 'utf8');

// Inject PYQ_DATABASE
code = code.replace(
  "import { PYQ_CHAPTERS, getPyqsByChapter } from '../utils/dummyPyqs';",
  "import PYQ_DATABASE, { PYQ_CHAPTERS, getPyqsByChapter } from '../utils/dummyPyqs';"
);

// Menu
code = code.replace(
  "const menuStructure = [",
  "const menuStructure = [\n    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },\n    { id: 'bookmarks', icon: Bookmark, label: 'Bookmarks' },"
);

// State
const state = `
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState([]);
  const [bookmarkGroups, setBookmarkGroups] = useState(['General']);
  const [selectedFolder, setSelectedFolder] = useState(null);

  useEffect(() => {
    if (activeMenu === 'bookmarks') {
      try {
        const saved = JSON.parse(localStorage.getItem('quantrex_bookmarks_v2') || '{}');
        const groups = JSON.parse(localStorage.getItem('quantrex_bookmark_groups') || '["General", "Hard Questions", "Needs Revision"]');
        setBookmarkGroups(groups);
        const bks = PYQ_DATABASE.filter(q => saved[q.id]);
        setBookmarkedQuestions(bks);
      } catch(e){}
    }
  }, [activeMenu]);
`;
code = code.replace("  const renderSidebarItem =", state + "\n  const renderSidebarItem =");

// Add Back Button to Chapter View
const backBtn = `
            <div className="flex items-center gap-4 mb-6">
              <button onClick={() => setSelectedChapter(null)} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-300" />
              </button>
              <h1 className="text-2xl font-bold text-white">{selectedChapter.name}</h1>
            </div>
`;
code = code.replace('<h1 className="text-2xl font-bold text-white">{selectedChapter.name}</h1>', backBtn);

// Import ArrowLeft
code = code.replace("Bookmark, ArrowRight", "Bookmark, ArrowRight, ArrowLeft, Folder");

// Add Bookmarks and Dashboard Render
const renderFuncs = `
  const renderDashboard = () => (
    <div className="p-8 animate-fade-in">
      <h2 className="text-3xl font-bold text-white mb-8">Your Progress Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="glass-panel p-6 rounded-2xl border-white/10 flex flex-col items-center justify-center">
          <Target className="w-10 h-10 text-blue-400 mb-3" />
          <div className="text-4xl font-bold text-white mb-1">1,240</div>
          <div className="text-sm text-gray-400">Total Attempted</div>
        </div>
        <div className="glass-panel p-6 rounded-2xl border-white/10 flex flex-col items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-400 mb-3" />
          <div className="text-4xl font-bold text-white mb-1">892</div>
          <div className="text-sm text-gray-400">Correct Answers</div>
        </div>
        <div className="glass-panel p-6 rounded-2xl border-white/10 flex flex-col items-center justify-center">
          <X className="w-10 h-10 text-red-400 mb-3" />
          <div className="text-4xl font-bold text-white mb-1">348</div>
          <div className="text-sm text-gray-400">Incorrect Answers</div>
        </div>
        <div className="glass-panel p-6 rounded-2xl border-white/10 flex flex-col items-center justify-center">
          <PieChart className="w-10 h-10 text-gold mb-3" />
          <div className="text-4xl font-bold text-white mb-1">71.9%</div>
          <div className="text-sm text-gray-400">Overall Accuracy</div>
        </div>
      </div>
      <div className="glass-panel p-8 rounded-3xl border-white/10">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <History className="w-5 h-5 text-electric" /> Recent Incorrect Questions
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-4 text-sm text-gray-400 font-bold">Date</th>
                <th className="p-4 text-sm text-gray-400 font-bold">Chapter</th>
                <th className="p-4 text-sm text-gray-400 font-bold">Year</th>
                <th className="p-4 text-sm text-gray-400 font-bold">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/5 hover:bg-white/5">
                <td className="p-4 text-sm text-gray-200">Today, 10:45 AM</td>
                <td className="p-4 text-sm text-gray-200">Trigonometric Equations</td>
                <td className="p-4 text-sm text-gray-200">JEE Main 2024</td>
                <td className="p-4 text-sm text-red-400 font-bold">Incorrect</td>
              </tr>
              <tr className="border-b border-white/5 hover:bg-white/5">
                <td className="p-4 text-sm text-gray-200">Yesterday</td>
                <td className="p-4 text-sm text-gray-200">Sets and Relations</td>
                <td className="p-4 text-sm text-gray-200">JEE Main 2021</td>
                <td className="p-4 text-sm text-red-400 font-bold">Incorrect</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderBookmarks = () => {
    if (!selectedFolder) {
      return (
        <div className="p-8 animate-fade-in">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <Bookmark className="w-8 h-8 text-gold" /> Bookmark Groups
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {bookmarkGroups.map(group => {
              const count = bookmarkedQuestions.filter(q => {
                const s = JSON.parse(localStorage.getItem('quantrex_bookmarks_v2') || '{}');
                return s[q.id] === group;
              }).length;
              
              return (
                <div key={group} onClick={() => setSelectedFolder(group)} className="glass-panel p-6 rounded-2xl border-white/10 hover:border-gold/50 cursor-pointer hover:bg-white/5 transition-all group flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gold/10 text-gold flex items-center justify-center group-hover:scale-110 transition-transform"><Folder className="w-8 h-8"/></div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{group}</h3>
                    <p className="text-gray-400 text-sm">{count} Questions</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    
    const folderQs = bookmarkedQuestions.filter(q => {
      const s = JSON.parse(localStorage.getItem('quantrex_bookmarks_v2') || '{}');
      return s[q.id] === selectedFolder;
    });

    return (
      <div className="p-8 animate-fade-in flex flex-col h-full overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between mb-8 shrink-0">
          <div className="flex items-center gap-4">
             <button onClick={() => setSelectedFolder(null)} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-300" />
              </button>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <Folder className="w-8 h-8 text-gold" /> {selectedFolder}
            </h2>
          </div>
          <button 
            onClick={() => onStartPractice({ title: selectedFolder + ' Practice', questions: folderQs, durationMinutes: 60 })}
            disabled={folderQs.length === 0}
            className="bg-gradient-to-r from-electric to-blue-600 hover:from-blue-500 hover:to-electric shadow-[0_0_15px_rgba(0,180,216,0.4)] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
          >
            <PlayCircle className="w-5 h-5" /> Practice Group
          </button>
        </div>
        
        {folderQs.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 pb-20">
            <p className="text-lg">No questions in this group.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
            {folderQs.map((q, i) => (
              <div key={q.id} className="glass-panel p-6 rounded-2xl border-white/10 hover:border-gold/50 transition-all flex flex-col min-h-[250px]">
                <div className="flex justify-between items-start mb-4">
                  <div className="text-xs font-mono text-gold bg-gold/10 px-2 py-1 rounded truncate max-w-[80%]">{q.chapterId.replace(/_/g, ' ')}</div>
                  <button onClick={() => {
                      const saved = JSON.parse(localStorage.getItem('quantrex_bookmarks_v2') || '{}');
                      delete saved[q.id];
                      localStorage.setItem('quantrex_bookmarks_v2', JSON.stringify(saved));
                      setBookmarkedQuestions(bookmarkedQuestions.filter(bq => bq.id !== q.id));
                    }} 
                    className="text-gray-400 hover:text-red-400 transition-colors" title="Remove Bookmark">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="text-gray-200 text-sm line-clamp-4 mb-6 flex-1 tex2jax_process whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: q.question }} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
`;

code = code.replace("{selectedChapter && (", renderFuncs + "\n        {activeMenu === 'dashboard' ? renderDashboard() : activeMenu === 'bookmarks' ? renderBookmarks() : selectedChapter ? (");

// Close the injected ternary logic at the very end
code = code.replace(
  "        {/* Placeholder for other tabs */}",
  "        ) : null}\n        {/* Placeholder for other tabs */}"
);

fs.writeFileSync('frontend/src/pages/ExamGoalPlatform.jsx', code);
console.log('Update Complete.');
