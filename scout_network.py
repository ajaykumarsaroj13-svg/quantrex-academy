import os
import time
import json
from selenium import webdriver
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities

def run_scout():
    print("Starting Network Scout...")
    options = webdriver.ChromeOptions()
    
    # Enable performance logging to capture network requests
    options.set_capability("goog:loggingPrefs", {"performance": "ALL"})
    
    user_data_dir = os.path.expanduser("~\\AppData\\Local\\Google\\Chrome\\User Data Temp")
    options.add_argument(f"--user-data-dir={user_data_dir}")
    options.add_argument("--profile-directory=Default")
    
    try:
        driver = webdriver.Chrome(options=options)
        print("Chrome launched successfully.")
        
        driver.get("https://room.examgoal.com/")
        print("Waiting 15 seconds to let dashboard load...")
        time.sleep(15)
        
        print("Extracting performance logs...")
        logs = driver.get_log("performance")
        
        api_requests = []
        for entry in logs:
            try:
                log = json.loads(entry["message"])["message"]
                if log["method"] == "Network.requestWillBeSent":
                    url = log["params"]["request"]["url"]
                    if url.startswith("http") and ("api" in url or "examgoal" in url) and not url.endswith((".js", ".css", ".png", ".jpg", ".svg", ".woff2")):
                        api_requests.append({
                            "url": url,
                            "method": log["params"]["request"]["method"],
                            "headers": log["params"]["request"]["headers"]
                        })
            except Exception:
                pass
                
        out_path = r"C:\Users\Admin\.gemini\antigravity\scratch\quantrex-academy\examgoal_network.json"
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(api_requests, f, indent=4)
            
        print(f"Network extraction successful! Saved {len(api_requests)} requests to {out_path}")
        
    except Exception as e:
        print(f"Failed to run scout: {e}")
    finally:
        try:
            driver.quit()
        except:
            pass

if __name__ == "__main__":
    run_scout()
