"""
=============================================================
  Quantrex Academy - Universal ExamGoal Scraper
  Downloads ALL questions for: JEE Main, JEE Advanced, NDA
  Saves directly to MongoDB database
=============================================================
"""
import json
import time
import requests
from pymongo import MongoClient
from datetime import datetime

# ─── CONFIGURATION ───────────────────────────────────────
MONGO_URI = "mongodb+srv://quantrexacademy:quantrex2024@cluster0.mongodb.net/quantrex?retryWrites=true&w=majority"
DB_NAME = "quantrex"

BASE_URL = "https://room.examgoal.com/api/v1"

# All cookies from successful login
COOKIES = {
    "_ga": "GA1.1.1276000664.1780383846",
    "IR_UID": "35d44b89-383e-43d0-9194-d724d4617d73",
    "IR_SSID": "5480f8ee-ed80-481c-9364-c92c47638bc1",
    "eg-device-id": "s%3A3bb49b90-5e51-11f1-aca8-e9d769b4726d19g61mpwakjwp.Tl%2FuOwrutq86FBQboBKPIH5ZjFTIzbKb2PtIWynfzy4",
    "SSID": "s%3ApQTLMAf9YwWyo3HoC1f9pQ3m63nQ0QtuyJDoqWZUi08Vsr7W5wcbGSKMPrRKSyhs7tJFWWf0fKc2mrA8WbDMhlmNS0C9GXj69gkRG34Eg3egLISANrDdWBJCqqWrNBMv.djrR2rKRg5mJePlLoxupF%2Bd4HQX%2Bu%2Ba0JdK6pUMoEmg",
    "AWSALBCORS": "ktpfqXjAojzXa4otsXqgvXr7n8hY62oePEt4ki7FjCOJredTmOXjESuacFYDqcFIv6U3GVZqdytm2JOGu/QpRw2CA9IAnczRQWjO1cazVZeMtiZ7jZOqdd7kj2XM",
    "AWSALB": "ktpfqXjAojzXa4otsXqgvXr7n8hY62oePEt4ki7FjCOJredTmOXjESuacFYDqcFIv6U3GVZqdytm2JOGu/QpRw2CA9IAnczRQWjO1cazVZeMtiZ7jZOqdd7kj2XM",
    "_ga_DMM567BWT0": "GS2.1.s1780383846$o1$g0$t1780383846$j60$l0$h0",
}

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36",
    "eg-app-id": "room-examgoal-com",
    "eg-platform": "desktop",
    "cache-control": "no-cache",
    "Referer": "https://room.examgoal.com/",
    "accept": "application/json",
    "content-type": "application/json",
}

# All exams to scrape (examGroup, exam, displayName)
EXAMS = [
    ("jee", "jee-main", "JEE Main"),
    ("jee", "jee-advanced", "JEE Advanced"),
    ("defence", "nda", "NDA"),
]

# ─── SETUP SESSION ───────────────────────────────────────
session = requests.Session()
for name, value in COOKIES.items():
    session.cookies.set(name, value)

# ─── CONNECT MONGODB ─────────────────────────────────────
print("Connecting to MongoDB...")
try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    db = client[DB_NAME]
    chapters_col = db["pyqchapters"]
    questions_col = db["pyqs"]
    print("MongoDB connected!")
except Exception as e:
    print(f"MongoDB connection failed: {e}")
    print("Will save to JSON files instead...")
    client = None

# ─── HELPERS ─────────────────────────────────────────────
def api_get(endpoint, params=None):
    url = f"{BASE_URL}{endpoint}"
    r = session.get(url, headers=HEADERS, params=params, timeout=30)
    if r.status_code == 200:
        return r.json()
    else:
        print(f"  [!] GET {endpoint} -> {r.status_code}: {r.text[:150]}")
        return None

def api_post(endpoint, body=None):
    url = f"{BASE_URL}{endpoint}"
    r = session.post(url, headers=HEADERS, json=body, timeout=30)
    if r.status_code == 200:
        return r.json()
    else:
        print(f"  [!] POST {endpoint} -> {r.status_code}: {r.text[:150]}")
        return None

def rate_limit():
    time.sleep(0.5)  # Be polite - 0.5 second between requests

# ─── MAIN SCRAPING LOGIC ─────────────────────────────────
total_questions = 0
all_data = {}

print("\n" + "=" * 60)
print("  Starting Universal ExamGoal Scraper")
print("=" * 60)

for examGroup, exam, displayName in EXAMS:
    print(f"\n{'='*50}")
    print(f"  Scraping: {displayName} ({exam})")
    print(f"{'='*50}")
    all_data[exam] = {"exam": displayName, "subjects": []}
    
    # Step 1: Get subjects for this exam
    subjects_data = api_get(f"/metadata/subjects", params={
        "country": "in",
        "examGroup": examGroup,
        "exam": exam,
        "from": "pq"
    })
    rate_limit()
    
    if not subjects_data or not subjects_data.get("results"):
        print(f"  No subjects found for {exam}")
        continue
    
    subjects = subjects_data["results"]
    print(f"  Found {len(subjects)} subjects: {[s.get('title', s.get('name')) for s in subjects]}")
    
    for subject in subjects:
        subject_id = subject["metaId"]
        subject_name = subject.get("title", subject.get("name", "Unknown"))
        subject_key = subject.get("key", "")
        
        print(f"\n  Subject: {subject_name} (ID: {subject_id})")
        all_data[exam]["subjects"].append({
            "id": subject_id,
            "name": subject_name,
            "chapters": []
        })
        
        # Step 2: Get chapters for this subject
        chapters_data = api_get(f"/metadata/chapters", params={
            "country": "in",
            "examGroup": examGroup,
            "exam": exam,
            "subject": subject_key,
            "from": "pq"
        })
        rate_limit()
        
        if not chapters_data or not chapters_data.get("results"):
            # Try alternative endpoint
            chapters_data = api_get(f"/past-question/user/statistics/{subject_id}")
            rate_limit()
        
        if not chapters_data:
            print(f"    No chapters found")
            continue
        
        # Extract chapters from various response formats
        chapters = []
        if isinstance(chapters_data, dict):
            if "results" in chapters_data:
                chapters = chapters_data["results"]
            elif "chapters" in chapters_data:
                chapters = chapters_data["chapters"]
            elif "data" in chapters_data:
                chapters = chapters_data["data"]
        
        if not chapters:
            print(f"    No chapters in response: {json.dumps(chapters_data)[:200]}")
            continue
            
        print(f"    Found {len(chapters)} chapters")
        
        for chapter in chapters:
            chapter_id = chapter.get("metaId", chapter.get("id", ""))
            chapter_name = chapter.get("title", chapter.get("name", "Unknown"))
            chapter_key = chapter.get("key", "")
            
            print(f"    Chapter: {chapter_name}")
            
            # Upsert chapter in MongoDB
            if client:
                chapters_col.update_one(
                    {"examGoalId": chapter_id, "exam": displayName},
                    {"$set": {
                        "examGoalId": chapter_id,
                        "name": chapter_name,
                        "subject": subject_name,
                        "exam": displayName,
                        "examGroup": examGroup,
                        "examSlug": exam,
                    }},
                    upsert=True
                )
            
            # Step 3: Get questions for this chapter
            questions_data = api_get(f"/past-question/tests/by-chapter/{chapter_id}", params={
                "country": "in",
                "examGroup": examGroup,
                "exam": exam,
            })
            rate_limit()
            
            if not questions_data:
                # Try alternative endpoint
                questions_data = api_get(f"/past-question/questions", params={
                    "chapterId": chapter_id,
                    "examGroup": examGroup,
                    "exam": exam,
                    "limit": 500,
                    "offset": 0
                })
                rate_limit()
            
            if not questions_data:
                print(f"      No questions found")
                continue
            
            # Extract questions
            questions = []
            if isinstance(questions_data, dict):
                for key in ("results", "questions", "data", "items"):
                    if key in questions_data:
                        questions = questions_data[key]
                        break
            elif isinstance(questions_data, list):
                questions = questions_data
            
            print(f"      Found {len(questions)} questions")
            total_questions += len(questions)
            
            # Save questions to MongoDB
            if questions and client:
                for q in questions:
                    q_id = q.get("questionId", q.get("id", q.get("_id", "")))
                    questions_col.update_one(
                        {"examGoalId": q_id, "exam": displayName},
                        {"$set": {
                            "examGoalId": q_id,
                            "question": q.get("question", q.get("questionText", "")),
                            "options": q.get("options", []),
                            "answer": q.get("answer", q.get("correctOption", "")),
                            "solution": q.get("solution", q.get("explanation", "")),
                            "chapter": chapter_name,
                            "subject": subject_name,
                            "exam": displayName,
                            "year": q.get("year", ""),
                            "difficulty": q.get("difficulty", q.get("difficultyLevel", "")),
                            "topic": q.get("topic", ""),
                        }},
                        upsert=True
                    )
            
            # Save to local data structure too
            all_data[exam]["subjects"][-1]["chapters"].append({
                "id": chapter_id,
                "name": chapter_name,
                "questionCount": len(questions),
                "questions": questions[:5]  # Save preview only to JSON
            })

print(f"\n{'='*60}")
print(f"  SCRAPING COMPLETE!")
print(f"  Total questions scraped: {total_questions}")
print(f"{'='*60}")

# Save full raw data to JSON for backup
out = r"C:\Users\Admin\.gemini\antigravity\scratch\quantrex-academy\scraped_data.json"
with open(out, "w", encoding="utf-8") as f:
    json.dump(all_data, f, indent=2, ensure_ascii=False, default=str)
print(f"\nBackup saved to {out}")

if client:
    client.close()
    print("MongoDB connection closed.")
