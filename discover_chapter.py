import requests
import json

BASE = "https://room.examgoal.com/api/v1"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "eg-app-id": "room-examgoal-com",
    "eg-platform": "desktop",
    "Referer": "https://room.examgoal.com/",
    "accept": "application/json"
}

# 1. Fetch metadata/chapters
url = f"{BASE}/metadata/chapters"
print(f"Fetching {url}")
r = requests.get(url, headers=HEADERS)
data = r.json()

if data.get("statusCode") == 0:
    results = data.get("results", [])
    for group in results:
        # group has 'title', 'chapters'
        title = group.get("title", "")
        if "math" in title.lower():
            for c in group.get("chapters", []):
                if "sequence" in c.get("name", "").lower():
                    print(f"FOUND CHAPTER: {c}")
else:
    print("Failed to fetch chapters")
    print(r.text[:500])

