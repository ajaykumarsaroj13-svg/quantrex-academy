import re

content = open('src/pages/Home.jsx', 'r', encoding='utf-8').read()
content = content.replace('v=new6', 'v=new7')
open('src/pages/Home.jsx', 'w', encoding='utf-8').write(content)

content = open('src/App.jsx', 'r', encoding='utf-8').read()
content = content.replace("localStorage.getItem('quantrex_toppers_v6')", "localStorage.getItem('quantrex_toppers_v7')")
content = content.replace("localStorage.getItem('quantrex_toppers_v5')", "localStorage.getItem('quantrex_toppers_v6')") # Wait!
# Actually, let's just do a clean replace using regex
