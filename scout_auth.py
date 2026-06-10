import os
import time
import json
from selenium import webdriver

def run_scout():
    print("Starting Auth Token Scout...")
    options = webdriver.ChromeOptions()
    
    # Use the copied Chrome profile
    user_data_dir = os.path.expanduser("~\\AppData\\Local\\Google\\Chrome\\User Data Temp")
    options.add_argument(f"--user-data-dir={user_data_dir}")
    options.add_argument("--profile-directory=Default")
    
    try:
        driver = webdriver.Chrome(options=options)
        print("Chrome launched successfully.")
        
        driver.get("https://room.examgoal.com/")
        print("Waiting 10 seconds for auth tokens to load...")
        time.sleep(10)
        
        auth_data = {}
        
        # 1. Extract Cookies
        auth_data['cookies'] = driver.get_cookies()
        
        # 2. Extract LocalStorage
        local_storage = driver.execute_script("return window.localStorage;")
        auth_data['local_storage'] = local_storage
        
        # 3. Extract SessionStorage
        session_storage = driver.execute_script("return window.sessionStorage;")
        auth_data['session_storage'] = session_storage
        
        out_path = r"C:\Users\Admin\.gemini\antigravity\scratch\quantrex-academy\examgoal_auth.json"
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(auth_data, f, indent=4)
            
        print(f"Auth extraction successful! Saved to {out_path}")
        
    except Exception as e:
        print(f"Failed to run scout: {e}")
    finally:
        try:
            driver.quit()
        except:
            pass

if __name__ == "__main__":
    run_scout()
