import urllib.request
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

# Check syllabus
syl = json.loads(urllib.request.urlopen('https://9fpwnwwgz32ufqdo.public.blob.vercel-storage.com/db/syllabusData.json').read().decode('utf-8'))
print("=== SYLLABUS KEYS ===")
print(list(syl.keys()))

for exam_key in syl:
    exam = syl[exam_key]
    subjects = exam.get('subjects', {})
    print(f"\n--- {exam_key} ---")
    print(f"  subjects: {list(subjects.keys())}")
    for sk, sv in subjects.items():
        chs = sv.get('chapters', [])
        print(f"    {sk}: {len(chs)} chapters")

# Check tests
print("\n=== TESTS DATA ===")
tests = json.loads(urllib.request.urlopen('https://9fpwnwwgz32ufqdo.public.blob.vercel-storage.com/db/testsData.json').read().decode('utf-8'))
print(f"Type: {type(tests).__name__}")
if isinstance(tests, list):
    print(f"Count: {len(tests)}")
    # Check exam types
    exam_types = {}
    for t in tests:
        et = t.get('examType', 'unknown')
        exam_types[et] = exam_types.get(et, 0) + 1
    print(f"Exam types: {exam_types}")
elif isinstance(tests, dict):
    print(f"Keys: {list(tests.keys())}")
    for k, v in tests.items():
        if isinstance(v, list):
            print(f"  {k}: {len(v)} tests")
