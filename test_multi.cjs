
const fs = require("fs");
const files = fs.readdirSync("public/data/questions").filter(f => f.startsWith("adv-"));
let total = 0;
let multi = 0;

for (const file of files) {
  const data = JSON.parse(fs.readFileSync(`public/data/questions/${file}`));
  for (const q of data) {
    if (!q.options || q.options.length === 0) continue;
    total++;
    
    const isSubjective = q.type === "SUBJECTIVE" || q.type === "subjective";
    const optionsToRender = (q.question && q.question.en && q.question.en.options && q.question.en.options.length > 0) ? q.question.en.options : (q.options || []);

    const isMultiCorrect = !isSubjective && (
        q.type === "MULTI_CORRECT" || 
        q.type === "multi_correct" || 
        q.type === "multiple_correct" || 
        q.type === "MCQM" || 
        q.type === "mcqm" || 
        q.type === "MCQ (Multiple Correct)" || 
        q.type === "Multiple Correct" || 
        (q.correctOptionsArray && q.correctOptionsArray.length > 0) || 
        q.isMultiCorrect || 
        (q.question && q.question.en && q.question.en.correct_options && q.question.en.correct_options.length > 1) ||
        (q.correctAnswer && (String(q.correctAnswer).includes(",") || String(q.correctAnswer).toLowerCase().includes("and") || String(q.correctAnswer).includes("&"))) ||
        Array.isArray(q.correctOptionIndex) ||
        (q.question && q.question.en && q.question.en.content && (
           q.question.en.content.toLowerCase().includes("one or more") ||
           q.question.en.content.toLowerCase().includes("multiple correct")
        )) ||
        (typeof q.question === "string" && (
           q.question.toLowerCase().includes("one or more") ||
           q.question.toLowerCase().includes("multiple correct")
        ))
    );
    if (isMultiCorrect) multi++;
  }
}
console.log(`Total MCQ questions: ${total}, Detected as Multi: ${multi}`);

