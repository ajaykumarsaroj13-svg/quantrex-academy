"""
login_automated.py – Automate ExamGoal login via Selenium, capture session cookies.
"""
import json, os, time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

MOBILE = "7750858874"
PASSWORD = "12345678"
LOGIN_URL = "https://accounts.examgoal.com/login?redirect=https://room.examgoal.com/"

options = webdriver.ChromeOptions()
options.add_argument("--start-maximized")
# you can add headless if you don't need UI, but keep visible for debugging
# options.add_argument("--headless")

driver = webdriver.Chrome(options=options)
try:
    driver.get(LOGIN_URL)
    wait = WebDriverWait(driver, 30)
    # Mobile/telephone field – may be of type text or tel
    mobile_input = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "input[type='tel'], input[type='text']")))
    mobile_input.clear()
    mobile_input.send_keys(MOBILE)
    # Password field
    pwd_input = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "input[type='password']")))
    pwd_input.clear()
    pwd_input.send_keys(PASSWORD)
    # Submit button – try common selectors
    submit_btn = None
    try:
        submit_btn = driver.find_element(By.XPATH, "//button[@type='submit']")
    except Exception:
        # fallback: first button element
        submit_btn = driver.find_element(By.TAG_NAME, "button")
    submit_btn.click()
    # Wait for redirect to room.examgoal.com
    max_wait = 60
    waited = 0
    while waited < max_wait:
        if "room.examgoal.com" in driver.current_url:
            break
        time.sleep(3)
        waited += 3
    # Capture all cookies (both domains)
    cookies = driver.get_cookies()
    out_path = os.path.join(os.path.dirname(__file__), "automated_cookies.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(cookies, f, indent=2)
    print(f"[INFO] Cookies saved to {out_path}")
finally:
    driver.quit()
