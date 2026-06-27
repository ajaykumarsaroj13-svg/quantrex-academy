import json
import urllib.request
import ssl
import sys

sys.stdout.reconfigure(encoding='utf-8')

BLOB_TOKEN = 'vercel_blob_rw_9fPWnWWgz32uFQdO_kTjaJqwhqsGgDLXQtv4Ei1wJcP8Ief'

def upload_to_blob(filename, data):
    url = f'https://blob.vercel-storage.com/db/{filename}'
    headers = {
        'authorization': f'Bearer {BLOB_TOKEN}',
        'x-api-version': '7', 'x-add-random-suffix': '0'
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
    print("=== Restoring Data to Vercel Blob ===")
    
    # 1. Load RTDB appData
    with open('C:/Users/Admin/.gemini/antigravity/scratch/rtdb_appData.json', 'r', encoding='utf-8') as f:
        rtdb_data = json.load(f)
        
    courses_data = rtdb_data.get('coursesData', [])
    toppers_data = rtdb_data.get('toppersData', [])
    syllabus_data = rtdb_data.get('syllabus', {})
    
    # 2. Upload RTDB data
    if courses_data:
        upload_to_blob('coursesData.json', courses_data)
    if toppers_data:
        upload_to_blob('toppersData.json', toppers_data)
    if syllabus_data:
        upload_to_blob('syllabusData.json', syllabus_data)
        
    # 3. Restore DEFAULT_BOOKS as booksData.json
    books_data = [
      {
        "id": "allen-maths-handbook",
        "title": "Allen Maths Handbook",
        "description": "Complete mathematics formulas and quick revision handbook for JEE Main and Advanced.",
        "coverColor": "from-orange-500 to-red-600",
        "tag": "Mathematics",
        "pages": "200+",
        "file": "/books/Allen-Maths-Handbook.pdf"
      },
      {
        "id": "black-book-maths",
        "title": "Advanced Problems in Mathematics",
        "description": "Vikas Gupta & Pankaj Joshi (Black Book) - Chapter-wise Interactive Practice.",
        "coverColor": "from-gray-800 to-black",
        "tag": "Practice Book",
        "pages": "Interactive",
        "type": "interactive"
      }
    ]
    upload_to_blob('booksData.json', books_data)
    
    # 4. Restore DEFAULT_HOME_CONTENT as homeData.json
    home_data = {
      "heroTitle": "Dominate JEE Math with",
      "heroSubtitle": "Quantrex Academy",
      "heroDescription": "Master JEE Main and Advanced Mathematics with A.K. Sir. Access premium video lectures, complete syllabus coverage, structured mock tests, and smart PYQ analytics.",
      "features": [
        { "id": "f1", "title": "Interactive PYQs", "desc": "Chapter-wise past year questions with smart analytics." },
        { "id": "f2", "title": "Structured Tests", "desc": "Real exam simulation with NTA & TCS iON interface." },
        { "id": "f3", "title": "Expert Video Solutions", "desc": "Detailed explanations by A.K. Sir." }
      ],
      "faqs": [
        { "question": "What is Quantrex Academy?", "answer": "Quantrex Academy is a specialized portal for JEE aspirants focusing deeply on mastering Mathematics." },
        { "question": "Are the mock tests pattern aligned?", "answer": "Yes, our testing platform exactly mimics the official NTA (JEE Main) and TCS iON (JEE Advanced) environments." }
      ]
    }
    upload_to_blob('homeData.json', home_data)
    
    # Do NOT overwrite testsData as it was correctly fixed by me for the NDA bug!

if __name__ == '__main__':
    main()
