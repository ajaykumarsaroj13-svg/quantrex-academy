const fs = require('fs');
const path = require('path');

function search(dir, query) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      search(fullPath, query);
    } else if (file.endsWith('.js') || file.endsWith('.json') || file.endsWith('.jsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes(query)) {
        console.log(`Found in: ${fullPath}`);
      }
    }
  }
}

search(path.join(__dirname, 'public'), 'Sets and Relations');
search(path.join(__dirname, 'src'), 'Sets and Relations');
