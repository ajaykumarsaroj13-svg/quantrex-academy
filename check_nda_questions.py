import urllib.request
import json
import sys
sys.stdout.reconfigure(encoding='utf-8')

# Get NDA syllabus chapters to check their slugs
syl = json.loads(urllib.request.urlopen('https://9fpwnwwgz32ufqdo.public.blob.vercel-storage.com/db/syllabusData.json').read().decode('utf-8'))

nda = syl.get('nda', {})
subjects = nda.get('subjects', {})

for subj_key, subj_val in subjects.items():
    print(f"\n=== NDA {subj_key} ===")
    chapters = subj_val.get('chapters', [])
    for ch in chapters[:3]:  # check first 3 per subject
        slug = ch.get('id', '')
        url_val = ch.get('url', '')
        if url_val:
            slug = url_val.split('/')[-1]
        
        file_url = f'https://quantrexacademy.vercel.app/data/questions/{slug}.json'
        try:
            resp = urllib.request.urlopen(file_url)
            data = json.loads(resp.read().decode('utf-8'))
            if isinstance(data, list):
                print(f"  {slug}: {len(data)} questions (array)")
            elif isinstance(data, dict):
                qs = data.get('data', data.get('questions', []))
                if isinstance(qs, list):
                    print(f"  {slug}: {len(qs)} questions (dict)")
                else:
                    print(f"  {slug}: dict with keys {list(data.keys())[:5]}")
            else:
                print(f"  {slug}: {type(data).__name__}")
        except Exception as e:
            print(f"  {slug}: NOT FOUND ({e})")
