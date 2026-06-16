import json, urllib.request

try:
    with open('C:/Users/Admin/.gemini/antigravity/scratch/project_2/quantrex-academy/examgoal_cookies_new.json', 'r', encoding='utf-8') as f:
        cookies_list = json.load(f)
    cookie_str = '; '.join([f"{c['name']}={c['value']}" for c in cookies_list])

    req = urllib.request.Request('https://room.examgoal.com/api/v1/past-question/questions?chapterId=47de5c20-a612-506e-a7a1-abc373932221&examGroup=jee&exam=jee-advanced&limit=500&offset=0', headers={
        'cookie': cookie_str,
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'accept': 'application/json'
    })
    
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode('utf-8'))
        
        q_list = []
        if 'results' in data: q_list = data['results']
        elif 'questions' in data: q_list = data['questions']
        elif 'data' in data: q_list = data['data']
        
        print('Questions:', len(q_list))
        with open('C:/Users/Admin/.gemini/antigravity/scratch/project_2/quantrex-academy/test_questions.json', 'w') as f:
            json.dump(q_list, f, indent=2)
except urllib.error.HTTPError as e:
    print(f"HTTPError: {e.code}")
except Exception as e:
    import traceback
    traceback.print_exc()
