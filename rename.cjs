const fs = require('fs');
fs.renameSync('public/blackbook-data-v2.js', 'public/blackbook-data-v3.js');
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/blackbook-data-v2\.js(\?v=\d+)?/g, 'blackbook-data-v3.js?v=' + Date.now());
fs.writeFileSync('index.html', html);

const vercelJson = {
  "headers": [
    {
      "source": "/(.*\\.js)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    }
  ]
};
fs.writeFileSync('vercel.json', JSON.stringify(vercelJson, null, 2));
console.log('Fixed cache busting by renaming to v3 and adding vercel.json');
