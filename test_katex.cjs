const katex = require('katex');
try {
  katex.renderToString("\\text{ \\textit{(where } \\displaystyle [\\cdot] \\text{ represents greatest integer function)}}", {throwOnError: true});
  console.log('Success');
} catch(e) {
  console.log('Error:', e.message);
}
