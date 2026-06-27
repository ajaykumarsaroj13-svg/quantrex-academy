import json
import re

answer_map = {
    1: 'b', 2: 'b', 3: 'b', 4: 'd', 5: 'd', 6: 'a', 7: 'd', 8: 'd', 9: 'b', 10: 'd',
    11: 'b', 12: 'a', 13: 'b', 14: 'b', 15: 'a', 16: 'a', 17: 'b', 18: 'c', 19: 'b', 20: 'a',
    21: 'a', 22: 'd', 23: 'b', 24: 'b', 25: 'c', 26: 'd', 27: 'a', 28: 'd', 29: 'd', 30: 'c',
    31: 'd', 32: 'b', 33: 'c', 34: 'd', 35: 'c', 36: 'a', 37: 'c', 38: 'a', 39: 'd', 40: 'd',
    41: 'b', 42: 'a', 43: 'b', 44: 'a', 45: 'a', 46: 'a', 47: 'd', 48: 'd', 49: 'd', 50: 'c',
    51: 'c', 52: 'b', 53: 'c', 54: 'c', 55: 'b', 56: 'c', 57: 'b', 58: 'b', 59: 'b', 60: 'a',
    61: 'a', 62: 'a', 63: 'b', 64: 'c', 65: 'd', 66: 'd', 67: 'a', 68: 'd', 69: 'd', 70: 'b',
    71: 'd', 72: 'b', 73: 'a', 74: 'd', 75: 'b', 76: 'a', 77: 'b', 78: 'c', 79: 'c', 80: 'c',
    81: 'b', 82: 'd', 83: 'd', 84: 'b', 85: 'c', 86: 'a', 87: 'd', 88: 'd', 89: 'd', 90: 'd',
    91: 'd', 92: 'c', 93: 'b', 94: 'c', 95: 'd', 96: 'b', 97: 'c', 98: 'a', 99: 'a', 100: 'b',
    101: 'd', 102: 'a', 103: 'a', 104: 'b', 105: 'c', 106: 'a', 107: 'd', 108: 'a', 109: 'b', 110: 'd',
    111: 'c', 112: 'd', 113: 'c', 114: 'b', 115: 'a', 116: 'c'
}

opt_to_idx = {'a': 0, 'b': 1, 'c': 2, 'd': 3}

with open(r'C:\Users\Admin\Documents\questions.txt', 'r', encoding='utf-8') as f:
    text = f.read()

questions = []
# split by "**N.**"
parts = re.split(r'\*\*(\d+)\.\*\*', text)

for i in range(1, len(parts), 2):
    q_num = int(parts[i])
    q_content = parts[i+1]
    
    # Extract options and question text
    # Option lines start with "(a)", "(b)", "(c)", "(d)"
    # Some lines might have extra text at the end like "(where C is constant)"
    
    # We find indices of options
    idx_a = q_content.find('\n(a)')
    if idx_a == -1: idx_a = q_content.find('(a)')
    idx_b = q_content.find('\n(b)')
    if idx_b == -1: idx_b = q_content.find('(b)')
    idx_c = q_content.find('\n(c)')
    if idx_c == -1: idx_c = q_content.find('(c)')
    idx_d = q_content.find('\n(d)')
    if idx_d == -1: idx_d = q_content.find('(d)')
    
    q_text = q_content[:idx_a].strip()
    
    opt_a = q_content[idx_a+4:idx_b].strip()
    opt_b = q_content[idx_b+4:idx_c].strip()
    opt_c = q_content[idx_c+4:idx_d].strip()
    
    # option d goes until the end, but we might need to strip trailing text
    opt_d_raw = q_content[idx_d+4:].strip()
    opt_d = opt_d_raw
    # if there is text like "*(where C is" we can put it in the question text or ignore it
    # usually it starts with "\n*(" or similar.
    # let's just keep opt_d clean and move the rest back to q_text if needed.
    extra_text_match = re.search(r'\n\s*(\*\(where.*|\(where.*|\(Note:.*)', opt_d_raw, re.IGNORECASE)
    if extra_text_match:
        opt_d = opt_d_raw[:extra_text_match.start()].strip()
        q_text += '\n\n' + extra_text_match.group(1).strip()
    
    correct_opt = answer_map.get(q_num, 'a')
    
    q_obj = {
        "questionNumber": q_num,
        "questionType": "SINGLE CORRECT",
        "text": q_text,
        "options": [opt_a, opt_b, opt_c, opt_d],
        "exerciseName": "Exercise 1",
        "has_graph": False,
        "chapter": "Indefinite and Definite Integration",
        "correctOption": opt_to_idx[correct_opt],
        "typeLabel": "[SINGLE CORRECT]",
        "graph_bbox": [],
        "chapterId": "black_book_ch5_integration"
    }
    questions.append(q_obj)

chapter_obj = {
    "id": "black_book_ch5_integration",
    "chapterNumber": 5,
    "title": "Indefinite and Definite Integration",
    "questions": questions
}

# Update the JS file safely
js_file = r'C:\Users\Admin\.gemini\antigravity\scratch\project_2\quantrex-academy\public\blackbook-script.js'
with open(js_file, 'r', encoding='utf-8') as f:
    js_content = f.read()

# js_content is window.DEFAULT_BLACKBOOK = [ ... ]
# We need to parse the JSON array or just append the new chapter object before the closing bracket.
import ast
import json

prefix = "window.DEFAULT_BLACKBOOK = "
if js_content.startswith(prefix):
    json_str = js_content[len(prefix):].strip()
    if json_str.endswith(';'):
        json_str = json_str[:-1]
    
    data = json.loads(json_str)
    # Remove existing chapter if it exists
    data = [ch for ch in data if ch['id'] != "black_book_ch5_integration"]
    data.append(chapter_obj)
    
    new_js = prefix + json.dumps(data, indent=2) + ";"
    with open(js_file, 'w', encoding='utf-8') as f:
        f.write(new_js)
    print("Success! Overwrote Chapter 5 with", len(questions), "questions.")
else:
    print("Could not parse JS file.")

