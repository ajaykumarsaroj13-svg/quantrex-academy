const fs = require('fs');
let data = fs.readFileSync('index.html', 'utf8');
data = data.replace('</head>', '  <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&family=Kalam:wght@300;400;700&display=swap" rel="stylesheet">\n</head>');
fs.writeFileSync('index.html', data);
