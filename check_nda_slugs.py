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
    for ch in chapters:
        ch_id = ch.get('id', '')
        url_val = ch.get('url', '')
        slug = url_val.split('/')[-1] if url_val else ch_id
        print(f"  id={ch_id}  url={url_val}  slug={slug}")
