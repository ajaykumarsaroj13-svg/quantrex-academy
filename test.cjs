
const fs = require("fs");
const path = require("path");

const dir = "public/data/questions";
const files = fs.readdirSync(dir).filter(f => f.startsWith("adv-"));

let count = 0;
for (const file of files) {
  const data = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
  for (const q of data) {
    let text = "";
    if (q.question && q.question.en && q.question.en.content) text = q.question.en.content;
    else if (typeof q.question === "string") text = q.question;
    
    // Check if it is marked as SCQ but text implies multiple correct
    if (q.type === "SCQ" || q.type === "mcq") {
       if (text.toLowerCase().includes("is/are") || text.toLowerCase().includes("which of the following are") || text.toLowerCase().includes("correct options")) {
          // See if there is any indication of multi correct
          let hasMulti = false;
          if (q.correctAnswer && String(q.correctAnswer).includes(",")) hasMulti = true;
          if (q.question && q.question.en && q.question.en.correct_options && q.question.en.correct_options.length > 1) hasMulti = true;
          if (q.correctOptionsArray && q.correctOptionsArray.length > 1) hasMulti = true;
          
          if (!hasMulti) {
              console.log(file, q.question_id, "Type:", q.type, "Correct:", q.correctAnswer || (q.question && q.question.en ? q.question.en.correct_options : null));
              count++;
          }
       }
    }
  }
}
console.log("Total suspicious:", count);

