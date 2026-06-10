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
options.set_capability('goog:loggingPrefs', {'performance': 'ALL'})
driver = webdriver.Chrome(options=options)

try:
    print('Opening login page...')
    driver.get('https://accounts.examgoal.com/login?redirect=https://room.examgoal.com/')
    wait = WebDriverWait(driver, 15)
    
    phone_tab = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Phone')]")))
    phone_tab.click()
    time.sleep(1)
    
    mobile_input = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "input[type='number']")))
    mobile_input.clear()
    mobile_input.send_keys(MOBILE)
    
    pwd_input = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "input[type='password']")))
    pwd_input.clear()
    pwd_input.send_keys(PASSWORD)
    
    submit_btn = driver.find_element(By.XPATH, "//button[@type='submit']")
    submit_btn.click()
    
    time.sleep(5)
    
    logs = driver.get_log('performance')
    for entry in logs:
        try:
            msg = json.loads(entry['message'])['message']
            if msg['method'] == 'Network.requestWillBeSent':
                req = msg['params']['request']
                if req.get('method') == 'POST':
                    print("POST to:", req.get('url'))
                    print("PostData:", req.get('postData', ''))
            elif msg['method'] == 'Network.responseReceived':
                resp = msg['params']['response']
                if 'login' in resp.get('url', ''):
                    print("Response Status:", resp.get('status'))
        except Exception as e:
            pass

finally:
    driver.quit()
