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
    
    mobile_input = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "input[type='tel'], input[type='text']")))
    mobile_input.clear()
    mobile_input.send_keys(MOBILE)
    
    pwd_input = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "input[type='password']")))
    pwd_input.clear()
    pwd_input.send_keys(PASSWORD)
    
    submit_btn = driver.find_element(By.XPATH, "//button[@type='submit']")
    submit_btn.click()
    
    print('Waiting for redirect to room.examgoal.com...')
    time.sleep(10)
    driver.get('https://room.examgoal.com/')
    time.sleep(5)
    
    # Try fetching via fetch api but just observe the network logs
    driver.execute_script("""
        fetch('https://room.examgoal.com/api/v1/metadata/subjects?country=in&examGroup=jee&exam=jee-main&from=pq', {
            headers: { 'accept': 'application/json' },
            credentials: 'omit'
        });
    """)
    time.sleep(3)
    
    logs = driver.get_log('performance')
    token = None
    for entry in logs:
        try:
            msg = json.loads(entry['message'])['message']
            if msg['method'] == 'Network.requestWillBeSent':
                req = msg['params']['request']
                url = req.get('url', '')
                if 'examgoal.com/api' in url:
                    print(f"URL: {url}")
                    auth = req.get('headers', {}).get('Authorization')
                    if auth:
                        print(f"FOUND TOKEN: {auth[:20]}...")
                        token = auth
        except Exception as e:
            continue

    if token:
        with open('captured_token.txt', 'w') as f:
            f.write(token)
        print("Token saved!")
    else:
        print("No token found in headers!")
        
finally:
    driver.quit()
