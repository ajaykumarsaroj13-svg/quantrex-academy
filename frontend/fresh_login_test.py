"""
FRESH LOGIN + TEST FETCH
Login fresh, capture new cookies, then fetch test questions
"""
import time, json, requests
from selenium import webdriver
from selenium.webdriver.common.by import By

MOBILE = "7750858874"
PASSWORD = "12345678"

def get_fresh_session():
    options = webdriver.ChromeOptions()
    options.set_capability("goog:loggingPrefs", {"performance": "ALL"})
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    driver = webdriver.Chrome(options=options)
    try:
        driver.get("https://accounts.examgoal.com/login?redirect=https://room.examgoal.com/")
        time.sleep(4)
        # Fill login form
        for inp in driver.find_elements(By.CSS_SELECTOR, "input"):
            if inp.get_attribute("type") in ("text", "tel"):
                inp.clear()
                inp.send_keys(MOBILE)
                break
        time.sleep(1)
        for inp in driver.find_elements(By.CSS_SELECTOR, "input[type='password']"):
            inp.clear()
            inp.send_keys(PASSWORD)
            break
        try:
            driver.find_element(By.XPATH, "//button[@type='submit']").click()
        except Exception:
            pass
        time.sleep(12)
        # Ensure we are on the main app
        if "room.examgoal.com" not in driver.current_url:
            driver.get("https://room.examgoal.com/")
            time.sleep(5)
        # Navigate to a known test page to trigger API calls
        test_id = "tst-19g71mnuno3s0"
        driver.get(f"https://room.examgoal.com/tests/{test_id}")
        time.sleep(8)
        # Capture performance logs
        logs = driver.get_log("performance")
        token = None
        for entry in logs:
            try:
                message = json.loads(entry["message"])["message"]
                if message["method"] == "Network.requestWillBeSent":
                    req = message["params"]["request"]
                    url = req.get("url", "")
                    if "examgoal.com/api" in url:
                        headers = req.get("headers", {})
                        auth = headers.get("Authorization")
                        if auth:
                            token = auth
                            break
            except Exception:
                continue
        # Save cookies
        cookies = driver.get_cookies()
        with open(r"C:\\Users\\Admin\\.gemini\\antigravity\\scratch\\quantrex-academy\\test_cookies.json", "w") as f:
            json.dump(cookies, f, indent=2)
        # Save token if found
        if token:
            with open(r"C:\\Users\\Admin\\.gemini\\antigravity\\scratch\\quantrex-academy\\token.txt", "w") as f:
                f.write(token)
        print("Login completed. Cookies and token saved.")
    finally:
        driver.quit()

if __name__ == "__main__":
    get_fresh_session()
