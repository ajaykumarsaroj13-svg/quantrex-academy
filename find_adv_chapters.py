import json

content = open('public/data-script.js', 'r', encoding='utf-8').read()
try:
    json_str = content.split('window.DEFAULT_SYLLABUS = ')[1].split(';\nwindow.DEFAULT_TOPPERS')[0]
    data = json.loads(json_str)
    adv_math_chapters = data.get('jee-advanced', {}).get('subjects', {}).get('mathematics', {}).get('chapters', [])
    print(f"Found {len(adv_math_chapters)} chapters for JEE Advanced Math.")
    for ch in adv_math_chapters:
        print(f" - {ch.get('title')}")
except Exception as e:
    print(f"Error parsing: {e}")
