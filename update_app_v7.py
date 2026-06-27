import re

content = open('src/App.jsx', 'r', encoding='utf-8').read()

# Replace all quantrex_toppers_vX with quantrex_toppers_v7
# For the cache removal part:
content = re.sub(r"localStorage\.removeItem\('quantrex_toppers_v\d+'\);", "localStorage.removeItem('quantrex_toppers_v6');", content)

content = re.sub(r"localStorage\.getItem\('quantrex_toppers_v\d+'\)", "localStorage.getItem('quantrex_toppers_v7')", content)
content = re.sub(r"localStorage\.setItem\('quantrex_toppers_v\d+'", "localStorage.setItem('quantrex_toppers_v7'", content)

open('src/App.jsx', 'w', encoding='utf-8').write(content)
