const fs = require('fs');
let code = fs.readFileSync('src/components/ChapterPYQDashboard.jsx', 'utf8');

// 1. Imports
if (!code.includes('BookmarkGroupModal')) {
  code = code.replace(
    /import \{ usePYQProgress \} from '\.\.\/hooks\/usePYQProgress';/,
    "import { usePYQProgress } from '../hooks/usePYQProgress';\nimport BookmarkGroupModal from './BookmarkGroupModal';"
  );
}

// 2. Destructure bookmarkGroups and add state
if (!code.includes('bookmarkModalOpen')) {
  code = code.replace(
    /const \{ progress, stats, updateProgress \} = usePYQProgress\(chapterId\);/,
    "const { progress, stats, updateProgress, bookmarkGroups, addBookmarkGroup } = usePYQProgress(chapterId);"
  );
  code = code.replace(
    /const \[activeTab, setActiveTab\] = useState\('topic'\);/,
    "const [activeTab, setActiveTab] = useState('topic');\n  const [bookmarkModalOpen, setBookmarkModalOpen] = useState(false);\n  const [bookmarkQuestionId, setBookmarkQuestionId] = useState(null);"
  );
}

// 3. Update bookmarkedQuestions derived state
code = code.replace(
  /const bookmarkedQuestions = allQuestions\.filter\(q => progress\[q\.id\]\?\.bookmarked\);/,
  `const bookmarkedQuestions = allQuestions.filter(q => progress[q.id]?.bookmarkGroups && progress[q.id]?.bookmarkGroups.length > 0);
  
  const questionsByGroup = {};
  bookmarkedQuestions.forEach(q => {
    (progress[q.id]?.bookmarkGroups || []).forEach(g => {
      if (!questionsByGroup[g]) questionsByGroup[g] = [];
      questionsByGroup[g].push(q);
    });
  });`
);

// 4. Update toggleBookmark to handleBookmarkClick
code = code.replace(
  /const toggleBookmark = \(qId\) => \{\s*updateProgress\(qId, \{ bookmarked: !progress\[qId\]\?\.bookmarked \}\);\s*\};/,
  `const handleBookmarkClick = (qId) => {
    setBookmarkQuestionId(qId);
    setBookmarkModalOpen(true);
  };\n\n  const saveBookmarkGroups = (groups) => {
    updateProgress(bookmarkQuestionId, { bookmarkGroups: groups });
  };`
);

// 5. Update renderQuestionItem's bookmark button
code = code.replace(
  /onClick=\{\(\) => toggleBookmark\(q\.id\)\}/g,
  'onClick={() => handleBookmarkClick(q.id)}'
);
code = code.replace(
  /className=\{\`\$\{progress\[q\.id\]\?\.bookmarked \? 'text-yellow-400' : 'text-gray-500 hover:text-white'\}\`\}/g,
  "className={`\\${(progress[q.id]?.bookmarkGroups && progress[q.id]?.bookmarkGroups.length > 0) ? 'text-yellow-400' : 'text-gray-500 hover:text-white'}`}"
);
code = code.replace(
  /fill=\{progress\[q\.id\]\?\.bookmarked \? 'currentColor' : 'none'\}/g,
  "fill={(progress[q.id]?.bookmarkGroups && progress[q.id]?.bookmarkGroups.length > 0) ? 'currentColor' : 'none'}"
);

// 6. Update More Tab to show Group-wise lists
const oldMoreTab = `                <h4 className="text-white font-bold mb-4 flex items-center gap-2"><Bookmark className="w-5 h-5 text-yellow-400" fill="currentColor"/> Bookmarked Questions</h4>
                {bookmarkedQuestions.length === 0 ? (
                  <p className="text-gray-500 text-sm">You haven't bookmarked any questions yet.</p>
                ) : (
                  <div className="space-y-4">
                    {bookmarkedQuestions.map((q, idx) => renderQuestionItem(q, idx))}
                  </div>
                )}`;

const newMoreTab = `                <h4 className="text-white font-bold mb-4 flex items-center gap-2"><Bookmark className="w-5 h-5 text-yellow-400" fill="currentColor"/> Bookmarked Questions</h4>
                {bookmarkedQuestions.length === 0 ? (
                  <p className="text-gray-500 text-sm">You haven't bookmarked any questions yet.</p>
                ) : (
                  <div className="space-y-8">
                    {Object.entries(questionsByGroup).map(([group, questions]) => (
                      <div key={group} className="space-y-4">
                        <h5 className="text-blue-400 font-bold border-b border-[#2d2d35] pb-2 flex items-center justify-between">
                          {group}
                          <span className="text-xs bg-blue-500/10 px-2 py-1 rounded text-blue-300">{questions.length} Qs</span>
                        </h5>
                        <div className="space-y-4 pl-2 border-l-2 border-[#2d2d35]">
                          {questions.map((q, idx) => renderQuestionItem(q, idx))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}`;
                
code = code.replace(oldMoreTab, newMoreTab);

// 7. Update Buckets
const oldBuckets = `             {[
               { id: '2026', title: '2026 Important Questions', desc: 'Questions from 2026 JEE Main shifts', count: allQuestions.filter(q=>q.year===2026).length, color: 'blue' },
               { id: '2025', title: '2025 Important Questions', desc: 'Questions from 2025 JEE Main shifts', count: allQuestions.filter(q=>q.year===2025).length, color: 'purple' },
               { id: '2024', title: '2024 Important Questions', desc: 'Questions from 2024 JEE Main shifts', count: allQuestions.filter(q=>q.year===2024).length, color: 'green' },
               { id: 'all_years', title: 'All Past Years', desc: 'Remaining important questions', count: allQuestions.filter(q=>q.year<2024).length, color: 'orange' }
             ].map(bucket => (`;

const newBuckets = `             {[
               { id: '2024', title: '2024 Important Questions', desc: 'Questions from 2024 JEE Main shifts', count: allQuestions.filter(q=>q.year===2024).length, color: 'blue' },
               { id: '2023', title: '2023 Important Questions', desc: 'Questions from 2023 JEE Main shifts', count: allQuestions.filter(q=>q.year===2023).length, color: 'purple' },
               { id: '2022', title: '2022 Important Questions', desc: 'Questions from 2022 JEE Main shifts', count: allQuestions.filter(q=>q.year===2022).length, color: 'green' },
               { id: '2021', title: '2021 Important Questions', desc: 'Questions from 2021 JEE Main shifts', count: allQuestions.filter(q=>q.year===2021).length, color: 'orange' },
               { id: '2020', title: '2020 Important Questions', desc: 'Questions from 2020 JEE Main shifts', count: allQuestions.filter(q=>q.year===2020).length, color: 'red' }
             ].map(bucket => (`;
             
code = code.replace(oldBuckets, newBuckets);

// 8. Update Bucket onClick filter logic
const oldFilter = `                        if (bucket.id === '2026') qs = allQuestions.filter(q=>q.year===2026);
                        if (bucket.id === '2025') qs = allQuestions.filter(q=>q.year===2025);
                        if (bucket.id === '2024') qs = allQuestions.filter(q=>q.year===2024);
                        if (bucket.id === 'all_years') qs = allQuestions.filter(q=>q.year<2024);`;

const newFilter = `                        if (bucket.id === '2024') qs = allQuestions.filter(q=>q.year===2024);
                        if (bucket.id === '2023') qs = allQuestions.filter(q=>q.year===2023);
                        if (bucket.id === '2022') qs = allQuestions.filter(q=>q.year===2022);
                        if (bucket.id === '2021') qs = allQuestions.filter(q=>q.year===2021);
                        if (bucket.id === '2020') qs = allQuestions.filter(q=>q.year===2020);`;

code = code.replace(oldFilter, newFilter);

// 9. Add modal rendering at the bottom
if (!code.includes('<BookmarkGroupModal')) {
  code = code.replace(
    /(\s*)<\/div>\s*<\/div>\s*\)\s*\}\s*export/g,
    `$1  <BookmarkGroupModal 
        isOpen={bookmarkModalOpen}
        onClose={() => setBookmarkModalOpen(false)}
        groups={bookmarkGroups}
        currentGroups={bookmarkQuestionId ? (progress[bookmarkQuestionId]?.bookmarkGroups || []) : []}
        onSave={saveBookmarkGroups}
        onCreateGroup={addBookmarkGroup}
      />\n    </div>\n  </div>\n  )\n}\nexport`
  );
}

fs.writeFileSync('src/components/ChapterPYQDashboard.jsx', code);
