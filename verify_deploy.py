import urllib.request
import json
import sys
sys.stdout.reconfigure(encoding='utf-8')

test_files = [
    'nda_english_synonyms',
    'nda_mathematics_logarithms', 
    'nda_general-science_physics',
    'nda_general-studies_history',
    'sets-relations-and-functions',  # JEE file
]

for slug in test_files:
    url = f'https://quantrexacademy.vercel.app/data/questions/{slug}.json'
    try:
        resp = urllib.request.urlopen(url)
        ct = resp.headers.get('Content-Type', '')
        data = json.loads(resp.read().decode('utf-8'))
        count = len(data) if isinstance(data, list) else len(data.get('data', []))
        print(f"  OK  {slug}: {count} questions ({ct.split(';')[0]})")
    except Exception as e:
        print(f"  FAIL {slug}: {e}")
