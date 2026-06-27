import urllib.request, ssl, json
url = 'https://blob.vercel-storage.com'
headers = {'authorization': f'Bearer vercel_blob_rw_9fPWnWWgz32uFQdO_kTjaJqwhqsGgDLXQtv4Ei1wJcP8Ief', 'x-api-version': '7'}
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
cursor = ''
has_more = True
blobs = []
while has_more:
    u = url + ('?cursor=' + cursor if cursor else '')
    req = urllib.request.Request(u, headers=headers)
    with urllib.request.urlopen(req, context=ctx) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        blobs.extend(data.get('blobs', []))
        has_more = data.get('hasMore', False)
        cursor = data.get('cursor', '')

print(f"Total blobs: {len(blobs)}")
home_blobs = [b for b in blobs if 'homeData' in b['pathname']]
print("homeData blobs:", len(home_blobs))
for b in home_blobs:
    print(b['pathname'], b['uploadedAt'], b['url'])

test_blobs = [b for b in blobs if 'testsData' in b['pathname']]
print("testsData blobs:", len(test_blobs))
for b in test_blobs:
    print(b['pathname'], b['uploadedAt'], b['url'])
