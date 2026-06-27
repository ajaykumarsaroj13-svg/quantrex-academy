import os
import json
import pymongo
import certifi
import urllib.request
import ssl

URI = "mongodb+srv://ajaykumarsaroj13_db_usar:quantrex2026@cluster0.jde6gri.mongodb.net/quantrex?retryWrites=true&w=majority&appName=Cluster0"
BLOB_TOKEN = 'vercel_blob_rw_9fPWnWWgz32uFQdO_kTjaJqwhqsGgDLXQtv4Ei1wJcP8Ief'

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
    client = pymongo.MongoClient(URI, tlsCAFile=certifi.where())
    db = client['quantrex']
    
    chapters_coll = db['blackbookchapters']
    chapters = list(chapters_coll.find({}))
    
    formatted_chapters = []
    for ch in chapters:
        formatted_chapters.append({
            'id': ch.get('id', str(ch.get('_id'))),
            'title': ch.get('title', ''),
            'subject': ch.get('subject', 'Mathematics'),
            'exercises': ch.get('exercises', [])
        })
        
    books_data = [
        {
            'id': 'allen_handbook',
            'title': 'Allen Maths Handbook',
            'description': 'Allen Mathematics Handbook for quick revision.',
            'coverColor': 'from-green-500 to-teal-600',
            'tag': 'Mathematics',
            'type': 'pdf',
            'file': 'books/Allen-Maths-Handbook.pdf'
        },
        {
            'id': 'advanced_mathematics',
            'title': 'Black Book (Advanced Mathematics)',
            'description': 'Advanced Mathematics practice and theory by Vikas Gupta.',
            'coverColor': 'from-blue-500 to-indigo-600',
            'tag': 'Mathematics',
            'pages': f'{len(formatted_chapters)} Chapters',
            'type': 'interactive',
            'chapters': formatted_chapters
        }
    ]
    
    upload_to_blob('booksData.json', books_data)

if __name__ == "__main__":
    main()
