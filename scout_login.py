import time
import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def attempt_login():
    print("Starting Login Bot...")
    options = webdriver.ChromeOptions()
    options.add_argument("--start-maximized")
    
    driver = webdriver.Chrome(options=options)
    
    try:
        print("Navigating to ExamGoal Login...")
        driver.get("https://accounts.examgoal.com/login")
        
        wait = WebDriverWait(driver, 10)
        
        print("Looking for email input...")
        email_input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='text'], input[type='email']")))
        email_input.send_keys("ajaykumarsaroj13@gmail.com")
        
        # Click next or continue if there's a two-step login
        try:
            next_btn = driver.find_element(By.XPATH, "//button[contains(., 'Continue') or contains(., 'Next')]")
            next_btn.click()
            time.sleep(2)
        except:
            pass
            
        print("Looking for password input...")
        pass_input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='password']")))
        pass_input.send_keys("Saroj13@")
        
        print("Clicking login...")
        login_btn = driver.find_element(By.XPATH, "//button[contains(., 'Login') or contains(., 'Sign In') or @type='submit']")
        login_btn.click()
        
        print("Waiting 10 seconds for login to complete...")
        time.sleep(10)
        
        if "room.examgoal.com" in driver.current_url or "dashboard" in driver.current_url:
            print("LOGIN SUCCESSFUL!")
            # Save cookies
            with open(r"C:\Users\Admin\.gemini\antigravity\scratch\quantrex-academy\examgoal_cookies.json", "w") as f:
                json.dump(driver.get_cookies(), f)
            print("Saved cookies.")
        else:
            print(f"Login might have failed. Current URL: {driver.current_url}")
            driver.save_screenshot(r"C:\Users\Admin\.gemini\antigravity\scratch\quantrex-academy\login_failed.png")
            
    except Exception as e:
        print(f"Error during login: {e}")
        driver.save_screenshot(r"C:\Users\Admin\.gemini\antigravity\scratch\quantrex-academy\login_error.png")
    finally:
        driver.quit()

if __name__ == "__main__":
    attempt_login()
