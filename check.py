import re, json
with open('public/blackbook-script.js', encoding='utf-8') as f:
  content=f.read()
matches = re.findall(r'"id":"([^"]+)","chapterNumber":\d+,"title":"([^"]+)"', content)
print(matches)
