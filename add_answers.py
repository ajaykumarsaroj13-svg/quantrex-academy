import json

data = json.load(open('E:\\quantrexacademy\\blackBookDataFull.json', 'r', encoding='utf-8'))

ans_map = {
    'adv-differential-equations': {
        'Exercise 1': {
            **{i: ans for i, ans in {1:'a',2:'d',3:'b',4:'a',5:'c',6:'a',7:'b',8:'c',9:'c',10:'b',11:'d',12:'c',13:'a',14:'b',15:'a',16:'c',17:'b',18:'c',19:'c',20:'d',21:'c',22:'c',23:'c',24:'d',25:'a',26:'a',27:'c'}.items()},
            **{i+27: ans for i, ans in {1:'ac', 2:'ab', 3:'abc', 4:'a', 5:'b', 6:'ac'}.items()},
            **{i+33: ans for i, ans in {1:'c',2:'a',3:'c',4:'b',5:'c',6:'c',7:'b',8:'a'}.items()}
        },
        'Exercise 4': {1:'A-R B-T C-S D-Q', 2:'A-Q B-R C-P D-S'},
        'Exercise 5': {1:'1',2:'2',3:'6',4:'1',5:'4',6:'2'}
    },
    'adv-area-under-curves': {
        'Exercise 1': {
            **{i: ans for i, ans in {1:'b', 2:'b', 3:'c', 4:'d', 5:'a', 6:'b', 7:'d', 8:'b', 9:'c', 10:'a', 11:'d', 12:'b', 13:'c', 14:'b', 15:'c', 16:'b', 17:'b', 18:'b'}.items()},
            **{i+18: ans for i, ans in {1:'bcd', 2:'ab', 3:'ad', 4:'d'}.items()},
            **{i+22: ans for i, ans in {1:'a', 2:'d', 3:'b', 4:'b', 5:'b', 6:'b'}.items()}
        },
        'Exercise 4': {1:'A-R B-Q C-P D-T'},
        'Exercise 5': {1:'1', 2:'7', 3:'6', 4:'5', 5:'8', 6:'2', 7:'2', 8:'1'}
    },
    'indefinite-and-definite-integration': {
        'Exercise 1': {1:'b',2:'b',3:'b',4:'d',5:'d',6:'a',7:'d',8:'d',9:'b',10:'d',11:'b',12:'a',13:'b',14:'b',15:'a',16:'a',17:'b',18:'c',19:'b',20:'a',21:'a',22:'d',23:'b',24:'b',25:'c',26:'d',27:'a',28:'d',29:'d',30:'c',31:'d',32:'b',33:'c',34:'d',35:'c',36:'a',37:'c',38:'a',39:'d',40:'d',41:'b',42:'a',43:'b',44:'a',45:'a',46:'a',47:'d',48:'d',49:'d',50:'c',51:'c',52:'b',53:'c',54:'c',55:'b',56:'c',57:'b',58:'b',59:'b',60:'a',61:'a',62:'a',63:'b',64:'c',65:'d',66:'d',67:'a',68:'d',69:'d',70:'b',71:'d',72:'b',73:'a',74:'d',75:'b',76:'a',77:'b',78:'c',79:'c',80:'c',81:'b',82:'d',83:'d',84:'b',85:'c',86:'a',87:'d',88:'d',89:'d',90:'d',91:'d',92:'c',93:'b',94:'c',95:'d',96:'b',97:'c',98:'a',99:'a',100:'b',101:'d',102:'a',103:'a',104:'b',105:'c',106:'a',107:'d',108:'a',109:'b',110:'d',111:'c',112:'d',113:'c',114:'b',115:'a',116:'c'},
        'Exercise 2': {1:'bc',2:'abcd',3:'ab',4:'acd',5:'abc',6:'ab',7:'abd',8:'bd',9:'ab',10:'abcd',11:'abcd',12:'ab',13:'ac',14:'b',15:'abc',16:'bc'},
        'Exercise 3': {1:'a',2:'b',3:'c',4:'d',5:'a',6:'b',7:'a',8:'c',9:'a',10:'a',11:'c',12:'c',13:'c',14:'b',15:'d',16:'c',17:'d'},
        'Exercise 4': {1:'A-S B-P C-P D-S', 2:'A-S B-Q C-P D-R', 3:'A-R B-Q C-S D-P', 4:'A-Q B-R C-S D-P', 5:'A-S B-R C-P D-Q'},
        'Exercise 5': {1:'90',2:'3',3:'3',4:'7',5:'7',6:'3',7:'1',8:'7',9:'8',10:'1',11:'9',12:'5',13:'2',14:'3',15:'5',16:'4',17:'3',18:'2',19:'2',20:'7',21:'9',22:'8',23:'3',24:'5',25:'2',26:'4',27:'2',28:'1',29:'4'}
    }
}

for ch in data:
    ch_id = ch['id']
    if ch_id in ans_map:
        ex_counters = {}
        for q in ch.get('questions', []):
            ex_title = q.get('exerciseName')
            if ex_title and ex_title in ans_map[ch_id]:
                if ex_title not in ex_counters:
                    ex_counters[ex_title] = 1
                q_num = ex_counters[ex_title]
                ex_counters[ex_title] += 1
                q['questionNumber'] = q_num
                
                ans_dict = ans_map[ch_id][ex_title]
                if q_num in ans_dict:
                    correct_ans = str(ans_dict[q_num])
                    q['answerKeyStr'] = correct_ans
                    q['answer'] = correct_ans
                    
                    if q['typeLabel'] in ['SCQ', 'SINGLE CHOICE', 'SINGLE CORRECT']:
                        opts = ['a','b','c','d']
                        if correct_ans in opts:
                            q['correctOption'] = opts.index(correct_ans)
                    elif q['typeLabel'] in ['MCQ', 'MULTIPLE CHOICE', 'MULTIPLE CORRECT']:
                        opts = ['a','b','c','d']
                        q['correctOptionsArray'] = [opts.index(c) for c in correct_ans if c in opts]

with open('E:\\quantrexacademy\\blackBookDataFull.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

with open('E:\\quantrexacademy\\src\\utils\\blackBookDataFull.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

with open('E:\\quantrexacademy\\public\\blackbook-script.js', 'w', encoding='utf-8') as f:
    f.write('window.DEFAULT_BLACKBOOK = ' + json.dumps(data, indent=2) + ';\n')
