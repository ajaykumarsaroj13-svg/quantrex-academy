"""
STEP 1: Run this script
STEP 2: A Chrome window will open to ExamGoal
STEP 3: LOG IN MANUALLY in that Chrome window  
STEP 4: Once logged in, come back to this terminal and press ENTER
STEP 5: Your session will be saved automatically
"""
import time
import json
from selenium import webdriver
from selenium.webdriver.common.by import By

def manual_login():
    print("=" * 60)
    print("  ExamGoal Session Capture Tool")
    print("=" * 60)
    print()
    
    options = webdriver.ChromeOptions()
    options.add_argument("--start-maximized")
    
    driver = webdriver.Chrome(options=options)
    
    try:
        driver.get("https://accounts.examgoal.com/login?redirect=https://room.examgoal.com/")
        
        print("A Chrome window has opened.")
        print()
        print("ACTION REQUIRED:")
        print("  1. Log in to ExamGoal in the Chrome window with:")
        print("     Mobile: 7750858874  OR  Email: ajaykumarsaroj13@gmail.com")
        print("     Password: (use your password)")
        print()
        print("  2. Make sure you reach the DASHBOARD (room.examgoal.com)")
        print()
        input("  3. Press ENTER here once you are logged in and on the dashboard: ")
        
        print()
        print("Capturing session...")
        time.sleep(3)
        
        # Navigate to room.examgoal.com to get fresh cookies for that domain
        if "room.examgoal.com" not in driver.current_url:
            driver.get("https://room.examgoal.com/")
            time.sleep(5)
        
        all_cookies = driver.get_cookies()
        
        # Also get cookies from accounts domain
        driver.get("https://accounts.examgoal.com/")
        time.sleep(2)
        all_cookies.extend(driver.get_cookies())
        
        # Get local storage for room.examgoal.com
        driver.get("https://room.examgoal.com/")
        time.sleep(3)
        local_storage = driver.execute_script("return Object.assign({}, window.localStorage);")
        
        session_data = {
            "cookies": all_cookies,
            "local_storage": local_storage,
            "current_url": driver.current_url
        }
        
        out_path = r"C:\Users\Admin\.gemini\antigravity\scratch\quantrex-academy\examgoal_session.json"
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(session_data, f, indent=4)
        
        print(f"Session saved to {out_path}")
        print(f"Current URL: {driver.current_url}")
        print(f"Total cookies captured: {len(all_cookies)}")
        
        if "room.examgoal.com" in driver.current_url:
            print("\n✓ SUCCESS! Session captured!")
        else:
            print("\n⚠ WARNING: Not on room.examgoal.com - you may not be logged in")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        driver.quit()
        print("\nBrowser closed. Session saved.")

if __name__ == "__main__":
    manual_login()
