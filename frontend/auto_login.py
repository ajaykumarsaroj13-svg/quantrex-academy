import time
import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

MOBILE = "7750858874"
PASSWORD = "12345678"

def login_with_phone():
    print("=" * 60)
    print("  ExamGoal Auto-Login Bot (Phone Number)")
    print("=" * 60)

    options = webdriver.ChromeOptions()
    options.set_capability("goog:loggingPrefs", {"performance": "ALL"})
    options.add_argument("--start-maximized")
    driver = webdriver.Chrome(options=options)
    wait = WebDriverWait(driver, 20)

    try:
        print("Opening login page...")
        driver.get("https://accounts.examgoal.com/login?redirect=https://room.examgoal.com/")
        time.sleep(4)
        
        # Take screenshot to see what's there
        driver.save_screenshot(r"C:\Users\Admin\.gemini\antigravity\scratch\quantrex-academy\login_step1.png")

        # Look for phone/mobile input
        print("Looking for phone input field...")
        inputs = driver.find_elements(By.CSS_SELECTOR, "input")
        print(f"Found {len(inputs)} input fields")
        for i, inp in enumerate(inputs):
            itype = inp.get_attribute("type")
            iname = inp.get_attribute("name")
            iplaceholder = inp.get_attribute("placeholder")
            print(f"  Input {i}: type={itype}, name={iname}, placeholder={iplaceholder}")

        # Try to find phone number input (could be type=tel or type=text)
        phone_input = None
        for inp in inputs:
            itype = inp.get_attribute("type") or ""
            iplaceholder = (inp.get_attribute("placeholder") or "").lower()
            iname = (inp.get_attribute("name") or "").lower()
            if "tel" in itype or "phone" in iplaceholder or "mobile" in iplaceholder or "number" in iplaceholder:
                phone_input = inp
                break
        
        if not phone_input:
            # Fallback: use first text input
            for inp in inputs:
                if inp.get_attribute("type") in ("text", "tel", "email", None, ""):
                    phone_input = inp
                    break

        if phone_input:
            phone_input.clear()
            phone_input.send_keys(MOBILE)
            print(f"Entered mobile: {MOBILE}")
        else:
            print("ERROR: Could not find phone input!")
            return

        # Click Continue/Next button
        try:
            btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(),'Continue') or contains(text(),'Next') or contains(text(),'Login') or contains(text(),'Sign')]")))
            btn.click()
            print("Clicked Continue/Next...")
            time.sleep(3)
        except Exception as e:
            print(f"No Continue button: {e}")

        driver.save_screenshot(r"C:\Users\Admin\.gemini\antigravity\scratch\quantrex-academy\login_step2.png")
        
        # Look for password field
        print("Looking for password field...")
        time.sleep(2)
        pass_inputs = driver.find_elements(By.CSS_SELECTOR, "input[type='password']")
        if pass_inputs:
            pass_inputs[0].clear()
            pass_inputs[0].send_keys(PASSWORD)
            print(f"Entered password")
            
            # Click Login/Submit
            try:
                submit_btn = driver.find_element(By.XPATH, "//button[@type='submit' or contains(text(),'Login') or contains(text(),'Sign In')]")
                submit_btn.click()
                print("Clicked Submit...")
            except:
                pass_inputs[0].submit()
                
            time.sleep(10)
        else:
            print("No password field found - may need OTP login")
            driver.save_screenshot(r"C:\Users\Admin\.gemini\antigravity\scratch\quantrex-academy\login_step2b.png")

        driver.save_screenshot(r"C:\Users\Admin\.gemini\antigravity\scratch\quantrex-academy\login_step3.png")
        print(f"Current URL: {driver.current_url}")

        # Navigate to room.examgoal.com  
        driver.get("https://room.examgoal.com/")
        time.sleep(8)
        print(f"Final URL: {driver.current_url}")
        driver.save_screenshot(r"C:\Users\Admin\.gemini\antigravity\scratch\quantrex-academy\login_final.png")

        if "room.examgoal.com" in driver.current_url and "login" not in driver.current_url:
            print("LOGIN SUCCESSFUL!")
            # Capture session cookies
            cookies = driver.get_cookies()
            local_storage = driver.execute_script("return Object.assign({}, window.localStorage);")
            
            session = {"cookies": cookies, "local_storage": local_storage}
            out = r"C:\Users\Admin\.gemini\antigravity\scratch\quantrex-academy\examgoal_session.json"
            with open(out, "w", encoding="utf-8") as f:
                json.dump(session, f, indent=2)
            print(f"Session saved! {len(cookies)} cookies captured.")
        else:
            print("Login failed or redirected to login page again.")
            print("Check screenshots: login_step1.png, login_step2.png, login_step3.png, login_final.png")

    except Exception as e:
        print(f"Error: {e}")
        driver.save_screenshot(r"C:\Users\Admin\.gemini\antigravity\scratch\quantrex-academy\login_error.png")
    finally:
        driver.quit()

if __name__ == "__main__":
    login_with_phone()
