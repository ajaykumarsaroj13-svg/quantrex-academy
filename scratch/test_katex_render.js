import katex from 'katex';

const text = '<table class="w-full"><tr><td>**(A)** $x^2 + y^2 = r^2$</td></tr></table>';

function renderMathInText(text) {
  if (!text) return '';
  
  let remaining = String(text);
  let html = '';
  
  while (remaining.length > 0) {
    const displayStart = remaining.indexOf('$$');
    const inlineStart = remaining.indexOf('$');
    
    if (inlineStart === -1) {
      html += remaining;
      break;
    }
    
    const isDisplay = displayStart === inlineStart;
    
    if (inlineStart > 0) {
      html += remaining.slice(0, inlineStart);
      remaining = remaining.slice(inlineStart);
      continue;
    }
    
    // We are at the start of a math block
    if (isDisplay && remaining.startsWith('$$')) {
      const end = remaining.indexOf('$$', 2);
      if (end === -1) {
        html += remaining;
        break;
      }
      const mathStr = remaining.slice(2, end);
      try {
        const mathHtml = katex.renderToString(mathStr, { displayMode: true, throwOnError: false });
        html += `<span class="inline-block my-1">${mathHtml}</span>`;
      } catch (e) {
        html += `<span class="text-red-500 font-mono text-sm">${mathStr}</span>`;
      }
      remaining = remaining.slice(end + 2);
    } else if (remaining.startsWith('$')) {
      const end = remaining.indexOf('$', 1);
      if (end === -1) {
        html += remaining;
        break;
      }
      const mathStr = remaining.slice(1, end);
      try {
        const mathHtml = katex.renderToString(mathStr, { displayMode: false, throwOnError: false });
        html += mathHtml;
      } catch (e) {
        html += `<span class="text-red-500 font-mono text-sm">${mathStr}</span>`;
      }
      remaining = remaining.slice(end + 1);
    } else {
      html += remaining[0];
      remaining = remaining.slice(1);
    }
  }
  
  return html;
}

const output = renderMathInText(text);
console.log('Result html length:', output.length);
console.log('Includes HTML table:', output.includes('<table'));
console.log('Includes KaTeX span:', output.includes('katex'));
