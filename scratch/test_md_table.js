function convertMarkdownTableToHtml(text) {
  const lines = text.split('\n');
  let inTable = false;
  let htmlLines = [];
  let tableHeader = true;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('|') && line.endsWith('|')) {
      if (!inTable) {
        inTable = true;
        htmlLines.push('<table class="w-full text-left border-collapse border border-gray-300 mt-4 mb-4 text-sm"><tbody>');
        tableHeader = true;
      }
      
      // Skip separator line (e.g. |---|---|)
      if (line.includes('---') || line.includes('- - -')) {
        tableHeader = false;
        continue;
      }
      
      const cells = line.split('|').map(c => c.trim()).filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
      
      htmlLines.push('<tr>');
      cells.forEach(cell => {
        const tag = tableHeader ? 'th' : 'td';
        const classes = tableHeader 
          ? 'border border-gray-300 p-2 bg-gray-100 font-bold' 
          : 'border border-gray-300 p-2';
        htmlLines.push(`<${tag} class="${classes}">${cell}</${tag}>`);
      });
      htmlLines.push('</tr>');
      tableHeader = false; // only the first row is header
    } else {
      if (inTable) {
        inTable = false;
        htmlLines.push('</tbody></table>');
      }
      htmlLines.push(lines[i]);
    }
  }
  if (inTable) {
    htmlLines.push('</tbody></table>');
  }
  return htmlLines.join('\n');
}

const md = `Match the following columns:

| Column-I | Column-II |
|---|---|
| (A) $f(x) = \\sin^2 2x$ | (P) Range is $[0, 1]$ |`;

const html = convertMarkdownTableToHtml(md);
console.log(html);
