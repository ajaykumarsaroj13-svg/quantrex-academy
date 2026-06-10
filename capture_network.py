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
    driver.get('https://room.examgoal.com/past-years/jee/jee-main/mathematics/sequences-and-series')
    time.sleep(10)
    
    logs = driver.get_log('performance')
    for entry in logs:
        try:
            msg = json.loads(entry['message'])['message']
            if msg['method'] == 'Network.requestWillBeSent':
                req = msg['params']['request']
                url = req.get('url', '')
                if 'past-question/questions' in url or 'past-question/tests' in url:
                    print(f"FOUND REQUEST TO: {url}")
                    print("Headers:", json.dumps(req.get('headers', {}), indent=2))
        except Exception as e:
            continue

finally:
    driver.quit()
