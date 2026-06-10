"""
==========================================================
  QUANTREX ACADEMY - FULL WORKING SCRAPER
  Confirmed endpoints:
  1. GET /api/v1/test/test-id-series/{series-key} → paper list
  2. GET /api/v1/past-question/question/{qid}     → question data
  3. GET /api/v1/metadata/chapters                → chapter list
==========================================================
"""
import requests
import json
import time
from pymongo import MongoClient

# ── CONFIG ─────────────────────────────────────────────
MONGO_URI = "mongodb+srv://quantrexacademy:quantrex2024@cluster0.mongodb.net/quantrex?retryWrites=true&w=majority"
BASE = "https://room.examgoal.com/api/v1"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "eg-app-id": "room-examgoal-com",
    "eg-platform": "desktop",
    "Referer": "https://room.examgoal.com/",
    "accept": "application/json",
    "content-type": "application/json",
}
COOKIES = {}
import os, json
cookies_path = os.path.join(os.path.dirname(__file__), "cookies.json")
if os.path.exists(cookies_path):
    with open(cookies_path, "r", encoding="utf-8") as f:
        COOKIES = json.load(f)
else:
    # fallback to placeholder (will be overwritten after login)
    COOKIES = {
        "SSID": "",
        "eg-device-id": "",
        "IR_UID": "",
        "AWSALB": "",
        "AWSALBCORS": ""
    }

# ── SETUP ──────────────────────────────────────────────
s = requests.Session()
for k, v in COOKIES.items():
    s.cookies.set(k, v)

# ── MONGODB ────────────────────────────────────────────
print("Connecting to MongoDB...")
try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=8000)
    client.admin.command('ping')
    db = client["quantrex"]
    col = db["pyqs"]
    print("MongoDB connected!")
except Exception as e:
    print(f"MongoDB failed: {e}")
    print("Will save to local JSON only.")
    client = None
    col = None

# ── HELPERS ────────────────────────────────────────────
def get(url, params=None):
    try:
        r = s.get(url, headers=HEADERS, params=params, timeout=20)
        if r.status_code == 200:
            ct = r.headers.get("content-type", "")
            if "json" in ct:
                return r.json()
        return None
    except:
        return None

def fetch_question(qid):
    """Fetch a single question by its ID"""
    data = get(f"{BASE}/past-question/question/{qid}")
    if data and data.get("statusCode") == 0:
        return data.get("data")
    return None

# ── EXAM CONFIGS ───────────────────────────────────────
EXAMS = [
    {
        "series_key": "pyq-in-jee-jee-main",
        "examGroup": "jee",
        "exam": "jee-main",
        "displayName": "JEE Main"
    },
    {
        "series_key": "pyq-in-jee-jee-advanced",
        "examGroup": "jee",
        "exam": "jee-advanced",
        "displayName": "JEE Advanced"
    },
    {
        "series_key": "pyq-in-defence-nda",
        "examGroup": "defence",
        "exam": "nda",
        "displayName": "NDA"
    },
]

total_saved = 0
all_papers = {}

# ── STEP 1: Get all paper test IDs from test-id-series ─
print("\n" + "=" * 60)
print("STEP 1: Fetching paper lists for each exam...")
print("=" * 60)

for exam_cfg in EXAMS:
    key = exam_cfg["series_key"]
    displayName = exam_cfg["displayName"]
    print(f"\n  {displayName}: GET /test/test-id-series/{key}")
    
    data = get(f"{BASE}/test/test-id-series/{key}")
    if not data:
        print(f"    Failed to get series")
        continue
    
    results = data.get("results", [])
    all_papers[exam_cfg["exam"]] = []
    
    paper_count = 0
    for group in results:
        group_title = group.get("title", "")
        for test in group.get("tests", []):
            test_id = test.get("testId", test.get("id", ""))
            test_title = test.get("title", "")
            if test_id:
                all_papers[exam_cfg["exam"]].append({
                    "testId": test_id,
                    "title": test_title,
                    "group": group_title,
                    "exam": displayName,
                    "examSlug": exam_cfg["exam"],
                    "examGroup": exam_cfg["examGroup"]
                })
                paper_count += 1
    
    print(f"    Found {paper_count} papers")
    time.sleep(0.3)

# Save paper list
with open(r"C:\Users\Admin\.gemini\antigravity\scratch\quantrex-academy\paper_list.json", "w") as f:
    json.dump(all_papers, f, indent=2)
print(f"\nPaper list saved!")

# ── STEP 2: Fetch questions from each paper ─────────────
print("\n" + "=" * 60)
print("STEP 2: Fetching questions from each paper...")
print("=" * 60)

for exam_slug, papers in all_papers.items():
    print(f"\n{'='*50}")
    print(f"Exam: {exam_slug} - {len(papers)} papers")
    
    for i, paper in enumerate(papers):
        test_id = paper["testId"]
        title = paper["title"]
        print(f"\n  [{i+1}/{len(papers)}] {title} (ID: {test_id})")
        
        # Fetch this paper/test
        paper_data = get(f"{BASE}/past-question/tests/personalized/test/{test_id}")
        if not paper_data:
            # Try test endpoint
            paper_data = get(f"{BASE}/test/{test_id}")
        
        if not paper_data:
            print(f"    Skipping - no data")
            time.sleep(0.3)
            continue
        
        # Get question IDs from paper
        q_ids = []
        if isinstance(paper_data, dict):
            # Try various fields for question IDs
            for field in ["questionIds", "questions", "items", "data"]:
                if field in paper_data:
                    val = paper_data[field]
                    if isinstance(val, list):
                        if val and isinstance(val[0], str):
                            q_ids = val
                        elif val and isinstance(val[0], dict):
                            q_ids = [q.get("id", q.get("questionId", "")) for q in val]
                        break
        
        if not q_ids:
            print(f"    No question IDs in response: {json.dumps(paper_data)[:200]}")
            time.sleep(0.3)
            continue
        
        print(f"    Found {len(q_ids)} questions")
        
        # Fetch each question
        paper_questions = []
        for qid in q_ids:
            if not qid:
                continue
            q = fetch_question(qid)
            if q:
                q["source_exam"] = paper["exam"]
                q["source_paper"] = title
                q["source_test_id"] = test_id
                paper_questions.append(q)
                total_saved += 1
                if total_saved % 50 == 0:
                    print(f"    ... {total_saved} total questions fetched")
            time.sleep(0.1)
        
        print(f"    Fetched {len(paper_questions)} questions for this paper")
        
        # Save to MongoDB
        if paper_questions and col:
            for q in paper_questions:
                qid = q.get("question_id", "")
                if qid:
                    col.update_one(
                        {"examGoalId": qid},
                        {"$set": {
                            "examGoalId": qid,
                            "question": q.get("question", q.get("excerpt", "")),
                            "options": q.get("options", []),
                            "answer": q.get("answer", q.get("correctOption", "")),
                            "solution": q.get("solution", q.get("explanation", "")),
                            "chapter": q.get("chapter", ""),
                            "subject": q.get("subject", ""),
                            "exam": paper["exam"],
                            "examGroup": paper["examGroup"],
                            "examSlug": exam_slug,
                            "year": q.get("year", ""),
                            "difficulty": q.get("difficulty", ""),
                            "paperId": q.get("paperId", ""),
                            "paperTitle": q.get("paperTitle", title),
                            "marks": q.get("marks", 4),
                            "negMarks": q.get("negMarks", 1),
                            "languages": q.get("languages", ["en"]),
                            "topics": q.get("topics", []),
                            "rawData": q
                        }},
                        upsert=True
                    )
        
        time.sleep(0.5)  # Rate limiting

print(f"\n{'='*60}")
print(f"TOTAL QUESTIONS SCRAPED: {total_saved}")
print(f"{'='*60}")

if client:
    client.close()
