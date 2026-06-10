import json
data = json.load(open('C:/Users/Admin/.gemini/antigravity/scratch/quantrexacadmy/src/utils/blackBookDataFull.json'))
questions = data[0]['questions']
ex4 = [q for q in questions if q['exerciseName'] == 'Exercise 4']
print('Total Ex4 questions:', len(ex4))
for i, q in enumerate(ex4):
    print(f'\n--- Q{i+1} ---')
    print('text:', q.get('text','')[:300])
    print('id:', q.get('id'))
