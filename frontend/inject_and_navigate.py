"""
COOKIE INJECTION SCRAPER
- Injects saved cookies into a fresh Chrome instance
- Navigates to room.examgoal.com with valid session
- Clicks through to a chapter page and intercepts question API calls
"""
import time
import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Cookies from last successful login
COOKIES = [
    {"name": "IR_UID", "value": "35d44b89-383e-43d0-9194-d724d4617d73", "domain": "room.examgoal.com", "path": "/"},
    {"name": "IR_SSID", "value": "5480f8ee-ed80-481c-9364-c92c47638bc1", "domain": "room.examgoal.com", "path": "/"},
    {"name": "eg-device-id", "value": "s%3A3bb49b90-5e51-11f1-aca8-e9d769b4726d19g61mpwakjwp.Tl%2FuOwrutq86FBQboBKPIH5ZjFTIzbKb2PtIWynfzy4", "domain": ".examgoal.com", "path": "/"},
    {"name": "SSID", "value": "s%3ApQTLMAf9YwWyo3HoC1f9pQ3m63nQ0QtuyJDoqWZUi08Vsr7W5wcbGSKMPrRKSyhs7tJFWWf0fKc2mrA8WbDMhlmNS0C9GXj69gkRG34Eg3egLISANrDdWBJCqqWrNBMv.djrR2rKRg5mJePlLoxupF%2Bd4HQX%2Bu%2Ba0JdK6pUMoEmg", "domain": ".examgoal.com", "path": "/"},
    {"name": "AWSALB", "value": "ktpfqXjAojzXa4otsXqgvXr7n8hY62oePEt4ki7FjCOJredTmOXjESuacFYDqcFIv6U3GVZqdytm2JOGu/QpRw2CA9IAnczRQWjO1cazVZeMtiZ7jZOqdd7kj2XM", "domain": "room.examgoal.com", "path": "/"},
    {"name": "AWSALBCORS", "value": "ktpfqXjAojzXa4otsXqgvXr7n8hY62oePEt4ki7FjCOJredTmOXjESuacFYDqcFIv6U3GVZqdytm2JOGu/QpRw2CA9IAnczRQWjO1cazVZeMtiZ7jZOqdd7kj2XM", "domain": "room.examgoal.com", "path": "/"},
    {"name": "_ga", "value": "GA1.1.1276000664.1780383846", "domain": ".examgoal.com", "path": "/"},
]

def inject_and_navigate():
    print("Starting cookie-injection scraper...")
    options = webdriver.ChromeOptions()
    options.set_capability("goog:loggingPrefs", {"performance": "ALL"})
    options.add_argument("--start-maximized")
    driver = webdriver.Chrome(options=options)
    
    try:
        # First, navigate to the domain so we can set cookies
        print("Loading examgoal.com domain...")
        driver.get("https://room.examgoal.com/")
        time.sleep(3)
        
        # Inject all cookies
        print("Injecting session cookies...")
        for ck in COOKIES:
            try:
                driver.add_cookie(ck)
            except Exception as e:
                print(f"  Cookie '{ck['name']}' error: {e}")
        
        # Refresh to apply cookies
        driver.refresh()
        time.sleep(5)
        
        print(f"Current URL: {driver.current_url}")
        driver.save_screenshot(r"C:\Users\Admin\.gemini\antigravity\scratch\quantrex-academy\after_cookies.png")
        
        if "login" in driver.current_url:
            print("Still on login page - cookies expired. Need fresh login.")
            # Do fresh login
            from selenium.webdriver.common.by import By
            driver.get("https://accounts.examgoal.com/login?redirect=https://room.examgoal.com/")
            time.sleep(4)
            
            for inp in driver.find_elements(By.CSS_SELECTOR, "input"):
                if inp.get_attribute("type") in ("text", "tel"):
                    inp.clear()
                    inp.send_keys("7750858874")
                    break
            
            time.sleep(1)
            pass_els = driver.find_elements(By.CSS_SELECTOR, "input[type='password']")
            if pass_els:
                pass_els[0].clear()
                pass_els[0].send_keys("12345678")
                try:
                    driver.find_element(By.XPATH, "//button[@type='submit']").click()
                except:
                    pass_els[0].submit()
            
            print("Waiting 15 seconds for login...")
            time.sleep(15)
            print(f"After login: {driver.current_url}")
        
        if "room.examgoal.com" not in driver.current_url:
            driver.get("https://room.examgoal.com/")
            time.sleep(6)
        
        print(f"Final URL: {driver.current_url}")
        title = driver.title
        print(f"Page title: {title}")
        
        # Get fresh cookies after login
        fresh_cookies = driver.get_cookies()
        with open(r"C:\Users\Admin\.gemini\antigravity\scratch\quantrex-academy\very_fresh_cookies.json", "w") as f:
            json.dump(fresh_cookies, f, indent=2)
        print(f"Saved {len(fresh_cookies)} fresh cookies")
        
        # Navigate to JEE Main Practice Questions
        print("\nNavigating to JEE Main Physics PYQ...")
        
        # Try clicking navigation links instead of direct URL
        # Look for PYQ or Practice Questions link
        links = driver.find_elements(By.TAG_NAME, "a")
        pq_link = None
        for link in links:
            href = link.get_attribute("href") or ""
            text = link.text.lower()
            if "practice" in href or "pyq" in href or "past" in href:
                print(f"  Found PQ link: {href} [{text}]")
                pq_link = href
        
        # Now try all the known URL patterns from the main page
        print("\nChecking current page links...")
        all_links = [(l.text, l.get_attribute("href")) for l in driver.find_elements(By.TAG_NAME, "a") if l.get_attribute("href")]
        for text, href in all_links[:20]:
            print(f"  '{text[:30]}' -> {href}")
        
        # Clear logs and navigate to PQ section
        _ = driver.get_log("performance")  # Clear existing logs
        
        driver.get("https://room.examgoal.com/practice-questions")
        time.sleep(8)
        print(f"\nPQ section URL: {driver.current_url}")
        driver.save_screenshot(r"C:\Users\Admin\.gemini\antigravity\scratch\quantrex-academy\pq_section.png")
        
        # Get all links on this page
        links = driver.find_elements(By.TAG_NAME, "a")
        pq_links = [(l.text[:40], l.get_attribute("href")) for l in links if l.get_attribute("href") and "examgoal" in l.get_attribute("href")]
        print(f"Links on PQ page:")
        for text, href in pq_links[:15]:
            print(f"  '{text}' -> {href}")
        
        # Capture network calls
        logs = driver.get_log("performance")
        api_calls_pq = []
        for entry in logs:
            try:
                log = json.loads(entry["message"])["message"]
                if log["method"] == "Network.requestWillBeSent":
                    url = log["params"]["request"]["url"]
                    if "examgoal.com/api" in url:
                        api_calls_pq.append(url)
            except:
                pass
        
        print(f"\nAPI calls on PQ section page:")
        for url in api_calls_pq:
            print(f"  {url}")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        driver.save_screenshot(r"C:\Users\Admin\.gemini\antigravity\scratch\quantrex-academy\error.png")
    finally:
        driver.quit()

if __name__ == "__main__":
    inject_and_navigate()
