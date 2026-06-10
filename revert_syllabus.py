import re

path = r'C:\Users\Admin\.gemini\antigravity\scratch\quantrexacadmy\src\utils\syllabusData.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

block_to_remove = '''          {
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

content = content.replace(block_to_remove, '')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Reverted syllabusData.js')
