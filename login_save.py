import requests, json, os, sys

LOGIN_URL = 'https://accounts.examgoal.com/api/v1/auth/login/phone'
PHONE = '7750858874'
PASSWORD = '12345678'

payload = {"phone": PHONE, "password": PASSWORD}

import uuid

# ... (previous imports remain)

# Generate a random device ID for the required header
DEVICE_ID = f"s%3A{uuid.uuid4().hex}"  # mimic the format seen in previous cookies

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Referer": "https://room.examgoal.com/",
    "eg-app-id": "room-examgoal-com",
    "eg-platform": "desktop",
    "eg-device-id": DEVICE_ID,
}


resp = requests.post(LOGIN_URL, json=payload, headers=headers, timeout=15)
if resp.status_code != 200:
    print(f"Login failed: {resp.status_code}")
    print(resp.text)
    sys.exit(1)

data = resp.json()
if data.get('statusCode') != 0:
    print('Login error response:', data)
    sys.exit(1)

# Extract cookies
cookies = resp.cookies.get_dict()
# Save to cookies.json in the same folder as the scraper
out_path = os.path.join(os.path.dirname(__file__), 'cookies.json')
os.makedirs(os.path.dirname(out_path), exist_ok=True)
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(cookies, f, indent=2)
print(f"Saved fresh cookies to {out_path}")
