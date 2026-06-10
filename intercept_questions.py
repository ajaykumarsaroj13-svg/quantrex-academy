"""
QUESTION API INTERCEPTOR
- Cookies work! Session is valid.
- Navigate to PQ page and intercept EVERY API call
- Capture question data structure
"""
import time
import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

MOBILE = "7750858874"
PASSWORD = "12345678"

SAVED_COOKIES = [
    {"name": "IR_UID", "value": "35d44b89-383e-43d0-9194-d724d4617d73", "domain": "room.examgoal.com", "path": "/"},
    {"name": "IR_SSID", "value": "5480f8ee-ed80-481c-9364-c92c47638bc1", "domain": "room.examgoal.com", "path": "/"},
    {"name": "eg-device-id", "value": "s%3A3bb49b90-5e51-11f1-aca8-e9d769b4726d19g61mpwakjwp.Tl%2FuOwrutq86FBQboBKPIH5ZjFTIzbKb2PtIWynfzy4", "domain": ".examgoal.com", "path": "/"},
    {"name": "SSID", "value": "s%3ApQTLMAf9YwWyo3HoC1f9pQ3m63nQ0QtuyJDoqWZUi08Vsr7W5wcbGSKMPrRKSyhs7tJFWWf0fKc2mrA8WbDMhlmNS0C9GXj69gkRG34Eg3egLISANrDdWBJCqqWrNBMv.djrR2rKRg5mJePlLoxupF%2Bd4HQX%2Bu%2Ba0JdK6pUMoEmg", "domain": ".examgoal.com", "path": "/"},
    {"name": "AWSALB", "value": "ktpfqXjAojzXa4otsXqgvXr7n8hY62oePEt4ki7FjCOJredTmOXjESuacFYDqcFIv6U3GVZqdytm2JOGu/QpRw2CA9IAnczRQWjO1cazVZeMtiZ7jZOqdd7kj2XM", "domain": "room.examgoal.com", "path": "/"},
    {"name": "AWSALBCORS", "value": "ktpfqXjAojzXa4otsXqgvXr7n8hY62oePEt4ki7FjCOJredTmOXjESuacFYDqcFIv6U3GVZqdytm2JOGu/QpRw2CA9IAnczRQWjO1cazVZeMtiZ7jZOqdd7kj2XM", "domain": "room.examgoal.com", "path": "/"},
    {"name": "_ga", "value": "GA1.1.1276000664.1780383846", "domain": ".examgoal.com", "path": "/"},
]

def get_logs(driver):
    """Get and parse all API calls from performance logs"""
    logs = driver.get_log("performance")
    api_calls = []
    for entry in logs:
        try:
            log = json.loads(entry["message"])["message"]
            if log["method"] == "Network.requestWillBeSent":
                url = log["params"]["request"]["url"]
                if "examgoal.com/api" in url:
                    method = log["params"]["request"]["method"]
                    post = log["params"]["request"].get("postData", "")
                    api_calls.append({"url": url, "method": method, "postData": post})
        except:
            pass
    return api_calls

def run():
    print("Starting Question API Interceptor...")
    options = webdriver.ChromeOptions()
    options.set_capability("goog:loggingPrefs", {"performance": "ALL"})
    options.add_argument("--start-maximized")
    driver = webdriver.Chrome(options=options)
    wait = WebDriverWait(driver, 20)

    try:
        # Step 1: Load site and inject cookies
        print("Loading room.examgoal.com...")
        driver.get("https://room.examgoal.com/")
        time.sleep(3)
        
        print("Injecting cookies...")
        for ck in SAVED_COOKIES:
            try:
                driver.add_cookie(ck)
            except Exception as e:
                print(f"  Skipped {ck['name']}: {e}")
        
        driver.refresh()
        time.sleep(6)
        
        print(f"URL: {driver.current_url} | Title: {driver.title}")
        _ = get_logs(driver)  # clear old logs
        
        if "login" in driver.current_url:
            print("Cookies expired - doing fresh login...")
            driver.get("https://accounts.examgoal.com/login?redirect=https://room.examgoal.com/")
            time.sleep(4)
            for inp in driver.find_elements(By.CSS_SELECTOR, "input"):
                if inp.get_attribute("type") in ("text", "tel"):
                    inp.clear()
                    inp.send_keys(MOBILE)
                    break
            time.sleep(1)
            pass_els = driver.find_elements(By.CSS_SELECTOR, "input[type='password']")
            if pass_els:
                pass_els[0].clear()
                pass_els[0].send_keys(PASSWORD)
                try:
                    driver.find_element(By.XPATH, "//button[@type='submit']").click()
                except:
                    pass_els[0].submit()
            time.sleep(15)
            print(f"After login: {driver.current_url}")
        
        # Clear logs  
        _ = get_logs(driver)
        
        # Step 2: Navigate to practice questions section
        print("\nNavigating to PQ section...")
        driver.get("https://room.examgoal.com/practice-questions")
        time.sleep(8)
        
        print(f"URL: {driver.current_url}")
        
        # Step 3: Get all links on this page
        all_links = driver.find_elements(By.TAG_NAME, "a")
        print(f"\nAll links on page ({len(all_links)} total):")
        pq_links = []
        for link in all_links:
            href = link.get_attribute("href") or ""
            text = link.text.strip()
            if href and "examgoal.com" in href and len(text) > 0:
                print(f"  '{text[:50]}' -> {href}")
                pq_links.append((text, href))
        
        # Get API calls
        api_calls = get_logs(driver)
        print(f"\nAPI calls on PQ page:")
        for call in api_calls:
            print(f"  [{call['method']}] {call['url']}")
        
        # Step 4: Look for Physics or JEE Main link and click it
        print("\nLooking for Physics / JEE Main links...")
        subject_links = [(t, h) for t, h in pq_links if any(kw in t.lower() or kw in h.lower() 
                         for kw in ["physics", "jee", "chapter", "subject"])]
        
        if subject_links:
            text, href = subject_links[0]
            print(f"Clicking: '{text}' -> {href}")
            _ = get_logs(driver)  # clear
            driver.get(href)
            time.sleep(8)
            
            api_calls2 = get_logs(driver)
            print(f"\nAPI calls after clicking subject:")
            for call in api_calls2:
                print(f"  [{call['method']}] {call['url']}")
                if call['postData']:
                    print(f"    PostData: {call['postData'][:100]}")
        
        # Step 5: Try clicking on chapters specifically
        print("\nLooking for chapter links...")
        chapter_links = driver.find_elements(By.TAG_NAME, "a")
        chapter_hrefs = [(l.text[:40], l.get_attribute("href")) for l in chapter_links 
                         if l.get_attribute("href") and "chapter" in (l.get_attribute("href") or "").lower()]
        for text, href in chapter_hrefs[:5]:
            print(f"  Chapter: '{text}' -> {href}")
        
        # Save page source
        with open(r"C:\Users\Admin\.gemini\antigravity\scratch\quantrex-academy\pq_logged_in.html", "w", encoding="utf-8") as f:
            f.write(driver.page_source)
        print("\nSaved pq_logged_in.html")
        driver.save_screenshot(r"C:\Users\Admin\.gemini\antigravity\scratch\quantrex-academy\pq_logged_in.png")
        
        # Save fresh cookies
        fresh = driver.get_cookies()
        with open(r"C:\Users\Admin\.gemini\antigravity\scratch\quantrex-academy\very_fresh_cookies.json", "w") as f:
            json.dump(fresh, f, indent=2)
        print(f"Saved {len(fresh)} cookies")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        driver.quit()

if __name__ == "__main__":
    run()
