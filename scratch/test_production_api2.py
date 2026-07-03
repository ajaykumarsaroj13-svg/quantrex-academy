# Test multiple endpoints
import urllib.request

endpoints = [
    "https://quantrexacademy.vercel.app/api/auth",
    "https://quantrexacademy.vercel.app/api/backup",
    "https://quantrexacademy.vercel.app/api/progress",
    "https://quantrexacademy.vercel.app/api/v2/auth",
    "https://quantrexacademy.vercel.app/api/admin/revenue"
]

for url in endpoints:
    print(f"Testing URL: {url}")
    try:
        req = urllib.request.Request(url, method="POST", data=b'{"action":"test"}', headers={"Content-Type":"application/json"})
        with urllib.request.urlopen(req, timeout=5) as response:
            print(f"  POST Code: {response.status}")
            body = response.read().decode('utf-8')
            print(f"  Snippet: {body[:150]}")
    except Exception as e:
         print(f"  Error: {e}")
