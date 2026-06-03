"""
Login to ExamGoal using Selenium, then capture the auth token from network traffic
and use it to make direct API requests.
"""
import time
import json
import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

MOBILE = "7750858874"
PASSWORD = "12345678"

def login_and_capture():
    print("Starting login and token capture...")
    
    options = webdriver.ChromeOptions()
    options.set_capability("goog:loggingPrefs", {"performance": "ALL"})
    options.add_argument("--start-maximized")
    
    driver = webdriver.Chrome(options=options)
    wait = WebDriverWait(driver, 20)
    
    auth_token = None
    
    try:
        print("Opening login page...")
        driver.get("https://accounts.examgoal.com/login?redirect=https://room.examgoal.com/")
        time.sleep(4)
        
        # Find and fill email/phone
        inputs = driver.find_elements(By.CSS_SELECTOR, "input")
        for inp in inputs:
            if inp.get_attribute("type") in ("text", "tel", "email"):
                inp.clear()
                inp.send_keys(MOBILE)
                print(f"Entered mobile in field: {inp.get_attribute('name')}")
                break
        
        # Click Continue
        try:
            btn = wait.until(EC.element_to_be_clickable((By.XPATH, 
                "//button[contains(text(),'Continue') or contains(text(),'Next') or contains(text(),'Login')]")))
            btn.click()
            time.sleep(2)
        except Exception as e:
            print(f"Continue button: {e}")
        
        # Fill password
        time.sleep(1)
        pass_inputs = driver.find_elements(By.CSS_SELECTOR, "input[type='password']")
        if pass_inputs:
            pass_inputs[0].clear()
            pass_inputs[0].send_keys(PASSWORD)
            print("Entered password")
            
            try:
                submit = driver.find_element(By.XPATH, "//button[@type='submit']")
                submit.click()
            except:
                pass_inputs[0].submit()
        
        print("Waiting for login and redirect...")
        time.sleep(12)
        
        print(f"URL after login: {driver.current_url}")
        
        # Navigate to room and wait for API calls
        if "room.examgoal.com" not in driver.current_url:
            driver.get("https://room.examgoal.com/")
            time.sleep(10)
        
        # Parse performance logs to find auth token
        print("Scanning network traffic for auth token...")
        logs = driver.get_log("performance")
        for entry in logs:
            try:
                log = json.loads(entry["message"])["message"]
                if log["method"] == "Network.requestWillBeSent":
                    headers = log["params"]["request"].get("headers", {})
                    for k, v in headers.items():
                        if k.lower() in ("authorization", "x-auth-token", "token", "bearer"):
                            auth_token = v
                            print(f"FOUND AUTH TOKEN: {k} = {v[:50]}...")
                            break
            except:
                pass
        
        # Also check cookies for auth token
        cookies = driver.get_cookies()
        for ck in cookies:
            if "token" in ck["name"].lower() or "auth" in ck["name"].lower() or "jwt" in ck["name"].lower():
                print(f"Auth cookie found: {ck['name']} = {ck['value'][:50]}...")
        
        # Get Firebase auth token from localStorage
        local_storage = driver.execute_script("return Object.assign({}, window.localStorage);")
        for key, value in local_storage.items():
            if "token" in key.lower() or "firebase" in key.lower() or "user" in key.lower():
                print(f"LocalStorage auth key: {key} = {str(value)[:100]}")
        
        # Try to intercept a real API call to get the token
        # Navigate to PYQ page which makes authenticated requests
        print("\nNavigating to PYQ page to capture auth token in real API call...")
        driver.get("https://room.examgoal.com/practice-questions/jee-main/physics")
        time.sleep(8)
        
        new_logs = driver.get_log("performance")
        for entry in new_logs:
            try:
                log = json.loads(entry["message"])["message"]
                if log["method"] in ("Network.requestWillBeSent", "Network.responseReceived"):
                    if "past-question" in str(log.get("params", {})):
                        req = log["params"].get("request", {})
                        headers = req.get("headers", {})
                        for k, v in headers.items():
                            if "auth" in k.lower() or "token" in k.lower() or "bearer" in str(v).lower():
                                auth_token = v
                                print(f"CAPTURED AUTH HEADER: {k}: {v[:80]}")
            except:
                pass
        
        # Save full session data
        session_out = {
            "auth_token": auth_token,
            "cookies": cookies,
            "local_storage": local_storage,
            "current_url": driver.current_url
        }
        
        out = r"C:\Users\Admin\.gemini\antigravity\scratch\quantrex-academy\examgoal_full_session.json"
        with open(out, "w", encoding="utf-8") as f:
            json.dump(session_out, f, indent=2, default=str)
        print(f"\nFull session saved to {out}")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        driver.quit()

if __name__ == "__main__":
    login_and_capture()
