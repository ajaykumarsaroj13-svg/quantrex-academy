import re

path = r'C:\Users\Admin\.gemini\antigravity\scratch\quantrexacadmy\src\utils\syllabusData.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

new_chapter = '''          {
            "id": "jee_main_math_progression_series",
            "title": "Sequences and Series",
            "url": "#",
            "videos": [],
            "pdfs": [],
            "formulas": [],
            "mockTests": [],
            "module": "Algebra"
          },
'''

content = content.replace('"label": "Mathematics",\n        "chapters": [\n', '"label": "Mathematics",\n        "chapters": [\n' + new_chapter)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated syllabusData.js')
