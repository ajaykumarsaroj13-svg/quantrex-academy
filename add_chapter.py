import re

path = r'C:\Users\Admin\.gemini\antigravity\scratch\quantrexacadmy\backend\server.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

new_chapter = '''
            {
              id: "jee_main_math_progression_series",
              title: "Sequence and Series",
              topics: [
                { id: "jm_math_ch4_t1", title: "Arithmetic Progression (A.P.)" },
                { id: "jm_math_ch4_t2", title: "Geometric Progression (G.P.)" },
                { id: "jm_math_ch4_t3", title: "Harmonic Progression (H.P.)" },
                { id: "jm_math_ch4_t4", title: "Properties of A.M., G.M., H.M." },
                { id: "jm_math_ch4_t5", title: "Arithmetico-Geometric Progression (A.G.P.)" },
                { id: "jm_math_ch4_t6", title: "Sum of Special Series" }
              ],
              videos: [],
              pdfs: [],
              formulas: [],
              pyqTests: [],
              tests: []
            },
'''

content = content.replace('chapters: [\n            {', 'chapters: [\n' + new_chapter + '            {')
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Done!')
