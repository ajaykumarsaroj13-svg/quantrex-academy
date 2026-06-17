import json
content = open('public/data-script.js', 'r', encoding='utf-8').read()
json_str = content.split('window.DEFAULT_SYLLABUS = ')[1].split(';\nwindow.DEFAULT_TOPPERS')[0]
data = json.loads(json_str)
ch = data.get('jee-advanced', {}).get('subjects', {}).get('mathematics', {}).get('chapters', [])[0]
print(json.dumps(ch, indent=2))
