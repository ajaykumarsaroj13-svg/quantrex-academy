"""
login_api.py - obtain ExamGoal session cookies via direct API login.
"""
import json
import requests

MOBILE = "7750858874"
PASSWORD = "12345678"
LOGIN_URL = "https://accounts.examgoal.com/api/v1/auth/login"

payload = {"mobile": MOBILE, "password": PASSWORD}

session = requests.Session()
resp = session.post(LOGIN_URL, json=payload, timeout=10)
print(f"Login status: {resp.status_code}")
if resp.status_code != 200:
    print("Login failed, response:", resp.text)
    exit(1)

# Save cookies to file for scraper
cookies_path = "C:\\Users\\Admin\\.gemini\\antigravity\\scratch\\quantrex-academy\\frontend\\cookies.json"
with open(cookies_path, "w", encoding="utf-8") as f:
    json.dump(session.cookies.get_dict(), f, indent=2)
print(f"Cookies saved to {cookies_path}")
