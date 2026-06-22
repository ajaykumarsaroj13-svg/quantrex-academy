import re, json
with open('public/data-script.js', encoding='utf-8') as f:
  content=f.read()
matches = re.findall(r'"id":"([^"]+)","chapterNumber":\d+,"title":"([^"]+)"', content)
print(matches[:5])
