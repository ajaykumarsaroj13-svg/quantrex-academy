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
    
    time.sleep(10)
    
    print('Navigating to sequences and series...')
    driver.get('https://room.examgoal.com/past-years/jee/jee-main/mathematics/sequences-and-series')
    time.sleep(10)
    
    page_source = driver.page_source
    if 'Sign in again' in page_source:
        print('FAILED: Page asks to sign in again.')
    elif 'Subscribe' in page_source:
        print('FAILED: Page asks to subscribe.')
    else:
        print('SUCCESS? Dumping page source...')
        with open('sequences_page.html', 'w', encoding='utf-8') as f:
            f.write(page_source)
        questions = driver.find_elements(By.XPATH, "//*[contains(text(), 'Question')]")
        print(f'Found {len(questions)} elements with text "Question".')
        
    # Save a screenshot just in case
    driver.save_screenshot('examgoal_screenshot.png')
    print('Saved screenshot to examgoal_screenshot.png')

finally:
    driver.quit()
