from selenium import webdriver
from selenium.webdriver.common.by import By
import time

MOBILE = "7750858874"
PASSWORD = "12345678"

options = webdriver.ChromeOptions()
options.add_argument("--start-maximized")
driver = webdriver.Chrome(options=options)

try:
    driver.get("https://accounts.examgoal.com/login?redirect=https://room.examgoal.com/")
    time.sleep(4)
    inputs = driver.find_elements(By.CSS_SELECTOR, "input")
    for inp in inputs:
        if inp.get_attribute("type") in ("text", "tel", "number"):
            inp.send_keys(MOBILE)
            break
    time.sleep(1)
    pass_inputs = driver.find_elements(By.CSS_SELECTOR, "input[type='password']")
    if pass_inputs:
        pass_inputs[0].send_keys(PASSWORD)
        pass_inputs[0].submit()
        
    time.sleep(8)
    driver.get("https://room.examgoal.com/pyq/jee-main/mathematics/sequence-and-series")
    time.sleep(8)
    driver.save_screenshot("seq_page.png")
    
    with open("seq_page.html", "w", encoding="utf-8") as f:
        f.write(driver.page_source)
        
finally:
    driver.quit()
