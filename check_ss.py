import json
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

MOBILE = '7750858874'
PASSWORD = '12345678'

options = webdriver.ChromeOptions()
options.add_argument('--headless')
driver = webdriver.Chrome(options=options)

try:
    driver.get('https://accounts.examgoal.com/login?redirect=https://room.examgoal.com/')
    wait = WebDriverWait(driver, 15)
    
    mobile_input = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "input[type='tel'], input[type='text']")))
    mobile_input.clear()
    mobile_input.send_keys(MOBILE)
    
    pwd_input = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "input[type='password']")))
    pwd_input.clear()
    pwd_input.send_keys(PASSWORD)
    
    submit_btn = driver.find_element(By.XPATH, "//button[@type='submit']")
    submit_btn.click()
    
    print('Waiting for redirect...')
    time.sleep(10)
    driver.get('https://room.examgoal.com/')
    time.sleep(5)
    
    ls = driver.execute_script('return window.sessionStorage;')
    print('SessionStorage keys:', ls.keys())
    for k, v in ls.items():
        if 'token' in k.lower() or 'auth' in k.lower() or 'user' in k.lower():
            print(f'{k}: {str(v)[:50]}...')

finally:
    driver.quit()
