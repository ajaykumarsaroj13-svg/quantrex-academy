const fs = require('fs');
const file = './src/utils/blackBookChap1.json';
if (!fs.existsSync(file)) return;
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

let updated = false;

data.forEach(ch => {
  ch.questions.forEach(q => {
    if (q.questionType === 'MATCH THE COLUMN' && q.text && !q.text.includes('<table')) {
      let t = q.text;
      t = t.replace('Match Column-I with Column-II. ', '');
      if (t.includes('Column-II:')) {
        let [col1Str, col2Str] = t.split('Column-II:');
        col1Str = col1Str.replace('Column-I:', '').trim();
        col2Str = col2Str.trim();
        
        // Split by (A), (B), (C), (D)
        const col1Parts = col1Str.split(/(?=\([A-Z]\))/).map(s => s.trim().replace(/;$/, ''));
        const col2Parts = col2Str.split(/(?=\([P-Z]\))/).map(s => s.trim().replace(/;$/, '').replace(/\.$/, ''));
        
        let html = '<div class=\"overflow-x-auto my-4\"><table class=\"min-w-full border-collapse border border-gray-300 dark:border-gray-700 text-sm\">\n';
        html += '<thead class=\"bg-gray-50 dark:bg-gray-800\"><tr><th class=\"border border-gray-300 dark:border-gray-700 px-4 py-2 font-bold text-center\">Column-I</th><th class=\"border border-gray-300 dark:border-gray-700 px-4 py-2 font-bold text-center\">Column-II</th></tr></thead>\n';
        html += '<tbody>\n';
        
        const maxRows = Math.max(col1Parts.length, col2Parts.length);
        for (let i = 0; i < maxRows; i++) {
          const c1 = col1Parts[i] || '';
          const c2 = col2Parts[i] || '';
          html += '<tr><td class=\"border border-gray-300 dark:border-gray-700 px-4 py-3\">' + c1 + '</td><td class=\"border border-gray-300 dark:border-gray-700 px-4 py-3\">' + c2 + '</td></tr>\n';
        }
        
        html += '</tbody></table></div>';
        
        q.text = html;
        updated = true;
      }
    }
  });
});

if (updated) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  console.log('Updated formatting for Match the Column questions in Chap1.');
} else {
  console.log('No updates needed in Chap1.');
}
