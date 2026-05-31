const fs = require('fs');

let dbCode = fs.readFileSync('backend/sqlite_pyq_db.js', 'utf8');
dbCode += `
export async function searchPyqsByChapterTitle(title) {
  const db = await getDb();
  const targetId = title.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '');
  const words = targetId.split('_').filter(w => w.length > 3);
  if (words.length === 0) return [];
  
  let query = 'SELECT * FROM pyqs WHERE ';
  const conditions = [];
  const params = [];
  for (const w of words) {
    conditions.push('chapterId LIKE ?');
    params.push(\`%\${w}%\`);
  }
  query += conditions.join(' OR ');
  
  const rows = await db.all(query, params);
  return rows.map(r => ({ ...r, options: JSON.parse(r.options) }));
}
`;
fs.writeFileSync('backend/sqlite_pyq_db.js', dbCode);
console.log('Updated sqlite_pyq_db.js');

let serverCode = fs.readFileSync('backend/server.js', 'utf8');
serverCode = serverCode.replace(
  "import { initializePyqDb, seedPyqDb, getChapters, getPyqs } from './sqlite_pyq_db.js';",
  "import { initializePyqDb, seedPyqDb, getChapters, getPyqs, searchPyqsByChapterTitle } from './sqlite_pyq_db.js';"
);

const searchRoute = `
app.get('/api/pyqs/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'q required' });
    const qs = await searchPyqsByChapterTitle(q);
    res.json(qs);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});
`;

serverCode = serverCode.replace("app.get('/api/pyqs/questions', async (req, res) => {", searchRoute + "\napp.get('/api/pyqs/questions', async (req, res) => {");
fs.writeFileSync('backend/server.js', serverCode);
console.log('Updated server.js');
