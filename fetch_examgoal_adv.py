
import requests
import json

with open(r"C:\Users\Admin\.gemini\antigravity\scratch\quantrex-academy\test_cookies.json", "r") as f:
    cookies = json.load(f)

s = requests.Session()
for c in cookies:
    s.cookies.set(c["name"], c["value"])

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "eg-app-id": "room-examgoal-com",
    "eg-platform": "desktop",
    "Referer": "https://room.examgoal.com/",
    "accept": "application/json",
    "content-type": "application/json"
}

s.headers.update(HEADERS)
BASE = "https://room.examgoal.com/api/v1"

# Fetch questions for Matrices and Determinants in JEE Advanced
# We need the chapter ID. For Matrices it is "matrices-and-determinants"
# Try fetching chapter questions
payload = {
    "country": "in",
    "examGroup": "jee",
    "exam": "jee-advanced",
    "subject": "mathematics",
    "chapter": "matrices-and-determinants",
    "type": "question",
    "limit": 100,
    "skip": 0
}
r = s.get(f"{BASE}/practice/questions", params=payload)
print(r.status_code, r.text)

with open("temp_adv.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)

print("Saved to temp_adv.json")

