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
        'x-api-version': '7',
        'x-add-random-suffix': '0'
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
    print("=== Restoring testsData to Vercel Blob ===")
    
    # 1. Load RTDB appData
    with open('C:/Users/Admin/.gemini/antigravity/scratch/rtdb_appData.json', 'r', encoding='utf-8') as f:
        rtdb_data = json.load(f)
        
    test_series_metadata = rtdb_data.get('testSeriesMetadata', [])
    
    # 2. Upload RTDB data as testsData.json
    if test_series_metadata:
        upload_to_blob('testsData.json', test_series_metadata)
        upload_to_blob('testSeries.json', test_series_metadata)
    else:
        print("No testSeriesMetadata found in RTDB appData.")

if __name__ == '__main__':
    main()
