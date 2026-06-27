import re

content = open('src/App.jsx', 'r', encoding='utf-8').read()
content = content.replace('const CACHE_VERSION = \"v8\";', 'const CACHE_VERSION = \"v9\";')
content = content.replace('if (cacheVersion !== \"v8\")', 'if (cacheVersion !== \"v9\")')
content = content.replace('localStorage.setItem(\"quantrex_cache_version\", \"v8\");', 'localStorage.setItem(\"quantrex_cache_version\", \"v9\");')
open('src/App.jsx', 'w', encoding='utf-8').write(content)
