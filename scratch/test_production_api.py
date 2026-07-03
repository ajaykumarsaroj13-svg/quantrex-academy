# Test content API type parameter
import urllib.request

urls = [
    "https://quantrexacademy.vercel.app/api/v2/content?type=app-config",
    "https://quantrexacademy.vercel.app/api/v2/content?type=syllabus"
]

for url in urls:
    print(f"Testing URL: {url}")
    try:
        req = urllib.request.Request(url, method="GET")
        with urllib.request.urlopen(req, timeout=5) as response:
            print(f"  GET Code: {response.status}")
            body = response.read().decode('utf-8')
            print(f"  Response: {body[:300]}")
    except Exception as e:
         print(f"  Error: {e}")
