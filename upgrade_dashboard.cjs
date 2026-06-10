const fs = require('fs');

let code = fs.readFileSync('src/components/ChapterPYQDashboard.jsx', 'utf8');

// 1. Upgrade Top Stats Bar
code = code.replace(
  /className="bg-\[#1e1e24\] p-4 rounded-xl border border-\[#2d2d35\]"/g,
  'className="bg-gradient-to-br from-[#1e1e24] to-[#25252b] p-4 rounded-xl border border-white/5 shadow-lg relative overflow-hidden"'
);

code = code.replace(
  /className="bg-\[#1e1e24\] p-4 rounded-xl border border-\[#2d2d35\] border-l-4 border-l-(green|red|blue|purple|orange|yellow)-500"/g,
  'className="bg-gradient-to-br from-[#1e1e24] to-[#25252b] p-4 rounded-xl border border-white/5 shadow-lg relative overflow-hidden border-l-4 border-l-$1-500"'
);

// 2. Upgrade Bucket Cards
code = code.replace(
  /className={`p-6 rounded-xl border text-left transition-all overflow-hidden relative group/g,
  'className={`p-6 rounded-xl border text-left transition-all overflow-hidden relative group shadow-md hover:shadow-xl hover:-translate-y-1'
);

// 3. Upgrade Topic Cards
code = code.replace(
  /className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"/g,
  'className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"'
);

// 4. Upgrade Buttons
code = code.replace(
  /bg-blue-500 hover:bg-blue-600 text-white/g,
  'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md hover:shadow-blue-500/25'
);
code = code.replace(
  /border-orange-200 text-orange-500 hover:bg-orange-50/g,
  'border-orange-200 text-orange-500 hover:bg-orange-50 hover:text-orange-600 transition-colors shadow-sm'
);

fs.writeFileSync('src/components/ChapterPYQDashboard.jsx', code);
console.log('Dashboard upgraded');
