import json
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.chrome.options import Options

# Mobile and password (provided earlier)
PHONE = "7750858874"
PASSWORD = "12345678"
LOGIN_URL = "https://accounts.examgoal.com/api/v1/auth/login/phone"
# Use Chrome (Chromium) driver – assume chromedriver is in PATH
options = Options()
options.add_argument("headless")
options.add_argument("disable-gpu")
options.add_argument("no-sandbox")
service = ChromeService()
driver = webdriver.Chrome(service=service, options=options)
try:
    driver.get(LOGIN_URL)
    # The API expects JSON POST; the UI may not render a form.
    # Instead we can perform a fetch via JavaScript.
    script = f"""
    return fetch('{LOGIN_URL}', {{
        method: 'POST',
        headers: {{'Content-Type': 'application/json'}},
        body: JSON.stringify({{phone: '{PHONE}', password: '{PASSWORD}'}})
    }).then(r => r.json());
    """
    result = driver.execute_script(script)
    print('Login response:', result)
    time.sleep(2)
    # After login, cookies are set in the browser
    cookies = driver.get_cookies()
    # Convert to dict
    cookie_dict = {c['name']: c['value'] for c in cookies}
    # Save to JSON in the scratch folder
    out_path = r"C:\Users\Admin\.gemini\antigravity\scratch\quantrex-academy\frontend\examgoal_cookies.json"
    with open(out_path, 'w') as f:
        json.dump(cookie_dict, f, indent=2)
    print('Cookies saved to', out_path)
finally:
    driver.quit()
