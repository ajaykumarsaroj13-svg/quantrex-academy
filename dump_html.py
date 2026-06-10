from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

options = webdriver.ChromeOptions()
options.add_argument('--headless')
driver = webdriver.Chrome(options=options)
driver.get('https://accounts.examgoal.com/login?redirect=https://room.examgoal.com/')
wait = WebDriverWait(driver, 15)
phone_tab = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Phone')]")))
phone_tab.click()
time.sleep(2)

with open('login_page.html', 'w', encoding='utf-8') as f:
    f.write(driver.page_source)

driver.quit()
