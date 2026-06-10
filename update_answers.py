import json
import re

with open('C:/Users/Admin/.gemini/antigravity/scratch/quantrexacadmy/src/utils/blackBookDataFull.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

questions = data[0]['questions']

# === EXERCISE 1 ANSWER KEY (from page 17) ===
# 1.b 2.c 3.c 4.b 5.d 6.a 7.d 8.c 9.c 10.a
# 11.b 12.c 13.c 14.b 15.a 16.a 17.d 18.a 19.d 20.c
# 21.d 22.d 23.b 24.b 25.c 26.b 27.c 28.c 29.b 30.c
# 31.d 32.b 33.a 34.c 35.b 36.c 37.a 38.d 39.a 40.c
# 41.b 42.b 43.a 44.b 45.c 46.b 47.b 48.b 49.c 50.c
# 51.b 52.c 53.c 54.d 55.a 56.b 57.d 58.c 59.a 60.b
# 61.b 62.c 63.c 64.b 65.d 66.a 67.d 68.a 69.a 70.b
# 71.c 72.a 73.a 74.d 75.c 76.d 77.b 78.d 79.d 80.c
# 81.b 82.b 83.a 84.c 85.c 86.b 87.d 88.b 89.d 90.d
# 91.b 92.d 93.d 94.d 95.c 96.c 97.b 98.b

ex1_answers = [
    1,2,2,1,3,0,3,2,2,0,  # 1-10: b=1,c=2,c=2,b=1,d=3,a=0,d=3,c=2,c=2,a=0
    1,2,2,1,0,0,3,0,3,2,  # 11-20
    3,3,1,1,2,1,2,2,1,2,  # 21-30
    3,1,0,2,1,2,0,3,0,2,  # 31-40
    1,1,0,1,2,1,1,1,2,2,  # 41-50
    1,2,2,3,0,1,3,2,0,1,  # 51-60
    1,2,2,1,3,0,3,0,0,1,  # 61-70
    2,0,0,3,2,3,1,3,3,2,  # 71-80
    1,1,0,2,2,1,3,1,3,3,  # 81-90
    1,3,3,3,2,2,1,1       # 91-98
]

# === EXERCISE 2 ANSWER KEY (from page 21) ===
# 1.(a,b,d) 2.(a,b,c) 3.(c,d) 4.(a,b) 5.(a,b,c) 6.(a,b,c,d)
# 7.(a,d) 8.(a,b,c) 9.(b,c) 10.(a,b,d) 11.(a,b,d) 12.(a,c)
# 13.(c,d) 14.(a,b,c) 15.(a,b,d) 16.(b,c,d) 17.(a,c,d) 18.(a,b,c,d)
# 19.(a,b) 20.(a,d) 21.(a,b,c) 22.(a,c,d) 23.(a,b) 24.(a,b)

ex2_answers = [
    [0,1,3], [0,1,2], [2,3], [0,1], [0,1,2], [0,1,2,3],
    [0,3], [0,1,2], [1,2], [0,1,3], [0,1,3], [0,2],
    [2,3], [0,1,2], [0,1,3], [1,2,3], [0,2,3], [0,1,2,3],
    [0,1], [0,3], [0,1,2], [0,2,3], [0,1], [0,1]
]

# === EXERCISE 3 ANSWER KEY (from page 24) ===
# 1.c 2.d 3.c 4.d 5.a 6.b 7.b 8.a 9.b 10.c
# 11.b 12.a 13.a 14.c 15.b 16.d

ex3_answers = [2,3,2,3,0,1,1,0,1,2,1,0,0,2,1,3]

# === EXERCISE 4 ANSWER KEY (from page 27) ===
# 1. A→R; B→S; C→P; D→Q  (but in our JSON, this is Q5 - about x+[y]+{z}=12.7)
# 2. A→S; B→P; C→Q; D→R  (Q6 - about ax^4...)
# 3. A→Q; B→R; C→P; D→S  (Q7 - the graph question)
# 4. A→P,Q,S,T; B→Q,R; C→P,Q,S; D→P,S  (Q1 - f(x)=sin^2 2x...)
# 5. A→Q; B→P; C→S; D→R  (Q2 - |x^2-x|≥x^2+x)
# 6. A→R; B→P; C→T; D→S  (Q3 - domain/range matching)
# 7. A→R; B→R; C→R; D→S  (Q4 - g(x)=f(f(x)))

# Map in JSON order:
# Q1 in JSON = PDF Q4: A→P,Q,S,T; B→Q,R; C→P,Q,S; D→P,S
# Q2 in JSON = PDF Q5: A→Q; B→P; C→S; D→R
# Q3 in JSON = PDF Q6: A→R; B→P; C→T; D→S
# Q4 in JSON = PDF Q7: A→R; B→R; C→R; D→S
# Q5 in JSON = PDF Q1: A→R; B→S; C→P; D→Q
# Q6 in JSON = PDF Q2: A→S; B→P; C→Q; D→R
# Q7 in JSON = PDF Q3: A→Q; B→R; C→P; D→S

ex4_answers = [
    "A→P,Q,S,T; B→Q,R; C→P,Q,S; D→P,S",
    "A→Q; B→P; C→S; D→R",
    "A→R; B→P; C→T; D→S",
    "A→R; B→R; C→R; D→S",
    "A→R; B→S; C→P; D→Q",
    "A→S; B→P; C→Q; D→R",
    "A→Q; B→R; C→P; D→S",
]

# === EXERCISE 5 ANSWER KEY (from page 31) ===
# 1.26 2.7 3.9 4.1 5.1 6.4 7.5
# 8.6 9.1 10.12 11.1 12.6 13.4 14.6
# 15.0 16.6 17.7 18.76 19.6 20.8 21.5
# 22.5 23.9 24.3 25.7 26.4 27.1 28.3
# 29.5 30.8 31.9 32.3 33.2 34.2 35.6
# 36.4 37.0 38.2

ex5_answers = [
    26,7,9,1,1,4,5,6,1,12,1,6,4,6,0,6,7,76,6,8,5,
    5,9,3,7,4,1,3,5,8,9,3,2,2,6,4,0,2
]

# Now apply answers to questions
ex1_idx = 0
ex2_idx = 0
ex3_idx = 0
ex4_idx = 0
ex5_idx = 0

for i, q in enumerate(questions):
    exName = q.get('exerciseName', '')
    
    if exName == 'Exercise 1':
        if ex1_idx < len(ex1_answers):
            q['correctOption'] = ex1_answers[ex1_idx]
            ex1_idx += 1
    
    elif exName == 'Exercise 2':
        if ex2_idx < len(ex2_answers):
            q['correctOptionsArray'] = ex2_answers[ex2_idx]
            q['correctOption'] = ex2_answers[ex2_idx][0]  # primary
            ex2_idx += 1
    
    elif exName == 'Exercise 3':
        if ex3_idx < len(ex3_answers):
            q['correctOption'] = ex3_answers[ex3_idx]
            ex3_idx += 1
    
    elif exName == 'Exercise 4':
        if ex4_idx < len(ex4_answers):
            q['answerKeyStr'] = ex4_answers[ex4_idx]
            ex4_idx += 1
    
    elif exName == 'Exercise 5':
        if ex5_idx < len(ex5_answers):
            q['answerKeyStr'] = str(ex5_answers[ex5_idx])
            ex5_idx += 1

# Fix Ex4 Q7 (graph question) - add proper image and complete the question text
ex4_questions = [q for q in questions if q.get('exerciseName') == 'Exercise 4']
ex4_q7 = ex4_questions[6]  # index 6 = 7th question

# Build complete Q7 text with inline graphs
ex4_q7['text'] = """Given the graph of $y = f(x)$ below:

<div style="margin: 16px 0; text-align: center;">
  <img src="/images/ex4_q7_original.png" alt="Graph of y=f(x)" style="max-width:320px; width:100%; border:1px solid #e5e7eb; border-radius:8px; background:white; padding:8px;" />
  <div style="font-size:0.85em; color:#6b7280; margin-top:4px;">Graph of $y = f(x)$: Passes through $(-1,0)$, peaks at $(0,1)$, passes through $(1,0)$, and reaches $(2,-2)$.</div>
</div>

Match the functions in Column-I with their correct graphs in Column-II:

<table class="min-w-full text-left text-sm border-collapse mt-4 mb-4" style="border:1px solid #d1d5db;">
<thead>
<tr style="background:#f3f4f6;">
<th style="border:1px solid #d1d5db; padding:10px 16px; font-weight:700;">Column-I (Function)</th>
<th style="border:1px solid #d1d5db; padding:10px 16px; font-weight:700;">Column-II (Graph)</th>
</tr>
</thead>
<tbody>
<tr>
<td style="border:1px solid #d1d5db; padding:10px 16px;"><strong>(A)</strong> $y = f(1-x)$ <br/><small style="color:#6b7280;">[Reflection about x = ½]</small></td>
<td style="border:1px solid #d1d5db; padding:10px 16px;"><strong>(P)</strong> Graph shifted: passes through $(-1,-2)$, $(0,0)$, $(1,1)$, $(2,0)$</td>
</tr>
<tr style="background:#f9fafb;">
<td style="border:1px solid #d1d5db; padding:10px 16px;"><strong>(B)</strong> $y = f(2x)$ <br/><small style="color:#6b7280;">[Horizontal compression by 2]</small></td>
<td style="border:1px solid #d1d5db; padding:10px 16px;"><strong>(Q)</strong> Original $f(x)$ — peaks at $(0,1)$</td>
</tr>
<tr>
<td style="border:1px solid #d1d5db; padding:10px 16px;"><strong>(C)</strong> $y = -2f(x)$ <br/><small style="color:#6b7280;">[Vertical flip and scale ×2]</small></td>
<td style="border:1px solid #d1d5db; padding:10px 16px;"><strong>(R)</strong> Graph compressed: peaks at $(0,1)$, x-range $[-\\frac{1}{2}, 1]$</td>
</tr>
<tr style="background:#f9fafb;">
<td style="border:1px solid #d1d5db; padding:10px 16px;"><strong>(D)</strong> $y = 1 - f(x)$ <br/><small style="color:#6b7280;">[Vertical flip + shift up 1]</small></td>
<td style="border:1px solid #d1d5db; padding:10px 16px;"><strong>(S)</strong> Graph: passes through $(-1,0)$, minimum $(0,-2)$, passes through $(1,0)$, to $(2,4)$</td>
</tr>
</tbody>
</table>

<div style="margin: 12px 0; text-align: center;">
  <img src="/images/ex4_q7_options.png" alt="Column-II option graphs" style="max-width:480px; width:100%; border:1px solid #e5e7eb; border-radius:8px; background:white; padding:8px;" />
  <div style="font-size:0.85em; color:#6b7280; margin-top:4px;">Reference graphs for Column-II options</div>
</div>"""

ex4_q7['has_graph'] = True
ex4_q7['imageUrl'] = '/images/ex4_q7_original.png'

print('Ex1 idx processed:', ex1_idx)
print('Ex2 idx processed:', ex2_idx)
print('Ex3 idx processed:', ex3_idx)
print('Ex4 idx processed:', ex4_idx)
print('Ex5 idx processed:', ex5_idx)

# Verify spot-check
ex1_qs = [q for q in questions if q.get('exerciseName') == 'Exercise 1']
print('Ex1 Q1 correctOption:', ex1_qs[0].get('correctOption'), '(expected 1=b)')
print('Ex1 Q98 correctOption:', ex1_qs[97].get('correctOption'), '(expected 1=b)')
ex5_qs = [q for q in questions if q.get('exerciseName') == 'Exercise 5']
print('Ex5 Q1 answerKeyStr:', ex5_qs[0].get('answerKeyStr'), '(expected 26)')

with open('C:/Users/Admin/.gemini/antigravity/scratch/quantrexacadmy/src/utils/blackBookDataFull.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print('Data saved successfully!')
