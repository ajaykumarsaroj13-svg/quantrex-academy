"""
manual_login.py – Open Chrome for user to log in manually.
After the user completes login, the script captures the session cookies
and saves them to `manual_cookies.json` for later API use.
"""
import time, json, os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service as ChromeService
# Adjust path to chromedriver if needed
service = ChromeService()
options = webdriver.ChromeOptions()
options.add_argument("--start-maximized")
# Keep the browser open for manual interaction
driver = webdriver.Chrome(service=service, options=options)

try:
    # Open the ExamGoal login page
    login_url = "https://accounts.examgoal.com/login?redirect=https://room.examgoal.com/"
    driver.get(login_url)
    print("[INFO] Chrome opened – please complete the login manually.")
    # Wait until the URL changes to the room after successful login (or max 180 sec)
    max_wait = 180
    waited = 0
    while waited < max_wait:
        current = driver.current_url
        if "room.examgoal.com" in current:
            break
        time.sleep(5)
        waited += 5
    if "room.examgoal.com" not in driver.current_url:
        print("[WARN] Login not detected after wait – proceeding anyway.")
        if any(name.lower() in ('ssid', 'eg-device-id', 'eg-auth-token') for name in names):
            break
        time.sleep(2)
        waited += 2
    out_path = os.path.join(os.path.dirname(__file__), "manual_cookies.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(cookies, f, indent=2)
    print(f"[INFO] Cookies saved to {out_path}")
finally:
    # Keep browser open for a bit so user can see the result, then close
    time.sleep(10)
    driver.quit()
