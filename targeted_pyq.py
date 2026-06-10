"""
TARGETED PYQ SCRAPER
- Navigate to /pyq/jee-main/physics (correct URL from bookmark link)
- Capture ALL API calls and response data
- Discover question endpoint
"""
import time
import json
from selenium import webdriver
from selenium.webdriver.common.by import By

SAVED_COOKIES = [
    {"name": "IR_UID", "value": "35d44b89-383e-43d0-9194-d724d4617d73", "domain": "room.examgoal.com", "path": "/"},
    {"name": "IR_SSID", "value": "5480f8ee-ed80-481c-9364-c92c47638bc1", "domain": "room.examgoal.com", "path": "/"},
    {"name": "eg-device-id", "value": "s%3A3bb49b90-5e51-11f1-aca8-e9d769b4726d19g61mpwakjwp.Tl%2FuOwrutq86FBQboBKPIH5ZjFTIzbKb2PtIWynfzy4", "domain": ".examgoal.com", "path": "/"},
    {"name": "SSID", "value": "s%3ApQTLMAf9YwWyo3HoC1f9pQ3m63nQ0QtuyJDoqWZUi08Vsr7W5wcbGSKMPrRKSyhs7tJFWWf0fKc2mrA8WbDMhlmNS0C9GXj69gkRG34Eg3egLISANrDdWBJCqqWrNBMv.djrR2rKRg5mJePlLoxupF%2Bd4HQX%2Bu%2Ba0JdK6pUMoEmg", "domain": ".examgoal.com", "path": "/"},
    {"name": "AWSALB", "value": "ktpfqXjAojzXa4otsXqgvXr7n8hY62oePEt4ki7FjCOJredTmOXjESuacFYDqcFIv6U3GVZqdytm2JOGu/QpRw2CA9IAnczRQWjO1cazVZeMtiZ7jZOqdd7kj2XM", "domain": "room.examgoal.com", "path": "/"},
    {"name": "AWSALBCORS", "value": "ktpfqXjAojzXa4otsXqgvXr7n8hY62oePEt4ki7FjCOJredTmOXjESuacFYDqcFIv6U3GVZqdytm2JOGu/QpRw2CA9IAnczRQWjO1cazVZeMtiZ7jZOqdd7kj2XM", "domain": "room.examgoal.com", "path": "/"},
    {"name": "_ga", "value": "GA1.1.1276000664.1780383846", "domain": ".examgoal.com", "path": "/"},
]

def get_api_logs(driver):
    logs = driver.get_log("performance")
    results = []
    for entry in logs:
        try:
            log = json.loads(entry["message"])["message"]
            if log["method"] == "Network.requestWillBeSent":
                url = log["params"]["request"]["url"]
                if "examgoal.com/api" in url:
                    results.append({
                        "url": url,
                        "method": log["params"]["request"]["method"],
                        "postData": log["params"]["request"].get("postData", "")
                    })
        except:
            pass
    return results

def run():
    options = webdriver.ChromeOptions()
    options.set_capability("goog:loggingPrefs", {"performance": "ALL"})
    options.add_argument("--start-maximized")
    driver = webdriver.Chrome(options=options)
    
    try:
        # Load and inject cookies
        driver.get("https://room.examgoal.com/")
        time.sleep(3)
        for ck in SAVED_COOKIES:
            try:
                driver.add_cookie(ck)
            except:
                pass
        driver.refresh()
        time.sleep(5)
        print(f"Logged in: {driver.current_url} | {driver.title}")
        _ = get_api_logs(driver)  # clear
        
        # ─── TEST 1: Navigate to /pyq/jee-main/physics ───
        print("\n[TEST 1] Navigating to /pyq/jee-main/physics...")
        driver.get("https://room.examgoal.com/pyq/jee-main/physics")
        time.sleep(10)
        print(f"URL: {driver.current_url}")
        print(f"Title: {driver.title}")
        driver.save_screenshot(r"C:\Users\Admin\.gemini\antigravity\scratch\quantrex-academy\pyq_physics.png")
        
        calls1 = get_api_logs(driver)
        print(f"API calls ({len(calls1)}):")
        for c in calls1:
            print(f"  [{c['method']}] {c['url']}")
            if c['postData']:
                print(f"    -> {c['postData'][:150]}")
        
        # Save HTML
        with open(r"C:\Users\Admin\.gemini\antigravity\scratch\quantrex-academy\pyq_physics.html", "w", encoding="utf-8") as f:
            f.write(driver.page_source)
        
        # Get all links
        links = driver.find_elements(By.TAG_NAME, "a")
        all_hrefs = [(l.text.strip()[:50], l.get_attribute("href")) for l in links if l.get_attribute("href")]
        print(f"\nLinks on pyq/physics page:")
        for t, h in all_hrefs[:20]:
            print(f"  '{t}' -> {h}")
        
        # ─── TEST 2: Click a chapter link if available ───
        chapter_links = [(t, h) for t, h in all_hrefs if h and "pyq" in h and len(t) > 2]
        if chapter_links:
            text, href = chapter_links[0]
            print(f"\n[TEST 2] Clicking chapter: '{text}' -> {href}")
            _ = get_api_logs(driver)  # clear
            driver.get(href)
            time.sleep(10)
            print(f"URL: {driver.current_url}")
            print(f"Title: {driver.title}")
            driver.save_screenshot(r"C:\Users\Admin\.gemini\antigravity\scratch\quantrex-academy\pyq_chapter.png")
            
            calls2 = get_api_logs(driver)
            print(f"\nAPI calls on chapter page ({len(calls2)}):")
            for c in calls2:
                print(f"  [{c['method']}] {c['url']}")
                if c['postData']:
                    print(f"    -> {c['postData'][:200]}")
            
            with open(r"C:\Users\Admin\.gemini\antigravity\scratch\quantrex-academy\pyq_chapter.html", "w", encoding="utf-8") as f:
                f.write(driver.page_source)
        
        # ─── TEST 3: Try /pyq/jee-main/physics/units-and-measurements ───
        print("\n[TEST 3] /pyq/jee-main/physics/units-and-measurements...")
        _ = get_api_logs(driver)
        driver.get("https://room.examgoal.com/pyq/jee-main/physics/units-and-measurements")
        time.sleep(10)
        print(f"URL: {driver.current_url}")
        print(f"Title: {driver.title}")
        
        calls3 = get_api_logs(driver)
        print(f"API calls ({len(calls3)}):")
        for c in calls3:
            print(f"  [{c['method']}] {c['url']}")
            if c['postData']:
                print(f"    -> {c['postData'][:200]}")
        
        driver.save_screenshot(r"C:\Users\Admin\.gemini\antigravity\scratch\quantrex-academy\pyq_chapter2.png")
        with open(r"C:\Users\Admin\.gemini\antigravity\scratch\quantrex-academy\pyq_chapter2.html", "w", encoding="utf-8") as f:
            f.write(driver.page_source)
        
        # Save fresh cookies
        fresh = driver.get_cookies()
        with open(r"C:\Users\Admin\.gemini\antigravity\scratch\quantrex-academy\very_fresh_cookies.json", "w") as f:
            json.dump(fresh, f, indent=2)
        print(f"\nSaved {len(fresh)} fresh cookies")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        driver.quit()

if __name__ == "__main__":
    run()
