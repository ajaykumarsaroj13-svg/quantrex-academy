const fs = require('fs');
const css = fs.readFileSync('src/index.css', 'utf8');

const newCSS = `
/* User Fixes */
.nta-solution-text, .nta-solution-text * {
  color: #0f172a !important;
}
.nta-solution-text img {
  filter: contrast(1.1);
  position: relative;
}

/* Watermark */
.nta-solution-box {
  position: relative;
  overflow: hidden;
}
.nta-solution-box::before {
  content: 'Quantrex Academy';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-25deg);
  font-size: 5rem;
  font-weight: 900;
  color: rgba(0, 0, 0, 0.04);
  pointer-events: none;
  z-index: 1;
  white-space: nowrap;
}

.nta-check-answer-wrap {
  display: flex !important;
  justify-content: center !important;
  width: 100% !important;
  margin-top: 20px;
}
.nta-check-answer-btn {
  margin: 0 auto !important;
}

.nta-option.correct {
  background-color: #d1fae5 !important;
  border-color: #10b981 !important;
  color: #064e3b !important;
}
.nta-option.correct * {
  color: #064e3b !important;
}
.nta-option.wrong {
  background-color: #fee2e2 !important;
  border-color: #ef4444 !important;
  color: #7f1d1d !important;
}
.nta-option.wrong * {
  color: #7f1d1d !important;
}
`;
fs.writeFileSync('src/index.css', css + '\n' + newCSS);
console.log('Appended to index.css');
