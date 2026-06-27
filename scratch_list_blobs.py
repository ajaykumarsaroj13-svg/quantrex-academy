import urllib.request
import ssl
import json

BLOB_TOKEN = 'vercel_blob_rw_9fPWnWWgz32uFQdO_kTjaJqwhqsGgDLXQtv4Ei1wJcP8Ief'

def list_blobs():
    url = 'https://blob.vercel-storage.com'
    headers = {
        'authorization': f'Bearer {BLOB_TOKEN}',
        'x-api-version': '7'
    }
    req = urllib.request.Request(url, headers=headers)
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    try:
        with urllib.request.urlopen(req, context=ctx) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            print("Blobs:")
            for b in data.get('blobs', []):
                if b['pathname'] == 'db/homeData.json': print(f"{b['pathname']} (uploaded {b['uploadedAt']}) - {b['url']}")
    except Exception as e:
        print(f"Error: {e}")

list_blobs()
