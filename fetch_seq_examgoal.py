import requests
import json
import time
from pymongo import MongoClient
import os

# MongoDB
MONGO_URI = "mongodb+srv://ajaykumarsaroj13_db_usar:quantrex2026@cluster0.jde6gri.mongodb.net/quantrex?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(MONGO_URI)
db = client["quantrex"]
pyq_col = db["pyqs"]
chap_col = db["pyqchapters"]

BASE = "https://room.examgoal.com/api/v1"

# Load Cookies
COOKIES = {}
cookie_file = "examgoal_cookies.json"
if os.path.exists(cookie_file):
    with open(cookie_file, "r") as f:
        cookie_list = json.load(f)
        for c in cookie_list:
            COOKIES[c["name"]] = c["value"]

s = requests.Session()
for k, v in COOKIES.items():
    s.cookies.set(k, v)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "eg-app-id": "room-examgoal-com",
    "eg-platform": "desktop",
    "Referer": "https://room.examgoal.com/",
    "accept": "application/json"
}

def get(url, params=None):
    try:
        r = s.get(url, headers=HEADERS, params=params, timeout=15)
        if r.status_code == 200:
            return r.json()
        print(f"Failed {url}: {r.status_code}")
        return None
    except Exception as e:
        print(f"Exception {url}: {e}")
        return None

def fetch_question(qid):
    data = get(f"{BASE}/past-question/question/{qid}")
    if data and data.get("statusCode") == 0:
        return data.get("data")
    return None

chapter_id = "ece890bf-9078-5967-a795-e27fc30f51cc"
new_chapter_title = "Progression & Series"
our_chapter_id = "jee_main_math_progression_series"

print("Fetching metadata to get QIDs...")
url_q = f"{BASE}/past-question/question/meta?examId=jee-main&chapterId={chapter_id}"
meta_data = get(url_q)

if not meta_data or "data" not in meta_data:
    print("Failed to get question meta")
    # try one more URL
    url_q2 = f"{BASE}/past-question/question/meta?chapterId={chapter_id}"
    meta_data = get(url_q2)
    if not meta_data or "data" not in meta_data:
        exit()

q_meta_list = meta_data["data"]
print(f"Found {len(q_meta_list)} questions in chapter")

if len(q_meta_list) == 0:
    exit()

chap_col.update_one(
    {"chapterId": our_chapter_id},
    {"$set": {
        "chapterId": our_chapter_id,
        "title": new_chapter_title,
        "subject": "mathematics",
        "exam": "jee-main",
        "topics": ["General"], # Will update topics if we can map them
        "totalQuestions": len(q_meta_list)
    }},
    upsert=True
)

saved_count = 0
for i, q_meta in enumerate(q_meta_list):
    qid = q_meta.get("id") or q_meta.get("questionId")
    if not qid: continue
    
    # Check if already in DB
    if pyq_col.find_one({"examGoalId": qid}):
        saved_count += 1
        continue
        
    print(f"Fetching {i+1}/{len(q_meta_list)}: {qid}")
    q = fetch_question(qid)
    if not q:
        time.sleep(1)
        continue
        
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
            
    # Try to map topic
    topic_name = "General"
    if q_meta.get("topics"):
        t_id = q_meta["topics"][0]
        # Just use topic ID as name for now or query topic name
        topic_name = str(t_id)

    pyq_doc = {
        "examGoalId": qid,
        "chapterId": our_chapter_id,
        "title": f"JEE Main {q.get('year', '')}",
        "year": str(q.get("year", "")),
        "difficulty": q.get("difficulty", "Medium"),
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
    time.sleep(0.3)
    
print(f"\nDone! Total in DB: {saved_count}/{len(q_meta_list)}")
