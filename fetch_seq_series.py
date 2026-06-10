"""
Scrape "Sequence and Series" from ExamGoal JEE Main Math and save to MongoDB.
"""
import time
import json
import re
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from pymongo import MongoClient

MOBILE = "7750858874"
PASSWORD = "12345678"

# Connect to MongoDB
MONGO_URI = "mongodb+srv://ajaykumarsaroj13_db_usar:quantrex2026@cluster0.jde6gri.mongodb.net/quantrex?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(MONGO_URI)
db = client["quantrex"]
pyq_col = db["pyqs"]
chap_col = db["pyqchapters"]

def get_api_logs(driver):
    logs = driver.get_log("performance")
    results = []
    for entry in logs:
        try:
            log = json.loads(entry["message"])["message"]
            if log["method"] == "Network.responseReceived":
                resp = log["params"]["response"]
                if "examgoal.com/api" in resp["url"] and "application/json" in resp.get("mimeType", ""):
                    req_id = log["params"]["requestId"]
                    try:
                        body = driver.execute_cdp_cmd("Network.getResponseBody", {"requestId": req_id})
                        results.append({
                            "url": resp["url"],
                            "body": body["body"]
                        })
                    except:
                        pass
        except:
            pass
    return results

def run():
    options = webdriver.ChromeOptions()
    options.set_capability("goog:loggingPrefs", {"performance": "ALL"})
    options.add_argument("--start-maximized")
    
    driver = webdriver.Chrome(options=options)
    
    try:
        # Login
        print("Logging in...")
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
            try:
                driver.find_element(By.XPATH, "//button[@type='submit']").click()
            except:
                pass_inputs[0].submit()
        
        print("Waiting for login...")
        time.sleep(10)
        
        # Navigate to chapter page
        chapter_url = "https://room.examgoal.com/pyq/jee-main/mathematics/sequence-and-series"
        print(f"Navigating to {chapter_url}")
        _ = get_api_logs(driver) # clear logs
        
        driver.get(chapter_url)
        time.sleep(10)
        
        # Scroll to load everything
        for _ in range(5):
            driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(2)
            
        print("Extracting data...")
        logs = get_api_logs(driver)
        
        chapter_metadata = None
        questions_list = []
        
        for item in logs:
            url = item["url"]
            try:
                data = json.loads(item["body"])
                
                # Check for chapter topics/metadata
                if "metadata/chapterTopics" in url:
                    if data.get("statusCode") == 0:
                        chapter_metadata = data.get("data")
                        
                # Check for questions list
                if "past-question/question/meta" in url:
                    if data.get("statusCode") == 0:
                        q_data = data.get("data", [])
                        if isinstance(q_data, list):
                            questions_list.extend(q_data)
            except:
                pass
                
        print(f"Found metadata: {chapter_metadata is not None}")
        print(f"Found {len(questions_list)} questions in logs.")
        
        if len(questions_list) == 0:
            print("Trying to extract from Redux state or local storage...")
            # Try from window state if Nuxt
            state = driver.execute_script("return window.__NUXT__;")
            with open("state.json", "w") as f:
                json.dump(state, f)
                
            print("Please check state.json")
            return
            
        # Format and save to MongoDB
        print("\nProcessing and saving to MongoDB...")
        
        # Determine topics mapping
        topics_map = {}
        if chapter_metadata and "topics" in chapter_metadata:
            for t in chapter_metadata["topics"]:
                topics_map[t["id"]] = t.get("name", t.get("title", "General"))
                
        saved_count = 0
        new_chapter_title = "Progression & Series"
        chapter_id = "jee_main_math_progression_series"
        
        # Upsert Chapter
        chap_col.update_one(
            {"chapterId": chapter_id},
            {"$set": {
                "chapterId": chapter_id,
                "title": new_chapter_title,
                "subject": "mathematics",
                "exam": "jee-main",
                "topics": list(topics_map.values()) if topics_map else ["General"],
                "totalQuestions": len(questions_list)
            }},
            upsert=True
        )
        
        for q in questions_list:
            qid = q.get("id", q.get("questionId", ""))
            if not qid: continue
            
            # Find topic name
            topic_ids = q.get("topics", [])
            topic_name = "General"
            if topic_ids and isinstance(topic_ids, list):
                t_id = topic_ids[0]
                topic_name = topics_map.get(t_id, "General")
                
            # Type and correct option
            q_type = q.get("type", "SCQ")
            if "NUMERICAL" in q_type.upper() or q_type == "int":
                q_type = "NUMERICAL"
            else:
                q_type = "SCQ"
                
            ans = q.get("answer", "")
            correct_idx = -1
            if q_type == "SCQ" and ans:
                try:
                    correct_idx = int(ans)
                except:
                    pass
            elif q_type == "NUMERICAL":
                pass # answer is a string
                
            pyq_doc = {
                "examGoalId": qid,
                "chapterId": chapter_id,
                "title": f"JEE Main {q.get('year', '')}",
                "year": str(q.get("year", "")),
                "difficulty": "Medium",
                "type": q_type,
                "question": q.get("question", q.get("excerpt", "")),
                "options": q.get("options", []),
                "correctOptionIndex": correct_idx,
                "solution": q.get("solution", q.get("explanation", "")),
                "marks": 4,
                "negativeMarks": -1 if q_type == "SCQ" else 0,
                "topic": topic_name,
                "rawData": q
            }
            
            if q_type == "NUMERICAL":
                pyq_doc["numericalAnswer"] = str(ans)
                
            pyq_col.update_one(
                {"examGoalId": qid},
                {"$set": pyq_doc},
                upsert=True
            )
            saved_count += 1
            
        print(f"Successfully saved {saved_count} questions for chapter '{new_chapter_title}' to MongoDB!")
        
    except Exception as e:
        import traceback
        traceback.print_exc()
    finally:
        driver.quit()

if __name__ == "__main__":
    run()
