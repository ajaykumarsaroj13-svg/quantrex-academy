import json

seq_ex1 = """1. (c)	2. (c)	3. (b)	4. (b)	5. (a)	6. (b)	7. (d)	8. (a)	9. (a)	10. (c)
11. (d)	12. (c)	13. (b)	14. (c)	15. (b)	16. (c)	17. (a)	18. (c)	19. (c)	20. (d)
21. (b)	22. (d)	23. (d)	24. (a)	25. (a)	26. (b)	27. (d)	28. (b)	29. (d)	30. (d)
31. (a)	32. (d)	33. (c)	34. (c)	35. (b)	36. (d)	37. (b)	38. (d)	39. (d)	40. (a)
41. (b)	42. (b)	43. (b)	44. (a)	45. (c)	46. (a)	47. (c)	48. (d)	49. (c)	50. (b)
51. (b)	52. (a)	53. (b)	54. (b)	55. (b)	56. (a)	57. (d)	58. (b)	59. (d)	60. (c)
61. (d)	62. (b)	63. (c)	64. (c)	65. (d)	66. (d)	67. (d)	68. (a)	69. (d)	70. (c)
71. (a)	72. (d)	73. (d)	74. (a)	75. (b)	76. (b)	77. (c)	78. (c)	79. (a)"""

seq_ex2 = """1. (b, d)
2. (b, c)
3. (b, c, d)
4. (a, b, c)
5. (b, c)
6. (a, b, c, d)
7. (a, b)
8. (a, b)
9. (b, c)"""

seq_ex3 = """1. (b)	2. (a)	3. (b)	4. (d)	5. (c)	6. (a)	7. (a)	8. (b)	9. (c)
10. (c)	11. (c)	12. (b)	13. (b)	14. (d)	15. (b)	16. (a)	17. (c)"""

seq_ex4 = """1. A \rightarrow R; B \rightarrow P; C \rightarrow Q; D \rightarrow S
2. A \rightarrow R, B \rightarrow R, C \rightarrow P, D \rightarrow R
3. A \rightarrow P, B \rightarrow R, C \rightarrow S, D \rightarrow Q
4. A \rightarrow Q; B \rightarrow P; C \rightarrow T; D \rightarrow S
5. A \rightarrow S; B \rightarrow R; C \rightarrow P; D \rightarrow Q
6. A \rightarrow S; B \rightarrow P; C \rightarrow Q; D \rightarrow R"""

seq_ex5 = """1. (8)	2. (9)	3. (2)	4. (2)	5. (8)	6. (3)	7. (9)	8. (4)	9. (1)	10. (3)
11. (6)	12. (5)	13. (5)	14. (7)	15. (5)	16. (8)	17. (3)	18. (6)	19. (2)	20. (1)
21. (8)"""

det_ex1 = "a,c,b,c,a,c,a,c,a,b,c,c,b,d,c,a,c,d,c,c,c,b,c,a,c,a"
det_ex2 = ["b,c,d", "b,d", "a,b", "a,b", "a,b,d", "a,b,d", "b,c,d", "b"]
det_ex3 = "b,a,d"
det_ex4 = ["3", "9", "0", "4", "5", "2", "6", "3", "3", "7", "2", "2"]

import re
opt_map = {"a": 0, "b": 1, "c": 2, "d": 3}

def parse_seq_answers(txt):
    ans_map = {}
    matches = re.finditer(r'(\d+)\.\s*\((.*?)\)', txt)
    for m in matches:
        num = int(m.group(1))
        val = m.group(2).replace(' ', '')
        if ',' in val:
            ans_map[num] = [opt_map[v.strip().lower()] for v in val.split(',')]
        else:
            if val.strip().lower() in opt_map:
                ans_map[num] = opt_map[val.strip().lower()]
            else:
                ans_map[num] = val.strip()
    return ans_map

def parse_seq_ex4(txt):
    ans_map = {}
    lines = txt.strip().split('\n')
    for line in lines:
        if line.strip():
            m = re.match(r'(\d+)\.\s+(.*)', line.strip())
            if m:
                ans_map[int(m.group(1))] = m.group(2)
    return ans_map

with open('E:/quantrexacademy/public/blackbook-script.js', 'r', encoding='utf-8') as f:
    text = f.read()

start = text.find('[')
end = text.rfind(']')+1
d = json.loads(text[start:end])

# Setup Determinants Answers
det_ex1_ans = [opt_map[x.strip()] for x in det_ex1.split(',')]
det_ex2_ans = [[opt_map[x.strip()] for x in s.split(',')] for s in det_ex2]
det_ex3_ans = [opt_map[x.strip()] for x in det_ex3.split(',')]

for ch in d:
    if ch['title'] == 'Determinants':
        for q in ch['questions']:
            qn = q['questionNumber']
            if 'Exercise-1' in q['exerciseName'] and qn <= len(det_ex1_ans):
                q['correctOption'] = det_ex1_ans[qn - 1]
            elif 'Exercise-2' in q['exerciseName'] and qn <= len(det_ex2_ans):
                q['correctOptions'] = det_ex2_ans[qn - 1]
                q['correctOption'] = None
            elif 'Exercise-3' in q['exerciseName'] and qn <= len(det_ex3_ans):
                q['correctOption'] = det_ex3_ans[qn - 1]
            elif 'Exercise-4' in q['exerciseName'] and qn <= len(det_ex4):
                q['answer'] = det_ex4[qn - 1]
                q['correctOption'] = None
                
    elif 'Sequence' in ch['title']:
        e1 = parse_seq_answers(seq_ex1)
        e2 = parse_seq_answers(seq_ex2)
        e3 = parse_seq_answers(seq_ex3)
        e4 = parse_seq_ex4(seq_ex4)
        e5 = parse_seq_answers(seq_ex5)
        
        for q in ch['questions']:
            qn = q['questionNumber']
            if 'Exercise-1' in q['exerciseName']:
                if qn in e1:
                    q['correctOption'] = e1[qn]
            elif 'Exercise-2' in q['exerciseName']:
                if qn in e2:
                    q['correctOptions'] = e2[qn]
            elif 'Exercise-3' in q['exerciseName']:
                if qn in e3:
                    q['correctOption'] = e3[qn]
            elif 'Exercise-4' in q['exerciseName']:
                if qn in e4:
                    q['answer'] = e4[qn]
            elif 'Exercise-5' in q['exerciseName']:
                if qn in e5:
                    q['answer'] = e5[qn]

new_script = text[:start] + json.dumps(d, ensure_ascii=False, indent=2) + text[end:]

with open('E:/quantrexacademy/public/blackbook-script.js', 'w', encoding='utf-8') as f:
    f.write(new_script)

print("Injected successfully!")
