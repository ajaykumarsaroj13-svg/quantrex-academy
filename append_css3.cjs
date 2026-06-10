const fs = require('fs');
const css = fs.readFileSync('src/index.css', 'utf8');

const newCSS = `
/* Additional fixes for flex and mathjax */
.nta-solution-box {
  flex-shrink: 0 !important;
  min-height: min-content !important;
  padding-bottom: 40px !important; /* Ensure enough space at bottom */
}

.nta-question-panel {
  padding-bottom: 50px !important; /* Extra scroll space */
}

.nta-option.correct, .nta-option.correct *, .nta-option.correct .MathJax, .nta-option.correct mjx-container {
  color: #064e3b !important;
  fill: #064e3b !important;
}

.nta-option.wrong, .nta-option.wrong *, .nta-option.wrong .MathJax, .nta-option.wrong mjx-container {
  color: #7f1d1d !important;
  fill: #7f1d1d !important;
}

.nta-solution-text, .nta-solution-text *, .nta-solution-text .MathJax, .nta-solution-text mjx-container {
  color: #0f172a !important;
  fill: #0f172a !important;
}
`;
fs.writeFileSync('src/index.css', css + '\n' + newCSS);
console.log('Appended to index.css');
