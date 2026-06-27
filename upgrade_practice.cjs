const fs = require('fs');

let code = fs.readFileSync('src/components/ExamGoalPracticeInterface.jsx', 'utf8');

// 1. Import Timer icon
if (!code.includes('Timer')) {
  code = code.replace(
    /import \{ ArrowLeft, CheckCircle2, XCircle, AlertTriangle, ChevronRight, ChevronLeft \} from 'lucide-react';/,
    "import { ArrowLeft, CheckCircle2, XCircle, AlertTriangle, ChevronRight, ChevronLeft, Timer, Clock } from 'lucide-react';"
  );
}

// 2. Format timer helper
if (!code.includes('formatTimeStr')) {
  code = code.replace(
    /const currentQuestion = questions\[currentQuestionIndex\];/,
    "const currentQuestion = questions[currentQuestionIndex];\n  const formatTimeStr = (seconds) => { const m = Math.floor(seconds / 60); const s = seconds % 60; return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`; };"
  );
}

// 3. Add visual timer to Question header
const oldHeader = `<div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
              <span className="text-[13px] font-bold text-[#1976d2] uppercase tracking-wider bg-[#e3f2fd] px-3 py-1 rounded-full">
                Single Choice
              </span>
              <span className="text-[12px] font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                Q {currentQuestionIndex + 1} of {questions.length}
              </span>
            </div>`;

const newHeader = `<div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
              <span className="text-[13px] font-bold text-[#1976d2] uppercase tracking-wider bg-[#e3f2fd] px-3 py-1 rounded-full">
                Single Choice
              </span>
              <div className="flex items-center gap-3">
                <div className={\`flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-sm font-bold shadow-sm border \${isAnswerChecked ? 'bg-gray-100 text-gray-500 border-gray-200' : 'bg-gradient-to-r from-blue-50 to-indigo-50 text-indigo-700 border-indigo-100 animate-pulse'}\`}>
                  <Timer className="w-4 h-4" />
                  {formatTimeStr(timeSpent)}
                </div>
                <span className="text-[12px] font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  Q {currentQuestionIndex + 1} of {questions.length}
                </span>
              </div>
            </div>`;

code = code.replace(oldHeader, newHeader);

// 4. Modernize Option styling
const oldOptionsStart = `<div className="space-y-3">
              {isNumerical ? (`;

const newOptionsStart = `<div className="space-y-4">
              {isNumerical ? (`;

code = code.replace(oldOptionsStart, newOptionsStart);

const oldOptionLabel = `<label 
                    key={idx}
                    className={\`flex items-start gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer \${boxClass}\`}
                  >`;

const newOptionLabel = `<label 
                    key={idx}
                    className={\`flex items-start gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer shadow-sm hover:shadow-md \${boxClass}\`}
                  >`;

code = code.replace(oldOptionLabel, newOptionLabel);

// 5. General Layout Tweaks
code = code.replace(
  /bg-white flex flex-col overflow-hidden relative/g,
  'bg-[#fafafa] flex flex-col overflow-hidden relative'
);

code = code.replace(
  /bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden/g,
  'bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden'
);

code = code.replace(
  /text-\[15px\] text-gray-800 leading-\[1.8\] font-medium exam-math-content/g,
  'text-[16px] text-gray-800 leading-[1.8] font-medium exam-math-content tracking-wide'
);

fs.writeFileSync('src/components/ExamGoalPracticeInterface.jsx', code);
console.log('Practice Interface upgraded');
