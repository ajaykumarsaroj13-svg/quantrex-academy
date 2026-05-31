const fs = require('fs');
let serverCode = fs.readFileSync('backend/server.js', 'utf8');

const importStatement = `import { initializePyqDb, seedPyqDb, getChapters, getPyqs } from './sqlite_pyq_db.js';`;
serverCode = serverCode.replace("import { paymentRouter } from './routes/paymentRoute.js';", "import { paymentRouter } from './routes/paymentRoute.js';\n" + importStatement);

const initStatement = `
// Initialize SQLite for PYQs
initializePyqDb().then(() => {
  seedPyqDb();
}).catch(console.error);

// PYQ API Routes
app.get('/api/pyqs/chapters', async (req, res) => {
  try {
    const chapters = await getChapters();
    res.json(chapters);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/pyqs/questions', async (req, res) => {
  try {
    const { chapterId } = req.query;
    if (!chapterId) return res.status(400).json({ error: 'chapterId required' });
    const qs = await getPyqs(chapterId);
    res.json(qs);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});
`;

serverCode = serverCode.replace('const app = express();', 'const app = express();\n' + initStatement);

fs.writeFileSync('backend/server.js', serverCode);
console.log('server.js updated with PYQ routes and initialization');
