import requests
import json
import os
from pymongo import MongoClient

# MongoDB
MONGO_URI = "mongodb+srv://ajaykumarsaroj13_db_usar:quantrex2026@cluster0.jde6gri.mongodb.net/quantrex?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(MONGO_URI)
db = client["quantrex"]
pyq_col = db["pyqs"]
chap_col = db["pyqchapters"]

BASE_URL = "https://room.examgoal.com/api/v1"

cookies = {}
cookie_file = "examgoal_cookies.json"
if os.path.exists(cookie_file):
    with open(cookie_file, "r") as f:
        cookie_list = json.load(f)
        for c in cookie_list:
            cookies[c["name"]] = c["value"]

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "eg-app-id": "room-examgoal-com",
    "eg-platform": "desktop",
    "Referer": "https://room.examgoal.com/"
}

# 1. Fetch Chapters for Math JEE Main
print("Fetching chapters...")
url = f"{BASE_URL}/metadata/chapters/exam/jee-main/subject/mathematics"
r = requests.get(url, cookies=cookies, headers=headers)
chapters = r.json().get("data", [])

seq_chapter = None
for c in chapters:
    if "sequence" in c.get("name", "").lower():
        seq_chapter = c
        break

if not seq_chapter:
    print("Sequence and Series chapter not found in math chapters:")
    for c in chapters:
         print(c.get("name"))
    exit()

print(f"Found Chapter: {seq_chapter['name']} ({seq_chapter['id']})")
chapter_id = seq_chapter["id"]

# 2. Fetch Topics for Chapter
print("Fetching topics...")
url_topics = f"{BASE_URL}/metadata/chapterTopics/exam/jee-main/subject/mathematics/chapter/{chapter_id}"
r_topics = requests.get(url_topics, cookies=cookies, headers=headers)
topics_data = r_topics.json().get("data", {}).get("topics", [])
print(f"Found {len(topics_data)} topics")

topics_map = { t["id"]: t["name"] for t in topics_data }
if not topics_map:
    topics_map = {"default": "General"}

topics_list = list(topics_map.values())

# 3. Fetch Questions
print("Fetching questions...")
url_q = f"{BASE_URL}/past-question/question/meta?examId=jee-main&subjectId=mathematics&chapterId={chapter_id}"
r_q = requests.get(url_q, cookies=cookies, headers=headers)
questions = r_q.json().get("data", [])
print(f"Found {len(questions)} questions")

if not questions:
    print("No questions found, maybe authentication issue or different endpoint format?")
    exit()

# 4. Save to DB
new_chapter_title = "Progression & Series"
our_chapter_id = "jee_main_math_progression_series"

chap_col.update_one(
    {"chapterId": our_chapter_id},
    {"$set": {
        "chapterId": our_chapter_id,
        "title": new_chapter_title,
        "subject": "mathematics",
        "exam": "jee-main",
        "topics": topics_list,
        "totalQuestions": len(questions)
    }},
    upsert=True
)

saved_count = 0
for q in questions:
    qid = q.get("id", "")
    if not qid: continue
    
    t_ids = q.get("topics", [])
    topic_name = "General"
    if isinstance(t_ids, list) and len(t_ids) > 0:
        topic_name = topics_map.get(t_ids[0], "General")
        
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
            
    pyq_doc = {
        "examGoalId": qid,
        "chapterId": our_chapter_id,
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
