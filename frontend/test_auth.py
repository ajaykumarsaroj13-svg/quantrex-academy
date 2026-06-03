import requests
import json

COOKIES = {
    "_ga": "GA1.1.1276000664.1780383846",
    "IR_UID": "35d44b89-383e-43d0-9194-d724d4617d73",
    "IR_SSID": "5480f8ee-ed80-481c-9364-c92c47638bc1",
    "eg-device-id": "s%3A3bb49b90-5e51-11f1-aca8-e9d769b4726d19g61mpwakjwp.Tl%2FuOwrutq86FBQboBKPIH5ZjFTIzbKb2PtIWynfzy4",
    "SSID": "s%3ApQTLMAf9YwWyo3HoC1f9pQ3m63nQ0QtuyJDoqWZUi08Vsr7W5wcbGSKMPrRKSyhs7tJFWWf0fKc2mrA8WbDMhlmNS0C9GXj69gkRG34Eg3egLISANrDdWBJCqqWrNBMv.djrR2rKRg5mJePlLoxupF%2Bd4HQX%2Bu%2Ba0JdK6pUMoEmg",
    "AWSALBCORS": "ktpfqXjAojzXa4otsXqgvXr7n8hY62oePEt4ki7FjCOJredTmOXjESuacFYDqcFIv6U3GVZqdytm2JOGu/QpRw2CA9IAnczRQWjO1cazVZeMtiZ7jZOqdd7kj2XM",
    "AWSALB": "ktpfqXjAojzXa4otsXqgvXr7n8hY62oePEt4ki7FjCOJredTmOXjESuacFYDqcFIv6U3GVZqdytm2JOGu/QpRw2CA9IAnczRQWjO1cazVZeMtiZ7jZOqdd7kj2XM",
}

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "eg-app-id": "room-examgoal-com",
    "eg-platform": "desktop",
    "Referer": "https://room.examgoal.com/",
    "accept": "application/json",
}

s = requests.Session()
for k, v in COOKIES.items():
    s.cookies.set(k, v)

BASE = "https://room.examgoal.com/api/v1"

print("[1] Profile check...")
r = s.get(f"{BASE}/auth/profile/me", headers=HEADERS)
print(f"    Status: {r.status_code}")
if r.status_code == 200:
    d = r.json()
    print(f"    Logged in as: {d.get('name','?')} ({d.get('email','?')})")
else:
    print(f"    {r.text[:200]}")

print("\n[2] JEE Main chapters for Physics...")
# First get physics metaId
r = s.get(f"{BASE}/metadata/subjects?country=in&examGroup=jee&exam=jee-main&from=pq", headers=HEADERS)
subjects = r.json().get("results", [])
physics = next((s for s in subjects if s.get("key") == "physics"), None)
if physics:
    pid = physics["metaId"]
    print(f"    Physics metaId: {pid}")
    
    # Try statistics endpoint
    r2 = s.get(f"{BASE}/past-question/user/statistics/{pid}", headers=HEADERS)
    print(f"    Statistics status: {r2.status_code}")
    print(f"    Response preview: {r2.text[:500]}")

print("\n[3] Try chapters endpoint...")
r3 = s.get(f"{BASE}/metadata/chapters?country=in&examGroup=jee&exam=jee-main&subject=physics&from=pq", headers=HEADERS)
print(f"    Status: {r3.status_code}")
print(f"    Response preview: {r3.text[:600]}")

print("\n[4] Try questions by chapter endpoint...")
# The chapter IDs from JEE metadata
r4 = s.get(f"{BASE}/past-question/tests/personalized/test?exam=jee-main&examGroup=jee", headers=HEADERS)
print(f"    Status: {r4.status_code}")
print(f"    Response preview: {r4.text[:500]}")
