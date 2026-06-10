const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

css += `\n
/* ========================================================================= */
/* WATERMARK REMOVER (THRESHOLDING FILTER)                                   */
/* ========================================================================= */
/* This filter targets ExamGoal images specifically.                         */
/* It uses high contrast and brightness to push faint watermarks to pure     */
/* white, effectively erasing them, while keeping the main text/lines black. */
img[src*="examgoal.net"] {
  filter: grayscale(100%) contrast(400%) brightness(120%) !important;
  mix-blend-mode: multiply !important;
  background-color: transparent !important;
}
`;

fs.writeFileSync('src/index.css', css);
console.log('Appended watermark remover CSS');
