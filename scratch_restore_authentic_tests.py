import os
import json
import urllib.request
import ssl
import sys

BLOB_TOKEN = 'vercel_blob_rw_9fPWnWWgz32uFQdO_kTjaJqwhqsGgDLXQtv4Ei1wJcP8Ief'
TESTS_DIR = 'public/data/tests'

def upload_to_blob(filename, data):
    url = f'https://blob.vercel-storage.com/db/{filename}'
    headers = {
        'authorization': f'Bearer {BLOB_TOKEN}',
        'x-api-version': '7'
    }
    content = json.dumps(data, default=str).encode('utf-8')
    req = urllib.request.Request(url, data=content, headers=headers, method='PUT')
    
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    
    try:
        with urllib.request.urlopen(req, context=ctx) as resp:
            print(f"[OK] Uploaded {filename}")
    except Exception as e:
        print(f"[FAIL] Failed to upload {filename}: {e}")

def main():
    if not os.path.exists(TESTS_DIR):
        print("Tests directory not found.")
        return
        
    mains_tests = []
    advanced_tests = []
    nda_tests = []
    
    for fname in os.listdir(TESTS_DIR):
        if not fname.endswith('.json'):
            continue
            
        fpath = os.path.join(TESTS_DIR, fname)
        try:
            with open(fpath, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
            exam_type = data.get('examType', '')
            if not exam_type and data.get('exam'):
                exam_type = data.get('exam')
                
            test_id = data.get('testId')
            if not test_id:
                test_id = data.get('id', fname.replace('.json', ''))
                
            entry = {
                'id': test_id,
                'examType': exam_type,
                'title': data.get('title', 'Unknown Test'),
                'year': data.get('year', '2026'),
                'duration': data.get('durationMinutes', data.get('duration', 180)),
                'totalMarks': data.get('totalMarks', 300),
                'totalQuestions': data.get('totalQuestions', len(data.get('questions', []))),
                'isOfficial': data.get('isOfficial', True)
            }
            
            if 'advanced' in str(exam_type).lower():
                advanced_tests.append(entry)
            elif 'nda' in str(exam_type).lower():
                nda_tests.append(entry)
            else:
                mains_tests.append(entry)
                
        except Exception as e:
            print(f"Error reading {fname}: {e}")
            
    print(f"Stats - Mains: {len(mains_tests)}, Advanced: {len(advanced_tests)}, NDA: {len(nda_tests)}")
    
    tests_data = {
        'mains': mains_tests,
        'advanced': advanced_tests,
        'nda': nda_tests
    }
    
    upload_to_blob('testsData.json', tests_data)
    upload_to_blob('testSeries.json', mains_tests + advanced_tests + nda_tests)

if __name__ == "__main__":
    main()
