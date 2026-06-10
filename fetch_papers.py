"""
fetch_papers.py – Retrieve list of test IDs for JEE Main, JEE Advanced, NDA.
Uses cookies saved by manual_login.py (manual_cookies.json).
"""
import json, os, sys, time
import requests

BASE = "https://room.examgoal.com/api/v1"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "eg-app-id": "room-examgoal-com",
    "eg-platform": "desktop",
    "Referer": "https://room.examgoal.com/",
    "accept": "application/json",
}

# Load cookies
cookies_path = os.path.join(os.path.dirname(__file__), "manual_cookies.json")
if not os.path.exists(cookies_path):
    print("Cookie file not found at", cookies_path)
    sys.exit(1)
with open(cookies_path, "r", encoding="utf-8") as f:
    raw = json.load(f)
# raw is a list of dicts from Selenium
session = requests.Session()
for c in raw:
    name = c.get("name")
    value = c.get("value")
    domain = c.get("domain", "room.examgoal.com")
    session.cookies.set(name, value, domain=domain)

# Exam series keys (same as used in full_scraper)
EXAMS = [
    {"key": "pyq-in-jee-jee-main", "name": "jee-main"},
    {"key": "pyq-in-jee-jee-advanced", "name": "jee-advanced"},
    {"key": "pyq-in-defence-nda", "name": "nda"},
]

all_papers = {"jee-main": [], "jee-advanced": [], "nda": []}

for cfg in EXAMS:
    series_key = cfg["key"]
    exam_name = cfg["name"]
    url = f"{BASE}/test/test-id-series/{series_key}"
    resp = session.get(url, headers=HEADERS, timeout=15)
    if resp.status_code != 200:
        print(f"Failed to fetch series {series_key}: {resp.status_code}")
        continue
    data = resp.json()
    results = data.get("results", [])
    for group in results:
        group_title = group.get("title", "")
        for test in group.get("tests", []):
            test_id = test.get("testId") or test.get("id")
            title = test.get("title", "")
            if test_id:
                all_papers[exam_name].append({
                    "testId": test_id,
                    "title": title,
                    "group": group_title,
                    "exam": exam_name,
                })
    print(f"Fetched {len(all_papers[exam_name])} papers for {exam_name}")
    time.sleep(0.2)

# Save to paper_list.json
out_path = os.path.join(os.path.dirname(__file__), "paper_list.json")
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(all_papers, f, indent=2, ensure_ascii=False)
print(f"Paper list saved to {out_path}")
