import urllib.request
import sys
sys.stdout.reconfigure(encoding='utf-8')

url = 'https://quantrexacademy.vercel.app/data/questions/nda_english_synonyms.json'
try:
    req = urllib.request.Request(url)
    resp = urllib.request.urlopen(req)
    content = resp.read().decode('utf-8')
    print(f"Status: {resp.status}")
    print(f"Content-Type: {resp.headers.get('Content-Type')}")
    print(f"First 200 chars: {content[:200]}")
except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code}")
    print(f"Response: {e.read().decode('utf-8')[:200]}")
