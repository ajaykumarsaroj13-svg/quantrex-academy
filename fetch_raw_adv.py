
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
r = s.get(f"{BASE}/past-question/tests/by-chapter/matrices-and-determinants", params={
    "country": "in",
    "examGroup": "jee",
    "exam": "jee-advanced"
})

with open("raw_adv_matrices.json", "w", encoding="utf-8") as f:
    f.write(r.text)
print(r.status_code)

