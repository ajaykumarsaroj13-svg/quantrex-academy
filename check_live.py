import urllib.request, json

for fname in ['indefinite-integrals.json', 'area-under-the-curves.json', 'differential-equations.json']:
    url = f'https://quantrexacademy.vercel.app/data/questions/{fname}'
    try:
        data = json.loads(urllib.request.urlopen(url).read())
        total = len(data) if isinstance(data, list) else 'dict'
        if isinstance(data, list):
            has_idx = sum(1 for q in data if q.get('correctOptionIndex') is not None)
            has_ans = sum(1 for q in data if q.get('correctAnswer'))
            print(f"LIVE {fname}: total={total}, has_correctOptionIndex={has_idx}, has_correctAnswer={has_ans}")
            q = data[0]
            print(f"  First Q: correctOptionIndex={q.get('correctOptionIndex')}, correctAnswer={repr(q.get('correctAnswer'))}")
        else:
            print(f"LIVE {fname}: type=dict")
    except Exception as e:
        print(f"LIVE {fname}: ERROR - {e}")
