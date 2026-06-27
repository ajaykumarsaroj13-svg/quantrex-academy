import os
import sys
import json
import urllib.request
import ssl

sys.stdout.reconfigure(encoding='utf-8')

BLOB_TOKEN = 'vercel_blob_rw_9fPWnWWgz32uFQdO_kTjaJqwhqsGgDLXQtv4Ei1wJcP8Ief'

def upload_to_blob(filename, data):
    url = f'https://blob.vercel-storage.com/db/{filename}'
    headers = {
        'authorization': f'Bearer {BLOB_TOKEN}',
        'x-api-version': '7'
    }
    content = json.dumps(data).encode('utf-8')
    req = urllib.request.Request(url, data=content, headers=headers, method='PUT')
    
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    
    try:
        with urllib.request.urlopen(req, context=ctx) as resp:
            print(f"✓ Uploaded {filename} to Vercel Blob")
            return json.loads(resp.read().decode('utf-8'))
    except Exception as e:
        print(f"✗ Failed to upload {filename}: {e}")

def main():
    print("=== Rebuilding Data for Vercel Blob ===")
    
    # 1. Syllabus Data
    syllabus_data = {
        "jee-mains": {
            "label": "JEE Main",
            "subjects": {
                "physics": {"label": "Physics", "chapters": [{"id": "phy_1", "title": "Kinematics", "videos": [], "pdfs": [], "pyqTests": []}]},
                "chemistry": {"label": "Chemistry", "chapters": [{"id": "chem_1", "title": "Atomic Structure", "videos": [], "pdfs": [], "pyqTests": []}]},
                "mathematics": {"label": "Mathematics", "chapters": [{"id": "math_1", "title": "Sets, Relations and Functions", "videos": [], "pdfs": [], "pyqTests": []}]}
            }
        },
        "jee-advanced": {
            "label": "JEE Advanced",
            "subjects": {
                "physics": {"label": "Physics", "chapters": [{"id": "phy_a1", "title": "Rotational Dynamics", "videos": [], "pdfs": [], "pyqTests": []}]},
                "chemistry": {"label": "Chemistry", "chapters": [{"id": "chem_a1", "title": "Thermodynamics", "videos": [], "pdfs": [], "pyqTests": []}]},
                "mathematics": {"label": "Mathematics", "chapters": [{"id": "math_a1", "title": "Complex Numbers", "videos": [], "pdfs": [], "pyqTests": []}]}
            }
        },
        "nda": {
            "label": "NDA",
            "subjects": {
                "mathematics": {"label": "Mathematics", "chapters": [{"id": "nda_math_1", "title": "Algebra", "videos": [], "pdfs": [], "pyqTests": []}]},
                "english": {"label": "English", "chapters": [{"id": "nda_eng_1", "title": "Grammar", "videos": [], "pdfs": [], "pyqTests": []}]},
                "general-science": {"label": "General Science", "chapters": [{"id": "nda_gs_1", "title": "Physics", "videos": [], "pdfs": [], "pyqTests": []}]},
                "general-studies": {"label": "General Studies", "chapters": [{"id": "nda_gst_1", "title": "History", "videos": [], "pdfs": [], "pyqTests": []}]}
            }
        }
    }
    upload_to_blob('syllabusData.json', syllabus_data)
    
    # 2. Test Series Data (187 Mains, 58 Advanced, 20 NDA)
    mains_tests = []
    for i in range(1, 188):
        mains_tests.append({
            'id': f'jee_main_{i}',
            'examType': 'JEE Main',
            'title': f'JEE Main Mock Test {i}',
            'year': '2026',
            'duration': 180,
            'totalMarks': 300,
            'totalQuestions': 90,
            'isOfficial': False
        })
        
    advanced_tests = []
    for i in range(1, 59):
        advanced_tests.append({
            'id': f'jee_adv_{i}',
            'examType': 'JEE Advanced',
            'title': f'JEE Advanced Mock Test {i}',
            'year': '2026',
            'duration': 180,
            'totalMarks': 360,
            'totalQuestions': 54,
            'isOfficial': False
        })
        
    nda_tests = []
    # 2 folders for NDA: Mathematics (10) and General Ability (10)
    for i in range(1, 11):
        nda_tests.append({
            'id': f'nda_math_{i}',
            'examType': 'NDA',
            'title': f'NDA Mathematics Mock Test {i}',
            'folder': 'Mathematics',
            'year': '2026',
            'duration': 150,
            'totalMarks': 300,
            'totalQuestions': 120,
            'isOfficial': False
        })
    for i in range(1, 11):
        nda_tests.append({
            'id': f'nda_gat_{i}',
            'examType': 'NDA',
            'title': f'NDA General Ability Test {i}',
            'folder': 'General Ability',
            'year': '2026',
            'duration': 150,
            'totalMarks': 600,
            'totalQuestions': 150,
            'isOfficial': False
        })
    
    print(f"Generated tests - Main: {len(mains_tests)}, Advanced: {len(advanced_tests)}, NDA: {len(nda_tests)}")
    
    all_tests = mains_tests + advanced_tests + nda_tests
    upload_to_blob('testSeries.json', all_tests)
    upload_to_blob('testsData.json', {'mains': mains_tests, 'advanced': advanced_tests, 'nda': nda_tests})

    # 3. Books Data
    books_data = [{
        'id': 'advanced_mathematics',
        'title': 'Advanced Mathematics',
        'description': 'Advanced Mathematics practice and theory.',
        'coverColor': 'from-blue-500 to-indigo-600',
        'tag': 'Mathematics',
        'pages': '10 Chapters',
        'type': 'interactive',
        'chapters': [
            {'id': 'adv_math_ch1', 'title': 'Chapter 1: Sets, Relations and Functions', 'file': ''},
            {'id': 'adv_math_ch2', 'title': 'Chapter 2: Complex Numbers', 'file': ''},
            {'id': 'adv_math_ch3', 'title': 'Chapter 3: Matrices and Determinants', 'file': ''},
            {'id': 'adv_math_ch4', 'title': 'Chapter 4: Permutations and Combinations', 'file': ''},
            {'id': 'adv_math_ch5', 'title': 'Chapter 5: Mathematical Induction', 'file': ''},
            {'id': 'adv_math_ch6', 'title': 'Chapter 6: Binomial Theorem', 'file': ''},
            {'id': 'adv_math_ch7', 'title': 'Chapter 7: Sequence and Series', 'file': ''},
            {'id': 'adv_math_ch8', 'title': 'Chapter 8: Limit, Continuity and Differentiability', 'file': ''},
            {'id': 'adv_math_ch9', 'title': 'Chapter 9: Integral Calculus', 'file': ''},
            {'id': 'adv_math_ch10', 'title': 'Chapter 10: Differential Equations', 'file': ''},
        ]
    }]
    upload_to_blob('booksData.json', books_data)
    
if __name__ == '__main__':
    main()
