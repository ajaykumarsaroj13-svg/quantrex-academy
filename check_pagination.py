import urllib.request, ssl, json
url = 'https://blob.vercel-storage.com'
headers = {'authorization': f'Bearer vercel_blob_rw_9fPWnWWgz32uFQdO_kTjaJqwhqsGgDLXQtv4Ei1wJcP8Ief', 'x-api-version': '7'}
req = urllib.request.Request(url, headers=headers)
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
with urllib.request.urlopen(req, context=ctx) as resp:
    data = json.loads(resp.read().decode('utf-8'))
    print("Keys in response:", data.keys())
    if 'hasMore' in data: print("hasMore:", data['hasMore'])
