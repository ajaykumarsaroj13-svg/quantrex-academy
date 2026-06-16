import json
import glob
import os

questions_dir = 'C:/Users/Admin/.gemini/antigravity/scratch/project_2/quantrex-academy/public/data/questions'
chapters_file = 'C:/Users/Admin/.gemini/antigravity/scratch/project_2/quantrex-academy/public/data/chapters.json'

with open(chapters_file, 'r', encoding='utf-8') as f:
    chapters_data = json.load(f)

# The structure is { "mathematics": [ { chapter1 }, { chapter2 } ], "physics": ... }
for subject_key, chapters_list in chapters_data.items():
    if isinstance(chapters_list, list):
        for chapter in chapters_list:
            slug = chapter['id']
            # only process adv files for now
            file_path = os.path.join(questions_dir, f"adv-{slug}.json")
            if os.path.exists(file_path):
                with open(file_path, 'r', encoding='utf-8') as f:
                    qs = json.load(f)
                
                counts = {}
                for q in qs:
                    t = q.get('type', 'Unknown')
                    if t == 'MCQM': t = 'Multi Correct'
                    elif t == 'SCQ': t = 'Single Correct'
                    elif t == 'NUMERICAL': t = 'Numerical'
                    elif t == 'FIB': t = 'Fill in the Blanks'
                    elif t == 'SUBJECTIVE': t = 'Subjective'
                    elif t == 'TRUE_FALSE': t = 'True / False'
                    elif t == 'MATCH': t = 'Match the Following'
                    
                    counts[t] = counts.get(t, 0) + 1
                    
                chapter['typeCounts'] = counts

with open(chapters_file, 'w', encoding='utf-8') as f:
    json.dump(chapters_data, f, indent=2)
print("Updated all type counts successfully.")
