"""
Navigate to a JEE Main chapter page in Selenium and capture the exact API call
that loads questions - this will reveal the correct endpoint.
"""
import time
import json
from selenium import webdriver

MOBILE = "7750858874"
PASSWORD = "12345678"

def capture_question_api():
    options = webdriver.ChromeOptions()
    options.set_capability("goog:loggingPrefs", {"performance": "ALL"})
    options.add_argument("--start-maximized")
    
    driver = webdriver.Chrome(options=options)
    
    try:
        # Login
        print("Logging in...")
        driver.get("https://accounts.examgoal.com/login?redirect=https://room.examgoal.com/")
        time.sleep(4)
        
        inputs = driver.find_elements("css selector", "input")
        for inp in inputs:
            if inp.get_attribute("type") in ("text", "tel"):
                inp.send_keys(MOBILE)
                break
        
        time.sleep(1)
        
        pass_inputs = driver.find_elements("css selector", "input[type='password']")
        if pass_inputs:
            pass_inputs[0].send_keys(PASSWORD)
            try:
                driver.find_element("xpath", "//button[@type='submit']").click()
            except:
                pass_inputs[0].submit()
        
        time.sleep(10)
        print(f"After login: {driver.current_url}")
        
        # Navigate to JEE Main Physics > Units & Measurements chapter
        print("Navigating to chapter page...")
        driver.get("https://room.examgoal.com/practice-questions/jee-main/physics/units-and-measurements")
        time.sleep(8)
        
        print(f"Chapter page: {driver.current_url}")
        
        # Capture ALL network calls
        logs = driver.get_log("performance")
        api_calls = []
        
        for entry in logs:
            try:
                log = json.loads(entry["message"])["message"]
                if log["method"] == "Network.requestWillBeSent":
                    url = log["params"]["request"]["url"]
                    if "examgoal" in url and "api" in url:
                        method = log["params"]["request"]["method"]
                        headers = log["params"]["request"]["headers"]
                        post_data = log["params"]["request"].get("postData", "")
                        api_calls.append({
                            "url": url,
                            "method": method,
                            "headers": {k:v for k,v in headers.items() if k.lower() not in ("user-agent",)},
                            "postData": post_data
                        })
            except:
                pass
        
        # Also capture response data for question-related endpoints
        print(f"\nFound {len(api_calls)} API calls. Looking for question-related ones...")
        for call in api_calls:
            url = call["url"]
            if any(kw in url for kw in ("question", "past-question", "pq", "chapter")):
                print(f"\n{'='*50}")
                print(f"URL: {url}")
                print(f"Method: {call['method']}")
                if call['postData']:
                    print(f"PostData: {call['postData'][:200]}")
        
        # Save all API calls
        out = r"C:\Users\Admin\.gemini\antigravity\scratch\quantrex-academy\chapter_api_calls.json"
        with open(out, "w") as f:
            json.dump(api_calls, f, indent=2)
        print(f"\nAll API calls saved to {out}")
        
        # Now intercept actual responses by making fresh requests with captured session
        cookies = driver.get_cookies()
        print(f"\nCookies: {[c['name'] for c in cookies]}")
        cookie_out = r"C:\Users\Admin\.gemini\antigravity\scratch\quantrex-academy\fresh_cookies.json"
        with open(cookie_out, "w") as f:
            json.dump(cookies, f, indent=2)
        print(f"Fresh cookies saved to {cookie_out}")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        driver.quit()

if __name__ == "__main__":
    capture_question_api()
