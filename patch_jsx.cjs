const fs = require('fs');
let code = fs.readFileSync('src/pages/TestSeriesExam.jsx', 'utf8');

// Replace option text rendering
const oldOptRender = `<div className="nta-option-text tex2jax_process" dangerouslySetInnerHTML={{ __html: opt }} />`;
const newOptRender = `<div className="nta-option-text tex2jax_process">
                      {isCorrect && <style>{\`#opt-\${idx} * { color: #064e3b !important; fill: #064e3b !important; font-weight: bold !important; }\`}</style>}
                      {isWrong && <style>{\`#opt-\${idx} * { color: #7f1d1d !important; fill: #7f1d1d !important; font-weight: bold !important; }\`}</style>}
                      <div id={\`opt-\${idx}\`} dangerouslySetInnerHTML={{ __html: opt }} />
                    </div>`;
code = code.replace(oldOptRender, newOptRender);

// Replace solution text rendering
const oldSolRender = `<div 
                className="nta-solution-text tex2jax_process" 
                style={{ 
                  color: '#1e293b', 
                  fontSize: '16px', 
                  lineHeight: '1.8',
                  overflowX: 'auto'
                }} 
                dangerouslySetInnerHTML={{ __html: question.solution }} 
              />`;
const newSolRender = `<div 
                className="nta-solution-text tex2jax_process" 
                style={{ 
                  color: '#1e293b', 
                  fontSize: '16px', 
                  lineHeight: '1.8',
                  overflowX: 'auto'
                }} 
              >
                <style>{\`#nta-sol-content * { color: #0f172a !important; fill: #0f172a !important; font-weight: 600 !important; }\`}</style>
                <div id="nta-sol-content" dangerouslySetInnerHTML={{ __html: question.solution }} />
              </div>`;
code = code.replace(oldSolRender, newSolRender);

fs.writeFileSync('src/pages/TestSeriesExam.jsx', code);
console.log('Replaced JSX code');
