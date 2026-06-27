const katex = require('katex');
try {
  katex.renderToString("\\begin{array}{|l|l|}\\hline\\text{Header} & \\text{Header2}\\\\\\hline\\text{\\textbf{(C)} } & \\text{(where } \\displaystyle [\\cdot] \\text{ represents)} \\\\\\hline\\end{array}", {throwOnError: true});
  console.log('Success');
} catch(e) {
  console.log('Error:', e.message);
}
