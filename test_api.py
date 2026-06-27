"""
Test ExamGoal API with saved session cookies
"""
import json
import requests

# Load saved session
with open(r"C:\Users\Admin\.gemini\antigravity\scratch\quantrex-academy\examgoal_session.json") as f:
    session_data = json.load(f)

# Build cookie jar
session = requests.Session()
for ck in session_data["cookies"]:
    session.cookies.set(ck["name"], ck["value"], domain=ck["domain"])

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "eg-app-id": "room-examgoal-com",
    "eg-platform": "desktop",
    "cache-control": "no-cache",
    "Referer": "https://room.examgoal.com/"
}

BASE = "https://room.examgoal.com/api/v1"

print("=" * 60)
print("Testing ExamGoal API with saved session...")
print("=" * 60)

# Test 1: Profile check
print("\n[TEST 1] Profile check...")
r = session.get(f"{BASE}/auth/profile/me", headers=HEADERS)
print(f"  Status: {r.status_code}")
if r.status_code == 200:
    data = r.json()
    print(f"  User: {data.get('name', 'N/A')}, Email: {data.get('email', 'N/A')}")
else:
    print(f"  Response: {r.text[:200]}")

# Test 2: JEE Main subjects
print("\n[TEST 2] JEE Main subjects...")
r = session.get(f"{BASE}/metadata/subjects?country=in&examGroup=jee&exam=jee-main&from=pq", headers=HEADERS)
print(f"  Status: {r.status_code}")
if r.status_code == 200:
    data = r.json()
    print(f"  Response preview: {json.dumps(data)[:500]}")
else:
    print(f"  Response: {r.text[:300]}")

# Test 3: BITSAT subjects
print("\n[TEST 3] BITSAT subjects...")
r = session.get(f"{BASE}/metadata/subjects?country=in&examGroup=engineering&exam=bitsat&from=pq", headers=HEADERS)
print(f"  Status: {r.status_code}")
print(f"  Response preview: {r.text[:400]}")

# Test 4: NDA subjects  
print("\n[TEST 4] NDA subjects...")
r = session.get(f"{BASE}/metadata/subjects?country=in&examGroup=defence&exam=nda&from=pq", headers=HEADERS)
print(f"  Status: {r.status_code}")
print(f"  Response preview: {r.text[:400]}")

# Test 5: NCERT Class 11
print("\n[TEST 5] NCERT Class 11...")
r = session.get(f"{BASE}/metadata/subjects?country=in&examGroup=ncert&exam=ncert-class-11&from=pq", headers=HEADERS)
print(f"  Status: {r.status_code}")
print(f"  Response preview: {r.text[:400]}")

print("\n" + "=" * 60)
print("Done!")
