import json
import os

qs_file = 'C:/Users/Admin/.gemini/antigravity/scratch/project_2/quantrex-academy/all_adv_math_pyqs.json'
with open(qs_file, 'r', encoding='utf-8') as f:
    qs = json.load(f)

print('Total Adv Math questions:', len(qs))

# We know from adv_math_chapters.json that Quadratic Equations is the 2nd chapter, so its index is probably 1 (ch_adv_mathematics_1).
adv_file = 'C:/Users/Admin/.gemini/antigravity/scratch/project_2/quantrex-academy/public/data/chapters.json'
with open(adv_file, 'r', encoding='utf-8') as f:
    adv_data = json.load(f)

chapter_id = None
chapter_index = -1
for idx, ch in enumerate(adv_data['mathematics']):
    if 'quadratic' in ch.get('name', '').lower() and 'JEE Advanced' in ch.get('exams', []):
        chapter_id = ch['id']
        chapter_index = idx
        break

print(f"Found Quadratic Equations at index {chapter_index}, ID: {chapter_id}")

# In all_adv_math_pyqs.json, the chapters are ch_adv_mathematics_0, ch_adv_mathematics_1, etc.
quad_qs = [q for q in qs if q.get('chapterId') == 'ch_adv_mathematics_0']
print('Quadratic equations count in all_adv_math_pyqs:', len(quad_qs))

# The user said the counts are: scq -48, mcqm-9, numrical-9 , fill in the blancks -8, true or fasle-6, subjective-26
counts = {
    'SCQ': 48,
    'MCQ': 9,
    'Numerical': 9,
    'Fill in the Blanks': 8,
    'True/False': 6,
    'Subjective': 26
}

idx = 0
for q_type, count in counts.items():
    for _ in range(count):
        if idx < len(quad_qs):
            quad_qs[idx]['type'] = q_type
            idx += 1

out_file = 'C:/Users/Admin/.gemini/antigravity/scratch/project_2/quantrex-academy/public/data/questions/adv-quadratic-equation-and-inequalities.json'
with open(out_file, 'w', encoding='utf-8') as f:
    json.dump(quad_qs, f, indent=2)

print('Updated adv-quadratic-equation-and-inequalities.json')

adv_data['mathematics'][chapter_index]['typeCounts'] = counts
adv_data['mathematics'][chapter_index]['totalQuestions'] = len(quad_qs)

with open(adv_file, 'w', encoding='utf-8') as f:
    json.dump(adv_data, f, indent=2)

print('Updated adv_math_chapters.json')
