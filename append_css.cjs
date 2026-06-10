const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

const newCSS = `
/* ─── Solution Box Styling ─── */
.nta-solution-box {
  margin-top: 25px;
  padding: 20px;
  background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%);
  border: 1px solid #d1d9e6;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #2c3e50;
  transition: all 0.3s ease;
}

.nta-solution-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 15px;
  color: #2980b9;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 2px solid #e1e8ed;
  padding-bottom: 8px;
}

.nta-solution-text {
  font-size: 1rem;
  line-height: 1.7;
  color: #34495e;
}

.nta-solution-text p {
  margin-bottom: 12px;
}

.nta-solution-text img {
  max-width: 100%;
  height: auto;
  border-radius: 6px;
  margin: 15px 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.nta-solution-text .MathJax {
  font-size: 1.1em !important;
}

/* Ensure instructions are clearly visible */
.nta-section-instruction {
  color: #111827 !important;
  line-height: 1.6;
  font-family: 'Inter', sans-serif;
}
.nta-section-instruction ul {
  margin-top: 8px;
  padding-left: 20px;
}
.nta-section-instruction li {
  margin-bottom: 6px;
}
`;

fs.writeFileSync('src/index.css', css + '\n' + newCSS);
console.log('CSS appended');
