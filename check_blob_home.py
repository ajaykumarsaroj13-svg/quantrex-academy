import urllib.request
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

urls = {
    'homeData': 'https://9fpwnwwgz32ufqdo.public.blob.vercel-storage.com/db/homeData.json',
    'booksData': 'https://9fpwnwwgz32ufqdo.public.blob.vercel-storage.com/db/booksData.json'
}

for name, url in urls.items():
    try:
        data = json.loads(urllib.request.urlopen(url).read().decode('utf-8'))
        print(f"\n=== {name} ===")
        print(json.dumps(data, indent=2))
    except Exception as e:
        print(f"Error fetching {name}: {e}")
