const fs = require('fs');
let code = fs.readFileSync('src/pages/TestSeriesExam.jsx', 'utf-8');
const search = '<div className="flex gap-2 mb-4">';
const replace = `<div className="flex flex-wrap gap-2 mb-4">
              {(question.shift || question.title || question.year) && (
                <span className="px-2 py-0.5 bg-[#e8f5e9] text-[#2e7d32] text-xs font-bold rounded border border-green-200">
                  {question.shift || question.title || question.year}
                </span>
              )}`;
code = code.replace(search, replace);
fs.writeFileSync('src/pages/TestSeriesExam.jsx', code);
