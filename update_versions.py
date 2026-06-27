import re

# Update Home.jsx
content = open('src/pages/Home.jsx', 'r', encoding='utf-8').read()
content = content.replace('v=new5', 'v=new6')
open('src/pages/Home.jsx', 'w', encoding='utf-8').write(content)

# Update data-script.js
content = open('public/data-script.js', 'r', encoding='utf-8').read()
content = content.replace('v=new5', 'v=new6')
open('public/data-script.js', 'w', encoding='utf-8').write(content)
