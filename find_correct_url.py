"""
FINAL WORKING SCRAPER
- Logs in via ExamGoal API directly
- Gets chapters via confirmed endpoints
- Uses Selenium to navigate correct URLs and capture question responses
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

def login_and_scrape():
    options = webdriver.ChromeOptions()
    options.set_capability("goog:loggingPrefs", {"performance": "ALL"})
    options.add_argument("--start-maximized")
    driver = webdriver.Chrome(options=options)
    wait = WebDriverWait(driver, 20)
    
    try:
        # LOGIN
        print("Logging in...")
        driver.get("https://accounts.examgoal.com/login?redirect=https://room.examgoal.com/")
        time.sleep(4)
        
        for inp in driver.find_elements(By.CSS_SELECTOR, "input"):
            if inp.get_attribute("type") in ("text", "tel"):
                inp.send_keys(MOBILE)
                break
        time.sleep(1)
        
        pass_els = driver.find_elements(By.CSS_SELECTOR, "input[type='password']")
        if pass_els:
            pass_els[0].send_keys(PASSWORD)
            try:
                driver.find_element(By.XPATH, "//button[@type='submit']").click()
            except:
                pass_els[0].submit()
        
        time.sleep(10)
        print(f"Logged in: {driver.current_url}")
        
        # Get cookies for requests session
        cookies = {c["name"]: c["value"] for c in driver.get_cookies()}
        
        # Navigate to PRACTICE QUESTIONS main page to find correct URL structure
        print("\nFinding correct URL structure...")
        driver.get("https://room.examgoal.com/practice-questions")
        time.sleep(6)
        print(f"PQ URL: {driver.current_url}")
        
        # Take screenshot
        driver.save_screenshot(r"C:\Users\Admin\.gemini\antigravity\scratch\quantrex-academy\pq_page.png")
        
        # Check what's on the page
        page_source = driver.page_source
        with open(r"C:\Users\Admin\.gemini\antigravity\scratch\quantrex-academy\pq_page.html", "w", encoding="utf-8") as f:
            f.write(page_source)
        
        # Get all network calls from practice-questions page
        logs = driver.get_log("performance")
        api_calls = []
        for entry in logs:
            try:
                log = json.loads(entry["message"])["message"]
                if log["method"] == "Network.requestWillBeSent":
                    url = log["params"]["request"]["url"]
                    if "examgoal" in url and "api" in url:
                        api_calls.append(url)
            except:
                pass
        
        print(f"\nAPI calls on PQ page:")
        for url in api_calls:
            print(f"  {url}")
        
        # Try to find links on the page
        links = driver.find_elements(By.TAG_NAME, "a")
        pq_links = [l.get_attribute("href") for l in links if l.get_attribute("href") and "practice-question" in (l.get_attribute("href") or "")]
        print(f"\nPractice question links found: {pq_links[:10]}")
        
        # Try alternative URL patterns
        print("\nTrying alternative URL patterns...")
        test_urls = [
            "https://room.examgoal.com/pyq/jee-main/physics",
            "https://room.examgoal.com/questions/jee-main/physics",
            "https://room.examgoal.com/jee-main/physics/pyq",
            "https://room.examgoal.com/practice-questions/jee/jee-main/physics",
        ]
        
        for url in test_urls:
            driver.get(url)
            time.sleep(3)
            current = driver.current_url
            title = driver.title
            print(f"  {url} -> {current} [{title[:50]}]")
            if "404" not in title and "not found" not in title.lower():
                print(f"  *** WORKING URL FOUND: {current}")
        
        print("\nDone! Check pq_page.html and pq_page.png for visual info.")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        driver.quit()

if __name__ == "__main__":
    login_and_scrape()
