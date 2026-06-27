const fs = require('fs');
let p1 = 'src/components/ExamGoalPracticeInterface.jsx';
let code1 = fs.readFileSync(p1, 'utf8');
code1 = code1.replace(/\{isMultiCorrect && <div className="col-span-1 md:col-span-2 mb-2 text-\[14px\] font-bold text-\[#1976d2\] px-4 py-2\.5 bg-blue-50\/50 rounded-lg border border-blue-100 inline-block">One or More Than One Correct Option<\/div>\}/g, '');
code1 = code1.replace(/\{!isMultiCorrect && !isNumerical && !isSubjective && <div className="col-span-1 md:col-span-2 mb-2 text-\[14px\] font-bold text-\[#28a745\] px-4 py-2\.5 bg-green-50\/50 rounded-lg border border-green-100 inline-block">Single Correct Option<\/div>\}/g, '');
fs.writeFileSync(p1, code1);

let p2 = 'src/components/ExamGoalTestInterface.jsx';
let code2 = fs.readFileSync(p2, 'utf8');
code2 = code2.replace(/\{isMultiCorrect && <div className="mb-2 text-\[14px\] font-bold text-\[#1976d2\] px-4 py-2 bg-blue-50\/50 rounded border border-blue-100 inline-block">One or More Than One Correct Option<\/div>\}/g, '');
code2 = code2.replace(/\{!isMultiCorrect && !isNumerical && !isSubjective && <div className="mb-2 text-\[14px\] font-bold text-\[#28a745\] px-4 py-2 bg-green-50\/50 rounded border border-green-100 inline-block">Single Correct Option<\/div>\}/g, '');
fs.writeFileSync(p2, code2);
console.log("Patched sentences");
