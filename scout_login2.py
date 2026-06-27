
import time
import json
import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def attempt_login():
    print("Starting Login Bot...")
    options = webdriver.ChromeOptions()
    options.add_argument("--start-maximized")
    # run headless so it doesnt disturb user
    options.add_argument("--headless=new")
    
    driver = webdriver.Chrome(options=options)
    
    try:
        print("Navigating to ExamGoal Login...")
        driver.get("https://accounts.examgoal.com/login")
        
        wait = WebDriverWait(driver, 10)
        
        print("Looking for phone input...")
        email_input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='text'], input[type='email']")))
        email_input.send_keys("7750858874")
        
        try:
            next_btn = driver.find_element(By.XPATH, "//button[contains(., 'Continue') or contains(., 'Next')]")
            next_btn.click()
            time.sleep(2)
        except:
            pass
            
        print("Looking for password input...")
        pass_input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='password']")))
        pass_input.send_keys("12345678")
        
        print("Clicking login...")
        login_btn = driver.find_element(By.XPATH, "//button[contains(., 'Login') or contains(., 'Sign In') or @type='submit']")
        login_btn.click()
        
        print("Waiting 10 seconds for login to complete...")
        time.sleep(10)
        
        cookies = driver.get_cookies()
        
        # Now fetch the API data using requests
        s = requests.Session()
        for c in cookies:
            s.cookies.set(c["name"], c["value"])

        HEADERS = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            "eg-app-id": "room-examgoal-com",
            "eg-platform": "desktop",
            "Referer": "https://room.examgoal.com/",
            "accept": "application/json",
            "content-type": "application/json"
        }
        s.headers.update(HEADERS)

        BASE = "https://room.examgoal.com/api/v1"
        r = s.get(f"{BASE}/past-question/tests/by-chapter/matrices-and-determinants", params={
            "country": "in",
            "examGroup": "jee",
            "exam": "jee-advanced"
        })
        
        with open("examgoal_matrices.json", "w", encoding="utf-8") as f:
            f.write(r.text)
        print("API Response Code:", r.status_code)
            
    except Exception as e:
        print(f"Error during login: {e}")
    finally:
        driver.quit()

if __name__ == "__main__":
    attempt_login()

