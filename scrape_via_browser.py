import json
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from pymongo import MongoClient
import re

MOBILE = "7750858874"
PASSWORD = "12345678"

def run_scraper():
    print("Launching browser...")
    options = webdriver.ChromeOptions()
    options.add_argument("--headless")
    options.add_argument("--window-size=1920,1080")
    
    driver = webdriver.Chrome(options=options)
    
    try:
        # 1. Login
        print("Logging in...")
        driver.get("https://accounts.examgoal.com/login?redirect=https://room.examgoal.com/")
        wait = WebDriverWait(driver, 15)
        
        print("Clicking Phone tab...")
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
        
        print("Waiting for dashboard redirect...")
        time.sleep(10)
        driver.get("https://room.examgoal.com/")
        time.sleep(5)
        
        # We are authenticated. Now we execute JS to fetch data directly!
        print("Fetching subjects via browser context...")
        
        fetch_js = """
        var cb = arguments[arguments.length - 1];
        fetch('https://room.examgoal.com/api/v1/metadata/subjects?country=in&examGroup=jee&exam=jee-main&from=pq', {
            headers: { 'accept': 'application/json' },
            credentials: 'include'
        })
        .then(res => res.json())
        .then(data => cb(data))
        .catch(err => cb({error: err.message}));
        """
        subjects_data = driver.execute_async_script(fetch_js)
        
        math_subject = None
        for sub in subjects_data.get("results", []):
            if sub.get("name") == "Mathematics":
                math_subject = sub
                break
                
        if not math_subject:
            print("Math subject not found!")
            return
            
        print("Fetching chapters...")
        fetch_chapters_js = f"""
        var cb = arguments[arguments.length - 1];
        fetch('https://room.examgoal.com/api/v1/metadata/chapters?country=in&examGroup=jee&exam=jee-main&subject={math_subject["key"]}&from=pq', {{
            headers: {{ 'accept': 'application/json' }},
            credentials: 'include'
        }})
        .then(res => res.json())
        .then(data => cb(data))
        .catch(err => cb({{error: err.message}}));
        """
        chapters_data = driver.execute_async_script(fetch_chapters_js)
        
        target_chap = None
        for ch in chapters_data.get("results", []):
            name = ch.get("title", ch.get("name", ""))
            if "Sequence" in name and "Series" in name:
                target_chap = ch
                break
                
        if not target_chap:
            print("Chapter not found.")
            return
            
        chapter_id = target_chap["metaId"]
        print(f"Target chapter ID: {chapter_id}")
        
        # Fetch Questions
        print("Fetching questions...")
        fetch_qs_js = f"""
        var cb = arguments[arguments.length - 1];
        fetch('https://room.examgoal.com/api/v1/past-question/tests/by-chapter/{chapter_id}?country=in&examGroup=jee&exam=jee-main', {{
            headers: {{ 'accept': 'application/json' }},
            credentials: 'include'
        }})
        .then(res => res.json())
        .then(data => cb(data))
        .catch(err => cb({{error: err.message}}));
        """
        qs_data = driver.execute_async_script(fetch_qs_js)
        
        if "error" in qs_data:
            print(f"Error fetching questions: {qs_data['error']}")
        else:
            print("Raw qs_data:", json.dumps(qs_data)[:500])
            
        all_questions = []
        if isinstance(qs_data, dict):
            for key in ("results", "questions", "data", "items"):
                if key in qs_data:
                    all_questions = qs_data[key]
                    break
        elif isinstance(qs_data, list):
            all_questions = qs_data
            
        print(f"Total questions fetched: {len(all_questions)}")
        
        if not all_questions:
            print("No questions returned.")
            # Let's try the fallback endpoint
            print("Trying fallback endpoint...")
            fetch_fallback_js = f"""
            var cb = arguments[arguments.length - 1];
            fetch('https://room.examgoal.com/api/v1/past-question/questions?chapterId={chapter_id}&examGroup=jee&exam=jee-main&limit=500&offset=0', {{
                headers: {{ 'accept': 'application/json' }},
                credentials: 'include'
            }})
            .then(res => res.json())
            .then(data => cb(data))
            .catch(err => cb({{error: err.message}}));
            """
            fallback_data = driver.execute_async_script(fetch_fallback_js)
            print("Raw fallback_data:", json.dumps(fallback_data)[:500])
            all_questions = fallback_data.get("data", fallback_data.get("results", []))
            print(f"Fallback fetched: {len(all_questions)}")

        if not all_questions:
            return
            
        print("Formatting and uploading to MongoDB...")
        client = MongoClient('mongodb+srv://ajaykumarsaroj13_db_usar:quantrex2026@cluster0.jde6gri.mongodb.net/quantrex?retryWrites=true&w=majority&appName=Cluster0')
        db = client['quantrex']
        col = db['pyqs']

        formatted_docs = []
        target_chapter_id = "ch_mathematics_algebra_3"

        for idx, q in enumerate(all_questions):
            q_id = q.get("questionId", q.get("id", q.get("_id", f"seq_{idx}")))
            
            title = ""
            year = q.get("year", "")
            if "tests" in q and q["tests"]:
                test_info = q["tests"][0]
                title = test_info.get("name", f"JEE Main {year}")
                if not year:
                    year_match = re.search(r'20\d\d', title)
                    if year_match:
                        year = year_match.group(0)
            
            if not year:
                year = "2024"
                
            topic = q.get("topic", "General")
            if not topic: topic = "General"
                
            difficulty = q.get("difficultyLevel", "Medium")
            if difficulty.lower() == "e": difficulty = "Easy"
            if difficulty.lower() == "m": difficulty = "Medium"
            if difficulty.lower() == "h": difficulty = "Hard"
            
            options = q.get("options", [])
            correct_option = q.get("correctOption", "")
            
            correct_idx = 0
            if correct_option == "A": correct_idx = 0
            elif correct_option == "B": correct_idx = 1
            elif correct_option == "C": correct_idx = 2
            elif correct_option == "D": correct_idx = 3
            elif correct_option and str(correct_option).isdigit():
                correct_idx = int(correct_option) - 1
                
            doc = {
                "question_id": str(q_id),
                "chapterId": target_chapter_id,
                "title": title,
                "year": str(year),
                "difficulty": difficulty.capitalize(),
                "type": "SCQ" if len(options) > 0 else "NUM",
                "question": q.get("questionText", ""),
                "options": options,
                "correctOptionIndex": correct_idx,
                "solution": q.get("explanation", ""),
                "marks": 4,
                "negativeMarks": -1,
                "topic": topic
            }
            
            if options and isinstance(options[0], dict):
                doc["options"] = [opt.get("text", "") for opt in options]
                
            formatted_docs.append(doc)

        if formatted_docs:
            col.insert_many(formatted_docs)
            print(f"Successfully inserted {len(formatted_docs)} REAL questions to MongoDB!")
            
    finally:
        driver.quit()

if __name__ == "__main__":
    run_scraper()
