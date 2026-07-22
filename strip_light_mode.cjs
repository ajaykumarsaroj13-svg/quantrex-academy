const fs = require('fs');

const cssPath = 'c:\\Users\\Admin\\.gemini\\antigravity\\scratch\\project_ajay2\\quantrex-academy\\src\\index.css';
let css = fs.readFileSync(cssPath, 'utf8');

// Strip out any block where the selector contains '.light'
// A basic approach: match selectors and blocks
const regex = /([^{}]*html\.light[^{}]*)\{([^}]*)\}/g;
css = css.replace(regex, '');

fs.writeFileSync(cssPath, css);
console.log('Stripped light mode from index.css');
