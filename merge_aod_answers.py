import json
import glob
import re

# Load all chunks
chunk_data = []
for i in range(1, 7):
    with open(f'public/data/questions/extracted_chunk_{i}.json', 'r', encoding='utf-8') as f:
        chunk_data.extend(json.load(f))

# Load main JSON
file_path = 'src/utils/blackBookDataFull.json'
with open(file_path, 'r', encoding='utf-8') as f:
    bb_data = json.load(f)

# Find AOD chapter
for ch in bb_data:
    if ch['id'] == 'black_book_ch_aod':
        questions = ch['questions']
        
        # We need to map chunk answers to questions.
        # Since we appended them in order, the lengths should match exactly.
        if len(questions) == len(chunk_data):
            for i, q in enumerate(questions):
                cq = chunk_data[i]
                
                # Single Choice
                if q['questionType'] == 'SINGLE CORRECT TYPE':
                    if 'correctOptionIndex' in cq and cq['correctOptionIndex'] is not None and cq['correctOptionIndex'] != -1:
                        q['correctOption'] = cq['correctOptionIndex']
                
                # Multi Correct
                elif q['questionType'] == 'ONE OR MORE THAN ONE CORRECT':
                    # Sometimes correctAnswer is like "(a, c, d)"
                    ans_str = cq.get('correctAnswer', '').lower()
                    if ans_str.startswith('(') and ans_str.endswith(')'):
                        ans_str = ans_str[1:-1]
                        parts = [p.strip() for p in ans_str.split(',')]
                        mapping = {'a': 0, 'b': 1, 'c': 2, 'd': 3}
                        arr = []
                        for p in parts:
                            if p in mapping:
                                arr.append(mapping[p])
                        if arr:
                            q['correctOptionsArray'] = arr
                
                # Comprehension
                elif q['questionType'] == 'COMPREHENSION TYPE':
                    if 'correctOptionIndex' in cq and cq['correctOptionIndex'] is not None and cq['correctOptionIndex'] != -1:
                        q['correctOption'] = cq['correctOptionIndex']
                    elif 'correctAnswer' in cq and cq['correctAnswer']:
                        q['correctAnswer'] = cq['correctAnswer']
                        
                # Matching
                elif q['questionType'] == 'MATCH THE COLUMN' or q['questionType'] == 'MATCHING TYPE':
                    if 'correctAnswer' in cq and cq['correctAnswer']:
                        q['correctAnswer'] = cq['correctAnswer']
                        
                # Subjective
                elif q['questionType'] == 'SUBJECTIVE TYPE':
                    if 'correctAnswer' in cq and cq['correctAnswer']:
                        q['correctAnswer'] = cq['correctAnswer']
        else:
            print(f"Mismatch! questions: {len(questions)}, chunks: {len(chunk_data)}")
        break

with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(bb_data, f, indent=2)

print("AOD answers updated!")
