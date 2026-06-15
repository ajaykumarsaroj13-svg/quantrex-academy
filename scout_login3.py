
import time
import json
import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def attempt_login():
    options = webdriver.ChromeOptions()
    options.add_argument("--headless=new")
    driver = webdriver.Chrome(options=options)
    
    try:
        driver.get("https://accounts.examgoal.com/login")
        wait = WebDriverWait(driver, 10)
        
        email_input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='text'], input[type='email']")))
        email_input.send_keys("7750858874")
        try:
            driver.find_element(By.XPATH, "//button[contains(., 'Continue') or contains(., 'Next')]").click()
            time.sleep(2)
        except: pass
            
        pass_input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='password']")))
        pass_input.send_keys("12345678")
        
        driver.find_element(By.XPATH, "//button[contains(., 'Login') or contains(., 'Sign In') or @type='submit']").click()
        time.sleep(10)
        
        # Extract JWT from local storage
        token = driver.execute_script("return window.localStorage.getItem('auth._token.local');")
        if not token:
            token = driver.execute_script("return window.localStorage.getItem('token');")
        print("Token found:", bool(token))
        if token and token.startswith("Bearer "):
            token = token[7:]
        elif token and token.startswith("%22Bearer%20"):
            import urllib.parse
            token = urllib.parse.unquote(token).strip("\"").replace("Bearer ", "")
            
        HEADERS = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            "eg-app-id": "room-examgoal-com",
            "eg-platform": "desktop",
            "Referer": "https://room.examgoal.com/",
            "accept": "application/json",
            "content-type": "application/json"
        }
        if token:
            HEADERS["Authorization"] = f"Bearer {token}"
            print("Added Authorization header")
            
        s = requests.Session()
        s.headers.update(HEADERS)
        BASE = "https://room.examgoal.com/api/v1"
        r = s.get(f"{BASE}/past-question/tests/by-chapter/matrices-and-determinants", params={
            "country": "in",
            "examGroup": "jee",
            "exam": "jee-advanced"
        })
        
        with open("examgoal_matrices.json", "w", encoding="utf-8") as f:
            f.write(r.text)
        print("API Response:", r.status_code)
        if r.status_code == 200:
            print("Success! Downloaded data.")
            
    finally:
        driver.quit()

if __name__ == "__main__":
    attempt_login()

