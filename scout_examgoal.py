import os
import time
from selenium import webdriver

def run_scout():
    print("Starting Scout Bot...")
    options = webdriver.ChromeOptions()
    
    # Use the default Chrome profile on Windows
    user_data_dir = os.path.expanduser("~\\AppData\\Local\\Google\\Chrome\\User Data Temp")
    options.add_argument(f"--user-data-dir={user_data_dir}")
    options.add_argument("--profile-directory=Default")
    
    try:
        driver = webdriver.Chrome(options=options)
        print("Chrome launched successfully with your profile.")
        
        print("Navigating to ExamGoal...")
        driver.get("https://room.examgoal.com/")
        
        # Wait 10 seconds for the dashboard to fully load and authenticate
        print("Waiting 15 seconds for dashboard to load completely...")
        time.sleep(15)
        
        # Dump HTML source
        out_path = r"C:\Users\Admin\.gemini\antigravity\scratch\quantrex-academy\examgoal_scout.html"
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(driver.page_source)
            
        print(f"Scout successful! HTML saved to {out_path}")
        
    except Exception as e:
        print(f"Failed to run scout: {e}")
        print("\n*** MAKE SURE ALL CHROME WINDOWS ARE COMPLETELY CLOSED BEFORE RUNNING THIS! ***")
    finally:
        try:
            driver.quit()
        except:
            pass

if __name__ == "__main__":
    run_scout()
