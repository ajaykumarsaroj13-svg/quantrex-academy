const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf-8');
css = css.replace(/@import url\(.*?Caveat.*?\);/, "@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@500;600;700&family=Outfit:wght@400;500;600;700&display=swap');");
css = css.replace(/'Inter'/g, "'Outfit'");
fs.writeFileSync('src/index.css', css);
